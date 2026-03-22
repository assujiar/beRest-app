// Supabase Auth Hook: Custom SMS Provider via Twilio WhatsApp
// Intercepts Supabase OTP and sends via WhatsApp instead of SMS
// Deploy: supabase functions deploy send-otp-whatsapp --no-verify-jwt
// Setup: Supabase Dashboard → Auth → Hooks → Custom SMS Provider → point to this function

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID")!;
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN")!;
const TWILIO_WHATSAPP_FROM = Deno.env.get("TWILIO_WHATSAPP_FROM") ?? "whatsapp:+14155238886"; // Sandbox default

interface AuthHookPayload {
  user: {
    phone: string;
  };
  sms: {
    otp: string;
  };
}

Deno.serve(async (req) => {
  // Verify request is from Supabase (check webhook secret)
  const hookSecret = Deno.env.get("SUPABASE_AUTH_HOOK_SECRET");
  if (hookSecret) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${hookSecret}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  try {
    const payload: AuthHookPayload = await req.json();
    const { phone } = payload.user;
    const { otp } = payload.sms;

    // Send OTP via Twilio WhatsApp
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

    const body = new URLSearchParams({
      To: `whatsapp:${phone}`,
      From: TWILIO_WHATSAPP_FROM,
      Body: `Kode verifikasi Apick kamu: *${otp}*\n\nJangan bagikan kode ini ke siapapun.\nKode berlaku 5 menit.`,
    });

    const twilioResponse = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    const result = await twilioResponse.json();

    if (!twilioResponse.ok) {
      console.error("Twilio WhatsApp error:", result);
      return new Response(
        JSON.stringify({ error: `Gagal kirim OTP: ${result.message ?? "Unknown error"}` }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`OTP sent via WhatsApp to ${phone}, SID: ${result.sid}`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Send OTP WhatsApp error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
