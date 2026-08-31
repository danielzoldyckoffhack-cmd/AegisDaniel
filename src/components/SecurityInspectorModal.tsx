import React from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Globe,
  Radio,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  X,
  Cpu
} from "lucide-react";
import { SafetyAnalysis, ProxyNode, UserAgentProfile } from "../types";

interface SecurityInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  safety: SafetyAnalysis | null;
  currentUrl: string;
  activeProxy: ProxyNode;
  activeUa: UserAgentProfile;
  headers?: Record<string, string>;
}

export const SecurityInspectorModal: React.FC<SecurityInspectorModalProps> = ({
  isOpen,
  onClose,
  safety,
  currentUrl,
  activeProxy,
  activeUa,
  headers
}) => {
  if (!isOpen) return null;

  const isSafe = safety ? safety.threatLevel === "safe" : true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 font-mono select-none">
      <div className="w-full max-w-xl max-h-[90vh] bg-[#FAF8F5] border-3 border-[#121212] shadow-[8px_8px_0px_0px_#121212] flex flex-col overflow-hidden text-[#121212]">
        {/* HEADER */}
        <div className={`p-4 border-b-3 border-[#121212] flex items-center justify-between ${isSafe ? "bg-[#54F28D]" : "bg-[#FF5A36] text-white"}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#121212] text-white flex items-center justify-center">
              {isSafe ? <ShieldCheck className="w-5 h-5 stroke-[2.5]" /> : <ShieldAlert className="w-5 h-5 stroke-[2.5]" />}
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-tight">
                INSPEKSI KEAMANAN SANDBOX
              </h2>
              <div className="text-[10px] font-bold truncate max-w-xs">
                TARGET: {currentUrl || "aegis://home"}
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

        {/* BODY */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 font-mono text-xs">
          {/* STATUS SUMMARY */}
          <div className={`p-3.5 border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] space-y-1 ${isSafe ? "bg-[#FFFFFF]" : "bg-[#FF5A36] text-white"}`}>
            <div className="font-black uppercase text-[11px] flex items-center gap-1.5">
              {isSafe ? <CheckCircle2 className="w-4 h-4 text-[#54F28D] stroke-[3]" /> : <AlertTriangle className="w-4 h-4 stroke-[3]" />}
              <span>{isSafe ? "STATUS: DOMAIN AMAN & TERISOLASI" : "STATUS: TERDETEKSI ANCAMAN PHISHING / MALWARE"}</span>
            </div>
            <p className="text-[11px] font-bold">
              {isSafe
                ? "Domain telah melalui filter analisis struktur punycode, typosquatting, dan SSL cipher verification."
                : "Halaman web mengandung pola manipulasi alamat atau skrip pencurian kredensial."}
            </p>
          </div>

          {/* METRIC GRID */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 bg-[#FFFFFF] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] space-y-1">
              <span className="text-[10px] font-black uppercase text-[#666] flex items-center gap-1">
                <Globe className="w-3 h-3 text-[#121212]" />
                <span>RELAY PROXY NODE</span>
              </span>
              <div className="font-black text-[#121212] uppercase truncate">[{activeProxy.flag}] {activeProxy.name}</div>
              <div className="text-[10px] text-[#444] font-bold">IP: {activeProxy.ipMask}</div>
            </div>

            <div className="p-3 bg-[#FFFFFF] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] space-y-1">
              <span className="text-[10px] font-black uppercase text-[#666] flex items-center gap-1">
                <Cpu className="w-3 h-3 text-[#121212]" />
                <span>ACTIVE SPOOFED UA</span>
              </span>
              <div className="font-black text-[#121212] uppercase truncate">{activeUa.name}</div>
              <div className="text-[10px] text-[#444] font-bold">OS: {activeUa.platform}</div>
            </div>

            <div className="p-3 bg-[#FFFFFF] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] space-y-1">
              <span className="text-[10px] font-black uppercase text-[#666] flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#121212]" />
                <span>TUNNEL CIPHER</span>
              </span>
              <div className="font-black text-[#121212] uppercase">{activeProxy.encryption}</div>
              <div className="text-[10px] text-[#444] font-bold">Zero-Knowledge Sandbox</div>
            </div>

            <div className="p-3 bg-[#FFFFFF] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] space-y-1">
              <span className="text-[10px] font-black uppercase text-[#666] flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#121212]" />
                <span>THREAT SCORE</span>
              </span>
              <div className="font-black text-[#121212] uppercase">{safety ? `${safety.score}/100` : "0/100 (AMAN)"}</div>
              <div className="text-[10px] text-[#444] font-bold">Client-Side Heuristic</div>
            </div>
          </div>

          {/* DETECTED ANOMALIES */}
          {safety && safety.reasons && safety.reasons.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase text-[#666]">
                CATATAN HEURISTIK ANCAMAN:
              </span>
              <div className="p-3 bg-[#FFE600] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] space-y-1">
                {safety.reasons.map((r, i) => (
                  <div key={i} className="text-[11px] font-black text-[#121212] flex items-center gap-1.5">
                    <span>•</span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
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
