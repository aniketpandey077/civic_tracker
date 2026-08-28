import QRCode from 'qrcode';
import { CivicIssue } from './types';

export async function generateQRCodeDataURL(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      margin: 1,
      width: 160,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('Failed to generate QR code', err);
    return '';
  }
}

// Function to trigger client-side printing or PDF export of the receipt element
export async function downloadReceiptPDF(elementId: string, complaintNumber: string) {
  if (typeof window === 'undefined') return;

  try {
    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF } = await import('jspdf');

    const element = document.getElementById(elementId);
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a5',
    });

    const imgWidth = 148;
    const pageHeight = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, Math.min(imgHeight, pageHeight));
    pdf.save(`CivicTrack_Receipt_${complaintNumber}.pdf`);
  } catch (error) {
    console.error('Error generating PDF receipt:', error);
    // Fallback: trigger standard window print
    window.print();
  }
}
