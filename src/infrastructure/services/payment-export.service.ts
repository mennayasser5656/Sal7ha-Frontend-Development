import type {
  Payment,
  PaymentExportFormat,
  PaymentExportOption,
  PaymentSummary,
} from "@/domain/entities/Payment";

export const PAYMENT_EXPORT_OPTIONS: PaymentExportOption[] = [
  { label: "EXCEL", format: "excel" },
  { label: "PDF", format: "pdf" },
  { label: "Word", format: "word" },
  { label: "Google Docs", format: "google-docs" },
  { label: "Dashboard", format: "dashboard" },
];

const EXPORT_HEADERS = [
  { key: "id", label: "Payment ID" },
  { key: "customer", label: "Customer" },
  { key: "item", label: "Item / Service" },
  { key: "method", label: "Method" },
  { key: "date", label: "Date" },
  { key: "amount", label: "Amount" },
  { key: "kind", label: "Type" },
] as const;

function escapeHtml(value: string | number) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeXml(value: string | number) {
  return escapeHtml(value).replace(/'/g, "&apos;");
}

function escapePdfText(value: string | number) {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function downloadBlob(content: BlobPart, fileName: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function createExcelWorkbook(payments: Payment[]) {
  const headerCells = EXPORT_HEADERS.map(
    (column) =>
      `<Cell><Data ss:Type="String">${escapeXml(column.label)}</Data></Cell>`,
  ).join("");
  const rows = payments
    .map((payment) => {
      const cells = EXPORT_HEADERS.map((column) => {
        const value = payment[column.key];
        const type = typeof value === "number" ? "Number" : "String";
        return `<Cell><Data ss:Type="${type}">${escapeXml(value)}</Data></Cell>`;
      }).join("");
      return `<Row>${cells}</Row>`;
    })
    .join("");

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="Payments">
    <Table>
      <Row>${headerCells}</Row>
      ${rows}
    </Table>
  </Worksheet>
</Workbook>`;
}

function createHtmlTable(payments: Payment[], title: string) {
  const headers = EXPORT_HEADERS.map(
    (column) => `<th>${escapeHtml(column.label)}</th>`,
  ).join("");
  const rows = payments
    .map((payment) => {
      const cells = EXPORT_HEADERS.map(
        (column) => `<td>${escapeHtml(payment[column.key])}</td>`,
      ).join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <style>
      body { font-family: Arial, sans-serif; color: #222; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; text-align: left; }
      th { background: #f3f3f3; }
    </style>
  </head>
  <body>
    <h1>${escapeHtml(title)}</h1>
    <table>
      <thead><tr>${headers}</tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </body>
</html>`;
}

function createPdf(payments: Payment[]) {
  const lines = [
    "Payments History",
    `Generated: ${new Date().toLocaleString()}`,
    "",
    ...payments.map(
      (payment) =>
        `${payment.id} | ${payment.customer} | ${payment.item} | ${payment.method} | ${payment.date} | $${payment.amount}`,
    ),
  ];
  const stream = [
    "BT",
    "/F1 10 Tf",
    "40 800 Td",
    "14 TL",
    ...lines.slice(0, 52).map((line) => `(${escapePdfText(line)}) Tj T*`),
    "ET",
  ].join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${
    objects.length + 1
  } /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return pdf;
}

export function exportPaymentHistory({
  format,
  payments,
  summary,
}: {
  format: PaymentExportFormat;
  payments: Payment[];
  summary: PaymentSummary;
}) {
  if (format === "excel") {
    downloadBlob(
      createExcelWorkbook(payments),
      "payments-history.xls",
      "application/vnd.ms-excel;charset=utf-8",
    );
    return;
  }

  if (format === "pdf") {
    downloadBlob(createPdf(payments), "payments-history.pdf", "application/pdf");
    return;
  }

  if (format === "word") {
    downloadBlob(
      createHtmlTable(payments, "Payments History"),
      "payments-history.doc",
      "application/msword;charset=utf-8",
    );
    return;
  }

  if (format === "google-docs") {
    downloadBlob(
      createHtmlTable(payments, "Payments History for Google Docs"),
      "payments-google-docs.html",
      "text/html;charset=utf-8",
    );
    return;
  }

  downloadBlob(
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        summary,
        schema: EXPORT_HEADERS,
        payments,
      },
      null,
      2,
    ),
    "payments-dashboard-data.json",
    "application/json;charset=utf-8",
  );
}
