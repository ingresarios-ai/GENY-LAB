import type { jsPDF } from 'jspdf';
import { PDF_HEADER_LOGO } from './pdfHeaderLogo';

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 18;
const HEADER_HEIGHT = 45;

/**
 * Adds the dark header background and the logo to the current page.
 */
function drawHeader(doc: jsPDF) {
  // Dark header background
  doc.setFillColor(8, 12, 20); // Deep dark blue/black
  doc.rect(0, 0, PAGE_WIDTH, HEADER_HEIGHT, 'F');
  
  // Cyan bottom border for the header
  doc.setFillColor(0, 212, 255);
  doc.rect(0, HEADER_HEIGHT - 1, PAGE_WIDTH, 1, 'F');

  // Add the logo image
  try {
    const imgProps = doc.getImageProperties(PDF_HEADER_LOGO);
    // Target width for the logo
    const targetWidth = 120;
    const targetHeight = (imgProps.height * targetWidth) / imgProps.width;
    
    // Center the logo in the header
    const x = (PAGE_WIDTH - targetWidth) / 2;
    const y = (HEADER_HEIGHT - targetHeight) / 2;
    
    doc.addImage(PDF_HEADER_LOGO, 'PNG', x, y, targetWidth, targetHeight);
  } catch (e) {
    console.warn("Failed to add logo to PDF header:", e);
    // Fallback text if logo fails
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text("GENY LAB", PAGE_WIDTH / 2, HEADER_HEIGHT / 2 + 8, { align: 'center' });
  }
}

/**
 * Initializes a new PDF document with the standard light theme and dark header.
 * Returns the starting Y coordinate for content.
 */
export function initPdfWithHeader(doc: jsPDF, activityTitle: string): number {
  // White background for the whole page
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F');

  drawHeader(doc);

  let y = HEADER_HEIGHT + 15;

  // Add the activity title
  doc.setTextColor(30, 41, 59); // slate-800
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(activityTitle.toUpperCase(), MARGIN, y);
  
  // Date and timestamp on the right
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(dateStr, PAGE_WIDTH - MARGIN, y, { align: 'right' });

  // Return next Y coordinate
  return y + 15;
}

/**
 * Checks if the upcoming content will exceed the page height.
 * If so, adds a new page, redraws the header, and returns the new Y coordinate.
 */
export function checkPageBreak(doc: jsPDF, currentY: number, heightNeeded: number): number {
  if (currentY + heightNeeded > PAGE_HEIGHT - MARGIN) {
    doc.addPage();
    // White background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F');
    drawHeader(doc);
    return HEADER_HEIGHT + 15;
  }
  return currentY;
}

/**
 * Adds text with automatic text wrapping and page breaking.
 * Returns the new Y coordinate after the text is drawn.
 */
export function addPdfText(
  doc: jsPDF, 
  text: string, 
  y: number, 
  options: { 
    fontSize?: number; 
    color?: [number, number, number]; 
    fontStyle?: 'normal' | 'bold' | 'italic';
    align?: 'left' | 'center' | 'right';
    maxWidth?: number;
    lineHeight?: number;
  } = {}
): number {
  const {
    fontSize = 12,
    color = [51, 65, 85], // slate-700
    fontStyle = 'normal',
    align = 'left',
    maxWidth = PAGE_WIDTH - (MARGIN * 2),
    lineHeight = 6
  } = options;

  doc.setFontSize(fontSize);
  doc.setTextColor(color[0], color[1], color[2]);
  doc.setFont('helvetica', fontStyle);

  const lines = doc.splitTextToSize(text, maxWidth);
  let currentY = y;

  for (let i = 0; i < lines.length; i++) {
    currentY = checkPageBreak(doc, currentY, lineHeight);
    
    let xPos = MARGIN;
    if (align === 'center') xPos = PAGE_WIDTH / 2;
    if (align === 'right') xPos = PAGE_WIDTH - MARGIN;

    doc.text(lines[i], xPos, currentY, { align });
    currentY += lineHeight;
  }

  return currentY;
}
