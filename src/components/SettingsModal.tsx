import React from "react";
import {
  Settings,
  Moon,
  Sun,
  BatteryCharging,
  Shield,
  Trash2,
  Lock,
  X,
  Check,
  Zap,
  Cpu,
  EyeOff
} from "lucide-react";
import { BrowserSettings } from "../types";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BrowserSettings;
  onUpdateSettings: (newSettings: Partial<BrowserSettings>) => void;
  onPurgeAllData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onPurgeAllData
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 font-mono select-none">
      <div className="w-full max-w-xl max-h-[90vh] bg-[#FAF8F5] border-3 border-[#121212] shadow-[8px_8px_0px_0px_#121212] flex flex-col overflow-hidden text-[#121212]">
        {/* HEADER */}
        <div className="p-4 bg-[#FFE600] border-b-3 border-[#121212] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#121212] text-white flex items-center justify-center">
              <Settings className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-tight text-[#121212]">
                PENGATURAN PERAMBAN
              </h2>
              <p className="text-[11px] text-[#333] font-bold">
                Konfigurasi perisai privasi, daya hemat, dan proteksi anti-phishing
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

        {/* BODY */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* THEME SELECTOR */}
          <div className="space-y-2">
            <label className="font-black text-[#121212] uppercase text-[11px] block">
              TEMA VISUAL & KONTRAST:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "auto", label: "SISTEM", icon: <Sun className="w-3.5 h-3.5 stroke-[2.5]" /> },
                { id: "dark", label: "GELAP", icon: <Moon className="w-3.5 h-3.5 stroke-[2.5]" /> },
                { id: "light", label: "NEOBRUTAL", icon: <Sun className="w-3.5 h-3.5 stroke-[2.5]" /> }
              ].map((th) => (
                <button
                  key={th.id}
                  onClick={() => onUpdateSettings({ theme: th.id as any })}
                  className={`p-2.5 border-2 border-[#121212] flex items-center justify-center gap-2 font-black uppercase transition-all cursor-pointer ${
                    settings.theme === th.id
                      ? "bg-[#121212] text-white shadow-[2px_2px_0px_0px_#FFE600]"
                      : "bg-[#FFFFFF] text-[#121212] hover:bg-[#FFE600]"
                  }`}
                >
                  {th.icon}
                  <span>{th.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* BATTERY & ECO SAVER TOGGLE */}
          <div className="p-3.5 bg-[#FFFFFF] border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="font-black uppercase text-[#121212] flex items-center gap-1.5">
                <BatteryCharging className="w-4 h-4 text-[#121212] stroke-[2.5]" />
                <span>MODE HEMAT BATERAI & DAYA</span>
              </div>
              <p className="text-[10px] text-[#555] font-bold">
                Menidurkan tab latar belakang, menghemat CPU sandbox, dan membatasi render.
              </p>
            </div>
            <button
              onClick={() => onUpdateSettings({ batteryEcoMode: !settings.batteryEcoMode })}
              className={`px-3 py-1 text-[11px] font-black uppercase border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] transition-all cursor-pointer ${
                settings.batteryEcoMode ? "bg-[#54F28D] text-[#121212]" : "bg-[#FFFFFF] text-[#777]"
              }`}
            >
              {settings.batteryEcoMode ? "ON" : "OFF"}
            </button>
          </div>

          {/* SMART PHISHING SHIELD TOGGLE */}
          <div className="p-3.5 bg-[#FFFFFF] border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="font-black uppercase text-[#121212] flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-[#121212] stroke-[2.5]" />
                <span>PERISAI PHISHING & DOMAIN BERBAHAYA</span>
              </div>
              <p className="text-[10px] text-[#555] font-bold">
                Mendeteksi typosquatting secara real-time, punycode, dan form login tiruan.
              </p>
            </div>
            <button
              onClick={() => onUpdateSettings({ smartPhishingShield: !settings.smartPhishingShield })}
              className={`px-3 py-1 text-[11px] font-black uppercase border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] transition-all cursor-pointer ${
                settings.smartPhishingShield ? "bg-[#54F28D] text-[#121212]" : "bg-[#FFFFFF] text-[#777]"
              }`}
            >
              {settings.smartPhishingShield ? "ON" : "OFF"}
            </button>
          </div>

          {/* TRACKER & AD STRIPPER */}
          <div className="p-3.5 bg-[#FFFFFF] border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="font-black uppercase text-[#121212] flex items-center gap-1.5">
                <EyeOff className="w-4 h-4 text-[#121212] stroke-[2.5]" />
                <span>PEMBERSIS IKLAN & PELACAK (ADBLOCK)</span>
              </div>
              <p className="text-[10px] text-[#555] font-bold">
                Menghapus skrip analitik, pixel tracker, dan beacon sidik jari.
              </p>
            </div>
            <button
              onClick={() => onUpdateSettings({ stripAdsAndTrackers: !settings.stripAdsAndTrackers })}
              className={`px-3 py-1 text-[11px] font-black uppercase border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] transition-all cursor-pointer ${
                settings.stripAdsAndTrackers ? "bg-[#54F28D] text-[#121212]" : "bg-[#FFFFFF] text-[#777]"
              }`}
            >
              {settings.stripAdsAndTrackers ? "ON" : "OFF"}
            </button>
          </div>

          {/* PURGE ALL DATA */}
          <div className="p-3.5 bg-[#FFFFFF] border-2 border-[#121212] shadow-[3px_3px_0px_0px_#FF5A36] flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="font-black uppercase text-[#FF5A36] flex items-center gap-1.5">
                <Trash2 className="w-4 h-4 stroke-[2.5]" />
                <span>PURGE DATA & CACHE SEKETIKA</span>
              </div>
              <p className="text-[10px] text-[#555] font-bold">
                Hapus cache lokal dan riwayat tanpa meninggalkan jejak.
              </p>
            </div>
            <button
              onClick={onPurgeAllData}
              className="px-3.5 py-1.5 bg-[#FF5A36] hover:bg-[#121212] text-white border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] text-xs font-black uppercase shrink-0 transition-colors cursor-pointer"
            >
              PURGE
            </button>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-[#EFECE6] border-t-2 border-[#121212] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#FFE600] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] hover:bg-[#54F28D] text-[#121212] font-black text-xs uppercase cursor-pointer"
          >
            SELESAI
          </button>
        </div>
      </div>
    </div>
  );
};
