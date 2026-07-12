import ExcelJS from 'exceljs';
import { fetchAllTables } from './db.js';
import { formatQuizAnswers, formatFeedbackRatings } from './format.js';

function addSheet(workbook: ExcelJS.Workbook, name: string, rows: Record<string, unknown>[], formatColumn?: Record<string, (value: unknown) => string>) {
  const sheet = workbook.addWorksheet(name);
  if (rows.length === 0) {
    sheet.addRow(['No submissions yet']);
    return;
  }
  const columns = Object.keys(rows[0]);
  sheet.columns = columns.map((key) => ({
    header: key,
    key,
    width: formatColumn?.[key] ? 70 : 22,
  }));
  for (const row of rows) {
    const flat: Record<string, unknown> = {};
    for (const key of columns) {
      const value = row[key];
      if (formatColumn?.[key]) {
        flat[key] = formatColumn[key](value);
      } else {
        flat[key] = value && typeof value === 'object' ? JSON.stringify(value) : value;
      }
    }
    const newRow = sheet.addRow(flat);
    for (const key of columns) {
      if (formatColumn?.[key]) newRow.getCell(key).alignment = { wrapText: true, vertical: 'top' };
    }
  }
  sheet.getRow(1).font = { bold: true };
}

export async function buildWorkbookBuffer(): Promise<Buffer> {
  const { contactInfo, wideningAccess, localInduction, quiz, feedback } = await fetchAllTables();
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Work Experience Forms';
  workbook.created = new Date();

  addSheet(workbook, 'Contact Info', contactInfo);
  addSheet(workbook, 'Widening Access', wideningAccess);
  addSheet(workbook, 'Local Induction', localInduction);
  addSheet(workbook, 'Quiz', quiz, {
    answers: (v) => formatQuizAnswers(v as Record<string, number>),
  });
  addSheet(workbook, 'Feedback', feedback, {
    ratings: (v) => formatFeedbackRatings(v as Record<string, { score?: number; comment?: string }>),
  });

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
