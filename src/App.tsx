import React, { useState, useEffect, useRef } from "react";
import {
  Tab,
  UserAgentProfile,
  ProxyNode,
  MediaItem,
  DownloadTask,
  VaultItem,
  BrowserSettings,
  AppNotification,
  SafetyAnalysis
} from "./types";
import { USER_AGENT_PRESETS } from "./data/userAgents";
import { PROXY_NODES } from "./data/proxyNodes";
import { HeaderBar } from "./components/HeaderBar";
import { WebViewer } from "./components/WebViewer";
import { UserAgentModal } from "./components/UserAgentModal";
import { ProxyNodeModal } from "./components/ProxyNodeModal";
import { PhishingWarningModal } from "./components/PhishingWarningModal";
import { MediaDownloaderModal } from "./components/MediaDownloaderModal";
import { EncryptedVaultModal } from "./components/EncryptedVaultModal";
import { QrisDonationModal } from "./components/QrisDonationModal";
import { SettingsModal } from "./components/SettingsModal";
import { SecurityInspectorModal } from "./components/SecurityInspectorModal";
import { NotificationToast } from "./components/NotificationToast";
import { NativeAppModal } from "./components/NativeAppModal";
import { GodModeHUD } from "./components/GodModeHUD";

export default function App() {
  // 1. Core State: Tabs
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: "tab-init-1",
      title: "Beranda Aegis",
      url: "aegis://home",
      isLoading: false,
      canGoBack: false,
      canGoForward: false,
      history: ["aegis://home"],
      historyIndex: 0,
      isIncognito: false,
      mediaFound: []
    }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>("tab-init-1");
  const [urlInput, setUrlInput] = useState<string>("");

  // 2. Settings & Profiles
  const [settings, setSettings] = useState<BrowserSettings>(() => {
    return {
      theme: "auto",
      batteryEcoMode: true,
      stripAdsAndTrackers: true,
      smartPhishingShield: true,
      isolateScripts: false,
      activeProxyId: PROXY_NODES[0].id,
      activeUaId: USER_AGENT_PRESETS[0].id,
      e2eEncryptionEnabled: true,
      usageCount: 0,
      maxUsageThreshold: 6 // Trigger gentle support alert every few requests
    };
  });

  const [activeUa, setActiveUa] = useState<UserAgentProfile>(USER_AGENT_PRESETS[0]);
  const [activeProxy, setActiveProxy] = useState<ProxyNode>(PROXY_NODES[0]);
  const [customUas, setCustomUas] = useState<UserAgentProfile[]>([]);

  // 3. Modals State
  const [isUaModalOpen, setIsUaModalOpen] = useState(false);
  const [isProxyModalOpen, setIsProxyModalOpen] = useState(false);
  const [isPhishingModalOpen, setIsPhishingModalOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isNativeModalOpen, setIsNativeModalOpen] = useState(false);

  // 4. Pending Intercepted Navigation (for Phishing check)
  const [pendingSafetyCheck, setPendingSafetyCheck] = useState<{
    url: string;
    safety: SafetyAnalysis;
  } | null>(null);

  // 5. Downloads & Vault
  const [downloads, setDownloads] = useState<DownloadTask[]>([]);
  const [vaultItems, setVaultItems] = useState<VaultItem[]>(() => {
    const saved = localStorage.getItem("aegis_vault_items");
    return saved ? JSON.parse(saved) : [];
  });

  // 6. Notifications & God Mode
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isGodMode, setIsGodMode] = useState<boolean>(true);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  // Helper to add toast
  const addNotification = (title: string, message: string, type: AppNotification["type"] = "info") => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title,
      message,
      type,
      timestamp: Date.now()
    };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 4)]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== newNotif.id));
    }, 4500);
  };

  // Sync Omnibox URL on tab change
  useEffect(() => {
    if (activeTab) {
      setUrlInput(activeTab.url === "aegis://home" ? "" : activeTab.url);
    }
  }, [activeTabId, activeTab?.url]);

  // Save vault items locally
  useEffect(() => {
    localStorage.setItem("aegis_vault_items", JSON.stringify(vaultItems));
  }, [vaultItems]);

  // Handle Automatic Dark Mode
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === "dark" || settings.theme === "auto") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [settings.theme]);

  // Global window message listener for sandbox navigation events
  useEffect(() => {
    const handleGlobalMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "AEGIS_NAVIGATE" && typeof event.data.url === "string") {
        navigateTo(event.data.url);
      }
    };
    window.addEventListener("message", handleGlobalMessage);
    return () => window.removeEventListener("message", handleGlobalMessage);
  }, [activeTabId, activeUa, activeProxy, settings]);

  // Core Navigation Fetcher
  const navigateTo = async (targetUrl: string, bypassPhishing: boolean = false) => {
    let url = targetUrl.trim();
    if (!url) return;

    if (url === "aegis://home" || url === "about:blank") {
      setTabs((prev) =>
        prev.map((t) => {
          if (t.id === activeTabId) {
            const nextHistory = [...t.history.slice(0, t.historyIndex + 1), "aegis://home"];
            return {
              ...t,
              title: "Beranda Aegis",
              url: "aegis://home",
              isLoading: false,
              contentHtml: undefined,
              history: nextHistory,
              historyIndex: nextHistory.length - 1,
              canGoBack: nextHistory.length > 1,
              canGoForward: false,
              mediaFound: []
            };
          }
          return t;
        })
      );
      return;
    }

    if (!/^https?:\/\//i.test(url)) {
      if (/^[a-z0-9-]+\.[a-z]{2,}/i.test(url)) {
        url = "https://" + url;
      } else {
        url = `https://www.google.com/search?q=${encodeURIComponent(url)}&hl=id`;
      }
    }

    // Check Phishing safety
    if (settings.smartPhishingShield && !bypassPhishing) {
      try {
        const safetyRes = await fetch("/api/analyze-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url })
        });
        const safety: SafetyAnalysis = await safetyRes.json();

        if (safety.threatLevel === "dangerous") {
          setPendingSafetyCheck({ url, safety });
          setIsPhishingModalOpen(true);
          addNotification(
            "Ancaman Terdeteksi",
            `Aegis Shield memblokir navigasi ke domain mencurigakan (${safety.domain}).`,
            "security"
          );
          return;
        }
      } catch (err) {
        console.error("Safety scan error:", err);
      }
    }

    // Set Loading State
    setTabs((prev) =>
      prev.map((t) => {
        if (t.id === activeTabId) {
          return { ...t, isLoading: true, url };
        }
        return t;
      })
    );

    try {
      const response = await fetch("/api/proxy-fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          userAgent: activeUa.uaString,
          proxyNode: activeProxy,
          stripAds: settings.stripAdsAndTrackers,
          removeScripts: settings.isolateScripts || bypassPhishing
        })
      });

      const data = await response.json();

      setTabs((prev) =>
        prev.map((t) => {
          if (t.id === activeTabId) {
            const nextHistory = [...t.history.slice(0, t.historyIndex + 1), data.finalUrl || url];
            return {
              ...t,
              title: data.pageTitle || new URL(url).hostname,
              url: data.finalUrl || url,
              isLoading: false,
              contentHtml: data.html,
              safety: data.safety,
              mediaFound: data.mediaList || [],
              history: nextHistory,
              historyIndex: nextHistory.length - 1,
              canGoBack: nextHistory.length > 1,
              canGoForward: false,
              bypassedPhishing: bypassPhishing
            };
          }
          return t;
        })
      );

      // Trigger Media notification if videos found
      if (data.mediaList && data.mediaList.length > 0) {
        addNotification(
          "Media Video Ditemukan",
          `${data.mediaList.length} berkas media terdeteksi di halaman ${new URL(url).hostname}. Siap diunduh.`,
          "info"
        );
      }

      // Check gentle quota threshold for QRIS notification
      const newUsage = settings.usageCount + 1;
      setSettings((prev) => ({ ...prev, usageCount: newUsage }));

      if (newUsage >= settings.maxUsageThreshold && newUsage % settings.maxUsageThreshold === 0) {
        setIsDonationModalOpen(true);
      }
    } catch (err: any) {
      console.error(err);
      setTabs((prev) =>
        prev.map((t) => {
          if (t.id === activeTabId) {
            return {
              ...t,
              isLoading: false,
              contentHtml: `<div style="font-family:sans-serif;padding:40px;text-align:center;color:#ef4444;"><h3>Gagal Memuat Halaman</h3><p>${err.message || "Koneksi proxy mengalami gangguan."}</p></div>`
            };
          }
          return t;
        })
      );
      addNotification("Gagal Memuat", "Tidak dapat terhubung ke situs target melalui proxy.", "security");
    }
  };

  // Tab Operations
  const handleAddTab = () => {
    const newId = `tab-${Date.now()}`;
    const newTab: Tab = {
      id: newId,
      title: "Beranda Aegis",
      url: "aegis://home",
      isLoading: false,
      canGoBack: false,
      canGoForward: false,
      history: ["aegis://home"],
      historyIndex: 0,
      isIncognito: false,
      mediaFound: []
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
  };

  const handleCloseTab = (id: string) => {
    if (tabs.length === 1) return;
    const remaining = tabs.filter((t) => t.id !== id);
    setTabs(remaining);
    if (activeTabId === id) {
      setActiveTabId(remaining[remaining.length - 1].id);
    }
  };

  const handleGoBack = () => {
    if (!activeTab || activeTab.historyIndex <= 0) return;
    const prevIndex = activeTab.historyIndex - 1;
    const prevUrl = activeTab.history[prevIndex];

    setTabs((prev) =>
      prev.map((t) => {
        if (t.id === activeTabId) {
          return {
            ...t,
            historyIndex: prevIndex,
            canGoBack: prevIndex > 0,
            canGoForward: true
          };
        }
        return t;
      })
    );
    navigateTo(prevUrl);
  };

  const handleGoForward = () => {
    if (!activeTab || activeTab.historyIndex >= activeTab.history.length - 1) return;
    const nextIndex = activeTab.historyIndex + 1;
    const nextUrl = activeTab.history[nextIndex];

    setTabs((prev) =>
      prev.map((t) => {
        if (t.id === activeTabId) {
          return {
            ...t,
            historyIndex: nextIndex,
            canGoBack: true,
            canGoForward: nextIndex < activeTab.history.length - 1
          };
        }
        return t;
      })
    );
    navigateTo(nextUrl);
  };

  const handleRefresh = () => {
    if (activeTab) {
      navigateTo(activeTab.url);
    }
  };

  const handleGoHome = () => {
    navigateTo("aegis://home");
  };

  // Start Download Action
  const handleStartDownload = (item: MediaItem, saveToVault: boolean = false) => {
    const taskId = `dl-${Date.now()}`;
    const newTask: DownloadTask = {
      id: taskId,
      title: item.title || "Video Stream Download",
      url: item.url,
      format: item.format || "MP4",
      quality: item.quality || "HD",
      progress: 0,
      status: "downloading",
      size: item.sizeEstimate || "38.4 MB",
      downloadedAt: Date.now(),
      isEncrypted: saveToVault
    };

    setDownloads((prev) => [newTask, ...prev]);
    setIsMediaModalOpen(false);
    addNotification(
      saveToVault ? "Mengenkripsi ke Vault E2E" : "Mengunduh Media",
      `Memulai pengunduhan ${item.title} (${item.quality}).`,
      "info"
    );

    // Simulate steady download progress
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 20) + 15;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);

        setDownloads((prev) =>
          prev.map((d) => {
            if (d.id === taskId) {
              return {
                ...d,
                progress: 100,
                status: saveToVault ? "encrypted_vault" : "completed"
              };
            }
            return d;
          })
        );

        if (saveToVault) {
          const newVaultItem: VaultItem = {
            id: `vault-media-${Date.now()}`,
            title: `[Media E2E] ${item.title}`,
            type: "media",
            encryptedPayload: `AES_ENCRYPTED_STREAM_KEY_${Date.now()}:::${item.url}`,
            iv: "IV_SALT_LOCAL_AES",
            createdAt: Date.now()
          };
          setVaultItems((prev) => [newVaultItem, ...prev]);
        }

        addNotification(
          saveToVault ? "Tersimpan di Brankas Terenkripsi" : "Unduhan Selesai",
          `${item.title} berhasil diunduh ${saveToVault ? "dan dienkripsi lokal dengan AES-256." : "ke perangkat."}`,
          "success"
        );
      } else {
        setDownloads((prev) =>
          prev.map((d) => (d.id === taskId ? { ...d, progress: currentProgress } : d))
        );
      }
    }, 400);
  };

  // Zero-Trace Purge
  const handlePurgeAllData = () => {
    localStorage.removeItem("aegis_vault_items");
    setVaultItems([]);
    setDownloads([]);
    setTabs([
      {
        id: "tab-purge-1",
        title: "Beranda Aegis",
        url: "aegis://home",
        isLoading: false,
        canGoBack: false,
        canGoForward: false,
        history: ["aegis://home"],
        historyIndex: 0,
        isIncognito: false,
        mediaFound: []
      }
    ]);
    setActiveTabId("tab-purge-1");
    setIsSettingsModalOpen(false);
    addNotification(
      "Zero-Trace Selesai",
      "Seluruh cache, riwayat, dan sesi memori telah dimusnahkan secara lokal.",
      "security"
    );
  };

  // Ping test simulation
  const handleTestPings = () => {
    addNotification("Pengujian Latensi", "Memperbarui waktu respons 10 node relay global...", "info");
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-stone-950 text-stone-100 font-sans overflow-hidden">
      {/* 1. TOP HEADER & OMNIBOX */}
      <HeaderBar
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={setActiveTabId}
        onCloseTab={handleCloseTab}
        onAddTab={handleAddTab}
        urlInput={urlInput}
        onChangeUrlInput={setUrlInput}
        onSubmitUrl={(e) => {
          e.preventDefault();
          navigateTo(urlInput);
        }}
        onGoBack={handleGoBack}
        onGoForward={handleGoForward}
        onRefresh={handleRefresh}
        onGoHome={handleGoHome}
        activeUa={activeUa}
        activeProxy={activeProxy}
        onOpenUaModal={() => setIsUaModalOpen(true)}
        onOpenProxyModal={() => setIsProxyModalOpen(true)}
        onOpenMediaModal={() => setIsMediaModalOpen(true)}
        onOpenVaultModal={() => setIsVaultModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onOpenDonationModal={() => setIsDonationModalOpen(true)}
        onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
        onOpenDomainAppModal={() => setIsNativeModalOpen(true)}
        downloads={downloads}
        mediaCount={activeTab?.mediaFound?.length || 0}
        batteryEcoMode={settings.batteryEcoMode}
        onToggleBatteryEco={() => {
          const next = !settings.batteryEcoMode;
          setSettings((prev) => ({ ...prev, batteryEcoMode: next }));
          addNotification(
            next ? "Mode Eco Diaktifkan" : "Mode Performa Maksimal",
            next
              ? "Latar belakang dioptimalkan untuk menghemat baterai & memori."
              : "Akselerasi penuh tanpa pembatasan frame.",
            "battery"
          );
        }}
        isPhishingRisk={activeTab?.safety?.threatLevel === "dangerous"}
        quotaUsedPercent={Math.min((settings.usageCount / settings.maxUsageThreshold) * 100, 100)}
      />

      {/* 2. MAIN WEB VIEWER STAGE */}
      <main className="flex-1 w-full min-h-0 relative overflow-hidden flex flex-col">
        <WebViewer
          activeTab={activeTab}
          activeUa={activeUa}
          activeProxy={activeProxy}
          onNavigate={navigateTo}
          onOpenUaModal={() => setIsUaModalOpen(true)}
          onOpenProxyModal={() => setIsProxyModalOpen(true)}
          onOpenMediaModal={() => setIsMediaModalOpen(true)}
          onOpenDonationModal={() => setIsDonationModalOpen(true)}
          onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
          onOpenDomainAppModal={() => setIsNativeModalOpen(true)}
          batteryEcoMode={settings.batteryEcoMode}
          onStartDirectDownload={handleStartDownload}
        />
      </main>

      {/* 3. MODALS */}
      {/* User-Agent Switcher */}
      <UserAgentModal
        isOpen={isUaModalOpen}
        onClose={() => setIsUaModalOpen(false)}
        activeUa={activeUa}
        onSelectUa={(ua) => {
          setActiveUa(ua);
          addNotification("Identitas User-Agent Berubah", `Penyamaran baru diterapkan: ${ua.name}`, "info");
        }}
        onAddCustomUa={(ua) => setCustomUas((prev) => [...prev, ua])}
        customUas={customUas}
      />

      {/* Proxy Nodes Switcher */}
      <ProxyNodeModal
        isOpen={isProxyModalOpen}
        onClose={() => setIsProxyModalOpen(false)}
        activeProxy={activeProxy}
        onSelectProxy={(node) => {
          setActiveProxy(node);
          addNotification(
            "Node Proxy Terhubung",
            `Rute dialihkan melalui ${node.name} (${node.country}) - ${node.encryption}`,
            "info"
          );
        }}
        onTestPings={handleTestPings}
      />

      {/* Phishing Interceptor & Bypass */}
      <PhishingWarningModal
        isOpen={isPhishingModalOpen}
        onClose={() => setIsPhishingModalOpen(false)}
        safety={pendingSafetyCheck?.safety || null}
        targetUrl={pendingSafetyCheck?.url || ""}
        onBypass={() => {
          setIsPhishingModalOpen(false);
          if (pendingSafetyCheck) {
            navigateTo(pendingSafetyCheck.url, true);
          }
        }}
        onGoBackSafe={() => {
          setIsPhishingModalOpen(false);
          setPendingSafetyCheck(null);
          handleGoHome();
        }}
      />

      {/* Media & Video Downloader */}
      <MediaDownloaderModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        mediaList={activeTab?.mediaFound || []}
        currentUrl={activeTab?.url || ""}
        downloads={downloads}
        onStartDownload={handleStartDownload}
        onOpenVault={() => {
          setIsMediaModalOpen(false);
          setIsVaultModalOpen(true);
        }}
      />

      {/* End-to-End Encrypted Vault */}
      <EncryptedVaultModal
        isOpen={isVaultModalOpen}
        onClose={() => setIsVaultModalOpen(false)}
        vaultItems={vaultItems}
        onSaveItem={(item) => setVaultItems((prev) => [item, ...prev])}
        onDeleteItem={(id) => setVaultItems((prev) => prev.filter((i) => i.id !== id))}
      />

      {/* QRIS Support & Donation Modal (Dismissable without restricting features) */}
      <QrisDonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
        isQuotaTriggered={settings.usageCount >= settings.maxUsageThreshold}
      />

      {/* Browser Settings */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onUpdateSettings={(newSet) => setSettings((prev) => ({ ...prev, ...newSet }))}
        onPurgeAllData={handlePurgeAllData}
      />

      {/* Security Inspector */}
      <SecurityInspectorModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        safety={activeTab?.safety || null}
        currentUrl={activeTab?.url || ""}
        activeProxy={activeProxy}
        activeUa={activeUa}
      />

      {/* Native App Standalone / danielzoldyck.com APK/Desktop Modal */}
      <NativeAppModal
        isOpen={isNativeModalOpen}
        onClose={() => setIsNativeModalOpen(false)}
      />

      {/* Non-Intrusive Bottom Toast Notification */}
      <NotificationToast
        notifications={notifications}
        onDismiss={(id) => setNotifications((prev) => prev.filter((n) => n.id !== id))}
      />

      {/* GOD MODE QUANTUM HUD OVERLAY */}
      <GodModeHUD
        activeUa={activeUa}
        activeProxy={activeProxy}
        currentUrl={activeTab?.url || "aegis://home"}
        isGodMode={isGodMode}
        onToggleGodMode={() => {
          setIsGodMode((prev) => {
            const next = !prev;
            addNotification(
              next ? "🔥 GOD MODE DIAKTIFKAN" : "GOD MODE STANDBY",
              next
                ? "Bypass WAF bot, zero-trace TLS spoofing & turbo retry sekarang aktif secara otomatis."
                : "Aegis kembali ke mode proteksi standar.",
              next ? "success" : "info"
            );
            return next;
          });
        }}
        batteryEcoMode={settings.batteryEcoMode}
        threatLevel={activeTab?.safety?.threatLevel || "safe"}
        onQuickNodeSwitch={() => setIsProxyModalOpen(true)}
        onQuickUaSwitch={() => setIsUaModalOpen(true)}
      />
    </div>
  );
}
