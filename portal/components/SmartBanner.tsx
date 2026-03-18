"use client";

import { useState } from "react";

export function SmartBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-[#1B3A5C] text-white flex items-center px-4 py-3 sticky top-0 z-50">
      <div className="flex-1">
        <div className="font-bold text-sm">Download Apick</div>
        <div className="text-white/70 text-xs">
          Notifikasi real-time &amp; semua status di 1 tempat
        </div>
      </div>
      <a
        href="https://play.google.com/store/apps/details?id=com.apick.app"
        className="bg-[#FF4600] text-white text-xs font-bold px-4 py-2 rounded-lg mr-2 hover:opacity-90"
      >
        Install
      </a>
      <button
        onClick={() => setDismissed(true)}
        className="text-white/50 text-lg hover:text-white"
      >
        ✕
      </button>
    </div>
  );
}
