import { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Card } from "@components/ui/Card";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { Modal } from "@components/ui/Modal";
import { CurrencyInput } from "@components/shared/CurrencyInput";
import { EmptyState } from "@components/shared/EmptyState";
import { addStudent, getStudents, getSchedules, addSchedule, recordAttendance, getAttendanceByDate, generateStudentBilling, getStudentBillings, updateStudentBillingStatus } from "@services/lapak-advanced.service";
import { useUIStore } from "@stores/ui.store";
import { formatRupiah } from "@utils/format";
import { GRADIENTS, GLASS, RADIUS, TYPO, SPACING } from "@utils/theme";
import Svg, { Path } from "react-native-svg";
import type { Student, Schedule, Attendance, StudentBilling, AttendanceStatus, PaymentStatus } from "@app-types/lapak.types";

function ArrowLeftIcon({ size = 20, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CheckIcon({ size = 12, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M20 6L9 17L4 12" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

type Tab = "students" | "schedule" | "attendance" | "billing";

export default function GuruScreen() {
  const insets = useSafeAreaInsets();
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

  useFocusEffect(useCallback(() => { if (bizId) loadAll(); }, [bizId, tab]));

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
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* Gradient Header */}
      <LinearGradient
        colors={[...GRADIENTS.lapak]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: insets.top + SPACING.sm,
          paddingBottom: SPACING.lg,
          paddingHorizontal: SPACING.md,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <ArrowLeftIcon size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={{ ...TYPO.h3, color: "#FFFFFF", marginLeft: SPACING.md }}>Guru/Pelatih</Text>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: GLASS.card.background,
          borderBottomWidth: 1,
          borderBottomColor: GLASS.card.border,
        }}
      >
        {tabs.map((t) => (
          <TouchableOpacity
            key={t.key}
            onPress={() => setTab(t.key)}
            style={{
              flex: 1,
              paddingVertical: SPACING.md,
              alignItems: "center",
              borderBottomWidth: tab === t.key ? 2 : 0,
              borderBottomColor: "#50BFC3",
            }}
          >
            <Text
              style={{
                ...TYPO.captionBold,
                color: tab === t.key ? "#50BFC3" : "#64748B",
              }}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SPACING.md, paddingTop: SPACING.md }}
      >
        {tab === "students" && (
          <>
            <Button title="+ Tambah Murid" variant="secondary" onPress={() => setShowAddStudent(true)} />
            <View style={{ marginTop: SPACING.md }}>
              {students.map((s) => (
                <Card key={s.id} variant="glass">
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ ...TYPO.bodyBold, color: "#1E293B" }}>{s.name}</Text>
                    </View>
                    <Text style={{ ...TYPO.money, color: "#50BFC3" }}>
                      {formatRupiah(s.monthly_fee)}/bln
                    </Text>
                  </View>
                </Card>
              ))}
              {students.length === 0 && (
                <EmptyState illustration="📚" title="Belum ada murid" />
              )}
            </View>
          </>
        )}

        {tab === "schedule" && (
          <>
            <Button title="+ Tambah Jadwal" variant="secondary" onPress={() => setShowAddSchedule(true)} />
            <View style={{ marginTop: SPACING.md }}>
              {schedules.map((sc) => (
                <Card key={sc.id} variant="glass">
                  <Text style={{ ...TYPO.bodyBold, color: "#1E293B" }}>
                    {DAY_LABELS[sc.day_of_week]} {sc.start_time}-{sc.end_time}
                  </Text>
                  {sc.subject && (
                    <Text style={{ ...TYPO.caption, color: "#64748B" }}>{sc.subject}</Text>
                  )}
                </Card>
              ))}
              {schedules.length === 0 && (
                <EmptyState illustration="📅" title="Belum ada jadwal" />
              )}
            </View>
          </>
        )}

        {tab === "attendance" && (
          <>
            <Text
              style={{
                ...TYPO.small,
                color: "#94A3B8",
                textTransform: "uppercase",
                letterSpacing: 0.8,
                marginBottom: SPACING.sm,
              }}
            >
              ABSENSI HARI INI
            </Text>
            {students.map((s) => {
              const att = attendance.find((a) => (a as Attendance & { students?: { name: string } }).student_id === s.id);
              return (
                <Card key={s.id} variant="glass">
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={{ ...TYPO.bodyBold, color: "#1E293B", flex: 1 }}>
                      {s.name}
                    </Text>
                    <View style={{ flexDirection: "row" }}>
                      {(["present", "absent", "excused"] as AttendanceStatus[]).map((st) => (
                        <TouchableOpacity
                          key={st}
                          onPress={() => handleAttendance(s.id, st)}
                          style={{
                            paddingHorizontal: SPACING.sm,
                            paddingVertical: SPACING.xs,
                            borderRadius: RADIUS.sm,
                            marginHorizontal: 2,
                            backgroundColor: att?.status === st ? "#50BFC3" : "rgba(0,0,0,0.04)",
                          }}
                        >
                          <Text
                            style={{
                              ...TYPO.captionBold,
                              color: att?.status === st ? "#FFFFFF" : "#64748B",
                            }}
                          >
                            {st === "present" ? "\u2713" : st === "absent" ? "\u2717" : "I"}
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
            {billings.length === 0 && (
              <Button title="Generate Tagihan Bulan Ini" variant="secondary" onPress={handleGenerateBilling} />
            )}
            <View style={{ marginTop: SPACING.md }}>
              {billings.map((b) => (
                <TouchableOpacity key={b.id} onPress={() => handleToggleBilling(b)} activeOpacity={0.7}>
                  <Card variant="glass">
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <View
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: RADIUS.sm,
                          borderWidth: 2,
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: SPACING.md,
                          backgroundColor: b.status === "paid" ? "#22C55E" : "transparent",
                          borderColor: b.status === "paid" ? "#22C55E" : GLASS.card.border,
                        }}
                      >
                        {b.status === "paid" && <CheckIcon size={12} color="#FFFFFF" />}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ ...TYPO.bodyBold, color: "#1E293B" }}>{b.student_name}</Text>
                      </View>
                      <Text style={{ ...TYPO.money, color: "#50BFC3" }}>
                        {formatRupiah(b.amount)}
                      </Text>
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
        <View style={{ marginTop: SPACING.md }}>
          <CurrencyInput label="Biaya/Bulan" value={sFee} onChangeValue={setSFee} />
        </View>
        <View style={{ marginTop: SPACING.lg }}>
          <Button title="Tambah" onPress={handleAddStudent} loading={actionLoading} />
        </View>
      </Modal>

      <Modal visible={showAddSchedule} onClose={() => setShowAddSchedule(false)} title="Tambah Jadwal">
        <Text style={{ ...TYPO.bodyBold, color: "#1E293B", marginBottom: SPACING.sm }}>Hari</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: SPACING.md }}>
          {DAY_LABELS.map((d, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setScDay(i)}
              style={{
                paddingHorizontal: SPACING.md,
                paddingVertical: SPACING.sm,
                borderRadius: RADIUS.md,
                marginRight: SPACING.xs,
                marginBottom: SPACING.xs,
                backgroundColor: scDay === i ? "#50BFC3" : "rgba(0,0,0,0.04)",
              }}
            >
              <Text
                style={{
                  ...TYPO.captionBold,
                  color: scDay === i ? "#FFFFFF" : "#64748B",
                }}
              >
                {d}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flex: 1, marginRight: SPACING.sm }}>
            <Input label="Mulai" value={scStart} onChangeText={setScStart} placeholder="08:00" />
          </View>
          <View style={{ flex: 1, marginLeft: SPACING.sm }}>
            <Input label="Selesai" value={scEnd} onChangeText={setScEnd} placeholder="09:00" />
          </View>
        </View>
        <View style={{ marginTop: SPACING.md }}>
          <Input label="Mata Pelajaran (opsional)" value={scSubject} onChangeText={setScSubject} placeholder="contoh: Matematika" />
        </View>
        <View style={{ marginTop: SPACING.lg }}>
          <Button title="Tambah" onPress={handleAddSchedule} loading={actionLoading} />
        </View>
      </Modal>
    </View>
  );
}
