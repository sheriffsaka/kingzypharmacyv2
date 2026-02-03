import { supabase } from '../lib/supabase/client';

/**
 * Mocked Document Service
 * Prevents "Failed to fetch" errors by simulating the PDF generation process
 * instead of calling a non-existent Supabase Edge Function.
 */
export const getDocument = async (
    documentType: 'invoice' | 'receipt', 
    documentId: number
): Promise<{ downloadUrl?: string; error?: string }> => {
    try {
        // Simulate network delay for generation
        await new Promise(resolve => setTimeout(resolve, 1200));

        // Use a reliable public PDF sample for the demo download
        const mockPdfUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
        
        return { downloadUrl: mockPdfUrl };

    } catch (err: any) {
        console.error(`Error in getDocument for ${documentType} #${documentId}:`, err);
        return { error: "Failed to generate document. Please try again later." };
    }
};