"use client";

import { useState, useEffect } from "react";
import { SmartBanner } from "@/components/SmartBanner";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";

const TYPE_LABELS: Record<string, string> = { nikah: "Pernikahan", khitan: "Khitanan", aqiqah: "Aqiqah", ultah: "Ulang Tahun", syukuran: "Syukuran", duka: "Duka Cita", custom: "Acara" };

export default function RsvpPage() {
  const params = useParams<{ slug: string; guest: string }>();
  const [event, setEvent] = useState<Record<string, unknown> | null>(null);
  const [guest, setGuest] = useState<Record<string, unknown> | null>(null);
  const [rsvp, setRsvp] = useState<string>("pending");
  const [count, setCount] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const { data: ev } = await supabase.from("hajat_events").select("*").eq("slug", params.slug).single();
    if (!ev) { setLoading(false); return; }
    setEvent(ev);
    const { data: g } = await supabase.from("event_guests").select("*").eq("event_id", ev.id).eq("guest_code", params.guest).single();
    if (g) { setGuest(g); setRsvp(g.rsvp_status as string); setCount(g.rsvp_count as number); }
    // Mark invitation opened
    if (g) await supabase.from("event_guests").update({ invitation_opened: true }).eq("id", g.id);
    setLoading(false);
  }

  async function handleSubmit() {
    if (!guest) return;
    await supabase.from("event_guests").update({ rsvp_status: rsvp, rsvp_count: count }).eq("id", guest.id as string);
    setSubmitted(true);
  }

  if (loading) return <main className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Memuat...</p></main>;
  if (!event || !guest) return <main className="min-h-screen flex items-center justify-center p-4"><div className="text-center"><p className="text-6xl mb-4">💌</p><h1 className="text-xl font-bold">Undangan tidak ditemukan</h1></div></main>;

  const eventDate = new Date(event.event_date as string).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-6xl mb-4">{rsvp === "attending" ? "🎉" : "🙏"}</p>
          <h1 className="text-xl font-bold text-gray-900">{rsvp === "attending" ? "Terima kasih! Sampai jumpa!" : "Terima kasih konfirmasinya"}</h1>
        </div>
      </main>
    );
  }

  return (
    <><SmartBanner /><main className="max-w-md mx-auto pb-20">
      <div className="bg-gradient-to-b from-[#EC4899] to-[#DB2777] text-white text-center py-10 px-6 rounded-b-3xl">
        <p className="text-sm opacity-80">{TYPE_LABELS[event.type as string] ?? "Acara"}</p>
        <h1 className="text-2xl font-bold mt-1">{event.title as string}</h1>
        <p className="text-sm opacity-80 mt-2">Kepada Yth. <strong>{guest.name as string}</strong></p>
      </div>

      <div className="px-4 -mt-6">
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 text-center">
          <p className="text-sm text-gray-500">📅 {eventDate}</p>
          {event.event_time && <p className="text-sm text-[#EC4899]">🕐 {event.event_time as string} WIB</p>}
          {event.location_name && <p className="text-sm font-bold text-gray-900 mt-2">📍 {event.location_name as string}</p>}
        </div>

        {/* RSVP Form */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 mt-4">
          <h2 className="text-lg font-bold text-gray-900 text-center mb-4">Konfirmasi Kehadiran</h2>
          <div className="space-y-2 mb-4">
            {[{ key: "attending", label: "Ya, saya hadir", icon: "✅" }, { key: "not_attending", label: "Maaf, tidak bisa hadir", icon: "❌" }, { key: "maybe", label: "Belum pasti", icon: "🤔" }].map((opt) => (
              <button key={opt.key} onClick={() => setRsvp(opt.key)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition ${rsvp === opt.key ? "border-[#EC4899] bg-pink-50" : "border-gray-200"}`}>
                <span className="mr-2">{opt.icon}</span>{opt.label}
              </button>
            ))}
          </div>

          {rsvp === "attending" && (
            <div className="mb-4">
              <label className="text-sm text-gray-500 block mb-1">Jumlah orang yang hadir</label>
              <div className="flex items-center justify-center gap-4">
                <button onClick={() => setCount(Math.max(1, count - 1))} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">-</button>
                <span className="text-2xl font-bold">{count}</span>
                <button onClick={() => setCount(Math.min(10, count + 1))} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">+</button>
              </div>
            </div>
          )}

          <button onClick={handleSubmit} className="w-full bg-[#EC4899] text-white py-3 rounded-xl font-bold hover:opacity-90 transition">
            Konfirmasi
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-8">Dibuat dengan Apick</p>
    </main></>
  );
}
