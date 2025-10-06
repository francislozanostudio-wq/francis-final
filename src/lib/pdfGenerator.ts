import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { getStudioSettings } from './studioService';
import type { BookingData } from '@/components/booking/MultiStepBookingForm';

export const generateBookingPDF = async (bookingData: BookingData) => {
  const { service, date, time, clientInfo, confirmationNumber } = bookingData;
  
  if (!service || !date || !time || !clientInfo || !confirmationNumber) {
    throw new Error('Incomplete booking data for PDF generation');
  }

  try {
    // Get current studio settings from database
    const studioSettings = await getStudioSettings();
    const studioName = studioSettings?.studio_name || 'Francis Lozano Studio';
    const studioPhone = studioSettings?.studio_phone || '(+1 737-378-5755';
    const studioEmail = studioSettings?.studio_email || 'francislozanostudio@gmail.com';
    const websiteUrl = studioSettings?.website_url || 'https://francislozanostudio.com';
    
    // Get location configuration
    const locationConfig = studioSettings?.location_config;
    const fullAddress = locationConfig?.fullAddress || '';
    const displayAddress = locationConfig?.displayAddress || 'Private Home Studio, Nashville, Tennessee';
    const googleMapsLink = locationConfig?.googleMapsLink || '';
    const parkingInstructions = locationConfig?.parkingInstructions || '';
    const accessInstructions = locationConfig?.accessInstructions || '';

    // Create new PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Colors (RGB values)
    const goldColor = [255, 215, 0]; // Gold
    const blackColor = [15, 15, 35]; // Luxury black
    const grayColor = [107, 114, 128]; // Gray
    const lightGrayColor = [243, 244, 246]; // Light gray

    // Header with gold background
    doc.setFillColor(goldColor[0], goldColor[1], goldColor[2]);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Studio logo/name in header
    doc.setTextColor(blackColor[0], blackColor[1], blackColor[2]);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(studioName, pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Luxury Nail Artistry • Nashville, TN', pageWidth / 2, 30, { align: 'center' });

    // Confirmation number highlight
    doc.setFillColor(lightGrayColor[0], lightGrayColor[1], lightGrayColor[2]);
    doc.rect(15, 50, pageWidth - 30, 20, 'F');
    doc.setTextColor(blackColor[0], blackColor[1], blackColor[2]);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`Confirmation #${confirmationNumber}`, pageWidth / 2, 63, { align: 'center' });

    // Reset text color for content
    doc.setTextColor(blackColor[0], blackColor[1], blackColor[2]);
    
    let yPosition = 90;

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Appointment Confirmation', 20, yPosition);
    yPosition += 20;

    // Client Information Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Client Information', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${clientInfo.fullName}`, 25, yPosition);
    yPosition += 8;
    doc.text(`Email: ${clientInfo.email}`, 25, yPosition);
    yPosition += 8;
    doc.text(`Phone: ${clientInfo.phone}`, 25, yPosition);
    yPosition += 15;

    // Appointment Details Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Appointment Details', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Service: ${service.name}`, 25, yPosition);
    yPosition += 8;
    doc.text(`Date: ${format(date, 'PPPP')}`, 25, yPosition);
    yPosition += 8;
    doc.text(`Time: ${time}`, 25, yPosition);
    yPosition += 8;
    doc.text(`Duration: ${service.duration} minutes`, 25, yPosition);
    yPosition += 8;
    doc.text(`Service Price: $${service.price}`, 25, yPosition);
    yPosition += 8;
    
    // Add-ons section if any
    if (bookingData.selectedAddOns && bookingData.selectedAddOns.length > 0) {
      const addOnsTotal = bookingData.selectedAddOns.reduce((sum, addOn) => sum + addOn.price, 0);
      
      doc.setFont('helvetica', 'bold');
      doc.text(`Add-Ons (${bookingData.selectedAddOns.length}):`, 25, yPosition);
      yPosition += 6;
      
      doc.setFont('helvetica', 'normal');
      bookingData.selectedAddOns.forEach(addOn => {
        doc.text(`  • ${addOn.name} (+$${addOn.price})`, 30, yPosition);
        yPosition += 6;
      });
      
      yPosition += 2;
      doc.text(`Add-Ons Total: +$${addOnsTotal.toFixed(2)}`, 25, yPosition);
      yPosition += 10;
      
      // Total cost with bold
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(`Total Cost: $${(service.price + addOnsTotal).toFixed(2)}`, 25, yPosition);
      yPosition += 15;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
    } else {
      doc.text(`Total Cost: $${service.price}`, 25, yPosition);
      yPosition += 15;
    }

    // Studio Information Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Studio Information', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(studioName, 25, yPosition);
    yPosition += 8;
    doc.text('Private Home Studio', 25, yPosition);
    yPosition += 8;
    doc.text('Nashville, Tennessee', 25, yPosition);
    yPosition += 8;
    doc.text(`Phone: ${studioPhone}`, 25, yPosition);
    yPosition += 8;
    doc.text(`Email: ${studioEmail}`, 25, yPosition);
    yPosition += 8;
    doc.text('*Full address provided separately for privacy', 25, yPosition);
    yPosition += 15;

    // Client Notes (if any)
    if (clientInfo.notes && clientInfo.notes.trim()) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Special Requests/Notes', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      // Split long notes into multiple lines
      const noteLines = doc.splitTextToSize(clientInfo.notes, pageWidth - 50);
      doc.text(noteLines, 25, yPosition);
      yPosition += noteLines.length * 6 + 10;
    }

    // Important Information Section
    doc.setFillColor(lightGrayColor[0], lightGrayColor[1], lightGrayColor[2]);
    doc.rect(15, yPosition, pageWidth - 30, 60, 'F');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Important Information', 20, yPosition + 12);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const importantInfo = [
      '• Please arrive 5 minutes early for check-in',
      '• Come with clean, polish-free nails',
      '• Payment due at time of service (Cash, Venmo, Zelle, Cards accepted)',
      '• 48-hour notice required for cancellations or changes',
      '• Bring inspiration photos if you have specific designs in mind',
      '• Reschedule if feeling unwell for everyone\'s safety'
    ];
    
    let infoY = yPosition + 25;
    importantInfo.forEach(info => {
      doc.text(info, 20, infoY);
      infoY += 7;
    });

    // Footer
    const footerY = pageHeight - 30;
    doc.setFontSize(8);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text(`${studioName} - Luxury Nail Artistry`, pageWidth / 2, footerY, { align: 'center' });
    doc.text(`Generated on ${format(new Date(), 'PPP')} at ${format(new Date(), 'p')}`, pageWidth / 2, footerY + 8, { align: 'center' });

    // Save the PDF
    const fileName = `${studioName.replace(/\s+/g, '-')}-Confirmation-${confirmationNumber}.pdf`;
    doc.save(fileName);
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF confirmation');
  }
};
