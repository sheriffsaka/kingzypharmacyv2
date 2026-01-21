import { Product } from '../types';

export const productsData: Omit<Product, 'categories'>[] = [
    {
        id: 1,
        name: 'Paracetamol', 
        description: 'Effective relief from pain and fever.', 
        category_id: 1, 
        dosage: '500mg, 20 tablets', 
        prices: { retail: 1500, wholesale_tiers: [{min_quantity: 10, price: 1200}] }, 
        stock_status: 'in_stock', 
        image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819816/pr9_ouhvx0.png', 
        min_order_quantity: 10, 
        wholesale_display_unit: 'Box of 20'
    },
    {
        id: 2,
        name: 'Ibuprofen', 
        description: 'Anti-inflammatory tablets for various pains.', 
        category_id: 1, 
        dosage: '200mg, 16 tablets', 
        prices: { retail: 2200, wholesale_tiers: [{min_quantity: 5, price: 1800}] }, 
        stock_status: 'in_stock', 
        image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819813/pr6_quh0rd.png', 
        min_order_quantity: 5, 
        wholesale_display_unit: 'Box of 16'
    },
    {
        id: 3,
        name: 'Vitamin C Effervescent', 
        description: 'High-strength Vitamin C to support your immune system.', 
        category_id: 2, 
        dosage: '1000mg, 20 tablets', 
        prices: { retail: 4500, wholesale_tiers: [{min_quantity: 10, price: 4000}] }, 
        stock_status: 'low_stock', 
        image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819813/pr10_ogxr0t.png', 
        min_order_quantity: 10, 
        wholesale_display_unit: 'Tube of 20'
    },
    {
        id: 4,
        name: 'Cetirizine Hydrochloride', 
        description: 'For the relief of hay fever and other allergic conditions.', 
        category_id: 3, 
        dosage: '10mg, 14 tablets', 
        prices: { retail: 4000 }, 
        stock_status: 'in_stock', 
        image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819812/pr3_ocnlnb.png', 
        min_order_quantity: 1
    },
    {
        id: 5,
        name: 'Gaviscon Double Action', 
        description: 'Effective relief from heartburn and indigestion.', 
        category_id: 4, 
        dosage: '300ml Bottle', 
        prices: { retail: 6500 }, 
        stock_status: 'out_of_stock', 
        image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1769019018/gav-removebg-preview_ojbzkp.png', 
        min_order_quantity: 1
    },
    {
        id: 6,
        name: 'Benylin Chesty Coughs', 
        description: 'Non-drowsy formula to relieve chesty coughs.', 
        category_id: 5, 
        dosage: '150ml Bottle', 
        prices: { retail: 3500 }, 
        stock_status: 'in_stock', 
        image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819814/pr4_sl96nd.png', 
        min_order_quantity: 1
    },
    {
        id: 7,
        name: 'Lemsip Max Cold & Flu', 
        description: 'Lemon sachets for powerful relief from cold and flu symptoms.', 
        category_id: 5, 
        dosage: '10 Sachets', 
        prices: { retail: 5200 }, 
        stock_status: 'in_stock', 
        image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1769019686/coldflu-removebg-preview_nv7n6l.png', 
        min_order_quantity: 1
    },
    {
        id: 8,
        name: 'Waterproof Plasters', 
        description: 'Assorted waterproof plasters for minor cuts.', 
        category_id: 6, 
        dosage: 'Pack of 40', 
        prices: { retail: 1200 }, 
        stock_status: 'in_stock', 
        image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1769019019/plaster-removebg-preview_cojryv.png', 
        min_order_quantity: 1
    },
    {
        id: 9,
        name: 'Antiseptic Wipes', 
        description: 'Individually wrapped wipes for cleaning wounds.', 
        category_id: 6, 
        dosage: 'Box of 100', 
        prices: { retail: 2800 }, 
        stock_status: 'in_stock', 
        image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1769019019/wipes-removebg-preview_w7ljhq.png', 
        min_order_quantity: 1
    },
    {
        id: 10,
        name: 'Multivitamin Gummies', 
        description: 'Daily multivitamin gummies for adults.', 
        category_id: 2, 
        dosage: '60 Gummies', 
        prices: { retail: 7500 }, 
        stock_status: 'in_stock', 
        image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819816/pr5_jpaxlh.png', 
        min_order_quantity: 1
    }
];
