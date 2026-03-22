import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Modal } from '@components/ui/Modal';
import { Button } from '@components/ui/Button';
import { Card } from '@components/ui/Card';
import { Badge } from '@components/ui/Badge';
import { getTierLabel, getTierPrice, getMonthlyEquivalent, getAnnualSavings } from '@services/subscription.service';
import { formatRupiah } from '@utils/format';
import { GRADIENTS, GLASS, RADIUS, TYPO, SPACING } from '@utils/theme';
import type { SubscriptionTier, BillingCycle } from '@app-types/shared.types';
import Svg, { Path } from 'react-native-svg';

interface UpgradeModalProps {
  visible: boolean;
  onClose: () => void;
  currentTier: SubscriptionTier;
  featureName?: string;
}

const TIER_FEATURES: Record<SubscriptionTier, string[]> = {
  free: ['1 modul aktif', '30 anggota / pelanggan', '5 unit properti', '20 produk', '1 acara hajatan', '100 tamu undangan', 'Catat transaksi & iuran', 'Share link ke WhatsApp'],
  starter: ['2 modul aktif', '100 anggota / pelanggan', '20 unit properti', '100 produk', '3 acara hajatan', '500 tamu undangan', 'Scan nota otomatis (AI)', 'Export laporan ke PDF'],
  pro: ['Semua 4 modul aktif', 'Anggota & pelanggan tanpa batas', 'Unit properti tanpa batas', 'Produk tanpa batas', 'Acara hajatan tanpa batas', 'Tamu undangan tanpa batas', 'Semua fitur Starter', 'Analisa & statistik lengkap'],
};

export function UpgradeModal({ visible, onClose, currentTier, featureName }: UpgradeModalProps) {
  const [cycle, setCycle] = useState<BillingCycle>('annual');
  const tiers: SubscriptionTier[] = ['free', 'starter', 'pro'];
  const upgradeTiers = tiers.filter((t) => tiers.indexOf(t) > tiers.indexOf(currentTier));

  return (
    <Modal visible={visible} onClose={onClose} title="Upgrade Apick">
      {featureName && (
        <Text style={{ ...TYPO.body, color: '#64748B', marginBottom: SPACING.md }}>
          Fitur &quot;{featureName}&quot; membutuhkan paket lebih tinggi.
        </Text>
      )}

      {/* Billing cycle toggle */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: GLASS.card.background,
          borderRadius: RADIUS.md,
          padding: 4,
          marginBottom: SPACING.lg,
          borderWidth: 1,
          borderColor: GLASS.card.border,
        }}
      >
        {(['monthly', 'annual'] as const).map((c) => (
          <TouchableOpacity
            key={c}
            onPress={() => setCycle(c)}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: RADIUS.sm,
              alignItems: 'center',
              ...(cycle === c ? { backgroundColor: '#2C7695', ...GLASS.shadow.sm } : {}),
            }}
          >
            <Text style={{ ...TYPO.captionBold, color: cycle === c ? '#FFFFFF' : '#64748B' }}>
              {c === 'monthly' ? 'Bulanan' : 'Tahunan'}
            </Text>
            {c === 'annual' && (
              <Text style={{ ...TYPO.small, color: cycle === c ? 'rgba(255,255,255,0.8)' : '#22C55E', marginTop: 2 }}>
                Hemat 2 bulan
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {upgradeTiers.map((tier) => {
        const price = getTierPrice(tier, cycle);
        const savings = getAnnualSavings(tier);
        const monthlyEq = getMonthlyEquivalent(tier, cycle);
        const isPro = tier === 'pro';

        return (
          <Card key={tier} variant={isPro ? 'elevated' : 'glass'} style={isPro ? { borderWidth: 2, borderColor: '#2C7695' } : {}}>
            {isPro && (
              <View style={{ position: 'absolute', top: -1, right: 16 }}>
                <LinearGradient
                  colors={GRADIENTS.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ borderBottomLeftRadius: 8, borderBottomRightRadius: 8, paddingHorizontal: 12, paddingVertical: 4 }}
                >
                  <Text style={{ ...TYPO.small, color: '#FFFFFF', fontWeight: '700' }}>POPULER</Text>
                </LinearGradient>
              </View>
            )}

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ ...TYPO.h3, color: '#1E293B' }}>{getTierLabel(tier)}</Text>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ ...TYPO.h3, color: '#156064' }}>
                  {price === 0 ? 'Gratis' : cycle === 'annual' ? `${formatRupiah(price)}/thn` : `${formatRupiah(price)}/bln`}
                </Text>
                {cycle === 'annual' && price > 0 && (
                  <Text style={{ ...TYPO.small, color: '#94A3B8' }}>= {formatRupiah(monthlyEq)}/bln</Text>
                )}
              </View>
            </View>

            {cycle === 'annual' && savings > 0 && (
              <View style={{ marginBottom: SPACING.sm }}>
                <Badge label={`Hemat ${formatRupiah(savings)}/tahun`} variant="success" />
              </View>
            )}

            {TIER_FEATURES[tier].map((feat) => (
              <View key={feat} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                  <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                    <Path d="M20 6L9 17L4 12" stroke="#22C55E" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
                <Text style={{ ...TYPO.caption, color: '#1E293B' }}>{feat}</Text>
              </View>
            ))}

            <View style={{ marginTop: SPACING.md }}>
              <Button
                title={`Pilih ${getTierLabel(tier)}`}
                variant={isPro ? 'primary' : 'secondary'}
                onPress={onClose}
              />
            </View>
          </Card>
        );
      })}
    </Modal>
  );
}
