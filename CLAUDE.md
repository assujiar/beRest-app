# Apick - Project Instructions for Claude Code

## IDENTITY
App Apick - "Life, well arranged."
Dual-sided modular platform: Provider (Android app) + Consumer (Android app + Web portal).
4 Modules: Apick Lapak, Apick Sewa, Apick Warga, Apick Hajat.
Indonesia-first.

## CRITICAL RULES

### Rule 1: SELALU baca PROGRESS.md sebelum mulai kerja
Resume dari task terakhir. JANGAN ulangi task DONE.

### Rule 2: SELALU update PROGRESS.md setelah selesai task
Status, timestamp, files affected.

### Rule 3: JANGAN modifikasi file DONE tanpa alasan
Catat di MODIFICATIONS LOG jika terpaksa.

### Rule 4: Test sebelum mark DONE
Minimal: compiles. Ideal: manual test pass.

### Rule 5: 1 file, 1 concern
1 component = 1 file. 1 hook = 1 file. 1 service = 1 file.

### Rule 6: YAGNI
Jangan bikin fitur yang belum diminta di phase saat ini.

### Rule 7: Indonesian context
UI default Bahasa Indonesia. Rupiah (Rp 1.250.000). DD/MM/YYYY. Asia/Jakarta.

### Rule 8: Dual-view awareness
Setiap screen yang affect provider data HARUS juga consider consumer view (web + app). Status updates harus trigger Supabase Realtime + push notification ke consumer.

### Rule 9: UI/UX Non-Negotiables (Low Digital Literacy Users)
- SATU LAYAR SATU TUGAS. Max 3 input fields per screen. Lebih = pecah ke step.
- BAHASA MANUSIA. Gak ada istilah teknis. Error bilang apa yang salah + cara benerin.
- THUMB ZONE. Primary buttons di bottom 1/3. Touch target min 48dp. Tab bar di bawah.
- VISUAL HIERARCHY. Angka uang = paling besar bold. Status = warna + icon + text.
- KONFIRMASI untuk destructive actions (hapus, arsip). Instant untuk non-destructive (simpan).
- NAVIGASI max 3 level depth dari tab. Back selalu predictable. Breadcrumb visible.
- OFFLINE-TOLERANT. Cached data selalu visible. Queue actions saat offline. Auto-sync.
- ONBOARDING max 2 langkah auth. Guided first action. Contextual tooltips, bukan tutorial slideshow.
- FONT min 14sp body, 12sp caption. Contrast 4.5:1. Support font scaling.
- KONSISTENSI. 1 pattern 1 action everywhere. Same card layout, same button colors, same positions.
- SMART DEFAULTS. App harus jalan tanpa config. Pre-fill everything possible.
- Refer to Section 4 "UI/UX Design Principles" in product concept for full specs.

## TECH STACK (LOCKED)
- Mobile: React Native + Expo SDK 52+ (TypeScript strict)
- Web Portal: Next.js 15 (hosted Vercel free)
- Navigation: Expo Router
- State: Zustand + TanStack Query
- Backend: Supabase (PostgreSQL, Auth, Storage, Realtime, Edge Functions)
- Auth: Supabase Auth (Google + Phone OTP)
- AI: Google Gemini 2.5 Flash (model: gemini-2.5-flash)
- Styling: NativeWind (Tailwind CSS for RN)
- Forms: React Hook Form + Zod
- Icons: lucide-react-native
- Push Notifications: Expo Notifications
- PDF: expo-print + expo-sharing
- QR: react-native-qrcode-svg + expo-camera
- Charts: victory-native
- Image: Expo Image Picker + Camera
- Realtime: Supabase Realtime (for consumer live updates)
- Deep Linking: Expo Linking

## ARCHITECTURE PRINCIPLE

### Dual-sided app in 1 codebase
1 React Native app. 2 view modes: Provider dan Consumer.
- User role stored in profile: 'provider' | 'consumer' | 'both'
- App layout adapts based on role
- Provider tabs: Home | [Active Modules] | Profile
- Consumer tabs: Home (connected providers) | Notifications | Profile
- User role 'both': toggle between provider/consumer view via switcher

### Module lazy loading
Inactive modules = zero memory footprint. Only import module code when activated.

### Consumer connections
- consumer_connections table links consumer to provider
- 3 methods: link code, QR scan, phone auto-detect
- Supabase Realtime subscriptions per connection for live updates

### Web portal
- Next.js 15 on Vercel
- Routes: apick.id/[code]/[slug]
- Static/SSR pages, gak butuh login untuk view
- Actions (RSVP, confirm payment) need simple verification
- Smart banner for app download with deep link

