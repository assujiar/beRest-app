"use client";

import { useState, useEffect } from "react";

const modules = [
  { id: "lapak", name: "Lapak", color: "#10B981" },
  { id: "sewa", name: "Sewa", color: "#3B82F6" },
  { id: "warga", name: "Warga", color: "#8B5CF6" },
  { id: "hajat", name: "Hajat", color: "#EC4899" },
];

export function StickyNav() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 80);

      // Find active section
      const sections = modules.map((m) => document.getElementById(m.id));
      let current = "";
      for (const section of sections) {
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 160) {
            current = section.id;
          }
        }
      }
      setActiveSection(current);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!scrolled) return null;

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40 nav-sticky scrolled"
      aria-label="Navigasi modul"
    >
      <div className="max-w-[960px] mx-auto px-6 py-3 flex items-center justify-between">
        <a
          href="#content"
          className="text-[#1B3A5C] text-[18px] font-extrabold tracking-tight"
        >
          apick
        </a>
        <div className="hidden sm:flex items-center gap-1">
          {modules.map((m) => (
            <a
              key={m.id}
              href={`#${m.id}`}
              className="px-3 py-1.5 rounded-full text-[13px] font-semibold transition-all duration-200"
              style={{
                color: activeSection === m.id ? "white" : m.color,
                backgroundColor:
                  activeSection === m.id ? m.color : "transparent",
              }}
            >
              {m.name}
            </a>
          ))}
          <a
            href="#pricing-heading"
            className="px-3 py-1.5 rounded-full text-[13px] font-semibold text-[#64748B] hover:text-[#FF4600] transition-colors"
          >
            Harga
          </a>
        </div>
        <a
          href="https://play.google.com/store/apps/details?id=id.apick.app"
          className="bg-[#FF4600] text-white px-4 py-1.5 rounded-lg text-[13px] font-bold hover:bg-[#E63E00] transition-colors"
        >
          Download
        </a>
      </div>
    </nav>
  );
}
