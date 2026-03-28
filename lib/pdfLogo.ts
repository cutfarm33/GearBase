import jsPDF from 'jspdf';

/**
 * Loads an image URL and adds it to the top-right of a jsPDF document.
 * Returns the doc for chaining. Silently skips if the image fails to load.
 */
export async function addLogoToDoc(doc: jsPDF, logoUrl: string | undefined): Promise<void> {
    if (!logoUrl) return;
    try {
        const response = await fetch(logoUrl);
        const blob = await response.blob();
        const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
        // Place logo in top-right corner, max 30mm wide x 15mm tall
        const imgProps = doc.getImageProperties(dataUrl);
        const maxW = 30;
        const maxH = 15;
        const ratio = Math.min(maxW / imgProps.width, maxH / imgProps.height);
        const w = imgProps.width * ratio;
        const h = imgProps.height * ratio;
        const x = 210 - 14 - w; // right-aligned with 14mm margin
        doc.addImage(dataUrl, x, 10, w, h);
    } catch {
        // Silently skip if logo can't be loaded
    }
}
