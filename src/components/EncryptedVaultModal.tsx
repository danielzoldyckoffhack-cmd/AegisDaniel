import React, { useState } from "react";
import {
  Lock,
  Unlock,
  Key,
  Plus,
  Trash2,
  Bookmark,
  FileText,
  Eye,
  EyeOff,
  ShieldCheck,
  X,
  Copy,
  Check,
  AlertCircle
} from "lucide-react";
import { VaultItem } from "../types";
import { encryptData, decryptData } from "../utils/crypto";

interface EncryptedVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaultItems: VaultItem[];
  onSaveItem: (item: VaultItem) => void;
  onDeleteItem: (id: string) => void;
}

export const EncryptedVaultModal: React.FC<EncryptedVaultModalProps> = ({
  isOpen,
  onClose,
  vaultItems,
  onSaveItem,
  onDeleteItem
}) => {
  const [passphrase, setPassphrase] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [decryptedCache, setDecryptedCache] = useState<Record<string, string>>({});

  // Add Item State
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<"note" | "bookmark" | "credential">("note");
  const [newContent, setNewContent] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphrase.trim()) {
      setErrorMessage("SILAKAN MASUKKAN KATA SANDI BRANKAS.");
      return;
    }

    try {
      if (vaultItems.length > 0) {
        const first = vaultItems[0];
        const parts = first.encryptedPayload.split(":::");
        if (parts.length === 2) {
          await decryptData(parts[0], first.iv, parts[1], passphrase);
        }
      }
      setIsUnlocked(true);
      setErrorMessage("");
    } catch {
      setErrorMessage("KATA SANDI SALAH ATAU KUNCI ENKRIPSI TIDAK SESUAI.");
    }
  };

  const handleCreateEncryptedItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || !passphrase.trim()) return;

    try {
      const encrypted = await encryptData(newContent.trim(), passphrase);
      const payloadString = `${encrypted.ciphertext}:::${encrypted.salt}`;

      const newItem: VaultItem = {
        id: `vault-item-${Date.now()}`,
        title: newTitle.trim(),
        type: newType,
        encryptedPayload: payloadString,
        iv: encrypted.iv,
        createdAt: Date.now()
      };

      onSaveItem(newItem);
      setDecryptedCache((prev) => ({ ...prev, [newItem.id]: newContent.trim() }));
      setIsAdding(false);
      setNewTitle("");
      setNewContent("");
    } catch (err) {
      console.error(err);
      setErrorMessage("GAGAL MENGENKRIPSI DATA.");
    }
  };

  const handleDecryptItem = async (item: VaultItem) => {
    if (decryptedCache[item.id]) {
      const updated = { ...decryptedCache };
      delete updated[item.id];
      setDecryptedCache(updated);
      return;
    }

    try {
      const parts = item.encryptedPayload.split(":::");
      if (parts.length === 2) {
        const decrypted = await decryptData(parts[0], item.iv, parts[1], passphrase);
        setDecryptedCache((prev) => ({ ...prev, [item.id]: decrypted }));
      }
    } catch {
      setErrorMessage("GAGAL MENDEKRIPSI ITEM INI.");
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 font-mono select-none">
      <div className="w-full max-w-2xl max-h-[90vh] bg-[#FAF8F5] border-3 border-[#121212] shadow-[8px_8px_0px_0px_#121212] flex flex-col overflow-hidden text-[#121212]">
        {/* HEADER */}
        <div className="p-4 bg-[#D4A5FF] border-b-3 border-[#121212] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#121212] text-white flex items-center justify-center">
              <Lock className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase text-[#121212] tracking-tight">
                BRANKAS ENKRIPSI E2E (AES-256)
              </h2>
              <p className="text-[11px] text-[#222] font-bold">
                Zero-Knowledge Storage murni lokal pada memori terisolasi
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
        <div className="p-6 overflow-y-auto flex-1">
          {!isUnlocked ? (
            /* UNLOCK SCREEN */
            <form onSubmit={handleUnlock} className="max-w-md mx-auto py-6 space-y-4 text-center">
              <div className="w-14 h-14 bg-[#FFE600] border-2 border-[#121212] shadow-[4px_4px_0px_0px_#121212] flex items-center justify-center mx-auto text-[#121212]">
                <Key className="w-7 h-7 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-black text-base uppercase text-[#121212]">
                  BUKA KUNCI BRANKAS RAHASIA
                </h3>
                <p className="text-xs text-[#555] font-bold mt-1">
                  Masukkan passphrase master untuk mendekripsi catatan, bookmark rahasia, dan kredensial Anda.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 bg-[#FF5A36] border-2 border-[#121212] text-white text-xs font-black uppercase flex items-center gap-2 text-left">
                  <AlertCircle className="w-4 h-4 shrink-0 stroke-[3]" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <input
                id="vault-passphrase-input"
                type="password"
                required
                value={passphrase}
                onChange={(e) => {
                  setPassphrase(e.target.value);
                  setErrorMessage("");
                }}
                placeholder="KETIK PASSPHRASE MASTER..."
                className="w-full bg-[#FFFFFF] border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] px-4 py-3 text-xs text-[#121212] font-black focus:outline-none text-center uppercase"
              />

              <button
                id="btn-unlock-vault"
                type="submit"
                className="w-full py-3 bg-[#FFE600] hover:bg-[#54F28D] text-[#121212] font-black uppercase border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] hover:translate-x-[-1px] hover:translate-y-[-1px] text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Unlock className="w-4 h-4 stroke-[3]" />
                <span>BUKA BRANKAS</span>
              </button>

              <div className="text-[10px] text-[#777] font-bold leading-relaxed">
                * KATA SANDI PERTAMA KALI AKAN MENJADI KUNCI MASTER UTAMA.
              </div>
            </form>
          ) : (
            /* UNLOCKED VAULT MANAGER */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-black uppercase text-[#121212]">
                  <ShieldCheck className="w-4 h-4 text-[#121212] stroke-[2.5]" />
                  <span>BRANKAS TERBUKA [{vaultItems.length} ITEM]</span>
                </div>
                <button
                  onClick={() => setIsAdding(!isAdding)}
                  className="px-3 py-1.5 bg-[#FFE600] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] text-[#121212] font-black text-xs uppercase flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>TAMBAH SECRET</span>
                </button>
              </div>

              {/* ADD ITEM DRAWER */}
              {isAdding && (
                <form onSubmit={handleCreateEncryptedItem} className="p-4 bg-[#FFFFFF] border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] space-y-3">
                  <div className="flex items-center justify-between text-xs font-black uppercase text-[#121212]">
                    <span>ENKRIPSI ITEM BARU (AES-256-GCM)</span>
                    <button type="button" onClick={() => setIsAdding(false)} className="text-[#666] hover:text-[#121212]">
                      <X className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] font-black uppercase text-[#444] block mb-1">JUDUL RAHASIA:</label>
                      <input
                        type="text"
                        required
                        placeholder="Misal: Token API / Catatan"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full bg-[#FAF8F5] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] px-2.5 py-1.5 text-xs font-bold text-[#121212] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-[#444] block mb-1">KATEGORI:</label>
                      <select
                        value={newType}
                        onChange={(e) => setNewType(e.target.value as any)}
                        className="w-full bg-[#FAF8F5] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] px-2.5 py-1.5 text-xs font-bold text-[#121212] focus:outline-none"
                      >
                        <option value="note">CATATAN TERENKRIPSI</option>
                        <option value="bookmark">BOOKMARK RAHASIA</option>
                        <option value="credential">KREDENSIAL / TOKEN</option>
                      </select>
                    </div>
                  </div>

                  <div className="text-xs">
                    <label className="text-[10px] font-black uppercase text-[#444] block mb-1">KONTEN PLAINTEXT:</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Ketik data rahasia yang akan dienkripsi..."
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      className="w-full bg-[#FAF8F5] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] px-2.5 py-1.5 text-xs font-bold text-[#121212] focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="px-3 py-1.5 bg-[#FFFFFF] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] font-black uppercase cursor-pointer"
                    >
                      BATAL
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#54F28D] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] text-[#121212] font-black uppercase hover:bg-[#FFE600] cursor-pointer"
                    >
                      ENKRIPSI & SIMPAN
                    </button>
                  </div>
                </form>
              )}

              {/* VAULT ITEMS LIST */}
              {vaultItems.length === 0 ? (
                <div className="text-center py-8 bg-[#FFFFFF] border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] text-xs font-black uppercase space-y-1">
                  <p>BRANKAS MASIH KOSONG.</p>
                  <p className="text-[10px] text-[#666]">
                    KLIK TOMBOL DI ATAS UNTUK MENAMBAH CATATAN ATAU TOKEN RAHASIA.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {vaultItems.map((item) => {
                    const isDecrypted = Boolean(decryptedCache[item.id]);
                    return (
                      <div
                        key={item.id}
                        className="p-3.5 bg-[#FFFFFF] border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            {item.type === "bookmark" ? (
                              <Bookmark className="w-4 h-4 text-[#121212] stroke-[2.5]" />
                            ) : (
                              <FileText className="w-4 h-4 text-[#121212] stroke-[2.5]" />
                            )}
                            <span className="font-black uppercase text-[#121212]">{item.title}</span>
                            <span className="text-[9px] px-1.5 py-0.5 bg-[#EFECE6] border border-[#121212] font-black uppercase text-[#121212]">
                              {item.type}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleDecryptItem(item)}
                              className="p-1.5 bg-[#FAF8F5] border-2 border-[#121212] shadow-[1px_1px_0px_0px_#121212] hover:bg-[#FFE600] transition-colors cursor-pointer"
                              title={isDecrypted ? "Sembunyikan" : "Deksripsi & Lihat"}
                            >
                              {isDecrypted ? <EyeOff className="w-3.5 h-3.5 stroke-[2.5]" /> : <Eye className="w-3.5 h-3.5 stroke-[2.5]" />}
                            </button>
                            <button
                              onClick={() => onDeleteItem(item.id)}
                              className="p-1.5 bg-[#FAF8F5] border-2 border-[#121212] shadow-[1px_1px_0px_0px_#121212] hover:bg-[#FF5A36] hover:text-white transition-colors cursor-pointer"
                              title="Hapus Item"
                            >
                              <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                          </div>
                        </div>

                        {/* CONTENT AREA */}
                        {isDecrypted ? (
                          <div className="p-2.5 bg-[#FFE600] border-2 border-[#121212] text-xs text-[#121212] font-black flex items-start justify-between gap-2 break-all">
                            <span>{decryptedCache[item.id]}</span>
                            <button
                              onClick={() => handleCopyText(item.id, decryptedCache[item.id])}
                              className="p-1 bg-[#121212] text-white shrink-0 cursor-pointer"
                            >
                              {copiedId === item.id ? (
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              ) : (
                                <Copy className="w-3.5 h-3.5 stroke-[2.5]" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <div className="text-[10px] text-[#666] font-bold truncate">
                            ENCRYPTED HASH: {item.encryptedPayload.slice(0, 36)}...
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
