// Supabase Edge Function: Auto-archive cron
// Runs daily to check and archive expired connections
// Deploy: supabase functions deploy auto-archive
// Cron: supabase functions set-schedule auto-archive --cron "0 2 * * *" (2 AM Jakarta)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

Deno.serve(async (_req) => {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const now = new Date().toISOString();

  // Find connections due for auto-archive
  const { data: dueConnections, error: fetchError } = await supabase
    .from("consumer_connections")
    .select("id, consumer_id, provider_id, module, notes")
    .eq("status", "active")
    .not("auto_archive_at", "is", null)
    .lte("auto_archive_at", now);

  if (fetchError) {
    return new Response(JSON.stringify({ error: fetchError.message }), {
      status: 500,
    });
  }

  let archived = 0;

  for (const conn of dueConnections ?? []) {
    // Archive the connection
    const { error: updateError } = await supabase
      .from("consumer_connections")
      .update({
        status: "archived",
        archived_at: now,
        archived_by: "system",
        archive_reason: "Auto-arsip: masa tenggang habis",
      })
      .eq("id", conn.id);

    if (!updateError) {
      archived++;

      // Notify consumer (in-app + push)
      const notifTitle = "Koneksi Diarsipkan";
      const notifBody = `Koneksi dengan ${conn.notes ?? "provider"} sudah diarsipkan otomatis. Kamu bisa hubungkan kembali di Riwayat.`;

      await supabase.from("notifications").insert({
        user_id: conn.consumer_id,
        provider_id: conn.provider_id,
        module: conn.module,
        type: "announcement",
        title: notifTitle,
        body: notifBody,
        is_read: false,
      });

      // Send push notification
      const { data: tokens } = await supabase
        .from("push_tokens")
        .select("token")
        .eq("user_id", conn.consumer_id);

      if (tokens?.length) {
        await fetch(EXPO_PUSH_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            tokens.map((t) => ({
              to: t.token,
              sound: "default",
              title: notifTitle,
              body: notifBody,
              data: {},
            }))
          ),
        }).catch(() => {});
      }
    }
  }

  return new Response(
    JSON.stringify({
      message: `Auto-archive selesai: ${archived} koneksi diarsipkan`,
      archived,
      checked: dueConnections?.length ?? 0,
    }),
    { headers: { "Content-Type": "application/json" } }
  );
});
