import { supabase } from "@/lib/supabase";
import { SmartBanner } from "@/components/SmartBanner";

interface Props {
  searchParams: Promise<{ org?: string }>;
}

async function getInfaqReport(orgId: string) {
  const [{ data: org }, { data: transactions }, { data: fundraisings }] =
    await Promise.all([
      supabase.from("organizations").select("*").eq("id", orgId).single(),
      supabase
        .from("org_transactions")
        .select("*")
        .eq("org_id", orgId)
        .eq("category", "infaq")
        .order("transaction_date", { ascending: false }),
      supabase
        .from("fundraisings")
        .select("*")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false }),
    ]);

  if (!org) return null;

  const totalInfaq = (transactions ?? []).reduce(
    (sum: number, tx: { amount: number }) => sum + tx.amount,
    0
  );

  return {
    org,
    transactions: transactions ?? [],
    fundraisings: fundraisings ?? [],
    totalInfaq,
  };
}

export default async function InfaqReportPage({ searchParams }: Props) {
  const { org: orgId } = await searchParams;

  if (!orgId) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Parameter organisasi tidak ditemukan.</p>
      </main>
    );
  }

  const data = await getInfaqReport(orgId);

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Organisasi tidak ditemukan.</p>
      </main>
    );
  }

  const { org, transactions, fundraisings, totalInfaq } = data;

  return (
    <>
      <SmartBanner />
      <main className="max-w-md mx-auto p-4 pb-20">
        <div className="text-center mb-6 pt-4">
          <p className="text-4xl mb-2">🕌</p>
          <h1 className="text-xl font-bold text-gray-900">Laporan Infaq</h1>
          <p className="text-gray-500 text-sm">{org.name}</p>
        </div>

        {/* Total */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 mb-4 text-center">
          <p className="text-xs text-gray-500">Total Infaq Terkumpul</p>
          <p className="text-3xl font-bold text-[#8B5CF6]">
            Rp {totalInfaq.toLocaleString("id-ID")}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {transactions.length} donatur
          </p>
        </div>

        {/* Fundraisings */}
        {fundraisings.length > 0 && (
          <>
            <h2 className="text-sm font-bold text-gray-500 mb-2">
              PENGGALANGAN DANA
            </h2>
            <div className="space-y-2 mb-6">
              {fundraisings.map(
                (f: {
                  id: string;
                  title: string;
                  target_amount: number;
                  collected_amount: number;
                  status: string;
                }) => {
                  const progress =
                    f.target_amount > 0
                      ? Math.min(100, (f.collected_amount / f.target_amount) * 100)
                      : 0;
                  return (
                    <div
                      key={f.id}
                      className="bg-white rounded-xl p-4 border border-gray-200"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-bold text-gray-900">{f.title}</p>
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-full ${
                            f.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {f.status === "completed" ? "Tercapai" : "Berjalan"}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                        <div
                          className="h-full bg-[#8B5CF6] rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-bold text-[#8B5CF6]">
                          Rp {f.collected_amount.toLocaleString("id-ID")}
                        </span>
                        <span className="text-gray-500">
                          dari Rp {f.target_amount.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </>
        )}

        {/* Recent donations */}
        <h2 className="text-sm font-bold text-gray-500 mb-2">
          RIWAYAT INFAQ
        </h2>
        <div className="space-y-2">
          {transactions.map(
            (tx: {
              id: string;
              donor_name: string | null;
              amount: number;
              transaction_date: string;
            }) => (
              <div
                key={tx.id}
                className="bg-white rounded-xl p-4 border border-gray-200 flex items-center"
              >
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                  <span className="text-sm">🤲</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">
                    {tx.donor_name ?? "Hamba Allah"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(tx.transaction_date).toLocaleDateString("id-ID")}
                  </p>
                </div>
                <p className="font-bold text-[#8B5CF6]">
                  +Rp {tx.amount.toLocaleString("id-ID")}
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
