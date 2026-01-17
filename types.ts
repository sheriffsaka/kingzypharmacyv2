
export interface Category {
  id: number;
  name: string;
  description?: string;
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
  | { name: 'chat' | 'auth' | 'admin' | 'wholesale' | 'cart' | 'labTests' | 'healthInsights' | 'plusMembership' | 'offers' | 'about' }
  | { name: 'productDetail', productId: number }
  | { name: 'orderSuccess', orderId: number };


// Auth Types
export type UserRole = 'admin' | 'wholesale_buyer' | 'general_public' | 'logistics';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';


export interface Profile {
  id: string; // Corresponds to Supabase auth.users.id
  created_at: string;
  role: UserRole;
  approval_status: ApprovalStatus;
  loyalty_discount_percentage: number;
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

export interface Order {
    id: number;
    user_id: string;
    created_at: string;
    status: OrderStatus;
    total_price: number;
    discount_applied: number;
    delivery_address: DeliveryAddress;
    customer_details: CustomerDetails;
}

export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    quantity: number;
    unit_price: number;
}