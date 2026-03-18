import { useState } from "react";
import { View, Text } from "react-native";
import { Modal } from "@components/ui/Modal";
import { Button } from "@components/ui/Button";
import { shareToWhatsApp, shareViaWhatsApp } from "@services/wa-share.service";
import { createNotification } from "@services/notification.service";
import { useUIStore } from "@stores/ui.store";
import { formatRupiah } from "@utils/format";
import type { OrgDues } from "@app-types/warga.types";

interface ReminderSheetProps {
  visible: boolean;
  onClose: () => void;
  orgName: string;
  providerId: string;
  unpaidMembers: (OrgDues & { org_members?: { name: string; phone: string | null } })[];
  period: string;
}

export function ReminderSheet({
  visible,
  onClose,
  orgName,
  providerId,
  unpaidMembers,
  period,
}: ReminderSheetProps) {
  const showToast = useUIStore((s) => s.showToast);
  const [loading, setLoading] = useState(false);

  async function handlePushReminder() {
    setLoading(true);
    try {
      for (const dues of unpaidMembers) {
        const member = dues.org_members;
        if (!member) continue;

        // Create in-app notification if consumer is linked
        await createNotification({
          userId: providerId, // Will be routed to consumer via connection
          providerId,
          module: "warga",
          type: "payment_due",
          title: `Pengingat Iuran ${orgName}`,
          body: `Iuran ${period} sebesar ${formatRupiah(dues.amount)} belum dibayar.`,
        });
      }
      showToast(`Notifikasi terkirim ke ${unpaidMembers.length} anggota`, "success");
      onClose();
    } catch {
      showToast("Gagal kirim notifikasi", "error");
    } finally {
      setLoading(false);
    }
  }

  function handleWAReminder() {
    const names = unpaidMembers
      .map((d) => d.org_members?.name ?? "Anggota")
      .join(", ");
    const amount = unpaidMembers[0]?.amount ?? 0;

    const message =
      `📋 *Pengingat Iuran ${orgName}*\n\n` +
      `Periode: ${period}\n` +
      `Jumlah: ${formatRupiah(amount)}\n\n` +
      `Yang belum bayar: ${names}\n\n` +
      `Mohon segera dilunasi ya. Terima kasih! 🙏`;

    // If only one person with phone, send directly
    if (unpaidMembers.length === 1 && unpaidMembers[0].org_members?.phone) {
      shareToWhatsApp(unpaidMembers[0].org_members.phone, message);
    } else {
      shareViaWhatsApp(message);
    }
    onClose();
  }

  return (
    <Modal visible={visible} onClose={onClose} title="Kirim Pengingat">
      <Text className="text-sm text-grey-text mb-4">
        {unpaidMembers.length} anggota belum bayar iuran {period}
      </Text>

      <Button
        title={`Kirim Push Notifikasi (${unpaidMembers.length} orang)`}
        onPress={handlePushReminder}
        loading={loading}
      />
      <View className="mt-3">
        <Button
          title="Kirim via WhatsApp"
          variant="whatsapp"
          onPress={handleWAReminder}
        />
      </View>
    </Modal>
  );
}
