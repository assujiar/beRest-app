# beRest - Build Progress Tracker

> Last updated: 2026-03-18
> Current phase: PHASE 0 - IN PROGRESS
> Overall progress: 15/128 tasks

## STATUS: TODO / IN_PROGRESS / DONE / BLOCKED / SKIPPED

---

## PHASE 0: FOUNDATION (Week 1-3)
| # | Task | Status | Files | Notes |
|---|------|--------|-------|-------|
| 0.1 | Init Expo project + TypeScript strict | DONE | app.json, package.json, tsconfig.json, index.ts, App.tsx | Expo SDK 55, TS strict + path aliases, 0 errors |
| 0.2 | Install all dependencies | DONE | package.json, .npmrc | Expo SDK 55, Supabase, Zustand, TanStack Query, NativeWind, RHF+Zod, lucide, victory-native, etc |
| 0.3 | Configure NativeWind | DONE | tailwind.config.js, global.css, nativewind-env.d.ts, metro.config.js, babel.config.js | NativeWind v4 + custom beRest colors |
| 0.4 | Configure Expo Router with role-based routing | DONE | app/_layout.tsx, app/index.tsx, app/(auth)/*, app/(onboarding)/*, app/(provider)/*, app/(consumer)/* | Root Stack -> (auth), (onboarding), (provider)/(tabs), (consumer)/(tabs) |
| 0.5 | Setup Supabase client + env vars | DONE | .env, .env.example, src/config/supabase.config.ts, src/services/supabase.ts, .gitignore | Supabase client with AsyncStorage auth persistence |
| 0.6 | Create full folder structure | DONE | src/types/*.ts, src/utils/*.ts, src/stores/*.ts, src/config/*.ts | All types, utils, stores, config created. Path alias @app-types instead of @types |
| 0.7 | Create shared UI components (Button, Input, Card, Badge, Modal, Toast, Skeleton) | DONE | src/components/ui/*.tsx, src/components/ui/index.ts | All 7 components per design system specs. Button: primary/secondary/destructive/whatsapp variants. Skeleton: shimmer animation. |
| 0.8 | Create shared components (CurrencyInput, DatePicker, PhotoPicker, SearchBar, EmptyState, SmartBanner) | DONE | src/components/shared/*.tsx | All 6 components. CurrencyInput auto-format Rp. DatePicker modal calendar. PhotoPicker camera+gallery. |
| 0.9 | Build auth screens (login + register + phone OTP) | DONE | app/(auth)/login.tsx, app/(auth)/otp.tsx, app/(auth)/register.tsx, src/services/auth.service.ts | Google 1-tap + Phone OTP + 6-digit OTP input with auto-submit |
| 0.10 | Build provider onboarding (module selection + guided setup) | DONE | app/(onboarding)/provider.tsx | Module cards with color borders, checkbox, skip-to-consumer option |
| 0.11 | Build consumer onboarding (auto-detect + code input + QR scan) | DONE | app/(onboarding)/consumer.tsx | Code input, QR scan link, auto-detect flow, skip option |
| 0.12 | Build role switcher (provider <-> consumer toggle for role='both') | DONE | src/components/shared/RoleSwitcher.tsx | Pill toggle Pengelola/Pengguna, navigates between views |
| 0.13 | Build provider tab navigation (dynamic based on active modules) | DONE | app/(provider)/(tabs)/_layout.tsx, app/(provider)/(tabs)/lapak/*, sewa/*, warga/*, hajat/* | Dynamic tabs: hidden when module inactive. Module colors on active tab. |
| 0.14 | Build consumer tab navigation (Home + Notifications + Profile) | DONE | app/(consumer)/(tabs)/_layout.tsx | 3 tabs: Home, Notifikasi, Profil. Orange active, h-64 |
| 0.15 | Build provider home dashboard (summary cards per module) | DONE | app/(provider)/(tabs)/index.tsx | Summary cards per active module with stats, role switcher in header, empty state |
| 0.16 | Build consumer home dashboard (connected providers list + status summaries) | TODO | - | - |
| 0.17 | Implement contacts service (shared CRUD) | TODO | - | - |
| 0.18 | Implement connection service (link/unlink consumer-provider) | TODO | - | - |
| 0.19 | Implement notification service (push + in-app) | TODO | - | - |
| 0.20 | Implement WA share engine | TODO | - | - |
| 0.21 | Implement reminder service + notification scheduling | TODO | - | - |
| 0.22 | Implement deep link handler (berest.id/xx/xx -> app screen) | TODO | - | - |
| 0.23 | Supabase migration: all tables + RLS policies | TODO | - | - |
| 0.24 | Setup Supabase Realtime subscriptions (for consumer live updates) | TODO | - | - |
| 0.25 | Implement connection lifecycle (archive, disconnect, auto-archive scheduler) | TODO | - | Grace periods: sewa 7d, rental 3d, hajat 7d, laundry 90d inactive prompt |
| 0.26 | Build consumer "Riwayat" (archived connections) view | TODO | - | Collapsible, history accessible |
| 0.27 | Build provider "Tandai Keluar" / "Arsipkan" flow | TODO | - | Both sides can initiate |
| 0.28 | Setup Supabase Edge Function: auto-archive cron (daily check) | TODO | - | Check auto_archive_at dates |
| 0.29 | Verify: app boots, auth works, both onboarding flows work, role switching works, connection lifecycle works | TODO | - | - |

**Quality Gate 0:** ❌

---

## PHASE 1: MODULE WARGA MVP (Week 4-8)
| # | Task | Status | Files | Notes |
|---|------|--------|-------|-------|
| 1.1 | Implement warga types | TODO | - | - |
| 1.2 | Implement warga service | TODO | - | - |
| 1.3 | Provider: Create Organization screen | TODO | - | - |
| 1.4 | Provider: Add Members screen (import contacts/manual) | TODO | - | Auto-generate member_code per member |
| 1.5 | Provider: Set Dues (iuran amount + period) | TODO | - | - |
| 1.6 | Provider: Payment Tracking screen (centang per member) | TODO | - | Trigger notification to consumer |
| 1.7 | Provider: Add Expense screen (+ photo bukti) | TODO | - | - |
| 1.8 | Provider: Financial Report screen | TODO | - | - |
| 1.9 | Provider: Share Report (generate link + WA share) | TODO | - | berest.id/rt/laporan |
| 1.10 | Provider: Reminder to unpaid members | TODO | - | Push + WA |
| 1.11 | Provider: Announcement (create + share) | TODO | - | - |
| 1.12 | Provider: Infaq/Donasi sub-module (mesjid mode) | TODO | - | - |
| 1.13 | Provider: Fundraising tracker (target + progress bar) | TODO | - | - |
| 1.14 | Consumer app: Warga dashboard (iuran status, pengumuman, jadwal per org) | TODO | - | - |
| 1.15 | Consumer app: Upload bukti bayar + push to provider | TODO | - | - |
| 1.16 | Consumer app: View announcements + read tracking | TODO | - | - |
| 1.17 | Setup Next.js portal project | TODO | - | - |
| 1.18 | Portal: berest.id/rt/[code] - warga status page | TODO | - | - |
| 1.19 | Portal: berest.id/rt/laporan - public financial report | TODO | - | - |
| 1.20 | Portal: berest.id/ms/laporan - infaq report | TODO | - | - |
| 1.21 | Portal: Smart banner (download app CTA) | TODO | - | - |
| 1.22 | Deploy portal to Vercel | TODO | - | - |
| 1.23 | Integration test: provider create org -> add member -> share link -> consumer web view -> consumer app view -> upload bukti bayar -> provider sees update | TODO | - | Full e2e |
| 1.24 | Verify quality gate | TODO | - | - |

**Quality Gate 1:** ❌

---

## PHASE 2: MODULE LAPAK - PEDAGANG (Week 9-12)
| # | Task | Status | Files | Notes |
|---|------|--------|-------|-------|
| 2.1 | Implement lapak types | TODO | - | - |
| 2.2 | Implement lapak service | TODO | - | - |
| 2.3 | Provider: Business Setup screen | TODO | - | - |
| 2.4 | Provider: 1-Tap Sales Logger | TODO | - | - |
| 2.5 | Provider: Product catalog (CRUD) | TODO | - | - |
| 2.6 | Provider: Expense logger | TODO | - | - |
| 2.7 | Provider: Daily Dashboard (omzet, profit, trend) | TODO | - | - |
| 2.8 | Consumer app: Browse catalog, order history | TODO | - | - |
| 2.9 | Portal: berest.id/wk/[slug] - mini storefront | TODO | - | - |
| 2.10 | Integrate financial dashboard (Warga + Lapak) | TODO | - | - |
| 2.11 | Verify quality gate | TODO | - | - |

**Quality Gate 2:** ❌

---

## PHASE 3: MODULE SEWA - PROPERTI (Week 13-17)
| # | Task | Status | Files | Notes |
|---|------|--------|-------|-------|
| 3.1 | Implement sewa types | TODO | - | - |
| 3.2 | Implement sewa service | TODO | - | - |
| 3.3 | Provider: Add Property screen | TODO | - | - |
| 3.4 | Provider: Unit Management (list + status) | TODO | - | - |
| 3.5 | Provider: Add Tenant (+ KTP scan via Gemini 2.5 Flash) | TODO | - | - |
| 3.6 | Provider: Monthly Billing (auto-generate + share) | TODO | - | - |
| 3.7 | Provider: Payment Tracking per tenant | TODO | - | Trigger push to consumer |
| 3.8 | Provider: Contract Template (Gemini 2.5 Flash generate) | TODO | - | - |
| 3.9 | Provider: Contract Vault | TODO | - | - |
| 3.10 | Provider: Maintenance/Expense tracker | TODO | - | - |
| 3.11 | Provider: Vacant Unit sharing | TODO | - | - |
| 3.12 | Consumer app: Tenant dashboard (tagihan, kontrak, maintenance request) | TODO | - | - |
| 3.13 | Consumer app: Upload bukti bayar + maintenance request with photo | TODO | - | - |
| 3.14 | Portal: berest.id/kh/[code] - tenant portal | TODO | - | - |
| 3.15 | Portal: Maintenance request form | TODO | - | - |
| 3.16 | Integrate financial dashboard (+Sewa) | TODO | - | - |
| 3.17 | Verify quality gate | TODO | - | - |

**Quality Gate 3:** ❌

---

## PHASE 4: MODULE LAPAK - ADVANCED MODES (Week 18-22)
| # | Task | Status | Files | Notes |
|---|------|--------|-------|-------|
| 4.1 | Provider: Laundry Mode (order + status + pricing) | TODO | - | - |
| 4.2 | Consumer app: Laundry tracking (real-time status via Supabase Realtime) | TODO | - | - |
| 4.3 | Portal: berest.id/lb/[code] - laundry status | TODO | - | - |
| 4.4 | Provider: Guru/Pelatih Mode (students + schedule + attendance) | TODO | - | - |
| 4.5 | Provider: Auto-generate monthly billing (guru) | TODO | - | - |
| 4.6 | Consumer app: Student/parent dashboard (jadwal + tagihan) | TODO | - | - |
| 4.7 | Portal: berest.id/gp/[code] - student portal | TODO | - | - |
| 4.8 | Provider: Jasa Umum Mode (queue + orders) | TODO | - | - |
| 4.9 | Provider: QR code generator for queue | TODO | - | - |
| 4.10 | Consumer app: Queue tracking (real-time) | TODO | - | - |
| 4.11 | Portal: berest.id/bb/[slug] - queue portal | TODO | - | - |
| 4.12 | Provider: Customer Database (cross-mode) | TODO | - | - |
| 4.13 | Provider: AI scan nota (Gemini 2.5 Flash) | TODO | - | - |
| 4.14 | Verify quality gate | TODO | - | - |

**Quality Gate 4:** ❌

---

## PHASE 5: MODULE HAJAT (Week 23-27)
| # | Task | Status | Files | Notes |
|---|------|--------|-------|-------|
| 5.1 | Implement hajat types | TODO | - | - |
| 5.2 | Implement hajat service | TODO | - | - |
| 5.3 | Provider: Create Event screen | TODO | - | - |
| 5.4 | Provider: Invitation Template picker | TODO | - | - |
| 5.5 | Provider: AI generate invitation text (Gemini 2.5 Flash) | TODO | - | - |
| 5.6 | Provider: Guest List management | TODO | - | - |
| 5.7 | Provider: Send Invitations (per-person WA share) | TODO | - | - |
| 5.8 | Provider: RSVP Tracker dashboard | TODO | - | - |
| 5.9 | Provider: Day-of checklist (guest check-in) | TODO | - | - |
| 5.10 | Provider: Amplop Tracker (give + receive + suggestion) | TODO | - | - |
| 5.11 | Consumer app: Incoming invitations dashboard | TODO | - | - |
| 5.12 | Consumer app: RSVP via app + amplop suggestion | TODO | - | - |
| 5.13 | Consumer app: Hajatan calendar + amplop history | TODO | - | - |
| 5.14 | Portal: berest.id/hj/[slug] - invitation page | TODO | - | - |
| 5.15 | Portal: berest.id/hj/[slug]/[guest] - RSVP form | TODO | - | - |
| 5.16 | Deep link: invitation URL -> app if installed | TODO | - | - |
| 5.17 | Verify quality gate | TODO | - | - |

**Quality Gate 5:** ❌

---

## PHASE 6: SEWA RENTAL + WARGA JADWAL + POLISH + LAUNCH (Week 28-32)
| # | Task | Status | Files | Notes |
|---|------|--------|-------|-------|
| 6.1 | Provider: Rental Items management | TODO | - | - |
| 6.2 | Provider: Rental transaction (borrow + return + photo) | TODO | - | - |
| 6.3 | Consumer: Rental status (app + web) | TODO | - | - |
| 6.4 | Portal: berest.id/rn/[code] | TODO | - | - |
| 6.5 | Provider: Warga Jadwal & Giliran sub-module | TODO | - | - |
| 6.6 | Consumer: Schedule view + swap request | TODO | - | - |
| 6.7 | Advanced analytics per module | TODO | - | - |
| 6.8 | Export PDF/CSV | TODO | - | - |
| 6.9 | Subscription/paywall logic | TODO | - | - |
| 6.10 | Web-to-app conversion optimization (smart banners, deep links) | TODO | - | - |
| 6.11 | App icon + splash + onboarding polish | TODO | - | - |
| 6.12 | Performance optimization | TODO | - | - |
| 6.13 | Full regression test all modules + all consumer flows | TODO | - | - |
| 6.14 | Build APK/AAB | TODO | - | - |
| 6.15 | Play Store listing prep | TODO | - | - |
| 6.16 | Portal: berest.id landing page | TODO | - | - |

**Quality Gate 6:** ❌

---

## MODIFICATIONS LOG
| Date | Phase | File | Reason | Impact |
|------|-------|------|--------|--------|

## KNOWN ISSUES
| # | Issue | Phase | Severity | Status |
|---|-------|-------|----------|--------|

## DECISIONS LOG
| Date | Decision | Reasoning |
|------|----------|-----------|
| 2026-03-18 | App name: beRest | "beres" + "rest". Natural, memorable, scalable. |
| 2026-03-18 | Module names: beRest-in Lapak/Sewa/Warga/Hajat | Marketing names. Tab labels: Lapak/Sewa/Warga/Hajat. |
| 2026-03-18 | AI model: Gemini 2.5 Flash | Gemini 2.0 Flash retired Juni 2026. 2.5 Flash stable, free tier, multimodal. |
| 2026-03-18 | Consumer dual-access: web + app | Web for first-touch (zero friction), app for repeat users (push notif, dashboard). |
| 2026-03-18 | URL structure: berest.id/xx/xx | Short 2-letter module codes + slug. Simple, clean. |
| 2026-03-18 | Connection lifecycle: archive not delete | Data never deleted. Pindah/ganti/keluar = archive. History always accessible. Grace periods per module type. |
| 2026-03-18 | UI/UX: low digital literacy first | 12 principles. Atomic flow (1 screen 1 task), bahasa manusia, thumb-zone, max 3 inputs/screen, offline-tolerant, smart defaults. Benchmark: kalau bisa buka WA = bisa pakai beRest. |
