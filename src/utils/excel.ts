/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-manager
 * https://github.com/wsrh8888/beaver-manager
 *
 * beaver-manager-header-v1
 */

// SpreadsheetML（Excel 2003 XML）。银行卡号、单号一律当文本写出，
// 否则 Excel 会把 19 位卡号收成科学计数法，财务没法用来打款。

export type ExcelCell = string | number

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function cellXml(value: ExcelCell): string {
  if (typeof value === "number" && Number.isFinite(value))
    return `<Cell><Data ss:Type="Number">${value}</Data></Cell>`
  return `<Cell ss:StyleID="sText"><Data ss:Type="String">${xmlEscape(String(value ?? ""))}</Data></Cell>`
}

function rowXml(cells: ExcelCell[]): string {
  return `<Row>${cells.map(cellXml).join("")}</Row>`
}

export function downloadExcel(filename: string, sheetName: string, headers: string[], rows: ExcelCell[][]) {
  const table = [
    rowXml(headers),
    ...rows.map(rowXml)
  ].join("\n")
  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="sText"><NumberFormat ss:Format="@"/></Style>
 </Styles>
 <Worksheet ss:Name="${xmlEscape(sheetName || "Sheet1")}">
  <Table>
${table}
  </Table>
 </Worksheet>
</Workbook>`
  const blob = new Blob([`\uFEFF${xml}`], { type: "application/vnd.ms-excel" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename.endsWith(".xls") ? filename : `${filename}.xls`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
