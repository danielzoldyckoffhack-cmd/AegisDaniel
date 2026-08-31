import React, { useState } from "react";
import {
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  Terminal,
  Cpu,
  Tv,
  EyeOff,
  Check,
  Plus,
  X,
  Copy,
  Info,
  Search,
  Layers
} from "lucide-react";
import { UserAgentProfile } from "../types";
import { USER_AGENT_PRESETS } from "../data/userAgents";

interface UserAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeUa: UserAgentProfile;
  onSelectUa: (ua: UserAgentProfile) => void;
  onAddCustomUa: (ua: UserAgentProfile) => void;
  customUas: UserAgentProfile[];
}

export const UserAgentModal: React.FC<UserAgentModalProps> = ({
  isOpen,
  onClose,
  activeUa,
  onSelectUa,
  onAddCustomUa,
  customUas
}) => {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Custom UA form state
  const [customName, setCustomName] = useState("");
  const [customPlatform, setCustomPlatform] = useState("Custom OS");
  const [customUaString, setCustomUaString] = useState("");
  const [customDesc, setCustomDesc] = useState("Kustom profil user-agent buatan pengguna.");

  if (!isOpen) return null;

  const allUas = [...USER_AGENT_PRESETS, ...customUas];
  const categories = ["All", "iOS", "Android", "Linux", "Windows", "macOS", "Specialized", "Custom"];

  const filteredUas = allUas.filter((ua) => {
    const matchCategory = activeCategory === "All" || ua.category === activeCategory;
    const matchSearch =
      ua.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ua.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ua.uaString.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case "mobile":
        return <Smartphone className="w-4 h-4 stroke-[2.5]" />;
      case "tablet":
        return <Tablet className="w-4 h-4 stroke-[2.5]" />;
      case "desktop":
        return <Laptop className="w-4 h-4 stroke-[2.5]" />;
      case "tv":
        return <Tv className="w-4 h-4 stroke-[2.5]" />;
      default:
        return <Terminal className="w-4 h-4 stroke-[2.5]" />;
    }
  };

  const handleCopyUa = (e: React.MouseEvent, id: string, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveCustomUa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customUaString.trim()) return;

    const newUa: UserAgentProfile = {
      id: `custom-ua-${Date.now()}`,
      name: customName.trim(),
      category: "Custom",
      uaString: customUaString.trim(),
      platform: customPlatform.trim(),
      iconName: "Terminal",
      description: customDesc.trim(),
      deviceType: "desktop"
    };

    onAddCustomUa(newUa);
    onSelectUa(newUa);
    setIsCreatingCustom(false);
    setCustomName("");
    setCustomUaString("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 font-mono">
      <div className="w-full max-w-4xl max-h-[90vh] bg-[#FAF8F5] border-3 border-[#121212] shadow-[8px_8px_0px_0px_#121212] flex flex-col overflow-hidden text-[#121212]">
        {/* Modal Header */}
        <div className="p-4 bg-[#FFE600] border-b-3 border-[#121212] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#121212] text-white flex items-center justify-center">
              <Layers className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase text-[#121212] tracking-tight">
                MATRIKS PENYAMARAN USER-AGENT
              </h2>
              <p className="text-[11px] text-[#333] font-bold">
                Ubah sidik jari peramban & bypass blokir perangkat tanpa batas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreatingCustom(!isCreatingCustom)}
              className="px-3 py-1.5 bg-[#FFFFFF] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] hover:translate-x-[-1px] hover:translate-y-[-1px] text-xs font-black uppercase flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>{isCreatingCustom ? "DAFTAR PRESET" : "TAMBAH KUSTOM"}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 bg-[#FFFFFF] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] hover:bg-[#FF5A36] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* Custom Form or Search/Filter Bar */}
        {isCreatingCustom ? (
          <form onSubmit={handleSaveCustomUa} className="p-6 bg-[#FFFFFF] border-b-2 border-[#121212] space-y-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase text-[#121212]">
              <Terminal className="w-4 h-4 stroke-[2.5]" />
              <span>INPUT USER-AGENT KUSTOM BARU</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black uppercase text-[#444] block mb-1">
                  NAMA IDENTITAS
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Custom PS5 WebKit Browser"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] text-xs font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-[#444] block mb-1">
                  PLATFORM / OS
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: PlayStation 5 / FreeBSD"
                  value={customPlatform}
                  onChange={(e) => setCustomPlatform(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] text-xs font-bold focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-[#444] block mb-1">
                RAW USER-AGENT HEADER STRING
              </label>
              <textarea
                required
                rows={2}
                placeholder="Mozilla/5.0 (PlayStation 5; FreeBSD) AppleWebKit/537.36..."
                value={customUaString}
                onChange={(e) => setCustomUaString(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F5] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] text-xs font-bold font-mono focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreatingCustom(false)}
                className="px-4 py-1.5 bg-[#FFFFFF] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] text-xs font-black uppercase cursor-pointer"
              >
                BATAL
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#FFE600] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] text-xs font-black uppercase hover:bg-[#54F28D] transition-colors cursor-pointer"
              >
                SIMPAN & AKTIFKAN
              </button>
            </div>
          </form>
        ) : (
          <div className="p-4 bg-[#EFECE6] border-b-2 border-[#121212] space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#121212] absolute left-3 top-1/2 -translate-y-1/2 stroke-[2.5]" />
              <input
                type="text"
                placeholder="CARI PROFIL USER-AGENT ATAU OS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#FFFFFF] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] text-xs font-bold uppercase focus:outline-none"
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 text-[11px] font-black uppercase border-2 border-[#121212] transition-all cursor-pointer ${
                    activeCategory === cat
                      ? "bg-[#121212] text-white shadow-[2px_2px_0px_0px_#FFE600]"
                      : "bg-[#FFFFFF] text-[#121212] hover:bg-[#FFE600]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* User-Agent Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredUas.length === 0 ? (
            <div className="p-8 text-center bg-[#FFFFFF] border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212]">
              <p className="text-xs font-black uppercase">TIDAK ADA USER-AGENT YANG COCOK</p>
            </div>
          ) : (
            filteredUas.map((ua) => {
              const isCurrent = ua.id === activeUa.id;
              return (
                <div
                  key={ua.id}
                  onClick={() => {
                    onSelectUa(ua);
                    onClose();
                  }}
                  className={`p-3.5 border-2 border-[#121212] transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isCurrent
                      ? "bg-[#FFE600] shadow-[4px_4px_0px_0px_#121212]"
                      : "bg-[#FFFFFF] shadow-[3px_3px_0px_0px_#121212] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_#121212]"
                  }`}
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="p-1 bg-[#121212] text-white">
                        {getDeviceIcon(ua.deviceType)}
                      </div>
                      <span className="font-black text-xs uppercase text-[#121212]">
                        {ua.name}
                      </span>
                      <span className="px-1.5 py-0.5 bg-[#EFECE6] border border-[#121212] text-[9px] font-black uppercase">
                        {ua.category}
                      </span>
                      <span className="text-[10px] text-[#444] font-bold">
                        [{ua.platform}]
                      </span>
                    </div>

                    <p className="text-[11px] text-[#444] font-medium leading-tight">
                      {ua.description}
                    </p>

                    <div className="text-[10px] text-[#555] font-mono truncate max-w-2xl bg-[#F4F0EA] p-1 border border-[#121212]/30 mt-1">
                      {ua.uaString}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={(e) => handleCopyUa(e, ua.id, ua.uaString)}
                      className="p-1.5 bg-[#FFFFFF] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] hover:bg-[#70D6FF] transition-colors cursor-pointer"
                      title="Salin UA String"
                    >
                      {copiedId === ua.id ? (
                        <Check className="w-3.5 h-3.5 stroke-[3] text-[#121212]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 stroke-[2.5]" />
                      )}
                    </button>

                    {isCurrent ? (
                      <span className="px-3 py-1 bg-[#121212] text-white text-[10px] font-black uppercase">
                        AKTIF
                      </span>
                    ) : (
                      <button className="px-3 py-1 bg-[#54F28D] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] text-[10px] font-black uppercase hover:translate-x-[-1px] hover:translate-y-[-1px] cursor-pointer">
                        GUNAKAN
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
