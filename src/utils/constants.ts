export const APP_NAME = "Apick";
export const APP_TAGLINE = "Life, well arranged.";
export const APP_SCHEME = "apick";
export const WEB_DOMAIN = "apick.id";

export const MODULE_URL_CODES = {
  lb: "lapak-laundry",
  gp: "lapak-guru",
  bb: "lapak-jasa",
  wk: "lapak-warung",
  kh: "sewa-kos",
  rn: "sewa-rental",
  rt: "warga-rt",
  ms: "warga-mesjid",
  hj: "hajat",
} as const;

export const SUBSCRIPTION_LIMITS = {
  free: {
    modules: 1,
    contacts: 50,
    lapak_customers: 10,
    lapak_queue_per_day: 10,
    sewa_units: 5,
    warga_members: 30,
    warga_orgs: 1,
    hajat_events: 1,
    hajat_guests: 50,
    hajat_gifts: 20,
    ai_per_month: 3,
  },
  starter: {
    modules: 2,
    contacts: 200,
    lapak_customers: 50,
    lapak_queue_per_day: Infinity,
    sewa_units: 20,
    warga_members: 100,
    warga_orgs: 3,
    hajat_events: 3,
    hajat_guests: 200,
    hajat_gifts: 100,
    ai_per_month: 30,
  },
  pro: {
    modules: 4,
    contacts: Infinity,
    lapak_customers: Infinity,
    lapak_queue_per_day: Infinity,
    sewa_units: Infinity,
    warga_members: Infinity,
    warga_orgs: Infinity,
    hajat_events: Infinity,
    hajat_guests: Infinity,
    hajat_gifts: Infinity,
    ai_per_month: 100,
  },
} as const;
