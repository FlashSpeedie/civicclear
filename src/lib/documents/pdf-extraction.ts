import * as pdfjsLib from 'pdfjs-dist';

type PDFTextItem = {
  str?: string;
  [key: string]: unknown;
};

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export interface PDFExtractionOptions {
  maxPages?: number;
  maxFileSize?: number;
}

export interface PDFExtractionResult {
  blocks: Array<{
    id: string;
    label: string;
    page: number;
    text: string;
  }>;
  pageCount: number;
  fileName: string;
  fileSize: number;
}

export interface PDFExtractionError {
  code: 'ENCRYPTED' | 'NO_TEXT' | 'TOO_LARGE' | 'TOO_MANY_PAGES' | 'CORRUPT' | 'UNKNOWN';
  message: string;
  details?: string;
}

const DEFAULT_MAX_PAGES = 40;
const DEFAULT_MAX_FILE_SIZE = 12 * 1024 * 1024;
const MAX_TEXT_LENGTH = 100000;

export async function extractTextFromPDF(
  file: File,
  options: PDFExtractionOptions = {}
): Promise<PDFExtractionResult> {
  const maxPages = options.maxPages ?? DEFAULT_MAX_PAGES;
  const maxFileSize = options.maxFileSize ?? DEFAULT_MAX_FILE_SIZE;

  if (file.size > maxFileSize) {
    throw createError('TOO_LARGE', `File size exceeds ${maxFileSize / (1024 * 1024)} MB limit`);
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  if (pdf.numPages > maxPages) {
    throw createError('TOO_MANY_PAGES', `Document has ${pdf.numPages} pages, maximum is ${maxPages}`);
  }

  const blocks: PDFExtractionResult['blocks'] = [];
  let totalText = '';

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    const pageText = textContent.items
      .map((item: PDFTextItem) => (item.str ? item.str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (pageText) {
      const blockId = `page-${pageNum}`;
      blocks.push({
        id: blockId,
        label: `Page ${pageNum}`,
        page: pageNum,
        text: pageText,
      });
      totalText += pageText + '\n\n';
    }
  }

  if (blocks.length === 0) {
    throw createError('NO_TEXT', 'No selectable text found in the PDF. This version supports text-based PDFs only.');
  }

  if (totalText.length > MAX_TEXT_LENGTH) {
    throw createError('TOO_LARGE', `Extracted text exceeds ${MAX_TEXT_LENGTH} character limit`);
  }

  return {
    blocks,
    pageCount: pdf.numPages,
    fileName: file.name,
    fileSize: file.size,
  };
}

function createError(code: PDFExtractionError['code'], message: string, details?: string): PDFExtractionError {
  const error = new Error(message) as Error & PDFExtractionError;
  error.code = code;
  error.details = details;
  return error;
}

export function splitTextIntoBlocks(text: string): Array<{ id: string; label: string; page: number | null; text: string }> {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return paragraphs.map((paragraph, index) => ({
    id: `para-${index + 1}`,
    label: `Paragraph ${index + 1}`,
    page: null,
    text: paragraph,
  }));
}

export function combineBlocksText(blocks: Array<{ text: string }>): string {
  return blocks.map((b) => b.text).join('\n\n');
}