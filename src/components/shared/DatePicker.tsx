import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Modal } from "@components/ui/Modal";

interface DatePickerProps {
  label?: string;
  value: Date | null;
  onChange: (date: Date) => void;
  placeholder?: string;
  error?: string;
}

function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export function DatePicker({
  label,
  value,
  onChange,
  placeholder = "Pilih tanggal",
  error,
}: DatePickerProps) {
  const [showModal, setShowModal] = useState(false);
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(
    value?.getFullYear() ?? now.getFullYear()
  );
  const [selectedMonth, setSelectedMonth] = useState(
    value?.getMonth() ?? now.getMonth()
  );

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  function handleSelectDay(day: number) {
    const date = new Date(selectedYear, selectedMonth, day);
    onChange(date);
    setShowModal(false);
  }

  return (
    <View className="w-full">
      {label && (
        <Text className="text-sm font-medium text-dark-text mb-1.5">
          {label}
        </Text>
      )}
      <TouchableOpacity
        className={`
          h-[52px] rounded-lg border px-4 justify-center
          ${error ? "border-red-500" : "border-border-color"}
        `}
        onPress={() => setShowModal(true)}
      >
        <Text
          className={value ? "text-base text-dark-text" : "text-sm text-[#94A3B8]"}
        >
          {value ? formatDateDisplay(value) : placeholder}
        </Text>
      </TouchableOpacity>
      {error && (
        <Text className="text-xs text-red-500 mt-1">{error}</Text>
      )}

      <Modal
        visible={showModal}
        onClose={() => setShowModal(false)}
        title="Pilih Tanggal"
      >
        {/* Month/Year navigation */}
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={() => {
              if (selectedMonth === 0) {
                setSelectedMonth(11);
                setSelectedYear((y) => y - 1);
              } else {
                setSelectedMonth((m) => m - 1);
              }
            }}
            hitSlop={12}
          >
            <Text className="text-2xl text-navy">‹</Text>
          </TouchableOpacity>
          <Text className="text-base font-bold text-dark-text">
            {MONTHS[selectedMonth]} {selectedYear}
          </Text>
          <TouchableOpacity
            onPress={() => {
              if (selectedMonth === 11) {
                setSelectedMonth(0);
                setSelectedYear((y) => y + 1);
              } else {
                setSelectedMonth((m) => m + 1);
              }
            }}
            hitSlop={12}
          >
            <Text className="text-2xl text-navy">›</Text>
          </TouchableOpacity>
        </View>

        {/* Day grid */}
        <View className="flex-row flex-wrap">
          {days.map((day) => {
            const isSelected =
              value?.getDate() === day &&
              value?.getMonth() === selectedMonth &&
              value?.getFullYear() === selectedYear;
            return (
              <TouchableOpacity
                key={day}
                onPress={() => handleSelectDay(day)}
                className={`
                  w-[14.28%] items-center py-2
                  ${isSelected ? "bg-orange rounded-full" : ""}
                `}
              >
                <Text
                  className={`text-base ${isSelected ? "text-white font-bold" : "text-dark-text"}`}
                >
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
