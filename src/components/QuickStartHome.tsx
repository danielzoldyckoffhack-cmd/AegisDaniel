import React, { useState } from "react";
import {
  Shield,
  Search,
  Lock,
  Globe,
  Radio,
  Download,
  AlertTriangle,
  ArrowRight,
  Terminal,
  Cpu,
  Layers,
  Sparkles,
  Zap,
  CheckCircle2,
  ExternalLink,
  Smartphone,
  BookOpen,
  Code2,
  Film,
  Archive,
  Key
} from "lucide-react";
import { UserAgentProfile, ProxyNode } from "../types";

interface QuickStartHomeProps {
  onNavigate: (url: string) => void;
  activeUa: UserAgentProfile;
  activeProxy: ProxyNode;
  onOpenUaModal: () => void;
  onOpenProxyModal: () => void;
  onOpenDonationModal: () => void;
  onOpenDomainAppModal: () => void;
  batteryEcoMode: boolean;
}

export const QuickStartHome: React.FC<QuickStartHomeProps> = ({
  onNavigate,
  activeUa,
  activeProxy,
  onOpenUaModal,
  onOpenProxyModal,
  onOpenDonationModal,
  onOpenDomainAppModal,
  batteryEcoMode
}) => {
  const [searchInput, setSearchInput] = useState("");
  const [searchEngine, setSearchEngine] = useState<"duckduckgo" | "searxng" | "wikipedia" | "startpage">("duckduckgo");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    const targetUrl = searchInput.trim();
    if (/^(https?:\/\/|[a-z0-9-]+\.[a-z]{2,})/i.test(targetUrl)) {
      onNavigate(targetUrl);
    } else {
      switch (searchEngine) {
        case "duckduckgo":
          onNavigate(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(targetUrl)}`);
          break;
        case "wikipedia":
          onNavigate(`https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(targetUrl)}`);
          break;
        case "searxng":
          onNavigate(`https://searx.be/search?q=${encodeURIComponent(targetUrl)}`);
          break;
        case "startpage":
          onNavigate(`https://www.startpage.com/sp/search?query=${encodeURIComponent(targetUrl)}`);
          break;
      }
    }
  };

  const privacyBookmarks = [
    { title: "DuckDuckGo", url: "https://html.duckduckgo.com", category: "SEARCH ENGINE", icon: Search, tag: "NO-TRACK", bg: "bg-[#FFE600]" },
    { title: "Wikipedia", url: "https://id.wikipedia.org", category: "ENCYCLOPEDIA", icon: BookOpen, tag: "OPEN-SRC", bg: "bg-[#70D6FF]" },
    { title: "Cloudflare WAF Test", url: "https://nowsecure.nl", category: "HIGH BOT SHIELD", icon: Shield, tag: "WAF TEST", bg: "bg-[#FF5A36]" },
    { title: "Steam Store", url: "https://store.steampowered.com", category: "AKAMAI PROTECTED", icon: Film, tag: "HEAVY JS", bg: "bg-[#70D6FF]" },
    { title: "Internet Archive", url: "https://archive.org", category: "DIGITAL ARCHIVE", icon: Archive, tag: "PUBLIC", bg: "bg-[#FF70A6]" },
    { title: "GitHub Trending", url: "https://github.com/trending", category: "CODE REPO", icon: Code2, tag: "DEV", bg: "bg-[#54F28D]" },
    { title: "Hacker News", url: "https://news.ycombinator.com", category: "TECH RESEARCH", icon: Terminal, tag: "MINIMAL", bg: "bg-[#FF9F1C]" },
    { title: "Brave Search", url: "https://search.brave.com", category: "INDEPENDENT INDEX", icon: Globe, tag: "PRIVATE", bg: "bg-[#D4A5FF]" }
  ];

  const phishingTestDemos = [
    { name: "TEST 1: Typosquatting (paypa1-secure-login.xyz)", url: "https://paypa1-secure-login.xyz/auth/verify" },
    { name: "TEST 2: Fake Subdomain (klikbca-update.top)", url: "https://klikbca-update.top/rekening/pin" },
    { name: "TEST 3: Raw IP Address (198.51.100.22/admin-login)", url: "http://198.51.100.22/admin-login" }
  ];

  return (
    <div className="w-full min-h-full bg-[#F4F0EA] text-[#121212] px-4 sm:px-8 py-6 sm:py-8 pb-20 max-w-6xl mx-auto flex flex-col justify-between font-mono">
      {/* 1. BRUTALIST HEADER & BRAND */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#121212] pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FFE600] border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] flex items-center justify-center text-[#121212]">
                <Shield className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-heading uppercase text-[#121212] tracking-tight">
                  AEGIS STEALTH
                </h1>
              </div>
              <span className="px-2 py-0.5 bg-[#121212] text-white text-[10px] font-black uppercase tracking-wider">
                CORE V2.5
              </span>
            </div>
            <p className="text-xs text-[#444] mt-2 max-w-2xl font-bold">
              PERAMBAN ANTIMATA-MATA DENGAN RELAY MULTI-PROXY GLOBAL, USER-AGENT SPOOFING BEBAS BATAS, SANDBOXING KONTEN, DAN DETEKSI PHISHING CERDAS.
            </p>
          </div>

          {/* Action Header Buttons */}
          <div className="flex items-center gap-2">
            <button
              id="btn-home-native-banner"
              onClick={onOpenDomainAppModal}
              className="px-3.5 py-2 bg-[#70D6FF] border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] text-xs font-black uppercase text-[#121212] transition-all flex items-center gap-2 cursor-pointer"
            >
              <Smartphone className="w-4 h-4 stroke-[2.5]" />
              <div className="text-left">
                <div className="leading-tight">NATIVE APK / EXE</div>
                <div className="text-[9px] text-[#222]">danielzoldyck.com</div>
              </div>
            </button>

            <button
              id="btn-home-donation-banner"
              onClick={onOpenDonationModal}
              className="px-3.5 py-2 bg-[#FFE600] border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] text-xs font-black uppercase text-[#121212] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-4 h-4 stroke-[2.5]" />
              <span>DONASI QRIS</span>
            </button>
          </div>
        </div>

        {/* 2. NEUBRUTALIST METRICS STATUS MATRIX */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div
            onClick={onOpenProxyModal}
            className="p-3 bg-[#FFFFFF] border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] hover:translate-x-[-1px] hover:translate-y-[-1px] cursor-pointer transition-all flex flex-col justify-between gap-1.5"
          >
            <div className="text-[#666] flex items-center justify-between text-[11px] font-bold">
              <span>NODE PROXY</span>
              <span className="px-1 bg-[#121212] text-white text-[10px] font-black">{activeProxy.flag}</span>
            </div>
            <div className="font-black text-[#121212] truncate text-sm uppercase">{activeProxy.country}</div>
            <div className="text-[10px] text-[#121212] font-black flex items-center gap-1">
              <span className="w-2 h-2 bg-[#54F28D] border border-[#121212]" />
              {activeProxy.ipMask} [{activeProxy.latencyMs}MS]
            </div>
          </div>

          <div
            onClick={onOpenUaModal}
            className="p-3 bg-[#FFFFFF] border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] hover:translate-x-[-1px] hover:translate-y-[-1px] cursor-pointer transition-all flex flex-col justify-between gap-1.5"
          >
            <div className="text-[#666] flex items-center justify-between text-[11px] font-bold">
              <span>USER-AGENT</span>
              <Cpu className="w-3.5 h-3.5 text-[#121212]" />
            </div>
            <div className="font-black text-[#121212] truncate text-sm uppercase">{activeUa.name}</div>
            <div className="text-[10px] text-[#555] font-bold truncate">{activeUa.platform}</div>
          </div>

          <div className="p-3 bg-[#FFFFFF] border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] flex flex-col justify-between gap-1.5">
            <div className="text-[#666] flex items-center justify-between text-[11px] font-bold">
              <span>ENKRIPSI DATA</span>
              <Lock className="w-3.5 h-3.5 text-[#121212]" />
            </div>
            <div className="font-black text-[#121212] text-sm uppercase">{activeProxy.encryption}</div>
            <div className="text-[10px] text-[#121212] font-bold">ZERO-LOG ISOLATION</div>
          </div>

          <div className="p-3 bg-[#FFFFFF] border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] flex flex-col justify-between gap-1.5">
            <div className="text-[#666] flex items-center justify-between text-[11px] font-bold">
              <span>SISTEM DAYA</span>
              <Zap className="w-3.5 h-3.5 text-[#121212]" />
            </div>
            <div className="font-black text-[#121212] text-sm uppercase">{batteryEcoMode ? "ECO MODE [ON]" : "STANDARD [MAX]"}</div>
            <div className="text-[10px] text-[#555] font-bold">SANDBOX ACTIVE</div>
          </div>
        </div>

        {/* 3. CENTRAL SEARCH ENGINE BOX */}
        <div className="p-5 sm:p-6 bg-[#FFFFFF] border-3 border-[#121212] shadow-[5px_5px_0px_0px_#121212] space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
            <span className="font-black uppercase tracking-tight text-[#121212]">
              PILIH MESIN PENCARI PRIVAT:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: "duckduckgo", label: "DUCKDUCKGO", bg: "bg-[#FFE600]" },
                { id: "searxng", label: "SEARXNG", bg: "bg-[#70D6FF]" },
                { id: "wikipedia", label: "WIKIPEDIA", bg: "bg-[#54F28D]" },
                { id: "startpage", label: "STARTPAGE", bg: "bg-[#FF9F1C]" }
              ].map((engine) => (
                <button
                  key={engine.id}
                  onClick={() => setSearchEngine(engine.id as any)}
                  className={`px-3 py-1 text-[11px] font-black uppercase border-2 border-[#121212] transition-all cursor-pointer ${
                    searchEngine === engine.id
                      ? `${engine.bg} text-[#121212] shadow-[2px_2px_0px_0px_#121212]`
                      : "bg-[#F4F0EA] text-[#666] hover:text-[#121212]"
                  }`}
                >
                  {engine.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSearch} className="relative flex items-center">
            <div className="w-full relative flex items-center">
              <Search className="w-5 h-5 text-[#121212] absolute left-3.5 pointer-events-none stroke-[2.5]" />
              <input
                id="home-search-input"
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="MASUKKAN URL ATAU CARI DI WEB SECARA ANONIM..."
                className="w-full bg-[#FAF8F5] text-[#121212] text-xs sm:text-sm pl-11 pr-28 py-3.5 border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] focus:shadow-[4px_4px_0px_0px_#FFE600] focus:outline-none font-bold uppercase placeholder-[#888] transition-all"
              />
              <button
                id="btn-home-search-submit"
                type="submit"
                className="absolute right-2 px-4 py-2 bg-[#FFE600] text-[#121212] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none text-xs font-black uppercase transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>BUKA</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
          </form>
        </div>

        {/* 4. PRIVACY BOOKMARKS GRID */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs border-b-2 border-[#121212] pb-1">
            <span className="font-black uppercase tracking-tight text-[#121212]">
              DIREKTORI PINTASAN TERVERIFIKASI
            </span>
            <span className="font-bold text-[#666]">8 NODE AKTIF</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {privacyBookmarks.map((bm) => {
              const IconComp = bm.icon;
              return (
                <div
                  key={bm.title}
                  id={`bookmark-card-${bm.title.toLowerCase().replace(/\s+/g, "-")}`}
                  onClick={() => onNavigate(bm.url)}
                  className="p-3.5 bg-[#FFFFFF] border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_#121212] transition-all cursor-pointer group flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start justify-between">
                    <div className={`w-8 h-8 ${bm.bg} border-2 border-[#121212] flex items-center justify-center text-[#121212]`}>
                      <IconComp className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <span className="text-[9px] font-black px-1.5 py-0.5 bg-[#121212] text-white uppercase">
                      {bm.tag}
                    </span>
                  </div>
                  <div>
                    <div className="font-black text-[#121212] text-xs uppercase group-hover:underline">
                      {bm.title}
                    </div>
                    <div className="text-[10px] text-[#666] font-bold truncate mt-0.5">{bm.category}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. PHISHING DETECTION TEST LAB */}
        <div className="p-4 bg-[#FFFFFF] border-2 border-[#121212] shadow-[3px_3px_0px_0px_#FF5A36] space-y-3">
          <div className="flex items-center gap-2 text-[#FF5A36] text-xs font-black uppercase">
            <AlertTriangle className="w-4 h-4 stroke-[3] shrink-0" />
            <span>LABORATORIUM UJI PERISAI PHISHING (SIMULASI ANCAMAN SIBER)</span>
          </div>
          <p className="text-[11px] text-[#444] font-bold leading-relaxed">
            Klik salah satu simulasi URL di bawah untuk menguji respon perisai Aegis dalam memblokir ancaman typosquatting dan punycode:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {phishingTestDemos.map((demo, idx) => (
              <button
                key={idx}
                id={`btn-demo-phishing-${idx}`}
                onClick={() => onNavigate(demo.url)}
                className="px-3 py-1.5 bg-[#F4F0EA] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] hover:bg-[#FF5A36] hover:text-white text-xs font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span className="w-2 h-2 bg-[#FF5A36] border border-[#121212]" />
                <span>{demo.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 6. BRUTALIST FOOTER */}
      <footer className="pt-8 pb-4 text-center text-xs text-[#555] space-y-1 font-mono border-t-2 border-[#121212] mt-8 font-bold">
        <div>AEGIS STEALTH SANDBOX • ZERO-LOG PRIVACY • E2E LOCAL CRYPTOGRAPHY</div>
        <div className="text-[10px] text-[#888]">
          HOST: danielzoldyck.com | NATIVE RUNTIME: ANDROID & DESKTOP
        </div>
      </footer>
    </div>
  );
};
