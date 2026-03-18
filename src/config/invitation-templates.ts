import type { InvitationTemplate, EventType } from "@app-types/hajat.types";

/**
 * Built-in invitation templates for Hajat events.
 * Each template defines colors and a preview image URL.
 * Used in event creation to pick visual style.
 */
export const INVITATION_TEMPLATES: InvitationTemplate[] = [
  // ==================== NIKAH ====================
  {
    id: "nikah-elegant-gold",
    name: "Emas Elegan",
    event_type: "nikah",
    preview_url: null,
    bg_color: "#FFF8E7",
    text_color: "#5C4A28",
  },
  {
    id: "nikah-green-garden",
    name: "Taman Hijau",
    event_type: "nikah",
    preview_url: null,
    bg_color: "#F0FFF4",
    text_color: "#1A4731",
  },
  {
    id: "nikah-navy-classic",
    name: "Navy Klasik",
    event_type: "nikah",
    preview_url: null,
    bg_color: "#F0F4FF",
    text_color: "#1B3A5C",
  },

  // ==================== KHITAN ====================
  {
    id: "khitan-blue-sky",
    name: "Langit Biru",
    event_type: "khitan",
    preview_url: null,
    bg_color: "#EFF6FF",
    text_color: "#1E40AF",
  },
  {
    id: "khitan-green-fresh",
    name: "Hijau Segar",
    event_type: "khitan",
    preview_url: null,
    bg_color: "#ECFDF5",
    text_color: "#065F46",
  },

  // ==================== AQIQAH ====================
  {
    id: "aqiqah-pink-soft",
    name: "Pink Lembut",
    event_type: "aqiqah",
    preview_url: null,
    bg_color: "#FFF1F2",
    text_color: "#9F1239",
  },
  {
    id: "aqiqah-blue-baby",
    name: "Biru Bayi",
    event_type: "aqiqah",
    preview_url: null,
    bg_color: "#EFF6FF",
    text_color: "#1E3A5F",
  },

  // ==================== ULTAH ====================
  {
    id: "ultah-colorful",
    name: "Warna-warni",
    event_type: "ultah",
    preview_url: null,
    bg_color: "#FFFBEB",
    text_color: "#92400E",
  },
  {
    id: "ultah-pastel",
    name: "Pastel Manis",
    event_type: "ultah",
    preview_url: null,
    bg_color: "#FDF2F8",
    text_color: "#831843",
  },

  // ==================== SYUKURAN ====================
  {
    id: "syukuran-warm",
    name: "Hangat",
    event_type: "syukuran",
    preview_url: null,
    bg_color: "#FFF7ED",
    text_color: "#7C2D12",
  },

  // ==================== DUKA ====================
  {
    id: "duka-putih-tenang",
    name: "Putih Tenang",
    event_type: "duka",
    preview_url: null,
    bg_color: "#FAFAFA",
    text_color: "#3F3F46",
  },

  // ==================== CUSTOM ====================
  {
    id: "custom-simple",
    name: "Sederhana",
    event_type: "custom",
    preview_url: null,
    bg_color: "#FFFFFF",
    text_color: "#1E293B",
  },
  {
    id: "custom-navy",
    name: "Navy Modern",
    event_type: "custom",
    preview_url: null,
    bg_color: "#F0F4FF",
    text_color: "#1B3A5C",
  },
];

/** Get templates for a specific event type */
export function getTemplatesForType(eventType: EventType): InvitationTemplate[] {
  return INVITATION_TEMPLATES.filter((t) => t.event_type === eventType);
}

/** Get template by ID */
export function getTemplate(id: string): InvitationTemplate | null {
  return INVITATION_TEMPLATES.find((t) => t.id === id) ?? null;
}

/** Generate invitation HTML for sharing/rendering */
export function generateInvitationHTML(params: {
  template: InvitationTemplate;
  eventTitle: string;
  eventDate: string;
  eventTime: string | null;
  locationName: string | null;
  locationAddress: string | null;
  guestName: string;
  customMessage: string | null;
  rsvpUrl: string | null;
}): string {
  const { template, eventTitle, eventDate, eventTime, locationName, locationAddress, guestName, customMessage, rsvpUrl } = params;

  const formattedDate = new Date(eventDate).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });

  return `
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
    <body style="margin:0;padding:0;background:${template.bg_color};color:${template.text_color};font-family:Georgia,serif;">
      <div style="max-width:480px;margin:0 auto;padding:40px 24px;text-align:center;">
        <p style="font-size:14px;opacity:0.7;margin-bottom:8px;">Kepada Yth.</p>
        <p style="font-size:20px;font-weight:bold;margin-bottom:32px;">${guestName}</p>

        <div style="width:40px;height:1px;background:${template.text_color};opacity:0.3;margin:0 auto 32px;"></div>

        <p style="font-size:12px;text-transform:uppercase;letter-spacing:2px;opacity:0.6;margin-bottom:8px;">Undangan</p>
        <h1 style="font-size:28px;margin:0 0 24px;">${eventTitle}</h1>

        ${customMessage ? `<p style="font-size:14px;line-height:1.6;opacity:0.8;margin-bottom:24px;">${customMessage}</p>` : ""}

        <div style="background:${template.text_color}10;border-radius:12px;padding:20px;margin-bottom:24px;text-align:left;">
          <p style="margin:0 0 8px;font-size:13px;"><strong>Tanggal:</strong> ${formattedDate}</p>
          ${eventTime ? `<p style="margin:0 0 8px;font-size:13px;"><strong>Waktu:</strong> ${eventTime} WIB</p>` : ""}
          ${locationName ? `<p style="margin:0 0 8px;font-size:13px;"><strong>Tempat:</strong> ${locationName}</p>` : ""}
          ${locationAddress ? `<p style="margin:0;font-size:12px;opacity:0.7;">${locationAddress}</p>` : ""}
        </div>

        ${rsvpUrl ? `
          <a href="${rsvpUrl}" style="display:inline-block;background:${template.text_color};color:${template.bg_color};padding:12px 32px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:bold;">
            Konfirmasi Kehadiran
          </a>
        ` : ""}

        <div style="margin-top:40px;opacity:0.4;font-size:11px;">
          <p>Dibuat dengan Apick</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
