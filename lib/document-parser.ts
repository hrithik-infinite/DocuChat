import mammoth from "mammoth";
import * as XLSX from "xlsx";
import officeParser from "officeparser";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

export type SupportedFileType =
  | "application/pdf"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  | "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  | "text/plain"
  | "text/markdown";

export const SUPPORTED_FILE_TYPES: Record<SupportedFileType, { extension: string; label: string }> = {
  "application/pdf": { extension: ".pdf", label: "PDF" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { extension: ".docx", label: "Word" },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { extension: ".xlsx", label: "Excel" },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": { extension: ".pptx", label: "PowerPoint" },
  "text/plain": { extension: ".txt", label: "Text" },
  "text/markdown": { extension: ".md", label: "Markdown" },
};

export function isSupportedFileType(mimeType: string): mimeType is SupportedFileType {
  return mimeType in SUPPORTED_FILE_TYPES;
}

export function getFileTypeFromExtension(filename: string): SupportedFileType | null {
  const ext = filename.toLowerCase().split(".").pop();
  switch (ext) {
    case "pdf":
      return "application/pdf";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case "pptx":
      return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    case "txt":
      return "text/plain";
    case "md":
      return "text/markdown";
    default:
      return null;
  }
}

async function extractPDF(buffer: Buffer): Promise<string> {
  const uint8Array = new Uint8Array(buffer);
  const loader = new PDFLoader(new Blob([uint8Array]));
  const docs = await loader.load();
  return docs.map((doc) => doc.pageContent).join("\n");
}

async function extractWord(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

async function extractExcel(buffer: Buffer): Promise<string> {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheets: string[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const csv = XLSX.utils.sheet_to_csv(sheet);
    sheets.push(`## Sheet: ${sheetName}\n${csv}`);
  }

  return sheets.join("\n\n");
}

async function extractPowerPoint(buffer: Buffer): Promise<string> {
  const text = await officeParser.parseOfficeAsync(buffer);
  return text;
}

export async function extractTextFromDocument(
  fileUrl: string,
  fileType: SupportedFileType
): Promise<string> {
  const response = await fetch(fileUrl);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  switch (fileType) {
    case "application/pdf":
      return extractPDF(buffer);

    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return extractWord(buffer);

    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      return extractExcel(buffer);

    case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      return extractPowerPoint(buffer);

    case "text/plain":
    case "text/markdown":
      return buffer.toString("utf-8");

    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}
