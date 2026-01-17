
import { supabase } from '../lib/supabase/client';

export const getDocument = async (
    documentType: 'invoice' | 'receipt', 
    documentId: number
): Promise<{ downloadUrl?: string; error?: string }> => {
    try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
            throw new Error("You must be logged in to download documents.");
        }

        // The edge function name must match the one you create in your Supabase project
        const { data, error } = await supabase.functions.invoke('generate-document', {
            body: { documentType, documentId },
        });

        if (error) {
            // Attempt to parse a more specific error message from the function response
            if (error.context && typeof error.context.json === 'function') {
                const errorJson = await error.context.json();
                throw new Error(errorJson.error || 'Function invocation failed.');
            }
            throw new Error(error.message || 'An unknown error occurred while invoking the function.');
        }

        if (data.error) {
            throw new Error(data.error);
        }

        if (!data.downloadUrl) {
            throw new Error("The function did not return a download URL.");
        }

        return { downloadUrl: data.downloadUrl };

    } catch (err: any) {
        console.error(`Error in getDocument for ${documentType} #${documentId}:`, err);
        return { error: err.message };
    }
};
