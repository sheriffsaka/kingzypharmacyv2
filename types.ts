export interface Category {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
}

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface WholesaleTier {
  min_quantity: number;
  price: number;
}

export interface ProductPrices {
  retail: number;
  wholesale_tiers?: WholesaleTier[];
}

export interface Product {
  id: number;
  name: string;
  description: string;
  category_id: number;
  dosage: string;
  prices: ProductPrices;
  stock_status: StockStatus;
  image_url: string;
  min_order_quantity: number;
  wholesale_display_unit?: string;
  // This will be populated after fetching from the DB
  categories?: Category;
}

export interface CartItem {
    product: Product;
    quantity: number;
}

export interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

// App Navigation View Type
export type View = 
  | { name: 'products', categoryId?: number | null }
  | { name: 'home' | 'chat' | 'auth' | 'admin' | 'wholesale' | 'cart' | 'labTests' | 'healthInsights' | 'plusMembership' | 'offers' | 'about' | 'orders' | 'wholesale_public' | 'contact' | 'faq' | 'terms' | 'logistics' | 'buyerDashboard' }
  | { name: 'productDetail', productId: number }
  | { name: 'orderSuccess', orderId: number }
  | { name: 'invoicePreview' | 'paymentInstructions', orderId: number }
  | { name: 'blogDetail', articleId: string };


// Auth Types
export type UserRole = 'admin' | 'wholesale_buyer' | 'general_public' | 'logistics';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type OrderStatus = 
  | 'ORDER_RECEIVED' 
  | 'ORDER_ACKNOWLEDGED' 
  | 'PROCESSING' 
  | 'DISPATCHED' 
  | 'IN_TRANSIT' 
  | 'DELIVERED' 
  | 'CANCELLED';


export interface Profile {
  id: string; // Corresponds to Supabase auth.users.id
  created_at: string;
  role: UserRole;
  approval_status: ApprovalStatus;
  loyalty_discount_percentage: number;
  // Joined data from auth.users for convenience
  email?: string; 
}

// Order Types
export interface DeliveryAddress {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zip: string;
}

export interface CustomerDetails {
    email: string;
    userId: string;
}

export interface OrderStatusHistory {
    id: number;
    status: OrderStatus;
    updated_at: string;
    updated_by: string; // The user ID (UUID) of who made the update
    note?: string;
}

export interface LogisticsAssignment {
    id: number;
    assigned_at: string;
    profiles: {
        id: string;
        email: string;
    };
}

export interface Order {
    id: number;
    user_id: string;
    created_at: string;
    status: OrderStatus;
    total_price: number;
    discount_applied: number;
    delivery_address: DeliveryAddress;
    customer_details: CustomerDetails;
    // Joined data
    payments?: Payment[];
    order_items?: OrderItem[];
    invoices?: Invoice[];
    order_status_history?: OrderStatusHistory[];
    logistics_assignments?: LogisticsAssignment[];
}

export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    quantity: number;
    unit_price: number;
    // Joined data
    products?: Pick<Product, 'name' | 'dosage' | 'image_url'>
}

// Payment Types
export type PaymentMethod = 'online' | 'pay_on_delivery';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'pay_on_delivery' | 'awaiting_confirmation';

export interface Payment {
  id: number;
  order_id: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  reference?: string;
  amount: number;
  verified_at?: string;
  created_at: string;
  receipts?: Receipt[];
}

// Invoice & Receipt Types
export type InvoiceStatus = 'draft' | 'locked';

export interface InvoiceItem {
    product_name: string;
    quantity: number;
    unit_price: number;
    line_total: number;
}

export interface InvoiceData {
    buyerDetails: {
        deliveryAddress: DeliveryAddress,
        customerDetails: CustomerDetails
    },
    items: InvoiceItem[];
    pricing: {
        subtotal: number;
        discount_applied: number;
        delivery_fee: number;
        total_price: number;
    }
}

export interface Invoice {
    id: number;
    invoice_number: string;
    order_id: number;
    user_id: string;
    status: InvoiceStatus;
    invoice_data: InvoiceData;
    pdf_storage_path?: string;
    created_at: string;
}

export interface ReceiptData {
    buyerDetails: {
        deliveryAddress: DeliveryAddress;
        customerDetails: CustomerDetails;
    };
    paymentDetails: {
        payment_method: PaymentMethod;
        amount_paid: number;
        verified_at: string;
    };
    relatedInvoiceNumber: string;
}


export interface Receipt {
    id: number;
    receipt_number: string;
    payment_id: number;
    order_id: number;
    user_id: string;
    receipt_data: ReceiptData;
    pdf_storage_path?: string;
    created_at: string;
}