import { Linking, Alert } from "react-native";

const WA_API = "https://api.whatsapp.com/send";

/** Format phone for WA (must be international format without +) */
function formatPhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.substring(1);
  }
  if (cleaned.startsWith("+")) {
    cleaned = cleaned.substring(1);
  }
  return cleaned;
}

/** Open WhatsApp chat with pre-filled message */
export async function shareToWhatsApp(
  phone: string,
  message: string
): Promise<void> {
  const formatted = formatPhone(phone);
  const encoded = encodeURIComponent(message);
  const url = `${WA_API}?phone=${formatted}&text=${encoded}`;

  const canOpen = await Linking.canOpenURL(url);
  if (!canOpen) {
    Alert.alert(
      "WhatsApp Tidak Tersedia",
      "Pastikan WhatsApp sudah terinstall di HP kamu."
    );
    return;
  }
  await Linking.openURL(url);
}

/** Share to WA without specific phone (broadcast) */
export async function shareViaWhatsApp(message: string): Promise<void> {
  const encoded = encodeURIComponent(message);
  const url = `whatsapp://send?text=${encoded}`;

  const canOpen = await Linking.canOpenURL(url);
  if (!canOpen) {
    Alert.alert(
      "WhatsApp Tidak Tersedia",
      "Pastikan WhatsApp sudah terinstall di HP kamu."
    );
    return;
  }
  await Linking.openURL(url);
}

/** Generate share message for a connection code */
export function generateConnectionMessage(
  providerName: string,
  code: string,
  moduleLabel: string
): string {
  return (
    `Halo! Kamu terhubung dengan ${providerName} di Apick.\n\n` +
    `Module: ${moduleLabel}\n` +
    `Kode koneksi: *${code}*\n\n` +
    `Download Apick untuk notifikasi real-time:\n` +
    `https://apick.id/download`
  );
}

/** Generate share message for financial report */
export function generateReportMessage(
  orgName: string,
  reportUrl: string
): string {
  return (
    `📊 Laporan Keuangan ${orgName}\n\n` +
    `Lihat laporan lengkap:\n${reportUrl}\n\n` +
    `Dibuat dengan Apick`
  );
}

/** Generate share message for invitation */
export function generateInvitationMessage(
  eventName: string,
  guestName: string,
  rsvpUrl: string
): string {
  return (
    `Kepada Yth. ${guestName},\n\n` +
    `Anda diundang ke acara: *${eventName}*\n\n` +
    `Konfirmasi kehadiran:\n${rsvpUrl}\n\n` +
    `Dibuat dengan Apick`
  );
}