## FOLDER STRUCTURE
apick-app/
├── CLAUDE.md
├── PROGRESS.md
├── app/                           # Expo Router
│   ├── (auth)/                    # Login, register, phone OTP
│   ├── (onboarding)/              # Module selection, guided setup
│   │   ├── provider.tsx           # Provider module picker
│   │   └── consumer.tsx           # Consumer connection setup
│   ├── (provider)/                # Provider view
│   │   ├── (tabs)/
│   │   │   ├── index.tsx          # Provider home dashboard
│   │   │   ├── lapak/             # Apick Lapak screens
│   │   │   ├── sewa/              # Apick Sewa screens
│   │   │   ├── warga/             # Apick Warga screens
│   │   │   ├── hajat/             # Apick Hajat screens
│   │   │   └── profile.tsx
│   │   └── _layout.tsx
│   ├── (consumer)/                # Consumer view
│   │   ├── (tabs)/
│   │   │   ├── index.tsx          # Consumer home (connected providers)
│   │   │   ├── notifications.tsx  # All notifications
│   │   │   └── profile.tsx
│   │   ├── lapak/                 # Consumer Lapak detail screens
│   │   ├── sewa/                  # Consumer Sewa detail screens
│   │   ├── warga/                 # Consumer Warga detail screens
│   │   ├── hajat/                 # Consumer Hajat detail screens
│   │   └── _layout.tsx
│   ├── connect/                   # Connection screens (QR, code input)
│   └── _layout.tsx                # Root: role-based routing
├── src/
│   ├── components/
│   │   ├── ui/                    # Shared UI primitives
│   │   ├── shared/                # Cross-module (ContactPicker, CurrencyDisplay, etc)
│   │   ├── provider/              # Provider-specific shared components
│   │   ├── consumer/              # Consumer-specific shared components
│   │   ├── lapak/
│   │   ├── sewa/
│   │   ├── warga/
│   │   └── hajat/
│   ├── hooks/
│   │   ├── shared/                # useContacts, useFinancial, useReminders, useNotifications
│   │   ├── consumer/              # useConnections, useProviderUpdates, useConsumerDashboard
│   │   ├── lapak/
│   │   ├── sewa/
│   │   ├── warga/
│   │   └── hajat/
│   ├── services/
│   │   ├── supabase.ts
│   │   ├── auth.service.ts
│   │   ├── contact.service.ts
│   │   ├── connection.service.ts  # Consumer <-> Provider linking + lifecycle
│   │   ├── connection-lifecycle.service.ts # Archive, disconnect, auto-archive
│   │   ├── notification.service.ts # Push + in-app notifications
│   │   ├── financial.service.ts
│   │   ├── reminder.service.ts
│   │   ├── wa-share.service.ts
│   │   ├── deep-link.service.ts   # Handle apick.id deep links
│   │   ├── gemini.service.ts      # Gemini 2.5 Flash
│   │   ├── lapak.service.ts
│   │   ├── sewa.service.ts
│   │   ├── warga.service.ts
│   │   └── hajat.service.ts
│   ├── stores/
│   │   ├── auth.store.ts
│   │   ├── role.store.ts          # provider/consumer/both + view switcher
│   │   ├── modules.store.ts
│   │   ├── connections.store.ts   # Consumer connections state
│   │   └── ui.store.ts
│   ├── types/
│   │   ├── shared.types.ts
│   │   ├── consumer.types.ts      # Connection, notification types
│   │   ├── lapak.types.ts
│   │   ├── sewa.types.ts
│   │   ├── warga.types.ts
│   │   └── hajat.types.ts
│   ├── utils/
│   │   ├── format.ts
│   │   ├── validation.ts
│   │   ├── constants.ts
│   │   ├── colors.ts
│   │   └── helpers.ts
│   └── config/
│       ├── supabase.config.ts
│       ├── gemini.config.ts
│       └── app.config.ts
├── portal/                        # Consumer web portal (Next.js)
│   ├── app/
│   │   ├── page.tsx               # Landing page
│   │   ├── layout.tsx
│   │   ├── lb/[code]/page.tsx     # Lapak order status
│   │   ├── gp/[code]/page.tsx     # Guru/pelatih portal
│   │   ├── bb/[slug]/page.tsx     # Jasa antrian/storefront
│   │   ├── wk/[slug]/page.tsx     # Warung katalog
│   │   ├── kh/[code]/page.tsx     # Kos/hunian tenant portal
│   │   ├── rn/[code]/page.tsx     # Rental status
│   │   ├── rt/
│   │   │   ├── [code]/page.tsx    # Warga member portal
│   │   │   └── laporan/page.tsx   # Public financial report
│   │   ├── ms/
│   │   │   ├── [code]/page.tsx    # Mesjid portal
│   │   │   └── laporan/page.tsx   # Public infaq report
│   │   └── hj/
│   │       ├── [slug]/page.tsx    # Invitation page
│   │       └── [slug]/[guest]/page.tsx  # Personalized RSVP
│   ├── components/
│   │   ├── SmartBanner.tsx        # App download banner
│   │   └── ...
│   ├── lib/
│   │   └── supabase.ts
│   └── next.config.js
├── supabase/
│   └── migrations/
├── assets/
├── app.json
├── package.json
└── .env

## COLOR PALETTE
Primary Navy: #1B3A5C
Primary Orange: #FF4600
Apick Lapak: #10B981 (green)
Apick Sewa: #3B82F6 (blue)
Apick Warga: #8B5CF6 (purple)
Apick Hajat: #EC4899 (pink)
Dark Text: #1E293B
Grey Text: #64748B
Light BG: #F8FAFC
Border: #E2E8F0
