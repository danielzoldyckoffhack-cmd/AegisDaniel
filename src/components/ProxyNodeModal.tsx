import React, { useState } from "react";
import {
  Globe,
  ShieldCheck,
  Check,
  X,
  Zap,
  Activity,
  Lock,
  RotateCw,
  Search,
  Server,
  Radio
} from "lucide-react";
import { ProxyNode } from "../types";
import { PROXY_NODES } from "../data/proxyNodes";

interface ProxyNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProxy: ProxyNode;
  onSelectProxy: (node: ProxyNode) => void;
  onTestPings: () => void;
}

export const ProxyNodeModal: React.FC<ProxyNodeModalProps> = ({
  isOpen,
  onClose,
  activeProxy,
  onSelectProxy,
  onTestPings
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("All");
  const [isPinging, setIsPinging] = useState(false);

  if (!isOpen) return null;

  const nodeTypes = ["All", "Stealth HTTP/S", "Zero-Log Vault", "Military Double-Hop", "Tor Onion Bridge", "Direct Relay"];

  const filteredNodes = PROXY_NODES.filter((node) => {
    const matchType = filterType === "All" || node.type === filterType;
    const matchSearch =
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.encryption.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchSearch;
  });

  const handleRefreshPing = () => {
    setIsPinging(true);
    onTestPings();
    setTimeout(() => setIsPinging(false), 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 font-mono select-none">
      <div className="w-full max-w-3xl max-h-[90vh] bg-[#FAF8F5] border-3 border-[#121212] shadow-[8px_8px_0px_0px_#121212] flex flex-col overflow-hidden text-[#121212]">
        {/* MODAL HEADER */}
        <div className="p-4 bg-[#54F28D] border-b-3 border-[#121212] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#121212] text-white flex items-center justify-center">
              <Globe className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase text-[#121212] tracking-tight">
                RELAY PROXY & ENKRIPSI JARINGAN
              </h2>
              <p className="text-[11px] text-[#222] font-bold">
                10 Node relay global dengan insulasi Zero-Log & enkripsi ChaCha20/WireGuard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefreshPing}
              className="px-3 py-1.5 bg-[#FFFFFF] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] hover:translate-x-[-1px] hover:translate-y-[-1px] text-xs font-black uppercase flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCw className={`w-3.5 h-3.5 stroke-[3] ${isPinging ? "animate-spin" : ""}`} />
              <span>TEST LATENSI</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 bg-[#FFFFFF] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] hover:bg-[#FF5A36] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="p-4 bg-[#EFECE6] border-b-2 border-[#121212] space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#121212] absolute left-3 top-1/2 -translate-y-1/2 stroke-[2.5]" />
            <input
              type="text"
              placeholder="CARI NEGARA, KOTA, ATAU PROTOKOL ENKRIPSI..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#FFFFFF] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] text-xs font-bold uppercase focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {nodeTypes.map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 text-[11px] font-black uppercase border-2 border-[#121212] transition-all cursor-pointer ${
                  filterType === type
                    ? "bg-[#121212] text-white shadow-[2px_2px_0px_0px_#54F28D]"
                    : "bg-[#FFFFFF] text-[#121212] hover:bg-[#54F28D]"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* NODES LIST */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredNodes.length === 0 ? (
            <div className="p-8 text-center bg-[#FFFFFF] border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212]">
              <p className="text-xs font-black uppercase">TIDAK ADA NODE YANG COCOK</p>
            </div>
          ) : (
            filteredNodes.map((node) => {
              const isCurrent = node.id === activeProxy.id;
              return (
                <div
                  key={node.id}
                  onClick={() => {
                    onSelectProxy(node);
                    onClose();
                  }}
                  className={`p-3.5 border-2 border-[#121212] transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isCurrent
                      ? "bg-[#54F28D] shadow-[4px_4px_0px_0px_#121212]"
                      : "bg-[#FFFFFF] shadow-[3px_3px_0px_0px_#121212] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_#121212]"
                  }`}
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-1.5 py-0.5 bg-[#121212] text-white text-[11px] font-black uppercase">
                        [{node.flag}]
                      </span>
                      <span className="font-black text-xs uppercase text-[#121212]">
                        {node.name}
                      </span>
                      <span className="px-1.5 py-0.5 bg-[#EFECE6] border border-[#121212] text-[9px] font-black uppercase">
                        {node.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-[#444] font-bold flex-wrap">
                      <span>LOKASI: {node.city}, {node.country}</span>
                      <span>•</span>
                      <span>IP SAMARAN: {node.ipMask}</span>
                    </div>

                    <div className="text-[10px] text-[#555] font-bold">
                      ENKRIPSI: {node.encryption} | KAPASITAS: {node.speedMbps} MBPS
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <div className="text-right">
                      <div className="text-xs font-black text-[#121212]">
                        {node.latencyMs} MS
                      </div>
                      <div className="text-[9px] font-black uppercase text-[#444]">
                        {node.latencyMs < 50 ? "ULTRA FAST" : node.latencyMs < 120 ? "FAST" : "SECURE RELAY"}
                      </div>
                    </div>

                    {isCurrent ? (
                      <span className="px-3 py-1 bg-[#121212] text-white text-[10px] font-black uppercase">
                        TERHUBUNG
                      </span>
                    ) : (
                      <button className="px-3 py-1 bg-[#FFE600] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] text-[10px] font-black uppercase hover:translate-x-[-1px] hover:translate-y-[-1px] cursor-pointer">
                        HUBUNGKAN
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
