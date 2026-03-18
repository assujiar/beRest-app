import { supabase } from "@/lib/supabase";
import { SmartBanner } from "@/components/SmartBanner";

interface Props { params: Promise<{ slug: string }> }
const STATUS_LABELS: Record<string, string> = { waiting: "Menunggu", serving: "Dilayani", completed: "Selesai", cancelled: "Batal" };

export default async function QueuePortalPage({ params }: Props) {
  const { slug } = await params;
  const { data: biz } = await supabase.from("businesses").select("*").eq("slug", slug).single();
  if (!biz) {
    return <main className="min-h-screen flex items-center justify-center p-4"><div className="text-center"><p className="text-6xl mb-4">🔍</p><h1 className="text-xl font-bold">Tidak ditemukan</h1></div></main>;
  }

  const today = new Date().toISOString().split("T")[0];
  const [{ data: serving }, { data: queue }] = await Promise.all([
    supabase.from("queue_entries").select("*").eq("business_id", biz.id).eq("status", "serving").gte("created_at", `${today}T00:00:00`).single(),
    supabase.from("queue_entries").select("*").eq("business_id", biz.id).gte("created_at", `${today}T00:00:00`).order("queue_number"),
  ]);

  const waitingCount = (queue ?? []).filter((q: { status: string }) => q.status === "waiting").length;

  return (
    <><SmartBanner /><main className="max-w-md mx-auto p-4 pb-20">
      <div className="text-center mb-6 pt-4">
        <p className="text-4xl mb-2">📋</p>
        <h1 className="text-xl font-bold text-gray-900">{biz.name}</h1>
        {biz.address && <p className="text-gray-400 text-xs mt-1">📍 {biz.address}</p>}
      </div>

      {/* Now serving */}
      <div className="bg-[#10B981] rounded-xl p-6 text-center mb-4">
        <p className="text-white/70 text-sm">Sedang Dilayani</p>
        <p className="text-white text-5xl font-bold mt-1">#{serving?.queue_number ?? "-"}</p>
        {serving && <p className="text-white/80 text-sm mt-1">{serving.customer_name}</p>}
      </div>

      <div className="bg-white rounded-xl p-4 border border-gray-200 text-center mb-4">
        <p className="text-gray-500 text-sm">Antrian Menunggu</p>
        <p className="text-3xl font-bold text-gray-900">{waitingCount}</p>
      </div>

      <h2 className="text-sm font-bold text-gray-500 mb-2">ANTRIAN</h2>
      <div className="space-y-2">
        {(queue ?? []).map((q: { id: string; queue_number: number; customer_name: string; status: string }) => (
          <div key={q.id} className={`rounded-xl p-3 border flex items-center ${q.status === "serving" ? "bg-green-50 border-green-200" : "bg-white border-gray-200"}`}>
            <span className="text-xl font-bold text-gray-900 w-12">#{q.queue_number}</span>
            <span className="flex-1 text-sm text-gray-700">{q.customer_name}</span>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${q.status === "serving" ? "bg-green-100 text-green-700" : q.status === "completed" ? "bg-gray-100 text-gray-500" : "bg-blue-100 text-blue-700"}`}>
              {STATUS_LABELS[q.status] ?? q.status}
            </span>
          </div>
        ))}
      </div>
      <p className="text-center text-xs text-gray-400 mt-8">Dibuat dengan Apick</p>
    </main></>
  );
}
