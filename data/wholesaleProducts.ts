
import { Product } from '../types';

// Mock data for the wholesale-specific catalog view
export const mockWholesaleProducts: Product[] = [
    { 
        id: 1, 
        name: 'Paracetamol (Bulk)', 
        description: 'Effective relief from pain and fever.', 
        category_id: 1, 
        dosage: '500mg, 1000 tablets', 
        prices: { retail: 10000, wholesale_tiers: [{min_quantity: 10, price: 8000}, {min_quantity: 50, price: 7500}] }, 
        stock_status: 'in_stock', 
        stock_quantity: 50,
        image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819816/pr9_ouhvx0.png', 
        min_order_quantity: 10, 
        wholesale_display_unit: 'Jar of 1000' 
    },
    { 
        id: 2, 
        name: 'Ibuprofen (Case)', 
        description: 'Anti-inflammatory tablets for various pains.', 
        category_id: 1, 
        dosage: '200mg, 48 packs', 
        prices: { retail: 25000, wholesale_tiers: [{min_quantity: 5, price: 22000}, {min_quantity: 20, price: 20000}] }, 
        stock_status: 'in_stock', 
        stock_quantity: 30,
        image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819813/pr6_quh0rd.png', 
        min_order_quantity: 5, 
        wholesale_display_unit: 'Case of 48' 
    },
    { 
        id: 3, 
        name: 'Vitamin C Effervescent (Bulk)', 
        description: 'High-strength Vitamin C to support your immune system.', 
        category_id: 2, 
        dosage: '1000mg, 200 tablets', 
        prices: { retail: 30000, wholesale_tiers: [{min_quantity: 10, price: 25000}, {min_quantity: 40, price: 22500}] }, 
        stock_status: 'low_stock', 
        stock_quantity: 12,
        image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819813/pr10_ogxr0t.png', 
        min_order_quantity: 10, 
        wholesale_display_unit: 'Pack of 200' 
    },
    { 
        id: 4, 
        name: 'Gaviscon Double Action (Carton)', 
        description: 'Effective relief from heartburn and indigestion.', 
        category_id: 4, 
        dosage: '300ml, 12 Bottles', 
        prices: { retail: 72000, wholesale_tiers: [{min_quantity: 2, price: 66000}, {min_quantity: 10, price: 60000}] }, 
        stock_status: 'in_stock', 
        stock_quantity: 8,
        image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819812/pr3_ocnlnb.png', 
        min_order_quantity: 2, 
        wholesale_display_unit: 'Carton of 12' 
    },
];
