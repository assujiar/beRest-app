import { supabase } from "@/lib/supabase";
import { SmartBanner } from "@/components/SmartBanner";

interface Props { params: Promise<{ slug: string }> }

const TYPE_LABELS: Record<string, string> = { nikah: "Pernikahan", khitan: "Khitanan", aqiqah: "Aqiqah", ultah: "Ulang Tahun", syukuran: "Syukuran", duka: "Duka Cita", custom: "Acara" };

export default async function InvitationPage({ params }: Props) {
  const { slug } = await params;
  const { data: event } = await supabase.from("hajat_events").select("*").eq("slug", slug).eq("status", "published").single();

  if (!event) {
    return <main className="min-h-screen flex items-center justify-center p-4"><div className="text-center"><p className="text-6xl mb-4">💌</p><h1 className="text-xl font-bold">Undangan tidak ditemukan</h1></div></main>;
  }

  const eventDate = new Date(event.event_date).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <><SmartBanner /><main className="max-w-md mx-auto pb-20">
      {/* Hero */}
      <div className="bg-gradient-to-b from-[#EC4899] to-[#DB2777] text-white text-center py-12 px-6 rounded-b-3xl">
        <p className="text-sm opacity-80">{TYPE_LABELS[event.type] ?? "Acara"}</p>
        <h1 className="text-3xl font-bold mt-2">{event.title}</h1>
      </div>

      <div className="px-4 -mt-6">
        {/* Details card */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-500">📅 Tanggal</p>
            <p className="text-lg font-bold text-gray-900">{eventDate}</p>
            {event.event_time && <p className="text-sm text-[#EC4899]">🕐 {event.event_time} WIB</p>}
          </div>

          {event.location_name && (
            <div className="text-center mb-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">📍 Tempat</p>
              <p className="text-lg font-bold text-gray-900">{event.location_name}</p>
              {event.location_address && <p className="text-xs text-gray-500">{event.location_address}</p>}
              {event.location_maps_url && (
                <a href={event.location_maps_url} target="_blank" rel="noopener" className="text-sm text-[#EC4899] font-bold mt-1 inline-block">Buka Maps →</a>
              )}
            </div>
          )}

          {event.custom_message && (
            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-700 text-center italic">{event.custom_message}</p>
            </div>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-8">Dibuat dengan Apick</p>
    </main></>
  );
}
