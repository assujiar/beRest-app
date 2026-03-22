"use client";

import { useState, useEffect } from "react";

const modules = [
  { id: "lapak", name: "Lapak", color: "#50BFC3" },
  { id: "sewa", name: "Sewa", color: "#00C49A" },
  { id: "warga", name: "Warga", color: "#FB8F67" },
  { id: "hajat", name: "Hajat", color: "#D95877" },
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
        <a href="#content">
          <img src="/logos/apick-logo-full.svg" alt="apick" className="h-8" />
        </a>
        <div className="hidden sm:flex items-center gap-1">
          {modules.map((m) => (
            <a
              key={m.id}
              href="#modules-heading"
              onClick={(e) => {
                e.preventDefault();
                window.dispatchEvent(
                  new CustomEvent("apick:switch-module", { detail: m.id })
                );
                document
                  .getElementById("modules-heading")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
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
            className="px-3 py-1.5 rounded-full text-[13px] font-semibold text-[#64748B] hover:text-[#156064] transition-colors"
          >
            Harga
          </a>
        </div>
        <a
          href="https://play.google.com/store/apps/details?id=id.apick.app"
          className="bg-[#156064] text-white px-4 py-1.5 rounded-lg text-[13px] font-bold hover:bg-[#0E4A4D] transition-colors"
        >
          Download
        </a>
      </div>
    </nav>
  );
}
