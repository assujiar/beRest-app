import { supabase } from "@/lib/supabase";
import { SmartBanner } from "@/components/SmartBanner";

interface Props { params: Promise<{ code: string }> }
const STATUS_LABELS: Record<string, string> = { active: "Dipinjam", returned: "Dikembalikan", overdue: "Terlambat" };
const STATUS_COLORS: Record<string, string> = { active: "bg-blue-100 text-blue-700", returned: "bg-green-100 text-green-700", overdue: "bg-red-100 text-red-700" };

export default async function RentalStatusPage({ params }: Props) {
  const { code } = await params;
  const { data: tx } = await supabase.from("rental_transactions").select("*, rental_items(name, daily_rate)").eq("rental_code", code.toUpperCase()).single();

  if (!tx) return <main className="min-h-screen flex items-center justify-center p-4"><div className="text-center"><p className="text-6xl mb-4">🔍</p><h1 className="text-xl font-bold">Rental tidak ditemukan</h1></div></main>;

  const startDate = new Date(tx.start_date);
  const now = new Date();
  const days = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / 86400000));

  return (
    <><SmartBanner /><main className="max-w-md mx-auto p-4 pb-20">
      <div className="text-center mb-6 pt-4">
        <p className="text-4xl mb-2">📦</p>
        <h1 className="text-xl font-bold text-gray-900">{tx.rental_items?.name ?? "Barang"}</h1>
        <p className="text-gray-500 text-sm font-mono">{tx.rental_code}</p>
      </div>
      <div className="bg-white rounded-xl p-4 border border-gray-200 mb-4 text-center">
        <p className="text-xs text-gray-500">Status</p>
        <span className={`inline-block text-sm font-bold px-3 py-1 rounded-full mt-1 ${STATUS_COLORS[tx.status] ?? ""}`}>{STATUS_LABELS[tx.status]}</span>
      </div>
      <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-3">
        <div className="flex justify-between"><span className="text-gray-500">Peminjam</span><span className="font-bold">{tx.borrower_name}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Tanggal Pinjam</span><span>{startDate.toLocaleDateString("id-ID")}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Durasi</span><span>{days} hari</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Tarif</span><span>Rp {tx.daily_rate.toLocaleString("id-ID")}/hari</span></div>
        {tx.total_cost && <div className="flex justify-between border-t pt-3 border-gray-100"><span className="text-gray-500 font-bold">Total</span><span className="font-bold text-[#3B82F6]">Rp {tx.total_cost.toLocaleString("id-ID")}</span></div>}
      </div>
      <p className="text-center text-xs text-gray-400 mt-8">Dibuat dengan Apick</p>
    </main></>
  );
}
