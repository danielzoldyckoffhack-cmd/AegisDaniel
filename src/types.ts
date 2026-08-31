export interface Tab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  isLoading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  history: string[];
  historyIndex: number;
  isIncognito: boolean;
  contentHtml?: string;
  safety?: SafetyAnalysis;
  mediaFound?: MediaItem[];
  bypassedPhishing?: boolean;
}

export interface SafetyAnalysis {
  isSuspicious: boolean;
  threatLevel: "safe" | "warning" | "dangerous";
  reasons: string[];
  score: number;
  detectedType?: string;
  domain: string;
}

export interface UserAgentProfile {
  id: string;
  name: string;
  category: "iOS" | "Android" | "Linux" | "Windows" | "macOS" | "Specialized" | "Custom";
  uaString: string;
  platform: string;
  iconName: string;
  description: string;
  deviceType: "mobile" | "desktop" | "tablet" | "tv";
}

export interface ProxyNode {
  id: string;
  name: string;
  country: string;
  flag: string;
  city: string;
  ipMask: string;
  latencyMs: number;
  type: "Stealth HTTP/S" | "Tor Onion Bridge" | "Zero-Log Vault" | "Military Double-Hop" | "Direct Relay";
  encryption: "ChaCha20-Poly1305" | "AES-256-GCM" | "WireGuard-Curve25519" | "None";
  status: "online" | "optimal" | "congested";
  speedMbps: number;
}

export interface MediaItem {
  id?: string;
  title: string;
  url: string;
  quality: string;
  format: string;
  sizeEstimate?: string;
  thumbnail?: string;
}

export interface DownloadTask {
  id: string;
  title: string;
  url: string;
  format: string;
  quality: string;
  progress: number; // 0-100
  status: "downloading" | "completed" | "encrypted_vault" | "failed";
  size: string;
  downloadedAt: number;
  isEncrypted?: boolean;
}

export interface VaultItem {
  id: string;
  title: string;
  type: "bookmark" | "note" | "credential" | "media";
  encryptedPayload: string;
  iv: string;
  createdAt: number;
  tag?: string;
}

export interface BrowserSettings {
  theme: "auto" | "dark" | "light";
  batteryEcoMode: boolean;
  stripAdsAndTrackers: boolean;
  smartPhishingShield: boolean;
  isolateScripts: boolean;
  activeProxyId: string;
  activeUaId: string;
  e2eEncryptionEnabled: boolean;
  usageCount: number;
  maxUsageThreshold: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: "info" | "security" | "success" | "warning" | "battery";
  timestamp: number;
}
