import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Download,
  Code,
  BookOpen,
  ExternalLink,
  RotateCw,
  Lock,
  EyeOff,
  Maximize2,
  Minimize2,
  FileWarning,
  Zap,
  Globe
} from "lucide-react";
import { Tab, UserAgentProfile, ProxyNode, MediaItem } from "../types";
import { QuickStartHome } from "./QuickStartHome";

interface WebViewerProps {
  activeTab: Tab;
  activeUa: UserAgentProfile;
  activeProxy: ProxyNode;
  onNavigate: (url: string) => void;
  onOpenUaModal: () => void;
  onOpenProxyModal: () => void;
  onOpenMediaModal: () => void;
  onOpenDonationModal: () => void;
  onOpenSecurityModal: () => void;
  onOpenDomainAppModal: () => void;
  batteryEcoMode: boolean;
  onStartDirectDownload: (item: MediaItem, saveToVault: boolean) => void;
}

export const WebViewer: React.FC<WebViewerProps> = ({
  activeTab,
  activeUa,
  activeProxy,
  onNavigate,
  onOpenUaModal,
  onOpenProxyModal,
  onOpenMediaModal,
  onOpenDonationModal,
  onOpenSecurityModal,
  onOpenDomainAppModal,
  batteryEcoMode,
  onStartDirectDownload
}) => {
  const [viewMode, setViewMode] = useState<"render" | "source" | "reader">("render");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Listen to intercepted link clicks and form submits (Google search, etc.) from iframe sandbox
  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "AEGIS_NAVIGATE" && typeof event.data.url === "string") {
        onNavigate(event.data.url);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onNavigate]);

  const isHome = !activeTab.url || activeTab.url === "about:blank" || activeTab.url === "aegis://home";

  if (isHome) {
    return (
      <div className="w-full h-full min-h-0 overflow-y-auto overscroll-contain bg-[#F4F0EA]">
        <QuickStartHome
          onNavigate={onNavigate}
          activeUa={activeUa}
          activeProxy={activeProxy}
          onOpenUaModal={onOpenUaModal}
          onOpenProxyModal={onOpenProxyModal}
          onOpenDonationModal={onOpenDonationModal}
          onOpenDomainAppModal={onOpenDomainAppModal}
          batteryEcoMode={batteryEcoMode}
        />
      </div>
    );
  }

  const mediaFound = activeTab.mediaFound || [];

  return (
    <div className="relative w-full h-full min-h-0 flex flex-col bg-[#FAF8F5] overflow-hidden font-mono text-[#121212]">
      {/* 1. BRUTALIST STATUS STRIP */}
      <div className="px-4 py-2 bg-[#EFECE6] border-b-2 border-[#121212] flex items-center justify-between text-xs font-bold shrink-0">
        <div className="flex items-center gap-3 truncate">
          <button
            onClick={onOpenSecurityModal}
            className={`flex items-center gap-1.5 px-2.5 py-1 border-2 border-[#121212] text-[11px] font-black uppercase shadow-[2px_2px_0px_0px_#121212] transition-all cursor-pointer ${
              activeTab.safety?.threatLevel === "dangerous"
                ? "bg-[#FF5A36] text-white"
                : "bg-[#54F28D] text-[#121212]"
            }`}
          >
            {activeTab.safety?.threatLevel === "dangerous" ? (
              <ShieldAlert className="w-3.5 h-3.5 stroke-[2.5]" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
            )}
            <span>
              {activeTab.safety?.threatLevel === "dangerous" ? "KARANTINA PHISHING" : `NODE [${activeProxy.flag}] SECURE`}
            </span>
          </button>

          <span className="text-[#555] font-bold truncate max-w-sm text-xs">
            {activeTab.url}
          </span>
        </div>

        {/* View Mode Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-[#FFFFFF] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212]">
            <button
              onClick={() => setViewMode("render")}
              className={`px-2.5 py-1 text-[11px] font-black uppercase transition-colors ${
                viewMode === "render" ? "bg-[#121212] text-white" : "text-[#555] hover:text-[#121212]"
              }`}
            >
              RENDER
            </button>
            <button
              onClick={() => setViewMode("reader")}
              className={`px-2.5 py-1 text-[11px] font-black uppercase transition-colors border-l-2 border-[#121212] ${
                viewMode === "reader" ? "bg-[#121212] text-white" : "text-[#555] hover:text-[#121212]"
              }`}
            >
              READER
            </button>
            <button
              onClick={() => setViewMode("source")}
              className={`px-2.5 py-1 text-[11px] font-black uppercase transition-colors border-l-2 border-[#121212] ${
                viewMode === "source" ? "bg-[#121212] text-white" : "text-[#555] hover:text-[#121212]"
              }`}
            >
              SOURCE HTML
            </button>
          </div>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 bg-[#FFFFFF] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] hover:bg-[#FFE600] transition-colors"
            title="Layar Penuh"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 stroke-[2.5]" /> : <Maximize2 className="w-3.5 h-3.5 stroke-[2.5]" />}
          </button>
        </div>
      </div>

      {/* 2. FLOATING MEDIA DETECTOR PILL */}
      {mediaFound.length > 0 && (
        <div className="absolute top-12 right-6 z-20">
          <div className="flex items-center gap-2.5 p-2 bg-[#FFE600] border-2 border-[#121212] shadow-[4px_4px_0px_0px_#121212] text-xs font-mono">
            <span className="w-2.5 h-2.5 bg-[#FF5A36] border border-[#121212] animate-ping" />
            <span className="text-[#121212] font-black uppercase">
              {mediaFound.length} ALIRAN MEDIA DITEMUKAN
            </span>
            <button
              onClick={onOpenMediaModal}
              className="px-3 py-1 bg-[#121212] hover:bg-[#FF5A36] text-white font-black uppercase transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3 h-3 stroke-[2.5]" />
              <span>UNDUH</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. MAIN CONTENT CONTAINER */}
      <div className="flex-1 w-full h-full relative overflow-auto bg-[#FFFFFF]">
        {activeTab.isLoading ? (
          <div className="w-full h-full flex flex-col items-center justify-center space-y-3 bg-[#F4F0EA] text-[#121212]">
            <div className="w-12 h-12 bg-[#FFE600] border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] flex items-center justify-center">
              <RotateCw className="w-6 h-6 animate-spin stroke-[2.5]" />
            </div>
            <div className="text-xs font-black uppercase">
              MERUTEKAN MELALUI NODE [{activeProxy.flag}] {activeProxy.country}...
            </div>
            <div className="text-[10px] text-[#666] font-bold">
              ENKRIPSI: {activeProxy.encryption}
            </div>
          </div>
        ) : viewMode === "render" ? (
          activeTab.contentHtml ? (
            <iframe
              key={`${activeTab.id}-${activeTab.url}-${activeTab.historyIndex}`}
              id="aegis-sandbox-frame"
              title="Aegis Isolated Sandbox View"
              srcDoc={activeTab.contentHtml}
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
              className="w-full h-full border-0 bg-white"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-8 text-center bg-[#F4F0EA] text-[#121212]">
              <div className="max-w-md p-6 bg-[#FFFFFF] border-3 border-[#121212] shadow-[4px_4px_0px_0px_#121212] space-y-3">
                <FileWarning className="w-8 h-8 mx-auto text-[#FF5A36] stroke-[2.5]" />
                <h3 className="font-black text-sm uppercase">KONTEN TIDAK DITEMUKAN ATAU KOSONG</h3>
                <p className="text-xs text-[#555] font-bold">
                  Pastikan URL yang dimasukkan valid atau gunakan mesin pencari bawaan di beranda.
                </p>
              </div>
            </div>
          )
        ) : viewMode === "reader" ? (
          <div className="max-w-3xl mx-auto p-8 font-sans text-[#121212] leading-relaxed space-y-4 bg-[#FFFFFF]">
            <h1 className="text-2xl font-black uppercase text-[#121212] border-b-2 border-[#121212] pb-3 font-heading">
              {activeTab.title}
            </h1>
            <div className="text-xs text-[#666] font-mono font-bold">
              SUMBER: {activeTab.url} • BEBAS PELACAK & IKLAN
            </div>
            <div
              className="prose max-w-none text-[#222] text-sm pt-2 font-mono"
              dangerouslySetInnerHTML={{
                __html: activeTab.contentHtml?.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") || "Tidak ada artikel teks yang dapat diekstrak."
              }}
            />
          </div>
        ) : (
          <div className="p-6 font-mono text-xs text-[#121212] whitespace-pre-wrap break-all select-text bg-[#FAF8F5]">
            {activeTab.contentHtml || "<!-- Empty HTML Payload -->"}
          </div>
        )}
      </div>
    </div>
  );
};
