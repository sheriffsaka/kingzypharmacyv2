import { supabase } from '../lib/supabase/client';
import { OrderStatus } from '../types';

export const mockUpdatePaymentAndOrderStatus = async (orderId: number, targetPaymentStatus: 'paid' | 'failed'): Promise<{ success: boolean; message: string }> => {
    try {
        // 1. Find the latest payment record for the order that is not already settled
        const { data: payment, error: paymentError } = await supabase
            .from('payments')
            .select('id, payment_status')
            .eq('order_id', orderId)
            .neq('payment_status', 'paid')
            .neq('payment_status', 'pay_on_delivery')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (paymentError || !payment) {
            if (paymentError?.code === 'PGRST116') { // PostgREST code for "No rows found"
                 return { success: false, message: 'This order has already been paid or no pending online payment was found.' };
            }
            throw new Error('Could not find a pending payment record for this order.');
        }

        // 2. Update the payment status
        const { error: updatePaymentError } = await supabase
            .from('payments')
            .update({ 
                payment_status: targetPaymentStatus,
                verified_at: new Date().toISOString() 
            })
            .eq('id', payment.id);

        if (updatePaymentError) {
            throw new Error(`Failed to update payment record: ${updatePaymentError.message}`);
        }

        // 3. Update the corresponding order status
        // FIX: Changed 'processing' and 'cancelled' to uppercase to match the OrderStatus type.
        const newOrderStatus: OrderStatus = targetPaymentStatus === 'paid' ? 'PROCESSING' : 'CANCELLED';
        const { error: updateOrderError } = await supabase
            .from('orders')
            .update({ status: newOrderStatus })
            .eq('id', orderId);

        if (updateOrderError) {
            // In a real scenario, you'd handle this more gracefully (e.g., retry or log for manual intervention)
            throw new Error(`Payment updated, but failed to update order status: ${updateOrderError.message}`);
        }
        
        return { success: true, message: `Successfully marked payment as ${targetPaymentStatus} and updated order to ${newOrderStatus}.` };

    } catch (error: any) {
        console.error("Mock payment confirmation failed:", error);
        return { success: false, message: error.message };
    }
};