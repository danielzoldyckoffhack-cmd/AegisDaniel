import React from "react";
import {
  ShieldAlert,
  AlertTriangle,
  Lock,
  ExternalLink,
  ShieldCheck,
  X,
  ArrowLeft,
  Terminal,
  FileWarning
} from "lucide-react";
import { SafetyAnalysis } from "../types";

interface PhishingWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  safety: SafetyAnalysis | null;
  targetUrl: string;
  onBypass: () => void;
  onGoBackSafe: () => void;
}

export const PhishingWarningModal: React.FC<PhishingWarningModalProps> = ({
  isOpen,
  onClose,
  safety,
  targetUrl,
  onBypass,
  onGoBackSafe
}) => {
  if (!isOpen || !safety) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 font-mono select-none">
      <div className="w-full max-w-2xl bg-[#FAF8F5] border-3 border-[#121212] shadow-[8px_8px_0px_0px_#FF5A36] overflow-hidden text-[#121212]">
        {/* HEADER */}
        <div className="p-4 bg-[#FF5A36] border-b-3 border-[#121212] flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#121212] text-white flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-tight">
                PERINGATAN PHISHING & ANCAMAN SIBER
              </h2>
              <div className="text-[10px] font-black uppercase text-white/90">
                SKOR RISIKO: {safety.score}/100 • JENIS: {safety.detectedType || "MALICIOUS URL"}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-[#FFFFFF] text-[#121212] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] hover:bg-[#121212] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-5 space-y-4 text-xs font-mono">
          <div className="p-3 bg-[#FFFFFF] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] break-all">
            <span className="text-[10px] font-black uppercase text-[#666] block mb-1">
              URL TARGET YANG DIBLOKIR:
            </span>
            <span className="font-bold text-[#121212]">{targetUrl}</span>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase text-[#444]">
              INDIKASI ANOMALI YANG DITEMUKAN OLEH HEURISTIK AEGIS:
            </span>
            <div className="p-3 bg-[#FFE600] border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] space-y-1.5">
              {safety.reasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2 font-bold text-[#121212]">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#FF5A36] shrink-0 stroke-[3] mt-0.5" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-[#FFFFFF] border-2 border-[#121212] text-[11px] font-bold text-[#555] leading-relaxed">
            Peramban telah menghentikan eksekusi skrip dan pengiriman kredensial. Membuka situs ini dapat mengakibatkan kebocoran kata sandi atau serangan malware.
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-4 bg-[#EFECE6] border-t-2 border-[#121212] flex items-center justify-between gap-3">
          <button
            onClick={onGoBackSafe}
            className="px-4 py-2 bg-[#54F28D] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] hover:translate-x-[-1px] hover:translate-y-[-1px] text-xs font-black uppercase text-[#121212] flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 stroke-[3]" />
            <span>KEMBALI KE HALAMAN AMAN</span>
          </button>

          <button
            onClick={onBypass}
            className="px-4 py-2 bg-[#FFFFFF] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] hover:bg-[#FF5A36] hover:text-white text-xs font-black uppercase transition-colors cursor-pointer"
          >
            LANJUTKAN (KARANTINA TERBATAS)
          </button>
        </div>
      </div>
    </div>
  );
};
