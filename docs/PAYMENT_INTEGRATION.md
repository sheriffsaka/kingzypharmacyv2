
# Paystack Integration Upgrade Path

This document outlines the steps to upgrade the current payment foundation to a full-fledged online payment system using Paystack. The existing database schema and application flow are designed to make this transition seamless with minimal refactoring.

## Overview of the Flow

The integration will involve three main parts:
1.  **Client-Side:** The user selects "Online Payment" and clicks "Place Order".
2.  **Server-Side (Edge Function):** An Edge Function securely communicates with Paystack to create a transaction.
3.  **Webhook (Edge Function):** Paystack sends real-time updates about the payment status to another Edge Function, which updates our database.

### Payment Status Flow Diagram

```mermaid
graph TD
    subgraph User Action
        A[User selects "Pay on Delivery" & places order] --> B{Order Created};
        C[User selects "Online Payment" & places order] --> D{Order Created};
    end

    subgraph System Action
        B --> E[Payment record created: status='pay_on_delivery'];
        E --> F[Order status updated: 'processing'];

        D --> G[Payment record created: status='pending'];
        G --> H[Redirect to Paystack];
    end

    subgraph Paystack Webhook
        H --> I{User pays};
        I -- Success --> J[Webhook: charge.success];
        I -- Fails --> K[Webhook: charge.failed];
    end

    subgraph Database Update
        J --> L[Payment status updated: 'paid'];
        L --> M[Order status updated: 'processing'];

        K --> N[Payment status updated: 'failed'];
        N --> O[Order status updated: 'cancelled'];
    end

    F --> P[Shipment];
    M --> P;
```

## Future-Proofing Features Already Implemented

-   **`payments` Table:** A dedicated table to track all payment attempts.
-   **`payment_status` Enum:** A robust status system (`pending`, `paid`, `failed`, etc.) is already in place.
-   **`reference` Column:** The `payments.reference` column is ready to store the unique transaction reference from Paystack.
-   **Decoupled Logic:** The checkout process is already designed to create an order and a `pending` payment record before initiating the actual payment, which is the correct flow for gateway integration.

## Integration Checklist

### 1. Set Up Environment Variables
In your Vercel project settings (and locally in a `.env.local` file), add your Paystack secret key:
```
PAYSTACK_SECRET_KEY=sk_...
```

### 2. Create an Edge Function for Transaction Initialization
Create a new Supabase Edge Function (e.g., `init-payment`).

**File:** `supabase/functions/init-payment/index.ts`

**Logic:**
- Receives the `orderId`, `amount`, and `email` from the client.
- Uses the `PAYSTACK_SECRET_KEY` to make a POST request to Paystack's `https://api.paystack.co/transaction/initialize` endpoint.
- **Crucially**, it passes our internal `paymentId` or a unique generated reference in the `reference` field of the Paystack request. This is how we'll link the webhook event back to our database record.
- Updates our `payments` record with the reference returned by Paystack.
- Returns the `authorization_url` from the Paystack response to the client.

### 3. Update the Checkout UI (`CartPage.tsx`)
- Enable the "Online Payment" radio button.
- Modify `handleSubmitOrder`:
    - If `paymentMethod` is `'online'`:
        1.  Create the `order` and `payment` records as is currently done (status will be `pending`).
        2.  Call the `init-payment` Edge Function with the order details.
        3.  On success, redirect the user to the `authorization_url` received from the function. `window.location.href = authorization_url;`
        4.  Do *not* clear the cart yet. The user might close the payment page. Handle cart clearing in the webhook or on a successful return to the site.

### 4. Create an Edge Function for the Webhook
Create a new Supabase Edge Function (e.g., `payment-webhook`).

**File:** `supabase/functions/payment-webhook/index.ts`

**Logic:**
- This function acts as the endpoint that Paystack will send POST requests to.
- **Security:** It MUST first verify that the request is genuinely from Paystack by validating the signature in the `x-paystack-signature` header.
- It parses the event body. We are interested in `charge.success` and `charge.failed` events.
- It extracts the `reference` from the event data.
- It uses this `reference` to find the corresponding record in our `payments` table.
- If the event is `charge.success`:
    - It updates `payments.payment_status` to `'paid'`.
    - It updates `payments.verified_at` to the current timestamp.
    - It updates the corresponding `orders.status` to `'processing'`.
- If the event is `charge.failed`:
    - It updates `payments.payment_status` to `'failed'`.
    - It updates the corresponding `orders.status` to `'cancelled'`.
- It returns a `200 OK` status to Paystack to acknowledge receipt of the event.

### 5. Configure Paystack
- In your Paystack dashboard, add the URL of your `payment-webhook` Edge Function to the Webhooks section.

---

By following these steps, the application can be upgraded to a production-ready payment system without altering the core database schema or rewriting the existing business logic for order creation and status management.
