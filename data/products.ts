import { Product } from '../types';

export const productsData: Omit<Product, 'categories'>[] = [
    {
        id: 1,
        name: 'Paracetamol', 
        description: 'Effective relief from pain and fever.', 
        category_id: 7, // Analgesics
        dosage: '500mg, 20 tablets', 
        prices: { retail: 1500, wholesale_tiers: [{min_quantity: 10, price: 1200}] }, 
        stock_status: 'in_stock', 
        stock_quantity: 1250,
        image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819816/pr9_ouhvx0.png', 
        min_order_quantity: 10, 
        wholesale_display_unit: 'Box of 20'
    },
    {
        id: 2,
        name: 'Ibuprofen', 
        description: 'Anti-inflammatory tablets for various pains.', 
        category_id: 7, // Analgesics
        dosage: '200mg, 16 tablets', 
        prices: { retail: 2200, wholesale_tiers: [{min_quantity: 5, price: 1800}] }, 
        stock_status: 'in_stock', 
        stock_quantity: 840,
        image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819813/pr6_quh0rd.png', 
        min_order_quantity: 5, 
        wholesale_display_unit: 'Box of 16'
    },
    {
        id: 3,
        name: 'Vitamin C Effervescent', 
        description: 'High-strength Vitamin C to support your immune system.', 
        category_id: 3, // Multivitamin
        dosage: '1000mg, 20 tablets', 
        prices: { retail: 4500, wholesale_tiers: [{min_quantity: 10, price: 4000}] }, 
        stock_status: 'low_stock', 
        stock_quantity: 45,
        image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819813/pr10_ogxr0t.png', 
        min_order_quantity: 10, 
        wholesale_display_unit: 'Tube of 20'
    },
    {
        id: 4,
        name: 'Cetirizine Hydrochloride', 
        description: 'For the relief of hay fever and other allergic conditions.', 
        category_id: 16, // General
        dosage: '10mg, 14 tablets', 
        prices: { retail: 4000 }, 
        stock_status: 'in_stock', 
        stock_quantity: 320,
        image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819812/pr3_ocnlnb.png', 
        min_order_quantity: 1
    },
    {
        id: 5,
        name: 'Gaviscon Double Action', 
        description: 'Effective relief from heartburn and indigestion.', 
        category_id: 15, // Anti-ulcers
        dosage: '300ml Bottle', 
        prices: { retail: 6500 }, 
        stock_status: 'out_of_stock', 
        stock_quantity: 0,
        image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1769019018/gav-removebg-preview_ojbzkp.png',
        min_order_quantity: 1
    },
    {
        id: 6,
        name: 'Artemether & Lumefantrine', 
        description: 'Standard combination therapy for the treatment of uncomplicated malaria.', 
        category_id: 1, // Antimalaria
        dosage: '20/120mg, 24 tablets', 
        prices: { retail: 3500, wholesale_tiers: [{min_quantity: 20, price: 2800}] }, 
        stock_status: 'in_stock', 
        stock_quantity: 500,
        image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1770051865/Artemether_Lumefantrine-removebg-preview_oszpjn.png', 
        min_order_quantity: 10,
        wholesale_display_unit: 'Box of 24'
    },
    {
        id: 7,
        name: 'Amoxicillin Capsules', 
        description: 'Commonly used antibiotic for various bacterial infections.', 
        category_id: 2, // Antibiotics
        dosage: '500mg, 15 capsules', 
        prices: { retail: 2800, wholesale_tiers: [{min_quantity: 50, price: 2100}] }, 
        stock_status: 'in_stock', 
        stock_quantity: 1200,
        image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1770053184/Amoxicillin-removebg-preview_gztnds.png', 
        min_order_quantity: 20
    },
    {
        id: 8,
        name: 'Loratadine', 
        description: 'Non-drowsy antihistamine for allergy relief.', 
        category_id: 5, // Cough&cold
        dosage: '10mg, 10 tablets', 
        prices: { retail: 1200 }, 
        stock_status: 'in_stock', 
        stock_quantity: 600,
        image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819813/pr7_ytnwx5.png', 
        min_order_quantity: 1
    },
    {
        id: 9,
        name: 'Omeprazole', 
        description: 'Reduces excess stomach acid for ulcer and reflux relief.', 
        category_id: 15, // Anti-ulcers
        dosage: '20mg, 14 capsules', 
        prices: { retail: 3200, wholesale_tiers: [{min_quantity: 10, price: 2500}] }, 
        stock_status: 'in_stock', 
        stock_quantity: 450,
        image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1770052608/Omeprazole-removebg-preview_hf9uet.png', 
        min_order_quantity: 5
    },
    {
        id: 10,
        name: 'Daily Wellness Pack', 
        description: 'Curated set of multivitamins and minerals for daily health maintenance.', 
        category_id: 16, // General
        dosage: '30-day supply', 
        prices: { retail: 12500, wholesale_tiers: [{min_quantity: 5, price: 10500}] }, 
        stock_status: 'in_stock', 
        stock_quantity: 100,
        image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1770052901/wellness-removebg-preview_i0hj7p.png', 
        min_order_quantity: 1
    }
];