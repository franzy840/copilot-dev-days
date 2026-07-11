import ExcelJS from 'exceljs';
import { fetchAllTables } from './db.js';

function addSheet(workbook: ExcelJS.Workbook, name: string, rows: Record<string, unknown>[]) {
  const sheet = workbook.addWorksheet(name);
  if (rows.length === 0) {
    sheet.addRow(['No submissions yet']);
    return;
  }
  const columns = Object.keys(rows[0]);
  sheet.columns = columns.map((key) => ({ header: key, key, width: 22 }));
  for (const row of rows) {
    const flat: Record<string, unknown> = {};
    for (const key of columns) {
      const value = row[key];
      flat[key] = value && typeof value === 'object' ? JSON.stringify(value) : value;
    }
    sheet.addRow(flat);
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
  addSheet(workbook, 'Quiz', quiz);
  addSheet(workbook, 'Feedback', feedback);

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
