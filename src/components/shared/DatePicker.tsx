import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Modal } from '@components/ui/Modal';
import { GLASS, RADIUS, TYPO, SPACING } from '@utils/theme';
import Svg, { Path } from 'react-native-svg';

interface DatePickerProps {
  label?: string;
  value: Date | null;
  onChange: (date: Date) => void;
  placeholder?: string;
  error?: string;
}

function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' });
}

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

export function DatePicker({ label, value, onChange, placeholder = 'Pilih tanggal', error }: DatePickerProps) {
  const [showModal, setShowModal] = useState(false);
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(value?.getFullYear() ?? now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(value?.getMonth() ?? now.getMonth());

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  function handleSelectDay(day: number) {
    onChange(new Date(selectedYear, selectedMonth, day));
    setShowModal(false);
  }

  return (
    <View style={{ width: '100%' }}>
      {label && (
        <Text style={{ ...TYPO.captionBold, color: '#64748B', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {label}
        </Text>
      )}
      <TouchableOpacity
        style={{
          height: 52,
          borderRadius: RADIUS.lg,
          borderWidth: 1.5,
          borderColor: error ? '#EF4444' : GLASS.card.border,
          backgroundColor: GLASS.card.background,
          paddingHorizontal: 16,
          justifyContent: 'center',
          flexDirection: 'row',
          alignItems: 'center',
        }}
        onPress={() => setShowModal(true)}
      >
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ marginRight: 10 }}>
          <Path d="M19 4H5C3.9 4 3 4.9 3 6V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4Z" stroke="#94A3B8" strokeWidth={1.8} />
          <Path d="M16 2V6M8 2V6M3 10H21" stroke="#94A3B8" strokeWidth={1.8} strokeLinecap="round" />
        </Svg>
        <Text style={value ? { ...TYPO.body, color: '#1E293B', flex: 1 } : { ...TYPO.body, color: '#94A3B8', flex: 1 }}>
          {value ? formatDateDisplay(value) : placeholder}
        </Text>
      </TouchableOpacity>
      {error && <Text style={{ ...TYPO.caption, color: '#EF4444', marginTop: 4 }}>{error}</Text>}

      <Modal visible={showModal} onClose={() => setShowModal(false)} title="Pilih Tanggal">
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md }}>
          <TouchableOpacity
            onPress={() => {
              if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear((y) => y - 1); }
              else setSelectedMonth((m) => m - 1);
            }}
            hitSlop={12}
            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' }}
          >
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path d="M15 18L9 12L15 6" stroke="#64748B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
          <Text style={{ ...TYPO.bodyBold, color: '#1E293B' }}>{MONTHS[selectedMonth]} {selectedYear}</Text>
          <TouchableOpacity
            onPress={() => {
              if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear((y) => y + 1); }
              else setSelectedMonth((m) => m + 1);
            }}
            hitSlop={12}
            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' }}
          >
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path d="M9 18L15 12L9 6" stroke="#64748B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {days.map((day) => {
            const isSelected = value?.getDate() === day && value?.getMonth() === selectedMonth && value?.getFullYear() === selectedYear;
            return (
              <TouchableOpacity
                key={day}
                onPress={() => handleSelectDay(day)}
                style={{
                  width: '14.28%',
                  alignItems: 'center',
                  paddingVertical: 8,
                  ...(isSelected ? { backgroundColor: '#2C7695', borderRadius: RADIUS.full } : {}),
                }}
              >
                <Text style={{ ...TYPO.body, color: isSelected ? '#FFFFFF' : '#1E293B', fontWeight: isSelected ? '700' : '400' }}>
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Modal>
    </View>
  );
}
