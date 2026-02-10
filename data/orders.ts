import { Order, OrderItem, OrderStatusHistory, Payment, Product } from '../types';

// This file acts as the single source of truth for mock order data.
// All dashboards will now pull from this data, ensuring consistency.

export const mockOrders: (Order & {order_status_history: OrderStatusHistory[], order_items: (OrderItem & { products: Pick<Product, 'name' | 'image_url' | 'dosage'>})[], payments: Partial<Payment>[] })[] = [
    // --- WHOLESALE BUYER ORDERS (user_id: '...0003') ---
    {
        id: 202401,
        user_id: '00000000-0000-0000-0000-000000000003',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        status: 'DELIVERED',
        total_price: 150000,
        discount_applied: 15000,
        delivery_address: { fullName: 'Chidi Okonkwo', street: '123, Commerce Avenue', city: 'Lagos', state: 'Lagos', zip: '101241', phone: '08012345678' },
        customer_details: { email: 'wholesale@kingzy.com', userId: '00000000-0000-0000-0000-000000000003' },
        // FIX: Added missing 'created_at' property to the payment object.
        payments: [{ id: 1, order_id: 202401, payment_method: 'bank_transfer', amount: 150000, payment_status: 'paid', created_at: new Date(Date.now() - 86400000 * 2).toISOString() }],
        order_items: [
            { id: 10, order_id: 202401, product_id: 4, quantity: 1, unit_price: 66000, products: { name: 'Gaviscon Double Action (Carton)', image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819812/pr2_b8czjp.png', dosage: '300ml, 12 Bottles' } },
            { id: 11, order_id: 202401, product_id: 2, quantity: 3, unit_price: 22000, products: { name: 'Ibuprofen (Case)', image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819813/pr6_quh0rd.png', dosage: '200mg, 48 packs' } },
        ] as any,
        order_status_history: [
            { id: 1, status: 'ORDER_RECEIVED', updated_at: new Date(Date.now() - 86400000 * 2).toISOString(), updated_by: 'user' },
            { id: 2, status: 'PROCESSING', updated_at: new Date(Date.now() - 86400000 * 1.8).toISOString(), updated_by: 'admin' },
            { id: 3, status: 'DISPATCHED', updated_at: new Date(Date.now() - 86400000 * 1.5).toISOString(), updated_by: 'admin' },
            { id: 4, status: 'IN_TRANSIT', updated_at: new Date(Date.now() - 86400000 * 1).toISOString(), updated_by: 'logistics' },
            { id: 5, status: 'DELIVERED', updated_at: new Date(Date.now() - 86400000 * 0.5).toISOString(), updated_by: 'logistics' },
        ]
    },
    {
        id: 202402,
        user_id: '00000000-0000-0000-0000-000000000003',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        status: 'ORDER_RECEIVED',
        total_price: 220000,
        discount_applied: 22000,
        delivery_address: { fullName: 'Chidi Okonkwo', street: '123, Commerce Avenue', city: 'Lagos', state: 'Lagos', zip: '101241', phone: '08012345678' },
        customer_details: { email: 'wholesale@kingzy.com', userId: '00000000-0000-0000-0000-000000000003' },
        // FIX: Added missing 'created_at' property to the payment object.
        payments: [{ id: 2, order_id: 202402, payment_method: 'bank_transfer', amount: 220000, payment_status: 'awaiting_confirmation', created_at: new Date(Date.now() - 3600000).toISOString() }],
        order_items: [
             { id: 12, order_id: 202402, product_id: 1, quantity: 20, unit_price: 8000, products: { name: 'Paracetamol (Bulk)', image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819816/pr9_ouhvx0.png', dosage: '500mg, 1000 tablets' } },
             { id: 13, order_id: 202402, product_id: 3, quantity: 2, unit_price: 25000, products: { name: 'Vitamin C Effervescent (Bulk)', image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819813/pr10_ogxr0t.png', dosage: '1000mg, 200 tablets' } },
        ] as any,
        order_status_history: [
            { id: 1, status: 'ORDER_RECEIVED', updated_at: new Date().toISOString(), updated_by: 'user' },
        ]
    },

    // --- GENERAL BUYER ORDERS (user_id: '...0005') ---
     {
        id: 101,
        user_id: '00000000-0000-0000-0000-000000000005',
        created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        status: 'DELIVERED',
        total_price: 5700,
        discount_applied: 142.5,
        delivery_address: { fullName: 'Bolanle Adeoye', street: '45, Unity Road', city: 'Ikeja', state: 'Lagos', zip: '100212', phone: '08055551234' },
        customer_details: { email: 'buyer@kingzy.com', userId: '00000000-0000-0000-0000-000000000005' },
        payments: [{ id: 101, order_id: 101, payment_method: 'bank_transfer', payment_status: 'paid', amount: 5700, created_at: new Date(Date.now() - 86400000 * 5).toISOString() }] as any,
        order_items: [
            { id: 1, order_id: 101, product_id: 1, quantity: 1, unit_price: 1500, products: { name: 'Paracetamol', image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819816/pr9_ouhvx0.png', dosage: '500mg, 20 tablets' } },
            { id: 2, order_id: 101, product_id: 2, quantity: 2, unit_price: 2200, products: { name: 'Ibuprofen', image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819813/pr6_quh0rd.png', dosage: '200mg, 16 tablets' } },
        ] as any,
        order_status_history: [
            { id: 1, status: 'ORDER_RECEIVED', updated_at: new Date(Date.now() - 86400000 * 5).toISOString(), updated_by: 'user' },
            { id: 5, status: 'DELIVERED', updated_at: new Date(Date.now() - 86400000 * 1).toISOString(), updated_by: 'logistics' },
        ]
    },
    {
        id: 105,
        user_id: '00000000-0000-0000-0000-000000000005',
        created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
        status: 'IN_TRANSIT',
        total_price: 12000,
        discount_applied: 300,
        delivery_address: { fullName: 'Bolanle Adeoye', street: '45, Unity Road', city: 'Ikeja', state: 'Lagos', zip: '100212', phone: '08055551234' },
        customer_details: { email: 'buyer@kingzy.com', userId: '00000000-0000-0000-0000-000000000005' },
        payments: [{ id: 105, order_id: 105, payment_method: 'bank_transfer', payment_status: 'paid', amount: 12000, created_at: new Date(Date.now() - 86400000 * 1).toISOString() }] as any,
        order_items: [ { id: 3, order_id: 105, product_id: 3, quantity: 3, unit_price: 4000, products: { name: 'Cetirizine Hydrochloride', image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819815/pr8_x30k6m.png', dosage: '10mg, 14 tablets' } }, ] as any,
        order_status_history: [ { id: 1, status: 'ORDER_RECEIVED', updated_at: new Date(Date.now() - 86400000 * 1).toISOString(), updated_by: 'user' }, { id: 4, status: 'IN_TRANSIT', updated_at: new Date(Date.now() - 86400000 * 0.2).toISOString(), updated_by: 'logistics' },]
    },
    {
        id: 106,
        user_id: '00000000-0000-0000-0000-000000000005',
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        status: 'ORDER_RECEIVED',
        total_price: 3700,
        discount_applied: 92.5,
        delivery_address: { fullName: 'Bolanle Adeoye', street: '45, Unity Road', city: 'Ikeja', state: 'Lagos', zip: '100212', phone: '08055551234' },
        customer_details: { email: 'buyer@kingzy.com', userId: '00000000-0000-0000-0000-000000000005' },
        payments: [{ id: 106, order_id: 106, payment_method: 'bank_transfer', payment_status: 'awaiting_confirmation', amount: 3700, created_at: new Date(Date.now() - 3600000 * 2).toISOString() }] as any,
        order_items: [ { id: 4, order_id: 106, product_id: 1, quantity: 2, unit_price: 1500, products: { name: 'Paracetamol', image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819816/pr9_ouhvx0.png', dosage: '500mg, 20 tablets' } }, ] as any,
        order_status_history: [ { id: 1, status: 'ORDER_RECEIVED', updated_at: new Date().toISOString(), updated_by: 'user' } ]
    },

    // --- ORDERS FOR ADMIN PANEL (NO SPECIFIC USER) ---
    { 
      id: 1001, user_id: 'u3', created_at: new Date(Date.now() - 345600000).toISOString(), 
      status: 'ASSIGNED_TO_LOGISTICS', total_price: 220000, discount_applied: 0, 
      delivery_address: { fullName: 'Central Clinic', phone: '09011223344', street: '45 Hospital Rd', city: 'Port Harcourt', state: 'Rivers', zip: '500001' },
      customer_details: { email: 'clinic.central@test.com', userId: 'u3' },
      order_items: [{ id: 2, order_id: 1001, product_id: 2, quantity: 10, unit_price: 22000, products: { name: 'Ibuprofen (Case)', dosage: 'Case of 48', image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819813/pr6_quh0rd.png' } }] as any,
      // FIX: Completed the payment object and added it to the array.
      payments: [{ id: 1001, order_id: 1001, payment_status: 'paid', payment_method: 'bank_transfer', amount: 220000, created_at: new Date(Date.now() - 345600000).toISOString() }] as any,
      logistics_assignments: [{ id: 1, assigned_at: new Date(Date.now() - 86400000).toISOString(), profiles: { id: 'logistics-2-uuid', email: 'delivery.expert@example.com' } }] as any,
      // FIX: Added the missing 'order_status_history' property.
      order_status_history: [
          { id: 1, status: 'ORDER_RECEIVED', updated_at: new Date(Date.now() - 345600000).toISOString(), updated_by: 'user' },
          { id: 2, status: 'PAYMENT_CONFIRMED', updated_at: new Date(Date.now() - 300000000).toISOString(), updated_by: 'admin' },
          { id: 3, status: 'ASSIGNED_TO_LOGISTICS', updated_at: new Date(Date.now() - 86400000).toISOString(), updated_by: 'admin' },
      ]
    },
];
