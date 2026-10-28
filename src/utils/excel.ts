/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-manager
 * https://github.com/wsrh8888/beaver-manager
 *
 * beaver-manager-header-v1
 */

// 写出 Office Open XML（.xlsx，Excel 2007+）。
// 银行卡号、单号按文本单元格落盘，避免被收成科学计数法。

export type ExcelCell = string | number

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let k = 0; k < 8; k++)
      c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1
    table[i] = c >>> 0
  }
  return table
})()

function crc32(bytes: Uint8Array): number {
  let crc = 0xFFFFFFFF
  for (let i = 0; i < bytes.length; i++)
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8)
  return (crc ^ 0xFFFFFFFF) >>> 0
}

function u16(n: number): Uint8Array {
  return new Uint8Array([n & 0xFF, (n >>> 8) & 0xFF])
}

function u32(n: number): Uint8Array {
  return new Uint8Array([n & 0xFF, (n >>> 8) & 0xFF, (n >>> 16) & 0xFF, (n >>> 24) & 0xFF])
}

function concat(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((n, p) => n + p.length, 0)
  const out = new Uint8Array(total)
  let offset = 0
  for (const p of parts) {
    out.set(p, offset)
    offset += p.length
  }
  return out
}

function encodeUtf8(text: string): Uint8Array {
  return new TextEncoder().encode(text)
}

function zipStore(files: Array<{ name: string, data: Uint8Array }>): Uint8Array {
  const locals: Uint8Array[] = []
  const centrals: Uint8Array[] = []
  let offset = 0
  for (const file of files) {
    const name = encodeUtf8(file.name)
    const crc = crc32(file.data)
    const local = concat([
      u32(0x04034B50),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(file.data.length),
      u32(file.data.length),
      u16(name.length),
      u16(0),
      name,
      file.data
    ])
    locals.push(local)
    centrals.push(concat([
      u32(0x02014B50),
      u16(20),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(file.data.length),
      u32(file.data.length),
      u16(name.length),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(offset),
      name
    ]))
    offset += local.length
  }
  const central = concat(centrals)
  const end = concat([
    u32(0x06054B50),
    u16(0),
    u16(0),
    u16(files.length),
    u16(files.length),
    u32(central.length),
    u32(offset),
    u16(0)
  ])
  return concat([...locals, central, end])
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function colLetter(index: number): string {
  let n = index + 1
  let s = ""
  while (n > 0) {
    const r = (n - 1) % 26
    s = String.fromCharCode(65 + r) + s
    n = Math.floor((n - 1) / 26)
  }
  return s
}

function safeSheetName(name: string): string {
  const cleaned = name.replace(/[:\\/?*[\]]/g, " ").trim() || "Sheet1"
  return cleaned.slice(0, 31)
}

function cellXml(value: ExcelCell, ref: string, style: number): string {
  if (typeof value === "number" && Number.isFinite(value))
    return `<c r="${ref}" s="${style}"><v>${value}</v></c>`
  return `<c r="${ref}" t="inlineStr" s="${style}"><is><t>${xmlEscape(String(value ?? ""))}</t></is></c>`
}

function sheetXml(headers: string[], rows: ExcelCell[][]): string {
  const width = Math.max(headers.length, ...rows.map(r => r.length), 1)
  const header = headers.map((h, i) => cellXml(h, `${colLetter(i)}1`, 3)).join("")
  const body = rows.map((row, r) => {
    const cells = Array.from({ length: width }, (_, i) => {
      const value = row[i]
      const ref = `${colLetter(i)}${r + 2}`
      if (typeof value === "number" && Number.isFinite(value))
        return cellXml(value, ref, 2)
      return cellXml(value ?? "", ref, 1)
    }).join("")
    return `<row r="${r + 2}">${cells}</row>`
  }).join("")
  const cols = Array.from({ length: width }, (_, i) => {
    const w = i === 5 ? 24 : 16
    return `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`
  }).join("")
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <cols>${cols}</cols>
  <sheetData>
    <row r="1">${header}</row>
    ${body}
  </sheetData>
</worksheet>`
}

function workbookXml(sheetName: string): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="${xmlEscape(safeSheetName(sheetName))}" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`
}

const CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`

const ROOT_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`

const WORKBOOK_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`

const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <numFmts count="2">
    <numFmt numFmtId="164" formatCode="@"/>
    <numFmt numFmtId="165" formatCode="0.00"/>
  </numFmts>
  <fonts count="2">
    <font><sz val="11"/><name val="Calibri"/></font>
    <font><b/><sz val="11"/><name val="Calibri"/></font>
  </fonts>
  <fills count="2">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
  </fills>
  <borders count="1">
    <border><left/><right/><top/><bottom/><diagonal/></border>
  </borders>
  <cellStyleXfs count="1"><xf/></cellStyleXfs>
  <cellXfs count="4">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
    <xf numFmtId="165" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
    <xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>
  </cellXfs>
</styleSheet>`

export function downloadExcel(filename: string, sheetName: string, headers: string[], rows: ExcelCell[][]) {
  const xlsx = zipStore([
    { name: "[Content_Types].xml", data: encodeUtf8(CONTENT_TYPES) },
    { name: "_rels/.rels", data: encodeUtf8(ROOT_RELS) },
    { name: "xl/workbook.xml", data: encodeUtf8(workbookXml(sheetName)) },
    { name: "xl/_rels/workbook.xml.rels", data: encodeUtf8(WORKBOOK_RELS) },
    { name: "xl/styles.xml", data: encodeUtf8(STYLES) },
    { name: "xl/worksheets/sheet1.xml", data: encodeUtf8(sheetXml(headers, rows)) }
  ])
  const blob = new Blob([xlsx], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
