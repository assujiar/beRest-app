import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@components/ui/Card";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { Modal } from "@components/ui/Modal";
import { CurrencyInput } from "@components/shared/CurrencyInput";
import { EmptyState } from "@components/shared/EmptyState";
import { addStudent, getStudents, getSchedules, addSchedule, recordAttendance, getAttendanceByDate, generateStudentBilling, getStudentBillings, updateStudentBillingStatus } from "@services/lapak-advanced.service";
import { useUIStore } from "@stores/ui.store";
import { formatRupiah } from "@utils/format";
import type { Student, Schedule, Attendance, StudentBilling, AttendanceStatus, PaymentStatus } from "@app-types/lapak.types";

const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

type Tab = "students" | "schedule" | "attendance" | "billing";

export default function GuruScreen() {
  const { bizId } = useLocalSearchParams<{ bizId: string }>();
  const showToast = useUIStore((s) => s.showToast);
  const [tab, setTab] = useState<Tab>("students");
  const [students, setStudents] = useState<Student[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [billings, setBillings] = useState<StudentBilling[]>([]);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [sName, setSName] = useState("");
  const [sFee, setSFee] = useState(0);
  const [scDay, setScDay] = useState(1);
  const [scStart, setScStart] = useState("08:00");
  const [scEnd, setScEnd] = useState("09:00");
  const [scSubject, setScSubject] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { if (bizId) loadAll(); }, [bizId, tab]);

  async function loadAll() {
    try {
      if (tab === "students") setStudents(await getStudents(bizId!));
      if (tab === "schedule") setSchedules(await getSchedules(bizId!));
      if (tab === "attendance") {
        const today = new Date().toISOString().split("T")[0];
        setAttendance(await getAttendanceByDate(bizId!, today));
      }
      if (tab === "billing") {
        const now = new Date();
        const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        setBillings(await getStudentBillings(bizId!, period));
      }
    } catch {}
  }

  async function handleAddStudent() {
    if (!sName.trim()) return;
    setActionLoading(true);
    try {
      await addStudent(bizId!, { name: sName.trim(), phone: null, parent_name: null, parent_phone: null, consumer_id: null, monthly_fee: sFee });
      showToast("Murid ditambahkan!", "success"); setSName(""); setSFee(0); setShowAddStudent(false); loadAll();
    } catch { showToast("Gagal", "error"); } finally { setActionLoading(false); }
  }

  async function handleAddSchedule() {
    setActionLoading(true);
    try {
      await addSchedule(bizId!, { day_of_week: scDay, start_time: scStart, end_time: scEnd, subject: scSubject.trim() || null, location: null });
      showToast("Jadwal ditambahkan!", "success"); setShowAddSchedule(false); loadAll();
    } catch { showToast("Gagal", "error"); } finally { setActionLoading(false); }
  }

  async function handleAttendance(studentId: string, status: AttendanceStatus) {
    const today = new Date().toISOString().split("T")[0];
    try { await recordAttendance(bizId!, studentId, today, status); loadAll(); }
    catch { showToast("Gagal", "error"); }
  }

  async function handleGenerateBilling() {
    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    try { const b = await generateStudentBilling(bizId!, period); setBillings(b); showToast("Tagihan digenerate!", "success"); }
    catch { showToast("Gagal", "error"); }
  }

  async function handleToggleBilling(b: StudentBilling) {
    const newStatus: PaymentStatus = b.status === "paid" ? "unpaid" : "paid";
    try { await updateStudentBillingStatus(b.id, newStatus); loadAll(); }
    catch { showToast("Gagal", "error"); }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "students", label: "Murid" }, { key: "schedule", label: "Jadwal" },
    { key: "attendance", label: "Absen" }, { key: "billing", label: "Tagihan" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-light-bg" edges={["top"]}>
      <View className="flex-row items-center px-4 py-3 border-b border-border-color bg-white">
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}><Text className="text-lg text-navy">←</Text></TouchableOpacity>
        <Text className="text-lg font-bold text-dark-text ml-3">Guru/Pelatih</Text>
      </View>

      {/* Tabs */}
      <View className="flex-row bg-white border-b border-border-color">
        {tabs.map((t) => (
          <TouchableOpacity key={t.key} onPress={() => setTab(t.key)} className={`flex-1 py-3 items-center ${tab === t.key ? "border-b-2 border-lapak" : ""}`}>
            <Text className={`text-xs font-bold ${tab === t.key ? "text-lapak" : "text-grey-text"}`}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView className="flex-1 px-4 pt-3">
        {tab === "students" && (
          <>
            <Button title="+ Tambah Murid" variant="secondary" onPress={() => setShowAddStudent(true)} />
            <View className="mt-3">
              {students.map((s) => (
                <Card key={s.id}>
                  <View className="flex-row items-center">
                    <View className="flex-1"><Text className="text-base font-bold text-dark-text">{s.name}</Text></View>
                    <Text className="text-sm text-lapak font-bold">{formatRupiah(s.monthly_fee)}/bln</Text>
                  </View>
                </Card>
              ))}
              {students.length === 0 && <EmptyState illustration="📚" title="Belum ada murid" />}
            </View>
          </>
        )}

        {tab === "schedule" && (
          <>
            <Button title="+ Tambah Jadwal" variant="secondary" onPress={() => setShowAddSchedule(true)} />
            <View className="mt-3">
              {schedules.map((sc) => (
                <Card key={sc.id}>
                  <Text className="text-base font-bold text-dark-text">{DAY_LABELS[sc.day_of_week]} {sc.start_time}-{sc.end_time}</Text>
                  {sc.subject && <Text className="text-xs text-grey-text">{sc.subject}</Text>}
                </Card>
              ))}
              {schedules.length === 0 && <EmptyState illustration="📅" title="Belum ada jadwal" />}
            </View>
          </>
        )}

        {tab === "attendance" && (
          <>
            <Text className="text-sm font-bold text-grey-text mb-2">ABSENSI HARI INI</Text>
            {students.map((s) => {
              const att = attendance.find((a) => (a as Attendance & { students?: { name: string } }).student_id === s.id);
              return (
                <Card key={s.id}>
                  <View className="flex-row items-center">
                    <Text className="flex-1 text-base font-bold text-dark-text">{s.name}</Text>
                    <View className="flex-row">
                      {(["present", "absent", "excused"] as AttendanceStatus[]).map((st) => (
                        <TouchableOpacity key={st} onPress={() => handleAttendance(s.id, st)}
                          className={`px-2 py-1 rounded mx-0.5 ${att?.status === st ? "bg-lapak" : "bg-gray-100"}`}>
                          <Text className={`text-xs font-bold ${att?.status === st ? "text-white" : "text-grey-text"}`}>
                            {st === "present" ? "✓" : st === "absent" ? "✗" : "I"}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </Card>
              );
            })}
          </>
        )}

        {tab === "billing" && (
          <>
            {billings.length === 0 && <Button title="Generate Tagihan Bulan Ini" variant="secondary" onPress={handleGenerateBilling} />}
            <View className="mt-3">
              {billings.map((b) => (
                <TouchableOpacity key={b.id} onPress={() => handleToggleBilling(b)} activeOpacity={0.7}>
                  <Card>
                    <View className="flex-row items-center">
                      <View className={`w-6 h-6 rounded border-2 items-center justify-center mr-3 ${b.status === "paid" ? "bg-green-500 border-green-500" : "border-border-color"}`}>
                        {b.status === "paid" && <Text className="text-white text-xs font-bold">✓</Text>}
                      </View>
                      <View className="flex-1"><Text className="text-base font-bold text-dark-text">{b.student_name}</Text></View>
                      <Text className="text-sm font-bold text-lapak">{formatRupiah(b.amount)}</Text>
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <Modal visible={showAddStudent} onClose={() => setShowAddStudent(false)} title="Tambah Murid">
        <Input label="Nama Murid" placeholder="contoh: Ahmad" value={sName} onChangeText={setSName} />
        <View className="mt-3"><CurrencyInput label="Biaya/Bulan" value={sFee} onChangeValue={setSFee} /></View>
        <View className="mt-4"><Button title="Tambah" onPress={handleAddStudent} loading={actionLoading} /></View>
      </Modal>

      <Modal visible={showAddSchedule} onClose={() => setShowAddSchedule(false)} title="Tambah Jadwal">
        <Text className="text-sm font-medium text-dark-text mb-2">Hari</Text>
        <View className="flex-row flex-wrap mb-3">
          {DAY_LABELS.map((d, i) => (
            <TouchableOpacity key={i} onPress={() => setScDay(i)} className={`px-3 py-2 rounded-lg mr-1 mb-1 ${scDay === i ? "bg-lapak" : "bg-gray-100"}`}>
              <Text className={`text-xs font-bold ${scDay === i ? "text-white" : "text-grey-text"}`}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View className="flex-row">
          <View className="flex-1 mr-2"><Input label="Mulai" value={scStart} onChangeText={setScStart} placeholder="08:00" /></View>
          <View className="flex-1 ml-2"><Input label="Selesai" value={scEnd} onChangeText={setScEnd} placeholder="09:00" /></View>
        </View>
        <View className="mt-3"><Input label="Mata Pelajaran (opsional)" value={scSubject} onChangeText={setScSubject} placeholder="contoh: Matematika" /></View>
        <View className="mt-4"><Button title="Tambah" onPress={handleAddSchedule} loading={actionLoading} /></View>
      </Modal>
    </SafeAreaView>
  );
}
