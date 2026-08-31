import React, { useEffect, useState } from "react";
import {
  HeartHandshake,
  QrCode,
  Check,
  Copy,
  X,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  ExternalLink
} from "lucide-react";
import { generateQrisPayload, renderQrisDataUrl } from "../utils/qris";

interface QrisDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  isQuotaTriggered?: boolean;
}

export const QrisDonationModal: React.FC<QrisDonationModalProps> = ({
  isOpen,
  onClose,
  isQuotaTriggered = false
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(10000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copiedPayload, setCopiedPayload] = useState<boolean>(false);
  const [copiedNmid, setCopiedNmid] = useState<boolean>(false);
  const [isThanked, setIsThanked] = useState<boolean>(false);

  const presetAmounts = [
    { label: "RP 5.000", value: 5000 },
    { label: "RP 10.000", value: 10000 },
    { label: "RP 25.000", value: 25000 },
    { label: "RP 50.000", value: 50000 }
  ];

  const currentAmount = customAmount ? parseInt(customAmount, 10) || 0 : selectedAmount;
  const nmid = "ID10200238000000303";
  const merchantName = "AEGIS STEALTH BROWSER";
  const merchantCity = "JAKARTA";

  useEffect(() => {
    if (!isOpen) return;

    const payload = generateQrisPayload({
      merchantName,
      merchantCity,
      nmid,
      amount: currentAmount
    });

    renderQrisDataUrl(payload)
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("QRIS render error:", err));
  }, [isOpen, currentAmount]);

  if (!isOpen) return null;

  const currentPayload = generateQrisPayload({
    merchantName,
    merchantCity,
    nmid,
    amount: currentAmount
  });

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(currentPayload);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const handleCopyNmid = () => {
    navigator.clipboard.writeText(nmid);
    setCopiedNmid(true);
    setTimeout(() => setCopiedNmid(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 font-mono select-none">
      <div className="w-full max-w-md bg-[#FAF8F5] border-3 border-[#121212] shadow-[8px_8px_0px_0px_#121212] overflow-hidden flex flex-col text-[#121212]">
        {/* MODAL HEADER */}
        <div className="p-4 bg-[#FF5A36] border-b-3 border-[#121212] flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#121212] text-white flex items-center justify-center">
              <Zap className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-tight">
                DUKUNGAN PENGEMBANG
              </h2>
              <div className="text-[10px] font-black uppercase text-white/90">
                {isQuotaTriggered ? "BATAS PENGGUNAAN SESI" : "QRIS SCAN RESMI NASIONAL"}
              </div>
            </div>
          </div>
          <button
            id="btn-close-qris-modal-header"
            onClick={onClose}
            className="p-1.5 bg-[#FFFFFF] text-[#121212] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] hover:bg-[#121212] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* USER'S EXACT REQUESTED PHRASE */}
          <div className="p-4 bg-[#FFE600] border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] text-center space-y-2">
            <p className="text-xs font-black uppercase text-[#121212] leading-relaxed">
              &ldquo;Yuk, dukung pengembangnya dengan berdonasi agar aplikasi ini bisa terus berkembang lebih baik lagi&rdquo;
            </p>
            <p className="text-[10px] text-[#444] font-bold">
              Donasi ini murni sukarela untuk biaya server relay proxy global & pemeliharaan enkripsi data.
            </p>
          </div>

          {/* QRIS DISPLAY */}
          <div className="p-4 bg-[#FFFFFF] border-2 border-[#121212] shadow-[4px_4px_0px_0px_#121212] flex flex-col items-center justify-center space-y-2">
            <div className="text-center">
              <div className="font-black text-xs uppercase text-[#121212]">
                QRIS PEMBAYARAN NASIONAL
              </div>
              <div className="text-[10px] text-[#555] font-mono font-bold">
                NMID: {nmid}
              </div>
            </div>

            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="QRIS Donasi Pengembang"
                className="w-48 h-48 object-contain border-2 border-[#121212] p-1 bg-white"
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-[#555] text-xs font-bold">
                MEMBUAT QRIS...
              </div>
            )}

            <div className="text-center">
              <div className="text-xs font-black uppercase text-[#121212]">{merchantName}</div>
              <div className="text-[10px] text-[#444] font-bold">
                NOMINAL: {currentAmount > 0 ? `Rp ${currentAmount.toLocaleString("id-ID")}` : "BEBAS (OPEN QRIS)"}
              </div>
            </div>
          </div>

          {/* NOMINAL SELECTION */}
          <div className="space-y-2">
            <div className="text-xs font-black uppercase text-[#121212]">
              PILIH NOMINAL DONASI:
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs font-mono">
              {presetAmounts.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => {
                    setSelectedAmount(p.value);
                    setCustomAmount("");
                  }}
                  className={`py-2 border-2 border-[#121212] font-black uppercase transition-all cursor-pointer ${
                    selectedAmount === p.value && !customAmount
                      ? "bg-[#54F28D] text-[#121212] shadow-[2px_2px_0px_0px_#121212]"
                      : "bg-[#FFFFFF] text-[#121212] hover:bg-[#FFE600]"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="pt-1">
              <input
                type="number"
                placeholder="ATAU KETIK NOMINAL KUSTOM (RP)..."
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(0);
                }}
                className="w-full px-3 py-2 bg-[#FFFFFF] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] text-xs font-bold text-[#121212] placeholder-[#888] focus:outline-none"
              />
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex gap-2 pt-1">
            <button
              id="btn-copy-raw-qris"
              type="button"
              onClick={handleCopyPayload}
              className="flex-1 py-2 bg-[#FFFFFF] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] hover:bg-[#70D6FF] text-xs font-black uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              {copiedPayload ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5 stroke-[2.5]" />}
              <span>{copiedPayload ? "TERSALIN!" : "SALIN STRING QRIS"}</span>
            </button>

            <button
              id="btn-confirm-already-donated"
              type="button"
              onClick={() => {
                setIsThanked(true);
                setTimeout(() => {
                  onClose();
                  setIsThanked(false);
                }, 1200);
              }}
              className="flex-1 py-2 bg-[#FFE600] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] hover:bg-[#54F28D] text-xs font-black uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>{isThanked ? "TERIMA KASIH!" : "SUDAH TRANSFER"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
