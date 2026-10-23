// A small stand-in for Google Sheets + Apps Script, backed by HyperFormula, so setup-warehouse.gs can run
// in Node and its formulas can be evaluated. Only the calls the warehouse script makes are implemented.
// Run tests with TZ=UTC: dates are written and read as UTC midnights, and HyperFormula's TODAY() is local.
import { HyperFormula } from 'hyperformula';

const SERIAL_EPOCH = Date.UTC(1899, 11, 30);
export const toSerial = (d) => Math.round((Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - SERIAL_EPOCH) / 86400000);
export const serialToYmd = (n) => new Date(SERIAL_EPOCH + n * 86400000).toISOString().slice(0, 10);

const colNum = (L) => [...L].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0);

// Shift row-relative references (A2, $A2) by k rows, leaving $-anchored rows (B$4, $1:$1) alone.
export function shiftRows(formula, k) {
  if (!k) return formula;
  let out = '', inStr = false;
  for (let i = 0; i < formula.length; i++) {
    const ch = formula[i];
    if (ch === '"') { inStr = !inStr; out += ch; continue; }
    if (inStr) { out += ch; continue; }
    const m = /^(\$?)([A-Z]{1,3})(\$?)(\d+)/.exec(formula.slice(i));
    const prev = formula[i - 1] || '';
    if (m && !/[A-Za-z0-9_.]/.test(prev) && !/[(A-Za-z]/.test(formula[i + m[0].length] || '')) {
      out += m[1] + m[2] + m[3] + (m[3] ? m[4] : String(Number(m[4]) + k));
      i += m[0].length - 1;
      continue;
    }
    out += ch;
  }
  return out;
}

export function createRuntime() {
  const hf = HyperFormula.buildEmpty({ licenseKey: 'gpl-v3', maxRows: 5000, maxColumns: 60, useArrayArithmetic: true });
  const sheets = new Map();
  const toasts = [];

  const toCell = (v) => {
    if (v instanceof Date) return toSerial(v);
    if (typeof v === 'string' && v.startsWith('=')) return v.replace(/COUNTUNIQUE\(/g, 'COUNTA(');   // HyperFormula has no COUNTUNIQUE
    return v;
  };

  class Range {
    constructor(sheet, row, col, nr, nc) { Object.assign(this, { sheet, row, col, nr, nc }); }
    setValues(values) {
      const id = hf.getSheetId(this.sheet.name);
      hf.batch(() => values.forEach((r, i) => r.forEach((v, j) => {
        hf.setCellContents({ sheet: id, row: this.row - 1 + i, col: this.col - 1 + j }, [[toCell(v)]]);
      })));
      return this;
    }
    setValue(v) { return this.setValues([[v]]); }
    setFormula(f) {
      const id = hf.getSheetId(this.sheet.name);
      hf.batch(() => {
        for (let i = 0; i < this.nr; i++) for (let j = 0; j < this.nc; j++)
          hf.setCellContents({ sheet: id, row: this.row - 1 + i, col: this.col - 1 + j }, [[toCell(shiftRows(f, i))]]);
      });
      return this;
    }
    getValues() {
      const id = hf.getSheetId(this.sheet.name);
      const out = [];
      for (let i = 0; i < this.nr; i++) {
        const row = [];
        for (let j = 0; j < this.nc; j++) {
          const v = hf.getCellValue({ sheet: id, row: this.row - 1 + i, col: this.col - 1 + j });
          row.push(v === null ? '' : v);
        }
        out.push(row);
      }
      return out;
    }
    clearContent() {
      const id = hf.getSheetId(this.sheet.name);
      hf.batch(() => { for (let i = 0; i < this.nr; i++) for (let j = 0; j < this.nc; j++) hf.setCellContents({ sheet: id, row: this.row - 1 + i, col: this.col - 1 + j }, [[null]]); });
      return this;
    }
    setNumberFormat() { return this; }
    setFontWeight() { return this; }
    setWrap() { return this; }
  }

  class Sheet {
    constructor(name) { this.name = name; hf.addSheet(name); }
    getName() { return this.name; }
    getRange(a, b, c, d) {
      if (typeof a === 'string') {
        const m = /^([A-Z]+)(\d+)(?::([A-Z]+)(\d*))?$/.exec(a);
        if (!m) throw new Error('mock cannot parse range ' + a);
        const r1 = Number(m[2]), c1 = colNum(m[1]);
        if (!m[3]) return new Range(this, r1, c1, 1, 1);
        const r2 = m[4] ? Number(m[4]) : Math.max(r1, this.getLastRow());
        return new Range(this, r1, c1, r2 - r1 + 1, colNum(m[3]) - c1 + 1);
      }
      return new Range(this, a, b, c || 1, d || 1);
    }
    dims() { return hf.getSheetDimensions(hf.getSheetId(this.name)); }
    getLastRow() {
      const values = hf.getSheetSerialized(hf.getSheetId(this.name));
      for (let i = values.length - 1; i >= 0; i--) if ((values[i] || []).some((v) => v !== null && v !== undefined && v !== '')) return i + 1;
      return 0;
    }
    getLastColumn() { return this.dims().width; }
    clear() { hf.clearSheet(hf.getSheetId(this.name)); }
    clearContents() { this.clear(); }
    setFrozenRows() {} autoResizeColumns() {} setColumnWidth() {}
  }

  const ss = {
    getSheetByName: (n) => sheets.get(n) || null,
    insertSheet: (n) => { const s = new Sheet(n); sheets.set(n, s); return s; },
    setSpreadsheetTimeZone() {}, setSpreadsheetLocale() {},
    setActiveSheet() {}, moveActiveSheet() {},
    deleteSheet(s) { hf.removeSheet(hf.getSheetId(s.name)); sheets.delete(s.name); },
    toast: (msg) => toasts.push(msg),
  };

  const globals = {
    SpreadsheetApp: {
      getActiveSpreadsheet: () => ss,
      getActive: () => ss,
      getUi: () => ({ alert: () => 'OK', ButtonSet: { OK_CANCEL: 1 }, Button: { OK: 'OK' }, createMenu: () => ({ addItem() { return this; }, addSeparator() { return this; }, addToUi() {} }) }),
    },
    Utilities: {
      formatDate: (d) => d.toISOString().slice(0, 10),
      parseDate: (s) => new Date(s + 'T00:00:00Z'),
    },
  };

  // read a whole tab as objects keyed by its header row
  const table = (name) => {
    const sh = sheets.get(name);
    const rows = sh.getRange(1, 1, sh.getLastRow(), sh.getLastColumn()).getValues();
    const [head, ...body] = rows;
    return body.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i]])));
  };

  return { hf, ss, globals, toasts, table, sheets };
}

// Load an Apps Script file into the runtime; returns its top-level functions.
export function loadAppsScript(source, runtime, names) {
  const fn = new Function(...Object.keys(runtime.globals), `${source}\nreturn { ${names.join(', ')} };`);
  return fn(...Object.values(runtime.globals));
}
