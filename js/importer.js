/* =========================================================================
   TEMPLATE & SPREADSHEET IMPORTER
   ========================================================================= */

import { studioState } from './state.js';

let rawWorkbook = null;
let rawSheetRows = [];

export function loadTemplateImageFile(file, onLoaded, onError) {
  if (!file || !file.type.startsWith('image/')) {
    if (onError) onError('Please upload a valid image file (PNG, JPG, or WEBP)');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      studioState.templateImage = img;
      studioState.templateWidth = img.naturalWidth;
      studioState.templateHeight = img.naturalHeight;
      studioState.templateLoaded = true;
      studioState.templateFileName = file.name;

      // Calculate proportional default font size
      const suggestedSize = Math.round(studioState.templateHeight * 0.06);
      studioState.fontSize = suggestedSize;

      if (onLoaded) onLoaded(file, img);
    };
    img.onerror = () => {
      if (onError) onError('Failed to load image file');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

export function parseSpreadsheetFile(file, onParsed, onError) {
  const ext = file.name.toLowerCase();
  if (!ext.endsWith('.xlsx') && !ext.endsWith('.xls') && !ext.endsWith('.csv')) {
    if (onError) onError('Please upload an Excel (.xlsx, .xls) or CSV file');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      rawWorkbook = XLSX.read(data, { type: 'array' });
      if (onParsed) onParsed(rawWorkbook, file);
    } catch (err) {
      console.error(err);
      if (onError) onError('Failed to parse spreadsheet format');
    }
  };
  reader.readAsArrayBuffer(file);
}

export function getExcelColumnsList(hasHeader) {
  if (!rawWorkbook) return { columns: [], selectedIndex: 0 };
  
  const sheetName = rawWorkbook.SheetNames[0];
  const sheet = rawWorkbook.Sheets[sheetName];
  rawSheetRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  if (!rawSheetRows || rawSheetRows.length === 0) {
    return { columns: [], selectedIndex: 0 };
  }

  const headerRow = rawSheetRows[0] || [];
  const colCount = Math.max(...rawSheetRows.map(r => (r ? r.length : 0)));
  const columns = [];
  let selectedIndex = 0;
  let highestScore = -1;

  for (let i = 0; i < colCount; i++) {
    let label = `Column ${i + 1}`;
    if (hasHeader && headerRow[i] !== undefined && String(headerRow[i]).trim() !== '') {
      label = `${headerRow[i]} (Col ${i + 1})`;
    } else {
      const sample = (rawSheetRows[hasHeader ? 1 : 0] || [])[i];
      if (sample) label += ` - "${String(sample).slice(0, 15)}"`;
    }

    columns.push({ index: i, label });

    const headerStr = String(headerRow[i] || '').toLowerCase();
    const keywords = ['name', 'student', 'candidate', 'participant', 'recipient', 'full name', 'attendee'];
    keywords.forEach((kw, scoreIdx) => {
      if (headerStr.includes(kw) && (10 - scoreIdx) > highestScore) {
        highestScore = 10 - scoreIdx;
        selectedIndex = i;
      }
    });
  }

  return { columns, selectedIndex };
}

export function extractColumnNames(colIndex, hasHeader) {
  if (!rawSheetRows || rawSheetRows.length === 0) return [];
  const start = hasHeader ? 1 : 0;
  const names = [];

  for (let i = start; i < rawSheetRows.length; i++) {
    const row = rawSheetRows[i];
    if (row && row[colIndex] !== undefined) {
      names.push(row[colIndex]);
    }
  }

  return names;
}
