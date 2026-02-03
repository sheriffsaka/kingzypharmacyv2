import { OrderStatus } from '../types';

/**
 * Mock Payment Service
 * Updated to bypass direct Supabase table queries that cause "Failed to fetch"
 * in restricted demo environments.
 */
export const mockUpdatePaymentAndOrderStatus = async (orderId: number, targetPaymentStatus: 'paid' | 'failed'): Promise<{ success: boolean; message: string }> => {
    try {
        // Simulate server-side processing
        await new Promise(resolve => setTimeout(resolve, 1000));

        const newOrderStatus: OrderStatus = targetPaymentStatus === 'paid' ? 'PROCESSING' : 'CANCELLED';
        
        // In a real app, we would update Supabase here. 
        // For the demo, we return a success signal to update the UI.
        return { 
            success: true, 
            message: `[MOCK] Order #${orderId} marked as ${targetPaymentStatus}. Status changed to ${newOrderStatus}.` 
        };

    } catch (error: any) {
        console.error("Mock payment confirmation failed:", error);
        return { success: false, message: "Network error during payment simulation." };
    }
};