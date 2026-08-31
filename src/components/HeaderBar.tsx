import React from "react";
import {
  Plus,
  X,
  Shield,
  ShieldAlert,
  ShieldCheck,
  RotateCw,
  ArrowLeft,
  ArrowRight,
  Home,
  Layers,
  Download,
  Settings,
  Lock,
  Zap,
  Globe,
  Radio,
  Smartphone,
  Search,
  Key
} from "lucide-react";
import { Tab, UserAgentProfile, ProxyNode, DownloadTask } from "../types";

interface HeaderBarProps {
  tabs: Tab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onAddTab: () => void;
  urlInput: string;
  onChangeUrlInput: (url: string) => void;
  onSubmitUrl: (e: React.FormEvent) => void;
  onGoBack: () => void;
  onGoForward: () => void;
  onRefresh: () => void;
  onGoHome: () => void;
  activeUa: UserAgentProfile;
  activeProxy: ProxyNode;
  onOpenUaModal: () => void;
  onOpenProxyModal: () => void;
  onOpenMediaModal: () => void;
  onOpenVaultModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenDonationModal: () => void;
  onOpenSecurityModal: () => void;
  onOpenDomainAppModal: () => void;
  downloads: DownloadTask[];
  mediaCount: number;
  batteryEcoMode: boolean;
  onToggleBatteryEco: () => void;
  isPhishingRisk?: boolean;
  quotaUsedPercent: number;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onAddTab,
  urlInput,
  onChangeUrlInput,
  onSubmitUrl,
  onGoBack,
  onGoForward,
  onRefresh,
  onGoHome,
  activeUa,
  activeProxy,
  onOpenUaModal,
  onOpenProxyModal,
  onOpenMediaModal,
  onOpenVaultModal,
  onOpenSettingsModal,
  onOpenDonationModal,
  onOpenSecurityModal,
  onOpenDomainAppModal,
  downloads,
  mediaCount,
  batteryEcoMode,
  onToggleBatteryEco,
  isPhishingRisk
}) => {
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
  const activeDownloadsCount = downloads.filter((d) => d.status === "downloading").length;

  return (
    <header className="bg-[#FAF8F5] border-b-2 border-[#121212] text-[#121212] select-none shrink-0 z-30 font-mono">
      {/* 1. TOP TABS STRIP */}
      <div className="flex items-center justify-between px-2 pt-2 pb-0 bg-[#EFECE6] border-b-2 border-[#121212] gap-2 overflow-hidden">
        {/* Tabs List */}
        <div className="flex items-end gap-1.5 overflow-x-auto no-scrollbar flex-1 min-w-0">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <div
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`group relative flex items-center gap-2 px-3 py-1.5 text-xs font-bold cursor-pointer transition-all max-w-[200px] min-w-[120px] truncate border-2 border-b-0 border-[#121212] ${
                  isActive
                    ? "bg-[#FAF8F5] text-[#121212] shadow-[2px_-2px_0px_0px_#121212] translate-y-[2px]"
                    : "bg-[#DFDAD0] text-[#555] hover:bg-[#E7E3DB] hover:text-[#121212]"
                }`}
              >
                {tab.isLoading ? (
                  <RotateCw className="w-3 h-3 animate-spin text-[#121212] shrink-0" />
                ) : tab.url === "aegis://home" ? (
                  <Shield className="w-3 h-3 text-[#121212] shrink-0" />
                ) : (
                  <Globe className="w-3 h-3 text-[#121212] shrink-0" />
                )}

                <span className="truncate flex-1 text-[11px] uppercase tracking-tight">
                  {tab.title || (tab.url === "aegis://home" ? "BERANDA" : tab.url)}
                </span>

                {tabs.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab(tab.id);
                    }}
                    className="p-0.5 hover:bg-[#121212] hover:text-white border border-transparent hover:border-[#121212] transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          {/* Add Tab Button */}
          <button
            id="btn-add-new-tab"
            onClick={onAddTab}
            className="p-1.5 bg-[#FFE600] text-[#121212] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none mb-1 transition-all"
            title="Tambah Tab Baru"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>

        {/* Right Corner Brutalist Badges */}
        <div className="flex items-center gap-2 pb-1.5 shrink-0">
          <button
            id="btn-open-domain-app-modal"
            onClick={onOpenDomainAppModal}
            className="px-2.5 py-1 text-[10px] font-black uppercase bg-[#70D6FF] text-[#121212] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] transition-all flex items-center gap-1.5"
            title="Aplikasi Native APK & Desktop danielzoldyck.com"
          >
            <Smartphone className="w-3 h-3 stroke-[2.5]" />
            <span>NATIVE [APK/EXE]</span>
          </button>

          <button
            id="btn-toggle-battery-eco"
            onClick={onToggleBatteryEco}
            className={`px-2.5 py-1 text-[10px] font-black uppercase border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] transition-all flex items-center gap-1 ${
              batteryEcoMode
                ? "bg-[#54F28D] text-[#121212]"
                : "bg-[#FFFFFF] text-[#777]"
            }`}
            title="Toggle Mode Hemat Baterai"
          >
            <Zap className="w-3 h-3" />
            <span className="hidden sm:inline">{batteryEcoMode ? "ECO: ON" : "ECO: OFF"}</span>
          </button>

          <button
            id="btn-open-qris-support"
            onClick={onOpenDonationModal}
            className="px-2.5 py-1 text-[10px] font-black uppercase bg-[#FF5A36] text-[#FFFFFF] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] transition-all"
            title="QRIS Donasi"
          >
            QRIS
          </button>
        </div>
      </div>

      {/* 2. OMNIBOX & NAVIGATION CONTROLS */}
      <div className="flex items-center gap-2 p-2 bg-[#FAF8F5]">
        {/* Navigation Buttons */}
        <div className="flex items-center gap-1 text-[#121212]">
          <button
            id="btn-nav-back"
            onClick={onGoBack}
            disabled={!activeTab?.canGoBack}
            className="p-1.5 bg-[#FFFFFF] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] disabled:opacity-30 disabled:shadow-none hover:bg-[#FFE600] active:translate-x-[1px] active:translate-y-[1px] transition-all"
            title="Kembali"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          </button>

          <button
            id="btn-nav-forward"
            onClick={onGoForward}
            disabled={!activeTab?.canGoForward}
            className="p-1.5 bg-[#FFFFFF] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] disabled:opacity-30 disabled:shadow-none hover:bg-[#FFE600] active:translate-x-[1px] active:translate-y-[1px] transition-all"
            title="Maju"
          >
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>

          <button
            id="btn-nav-refresh"
            onClick={onRefresh}
            className="p-1.5 bg-[#FFFFFF] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] hover:bg-[#FFE600] active:translate-x-[1px] active:translate-y-[1px] transition-all"
            title="Muat Ulang"
          >
            <RotateCw className={`w-4 h-4 stroke-[2.5] ${activeTab?.isLoading ? "animate-spin" : ""}`} />
          </button>

          <button
            id="btn-nav-home"
            onClick={onGoHome}
            className="p-1.5 bg-[#FFFFFF] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] hover:bg-[#FFE600] active:translate-x-[1px] active:translate-y-[1px] transition-all"
            title="Beranda"
          >
            <Home className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Brutalist Address Bar Form */}
        <form onSubmit={onSubmitUrl} className="flex-1 flex items-center relative">
          <div className="w-full relative flex items-center">
            <div className="absolute left-3 flex items-center gap-1.5 text-[#121212] pointer-events-none">
              {isPhishingRisk ? (
                <ShieldAlert className="w-4 h-4 text-[#FF5A36] stroke-[2.5]" />
              ) : activeTab?.url?.startsWith("https") ? (
                <Lock className="w-3.5 h-3.5 text-[#121212] stroke-[2.5]" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-[#121212] stroke-[2.5]" />
              )}
            </div>

            <input
              id="omnibox-input"
              type="text"
              value={urlInput}
              onChange={(e) => onChangeUrlInput(e.target.value)}
              placeholder="KETIK URL (MISAL: WIKIPEDIA.ORG) ATAU KATA KUNCI..."
              className="w-full bg-[#FFFFFF] border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] focus:shadow-[4px_4px_0px_0px_#FFE600] focus:outline-none pl-9 pr-20 py-1.5 text-xs font-mono font-bold text-[#121212] placeholder-[#888] transition-all"
            />

            <div className="absolute right-2 flex items-center">
              <button
                type="button"
                onClick={onOpenSecurityModal}
                className="px-2 py-0.5 bg-[#121212] text-white text-[10px] font-black uppercase hover:bg-[#FFE600] hover:text-[#121212] transition-colors"
                title="Scan Keamanan"
              >
                SCAN
              </button>
            </div>
          </div>
        </form>

        {/* Cloaking & Tool Triggers */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* User-Agent Trigger */}
          <button
            id="btn-open-ua-modal"
            onClick={onOpenUaModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#FFFFFF] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] hover:bg-[#FFE600] text-xs font-bold text-[#121212] transition-all"
            title="Ganti User-Agent"
          >
            <Layers className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden md:inline uppercase text-[11px] truncate max-w-[80px]">
              {activeUa.name.split(" ")[0]}
            </span>
            <span className="text-[10px] px-1 bg-[#121212] text-white">UA</span>
          </button>

          {/* Proxy Node Trigger */}
          <button
            id="btn-open-proxy-modal"
            onClick={onOpenProxyModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#FFFFFF] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] hover:bg-[#54F28D] text-xs font-bold text-[#121212] transition-all"
            title="Ganti Node Proxy"
          >
            <span className="px-1 bg-[#121212] text-white text-[10px] font-black">{activeProxy.flag}</span>
            <span className="hidden md:inline uppercase text-[11px] truncate max-w-[80px]">
              {activeProxy.country.split(" ")[0]}
            </span>
            <span className="text-[10px] text-[#121212] font-black">{activeProxy.latencyMs}MS</span>
          </button>

          {/* Media Downloader Trigger */}
          <button
            id="btn-open-media-modal"
            onClick={onOpenMediaModal}
            className={`relative p-1.5 border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] transition-all ${
              mediaCount > 0
                ? "bg-[#FFE600] text-[#121212]"
                : activeDownloadsCount > 0
                ? "bg-[#54F28D] text-[#121212]"
                : "bg-[#FFFFFF] text-[#121212] hover:bg-[#EFECE6]"
            }`}
            title="Media Downloader"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            {mediaCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 px-1 bg-[#FF5A36] text-white text-[9px] font-black border border-[#121212]">
                {mediaCount}
              </span>
            )}
          </button>

          {/* Encrypted Vault Trigger */}
          <button
            id="btn-open-vault-modal"
            onClick={onOpenVaultModal}
            className="p-1.5 bg-[#FFFFFF] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] hover:bg-[#D4A5FF] text-[#121212] transition-all"
            title="Brankas Terenkripsi E2E"
          >
            <Key className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Settings Trigger */}
          <button
            id="btn-open-settings-modal"
            onClick={onOpenSettingsModal}
            className="p-1.5 bg-[#FFFFFF] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] hover:bg-[#EFECE6] text-[#121212] transition-all"
            title="Pengaturan"
          >
            <Settings className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </header>
  );
};
