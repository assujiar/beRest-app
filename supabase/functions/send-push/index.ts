// Supabase Edge Function: Send push notification via Expo Push API
// Triggered by app after creating in-app notification
// Deploy: supabase functions deploy send-push

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

interface PushRequest {
  user_ids: string[];
  title: string;
  body?: string;
  data?: Record<string, unknown>;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { user_ids, title, body, data } = (await req.json()) as PushRequest;

    if (!user_ids?.length || !title) {
      return new Response(
        JSON.stringify({ error: "user_ids dan title wajib diisi" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch push tokens for target users
    const { data: tokens, error: tokenError } = await supabase
      .from("push_tokens")
      .select("token")
      .in("user_id", user_ids);

    if (tokenError) {
      return new Response(
        JSON.stringify({ error: tokenError.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!tokens?.length) {
      return new Response(
        JSON.stringify({ sent: 0, message: "Tidak ada push token terdaftar" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // Build Expo push messages
    const messages = tokens.map((t) => ({
      to: t.token,
      sound: "default" as const,
      title,
      body: body ?? "",
      data: data ?? {},
    }));

    // Send in batches of 100 (Expo limit)
    let sent = 0;
    for (let i = 0; i < messages.length; i += 100) {
      const batch = messages.slice(i, i + 100);
      const response = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(batch),
      });

      if (response.ok) {
        sent += batch.length;
      } else {
        console.error(
          "[send-push] Expo API error:",
          await response.text()
        );
      }
    }

    return new Response(
      JSON.stringify({ sent, total_tokens: tokens.length }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[send-push] Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
