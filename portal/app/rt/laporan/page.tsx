import { supabase } from "@/lib/supabase";
import { SmartBanner } from "@/components/SmartBanner";

interface Props {
  searchParams: Promise<{ org?: string }>;
}

async function getFinancialReport(orgId: string) {
  const [{ data: org }, { data: transactions }] = await Promise.all([
    supabase.from("organizations").select("*").eq("id", orgId).single(),
    supabase
      .from("org_transactions")
      .select("*")
      .eq("org_id", orgId)
      .order("transaction_date", { ascending: false }),
  ]);

  if (!org) return null;

  let totalIncome = 0;
  let totalExpense = 0;
  for (const tx of transactions ?? []) {
    if (tx.type === "income") totalIncome += tx.amount;
    else totalExpense += tx.amount;
  }

  return {
    org,
    transactions: transactions ?? [],
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
  };
}

export default async function FinancialReportPage({ searchParams }: Props) {
  const { org: orgId } = await searchParams;

  if (!orgId) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Parameter organisasi tidak ditemukan.</p>
      </main>
    );
  }

  const data = await getFinancialReport(orgId);

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Organisasi tidak ditemukan.</p>
      </main>
    );
  }

  const { org, transactions, totalIncome, totalExpense, balance } = data;

  return (
    <>
      <SmartBanner />
      <main className="max-w-md mx-auto p-4 pb-20">
        <div className="text-center mb-6 pt-4">
          <p className="text-4xl mb-2">📊</p>
          <h1 className="text-xl font-bold text-gray-900">
            Laporan Keuangan
          </h1>
          <p className="text-gray-500 text-sm">{org.name}</p>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Pemasukan</p>
              <p className="text-lg font-bold text-green-600">
                Rp {totalIncome.toLocaleString("id-ID")}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Pengeluaran</p>
              <p className="text-lg font-bold text-red-500">
                Rp {totalExpense.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">Saldo</p>
            <p className="text-2xl font-bold text-gray-900">
              Rp {balance.toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        {/* Transaction list */}
        <h2 className="text-sm font-bold text-gray-500 mb-2">
          RIWAYAT TRANSAKSI
        </h2>
        <div className="space-y-2">
          {transactions.map(
            (tx: {
              id: string;
              type: string;
              description: string;
              amount: number;
              transaction_date: string;
            }) => (
              <div
                key={tx.id}
                className="bg-white rounded-xl p-4 border border-gray-200 flex items-center"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                    tx.type === "income" ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  <span className="text-sm">
                    {tx.type === "income" ? "↓" : "↑"}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">
                    {tx.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(tx.transaction_date).toLocaleDateString("id-ID")}
                  </p>
                </div>
                <p
                  className={`font-bold ${
                    tx.type === "income" ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {tx.type === "income" ? "+" : "-"}Rp{" "}
                  {tx.amount.toLocaleString("id-ID")}
                </p>
              </div>
            )
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          Dibuat dengan Apick • {new Date().toLocaleDateString("id-ID")}
        </p>
      </main>
    </>
  );
}
