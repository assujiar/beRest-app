import { useState } from "react";
import { View, Text } from "react-native";
import { Modal } from "@components/ui/Modal";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { archiveConnection, setAutoArchiveDate } from "@services/connection-lifecycle.service";
import { useUIStore } from "@stores/ui.store";

interface ArchiveConnectionModalProps {
  visible: boolean;
  onClose: () => void;
  connectionId: string;
  consumerName: string;
  moduleType: string;
  onArchived: () => void;
}

export function ArchiveConnectionModal({
  visible,
  onClose,
  connectionId,
  consumerName,
  moduleType,
  onArchived,
}: ArchiveConnectionModalProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const showToast = useUIStore((s) => s.showToast);

  async function handleArchiveNow() {
    setLoading(true);
    try {
      await archiveConnection(connectionId, "provider", reason || undefined);
      showToast(`${consumerName} sudah diarsipkan`, "success");
      onArchived();
      onClose();
    } catch {
      showToast("Gagal mengarsipkan. Coba lagi.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleArchiveWithGrace() {
    setLoading(true);
    try {
      await setAutoArchiveDate(connectionId, moduleType);
      showToast(`${consumerName} akan otomatis diarsipkan`, "success");
      onArchived();
      onClose();
    } catch {
      showToast("Gagal mengatur arsip otomatis. Coba lagi.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Tandai Keluar"
    >
      <Text className="text-sm text-grey-text mb-4">
        {consumerName} akan diarsipkan dari daftar aktif. Data tetap tersimpan
        dan bisa dilihat di Riwayat.
      </Text>

      <Input
        label="Alasan (opsional)"
        placeholder="contoh: Sudah pindah kos"
        value={reason}
        onChangeText={setReason}
      />

      <View className="mt-6">
        <Button
          title="Arsipkan Sekarang"
          variant="destructive"
          onPress={handleArchiveNow}
          loading={loading}
        />
        <View className="mt-3">
          <Button
            title="Arsipkan Otomatis (Masa Tenggang)"
            variant="secondary"
            onPress={handleArchiveWithGrace}
            loading={loading}
          />
        </View>
      </View>
    </Modal>
  );
}
