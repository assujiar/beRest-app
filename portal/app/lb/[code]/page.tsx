import { supabase } from "@/lib/supabase";
import { SmartBanner } from "@/components/SmartBanner";

interface Props { params: Promise<{ code: string }> }

const STATUS_LABELS: Record<string, string> = {
  received: "Diterima", washing: "Dicuci", drying: "Dikeringkan",
  ironing: "Disetrika", ready: "✅ Siap Ambil", picked_up: "Diambil", cancelled: "Dibatalkan",
};
const STEPS = ["received", "washing", "drying", "ironing", "ready", "picked_up"];

export default async function LaundryStatusPage({ params }: Props) {
  const { code } = await params;
  const { data: order } = await supabase.from("laundry_orders").select("*, businesses(name)").eq("order_code", code.toUpperCase()).single();

  if (!order) {
    return <main className="min-h-screen flex items-center justify-center p-4"><div className="text-center"><p className="text-6xl mb-4">🔍</p><h1 className="text-xl font-bold">Order tidak ditemukan</h1><p className="text-gray-500 mt-2">Pastikan kode order benar.</p></div></main>;
  }

  const currentStep = STEPS.indexOf(order.status);

  return (
    <><SmartBanner /><main className="max-w-md mx-auto p-4 pb-20">
      <div className="text-center mb-6 pt-4">
        <p className="text-4xl mb-2">👕</p>
        <h1 className="text-xl font-bold text-gray-900">{order.businesses?.name ?? "Laundry"}</h1>
        <p className="text-gray-500 text-sm font-mono">{order.order_code}</p>
      </div>
      <div className="bg-white rounded-xl p-4 border border-gray-200 mb-4 text-center">
        <p className="text-xs text-gray-500">Status</p>
        <p className="text-2xl font-bold text-[#10B981]">{STATUS_LABELS[order.status]}</p>
        <p className="text-lg font-bold text-gray-900 mt-2">Rp {order.total.toLocaleString("id-ID")}</p>
      </div>
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <p className="text-sm font-bold text-gray-500 mb-3">PROGRESS</p>
        {STEPS.map((step, i) => (
          <div key={step} className="flex items-center mb-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${i <= currentStep ? "bg-[#10B981] text-white" : "bg-gray-200 text-gray-400"}`}>
              {i <= currentStep ? <span className="text-xs">✓</span> : <span className="text-xs">{i + 1}</span>}
            </div>
            <span className={`text-sm ${i <= currentStep ? "font-bold text-gray-900" : "text-gray-400"}`}>{STATUS_LABELS[step]}</span>
          </div>
        ))}
      </div>
      <p className="text-center text-xs text-gray-400 mt-8">Dibuat dengan Apick</p>
    </main></>
  );
}
