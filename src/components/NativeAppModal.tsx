import React, { useState } from "react";
import {
  Smartphone,
  Laptop,
  Terminal,
  Download,
  X,
  Check,
  Globe,
  ShieldCheck,
  Cpu,
  Layers,
  Copy
} from "lucide-react";

interface NativeAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NativeAppModal: React.FC<NativeAppModalProps> = ({
  isOpen,
  onClose
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const downloadPlatforms = [
    {
      name: "ANDROID APK (STANDALONE)",
      os: "Android 8.0 - 15.0+",
      version: "v2.5.0-arm64",
      size: "18.4 MB",
      filename: "aegis-browser-release-v2.5.apk",
      icon: Smartphone,
      bg: "bg-[#54F28D]",
      desc: "Paket instalasi mandiri dengan fitur bypass TLS fingerprint bawaan."
    },
    {
      name: "WINDOWS PORTABLE (.EXE)",
      os: "Windows 10 / 11 (64-bit)",
      version: "v2.5.0-win-x64",
      size: "42.1 MB",
      filename: "AegisBrowser-Setup-x64.exe",
      icon: Laptop,
      bg: "bg-[#70D6FF]",
      desc: "Versi desktop tanpa instalasi dengan isolasi process Chromium sandbox."
    },
    {
      name: "LINUX APPIMAGE / DEB",
      os: "Debian, Ubuntu, Arch, Fedora",
      version: "v2.5.0-linux-x86_64",
      size: "39.8 MB",
      filename: "aegis-browser-v2.5.AppImage",
      icon: Terminal,
      bg: "bg-[#FFE600]",
      desc: "Portabel untuk sistem operasi Linux dengan zero dependency bloatware."
    }
  ];

  const handleDownloadFile = (filename: string) => {
    // Trigger direct mock file download in browser
    const dummyContent = `AEGIS_BROWSER_STANDALONE_BINARY_PACKAGE\nVersion: 2.5.0\nDomain: danielzoldyck.com\nBuilt with Wasm Sandboxing & Zero-Knowledge Cryptography.`;
    const blob = new Blob([dummyContent], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyMirror = () => {
    navigator.clipboard.writeText("https://danielzoldyck.com/releases/aegis-browser");
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 font-mono select-none">
      <div className="w-full max-w-2xl max-h-[90vh] bg-[#FAF8F5] border-3 border-[#121212] shadow-[8px_8px_0px_0px_#121212] flex flex-col overflow-hidden text-[#121212]">
        {/* HEADER */}
        <div className="p-4 bg-[#70D6FF] border-b-3 border-[#121212] flex items-center justify-between text-[#121212]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#121212] text-white flex items-center justify-center">
              <Smartphone className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-tight">
                UNDUH APLIKASI NATIVE (APK & DESKTOP)
              </h2>
              <p className="text-[10px] font-bold text-[#222]">
                DISTRIBUSI RESMI: danielzoldyck.com
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-[#FFFFFF] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] hover:bg-[#FF5A36] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          <div className="p-3 bg-[#FFE600] border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] space-y-1">
            <div className="font-black uppercase text-xs text-[#121212]">
              INSTALL STANDALONE TANPA BROWSER WRAPPER
            </div>
            <p className="text-[11px] text-[#333] font-bold leading-relaxed">
              Jalankan Aegis Browser langsung pada perangkat Android, Windows, atau Linux Anda dengan performa native tanpa batas memori browser.
            </p>
          </div>

          <div className="space-y-3">
            {downloadPlatforms.map((p, idx) => {
              const IconComp = p.icon;
              return (
                <div
                  key={idx}
                  className="p-4 bg-[#FFFFFF] border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 ${p.bg} border-2 border-[#121212] text-[#121212]`}>
                        <IconComp className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <span className="font-black text-xs uppercase text-[#121212]">
                        {p.name}
                      </span>
                      <span className="px-1.5 py-0.5 bg-[#EFECE6] border border-[#121212] text-[9px] font-black uppercase">
                        {p.size}
                      </span>
                    </div>

                    <div className="text-[10px] text-[#444] font-bold">
                      KOMPATIBILITAS: {p.os} | VERSI: {p.version}
                    </div>

                    <p className="text-[11px] text-[#555] font-medium leading-tight">
                      {p.desc}
                    </p>
                  </div>

                  <div className="shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => handleDownloadFile(p.filename)}
                      className="px-4 py-2 bg-[#54F28D] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] hover:translate-x-[-1px] hover:translate-y-[-1px] text-xs font-black uppercase flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-4 h-4 stroke-[3]" />
                      <span>UNDUH PAKET</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-[#FFFFFF] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] flex items-center justify-between gap-2">
            <div className="text-[10px] font-bold text-[#555] truncate">
              REPOSITORI RESMI: <span className="text-[#121212] font-black">https://danielzoldyck.com/releases</span>
            </div>
            <button
              onClick={handleCopyMirror}
              className="px-3 py-1 bg-[#EFECE6] border-2 border-[#121212] text-[10px] font-black uppercase hover:bg-[#FFE600] flex items-center gap-1 cursor-pointer"
            >
              {copiedLink ? <Check className="w-3 h-3 stroke-[3]" /> : <Copy className="w-3 h-3 stroke-[2.5]" />}
              <span>{copiedLink ? "TERSALIN" : "SALIN URL"}</span>
            </button>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-[#EFECE6] border-t-2 border-[#121212] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#FFE600] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] hover:bg-[#54F28D] text-[#121212] font-black text-xs uppercase cursor-pointer"
          >
            TUTUP
          </button>
        </div>
      </div>
    </div>
  );
};
