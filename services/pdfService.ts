import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Generates a PDF from a specified HTML element and initiates a download.
 * @param elementId The ID of the HTML element to capture.
 * @param filename The desired filename for the downloaded PDF.
 */
export const generatePdfFromElement = async (elementId: string, filename: string): Promise<void> => {
    const input = document.getElementById(elementId);
    if (!input) {
        throw new Error(`PDF Generation Error: Element with id '${elementId}' not found.`);
    }

    try {
        const canvas = await html2canvas(input, {
            scale: 2, // Use a higher scale for better resolution
            useCORS: true, // Important for external images
            logging: false,
        });

        const imgData = canvas.toDataURL('image/png');
        
        // A4 page size in mm: 210 x 297
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        
        // Calculate the aspect ratio to fit the image onto the page while maintaining proportions
        const ratio = Math.min((pdfWidth - 20) / canvasWidth, (pdfHeight - 20) / canvasHeight);
        
        const imgWidth = canvasWidth * ratio;
        const imgHeight = canvasHeight * ratio;

        // Center the image on the page with a 10mm margin
        const x = (pdfWidth - imgWidth) / 2;
        const y = 10;

        pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
        pdf.save(filename);

    } catch (error) {
        console.error("Error generating PDF:", error);
        throw new Error("Could not generate the PDF. Please try again.");
    }
};
