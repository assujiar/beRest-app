import { supabase } from "@/lib/supabase";
import { SmartBanner } from "@/components/SmartBanner";

interface Props { params: Promise<{ code: string }> }
const DAY_LABELS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export default async function StudentPortalPage({ params }: Props) {
  const { code } = await params;
  // Lookup student by consumer connection or business slug
  const { data: biz } = await supabase.from("businesses").select("*").eq("slug", code).single();
  if (!biz) {
    return <main className="min-h-screen flex items-center justify-center p-4"><div className="text-center"><p className="text-6xl mb-4">🔍</p><h1 className="text-xl font-bold">Tidak ditemukan</h1></div></main>;
  }

  const [{ data: schedules }, { data: students }] = await Promise.all([
    supabase.from("schedules").select("*").eq("business_id", biz.id).order("day_of_week").order("start_time"),
    supabase.from("students").select("*").eq("business_id", biz.id).eq("is_active", true).order("name"),
  ]);

  return (
    <><SmartBanner /><main className="max-w-md mx-auto p-4 pb-20">
      <div className="text-center mb-6 pt-4">
        <p className="text-4xl mb-2">📚</p>
        <h1 className="text-xl font-bold text-gray-900">{biz.name}</h1>
        {biz.description && <p className="text-gray-500 text-sm mt-1">{biz.description}</p>}
      </div>

      <h2 className="text-sm font-bold text-gray-500 mb-2">JADWAL</h2>
      <div className="space-y-2 mb-6">
        {(schedules ?? []).map((sc: { id: string; day_of_week: number; start_time: string; end_time: string; subject: string | null }) => (
          <div key={sc.id} className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="font-bold text-gray-900">{DAY_LABELS[sc.day_of_week]}</p>
            <p className="text-sm text-[#10B981]">{sc.start_time} - {sc.end_time}</p>
            {sc.subject && <p className="text-xs text-gray-500">{sc.subject}</p>}
          </div>
        ))}
      </div>

      <h2 className="text-sm font-bold text-gray-500 mb-2">MURID ({students?.length ?? 0})</h2>
      <div className="space-y-2">
        {(students ?? []).map((s: { id: string; name: string; monthly_fee: number }) => (
          <div key={s.id} className="bg-white rounded-xl p-4 border border-gray-200 flex justify-between items-center">
            <p className="font-bold text-gray-900">{s.name}</p>
            <p className="text-sm font-bold text-[#10B981]">Rp {s.monthly_fee.toLocaleString("id-ID")}/bln</p>
          </div>
        ))}
      </div>
      <p className="text-center text-xs text-gray-400 mt-8">Dibuat dengan beRest</p>
    </main></>
  );
}
