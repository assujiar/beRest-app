import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { formatRupiah } from "@utils/format";

/** Export data as PDF and share */
export async function exportPDF(title: string, htmlContent: string): Promise<void> {
  const html = `
    <html><head><meta charset="utf-8"><style>
      body { font-family: sans-serif; padding: 20px; color: #1E293B; }
      h1 { color: #1B3A5C; font-size: 24px; }
      table { width: 100%; border-collapse: collapse; margin-top: 16px; }
      th, td { border: 1px solid #E2E8F0; padding: 8px; text-align: left; font-size: 12px; }
      th { background: #F8FAFC; font-weight: bold; }
      .total { font-weight: bold; font-size: 16px; color: #1B3A5C; }
      .footer { margin-top: 24px; font-size: 10px; color: #94A3B8; text-align: center; }
    </style></head><body>
      <h1>${title}</h1>
      ${htmlContent}
      <div class="footer">Dibuat dengan Apick • ${new Date().toLocaleDateString("id-ID")}</div>
    </body></html>
  `;

  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: title });
}

/** Export financial report as PDF */
export async function exportFinancialReport(
  orgName: string,
  transactions: { type: string; description: string; amount: number; transaction_date: string }[],
  summary: { totalIncome: number; totalExpense: number; balance: number }
): Promise<void> {
  const rows = transactions.map((tx) =>
    `<tr><td>${new Date(tx.transaction_date).toLocaleDateString("id-ID")}</td><td>${tx.description}</td><td style="color:${tx.type === "income" ? "green" : "red"}">${tx.type === "income" ? "+" : "-"}${formatRupiah(tx.amount)}</td></tr>`
  ).join("");

  const html = `
    <p class="total">Pemasukan: ${formatRupiah(summary.totalIncome)}</p>
    <p class="total">Pengeluaran: ${formatRupiah(summary.totalExpense)}</p>
    <p class="total">Saldo: ${formatRupiah(summary.balance)}</p>
    <table><thead><tr><th>Tanggal</th><th>Keterangan</th><th>Jumlah</th></tr></thead><tbody>${rows}</tbody></table>
  `;

  await exportPDF(`Laporan Keuangan - ${orgName}`, html);
}

/** Export member dues as PDF */
export async function exportDuesReport(
  orgName: string,
  period: string,
  dues: { name: string; amount: number; status: string }[]
): Promise<void> {
  const rows = dues.map((d) =>
    `<tr><td>${d.name}</td><td>${formatRupiah(d.amount)}</td><td>${d.status === "paid" ? "✅ Lunas" : "❌ Belum"}</td></tr>`
  ).join("");

  const html = `
    <p>Periode: <strong>${period}</strong></p>
    <table><thead><tr><th>Nama</th><th>Jumlah</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>
  `;

  await exportPDF(`Iuran ${orgName} - ${period}`, html);
}

/** Generate CSV string and share */
export async function exportCSV(
  filename: string,
  headers: string[],
  rows: string[][]
): Promise<void> {
  const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
  const html = `<html><body><pre>${csv}</pre></body></html>`;
  const { uri } = await Print.printToFileAsync({ html });
  // Rename to CSV by sharing with correct mime type
  await Sharing.shareAsync(uri, { mimeType: "text/csv", dialogTitle: filename });
}
