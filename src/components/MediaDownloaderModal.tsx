import React, { useState } from "react";
import {
  Download,
  Video,
  Music,
  Lock,
  Check,
  RotateCw,
  X,
  ExternalLink,
  Film,
  FileCheck,
  Shield,
  Layers,
  Sparkles
} from "lucide-react";
import { MediaItem, DownloadTask } from "../types";

interface MediaDownloaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaList: MediaItem[];
  currentUrl: string;
  downloads: DownloadTask[];
  onStartDownload: (item: MediaItem, saveToVault: boolean) => void;
  onOpenVault: () => void;
}

export const MediaDownloaderModal: React.FC<MediaDownloaderModalProps> = ({
  isOpen,
  onClose,
  mediaList,
  currentUrl,
  downloads,
  onStartDownload,
  onOpenVault
}) => {
  const [activeTab, setActiveTab] = useState<"detected" | "downloads">("detected");
  const [extractUrl, setExtractUrl] = useState("");
  const [isExtractingCustom, setIsExtractingCustom] = useState(false);
  const [customExtracted, setCustomExtracted] = useState<MediaItem[]>([]);

  if (!isOpen) return null;

  const handleCustomExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extractUrl.trim()) return;

    setIsExtractingCustom(true);
    try {
      const res = await fetch("/api/extract-media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: extractUrl })
      });
      const data = await res.json();
      if (data.media) {
        setCustomExtracted(data.media);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsExtractingCustom(false);
    }
  };

  const displayedMedia = [...mediaList, ...customExtracted];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 font-mono select-none">
      <div className="w-full max-w-3xl max-h-[90vh] bg-[#FAF8F5] border-3 border-[#121212] shadow-[8px_8px_0px_0px_#121212] flex flex-col overflow-hidden text-[#121212]">
        {/* MODAL HEADER */}
        <div className="p-4 bg-[#FFE600] border-b-3 border-[#121212] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#121212] text-white flex items-center justify-center">
              <Download className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase text-[#121212] tracking-tight">
                INSPEKTOR & PENGUNDUH MEDIA
              </h2>
              <p className="text-[11px] text-[#333] font-bold">
                Ekstraksi aliran video/audio sandbox dengan opsi enkripsi langsung
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

        {/* TABS SELECTOR */}
        <div className="flex items-center border-b-2 border-[#121212] bg-[#EFECE6] p-2 gap-2">
          <button
            onClick={() => setActiveTab("detected")}
            className={`px-3 py-1.5 text-xs font-black uppercase border-2 border-[#121212] transition-all cursor-pointer ${
              activeTab === "detected"
                ? "bg-[#121212] text-white shadow-[2px_2px_0px_0px_#FFE600]"
                : "bg-[#FFFFFF] text-[#121212] hover:bg-[#FFE600]"
            }`}
          >
            ALIRAN TERDETEKSI ({displayedMedia.length})
          </button>
          <button
            onClick={() => setActiveTab("downloads")}
            className={`px-3 py-1.5 text-xs font-black uppercase border-2 border-[#121212] transition-all cursor-pointer ${
              activeTab === "downloads"
                ? "bg-[#121212] text-white shadow-[2px_2px_0px_0px_#FFE600]"
                : "bg-[#FFFFFF] text-[#121212] hover:bg-[#FFE600]"
            }`}
          >
            RIWAYAT UNDUHAN ({downloads.length})
          </button>
        </div>

        {/* BODY CONTENT */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {/* CUSTOM EXTRACTOR INPUT */}
          <form onSubmit={handleCustomExtract} className="p-3 bg-[#FFFFFF] border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] space-y-2">
            <label className="text-[10px] font-black uppercase text-[#444] block">
              EKSTRAKSI MANUAL DARI URL VIDEO / AUDIO EXTERNAL:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={extractUrl}
                onChange={(e) => setExtractUrl(e.target.value)}
                placeholder="https://contoh.com/video.mp4 atau link streaming..."
                className="flex-1 px-3 py-1.5 bg-[#FAF8F5] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] text-xs font-bold focus:outline-none"
              />
              <button
                type="submit"
                disabled={isExtractingCustom}
                className="px-4 py-1.5 bg-[#70D6FF] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] text-xs font-black uppercase hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
              >
                {isExtractingCustom ? "SCANNING..." : "EKSTRAK"}
              </button>
            </div>
          </form>

          {activeTab === "detected" ? (
            displayedMedia.length === 0 ? (
              <div className="text-center py-10 bg-[#FFFFFF] border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] space-y-2">
                <Film className="w-8 h-8 mx-auto text-[#666] stroke-[2]" />
                <h3 className="font-black text-xs uppercase text-[#121212]">
                  TIDAK ADA ALIRAN MEDIA TERDETEKSI DI HALAMAN INI
                </h3>
                <p className="text-[10px] text-[#666] font-bold max-w-sm mx-auto">
                  Buka situs seperti Invidious, YouTube, atau masukkan URL stream langsung pada kolom ekstraksi di atas.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {displayedMedia.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#FFFFFF] border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-[#121212] text-white">
                          {item.type === "audio" ? (
                            <Music className="w-3.5 h-3.5 stroke-[2.5]" />
                          ) : (
                            <Video className="w-3.5 h-3.5 stroke-[2.5]" />
                          )}
                        </div>
                        <span className="font-black text-xs uppercase text-[#121212] truncate">
                          {item.title || "Aliran Media Web"}
                        </span>
                        {item.quality && (
                          <span className="px-1.5 py-0.5 bg-[#FFE600] border border-[#121212] text-[9px] font-black uppercase">
                            {item.quality}
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 bg-[#EFECE6] border border-[#121212] text-[9px] font-black uppercase">
                          {item.format}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#555] font-bold truncate">
                        {item.url}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => onStartDownload(item, false)}
                        className="px-3 py-1.5 bg-[#54F28D] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] hover:translate-x-[-1px] hover:translate-y-[-1px] text-xs font-black uppercase flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 stroke-[3]" />
                        <span>UNDUH</span>
                      </button>

                      <button
                        onClick={() => onStartDownload(item, true)}
                        className="px-3 py-1.5 bg-[#D4A5FF] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] hover:translate-x-[-1px] hover:translate-y-[-1px] text-xs font-black uppercase flex items-center gap-1 cursor-pointer"
                        title="Simpan Langsung ke Brankas Terenkripsi"
                      >
                        <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>KE VAULT</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            downloads.length === 0 ? (
              <div className="text-center py-10 bg-[#FFFFFF] border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] space-y-1">
                <FileCheck className="w-8 h-8 mx-auto text-[#666] stroke-[2]" />
                <h3 className="font-black text-xs uppercase text-[#121212]">
                  BELUM ADA AKTIVITAS UNDUHAN
                </h3>
              </div>
            ) : (
              <div className="space-y-2.5">
                {downloads.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 bg-[#FFFFFF] border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black uppercase text-[#121212] truncate max-w-sm">
                        {task.filename}
                      </span>
                      <span className="text-[10px] font-black uppercase">
                        {task.status === "completed" ? (
                          <span className="px-1.5 py-0.5 bg-[#54F28D] border border-[#121212]">SELESAI</span>
                        ) : task.status === "downloading" ? (
                          <span className="px-1.5 py-0.5 bg-[#FFE600] border border-[#121212]">{task.progress}%</span>
                        ) : (
                          <span className="px-1.5 py-0.5 bg-[#FF5A36] text-white">GAGAL</span>
                        )}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-3 bg-[#EFECE6] border-2 border-[#121212] overflow-hidden">
                      <div
                        className="h-full bg-[#54F28D] transition-all"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[#666] font-bold">
                      <span>{task.speed}</span>
                      <span>{task.isEncrypted ? "[VAULT ENCRYPTED]" : "[STORAGE LOKAL]"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
