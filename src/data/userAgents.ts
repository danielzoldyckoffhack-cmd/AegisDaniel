import { UserAgentProfile } from "../types";

export const USER_AGENT_PRESETS: UserAgentProfile[] = [
  // iOS
  {
    id: "ios-safari-18",
    name: "Apple iPhone 16 Pro (Safari 18)",
    category: "iOS",
    uaString: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1",
    platform: "iPhone / iOS 18.1",
    iconName: "Smartphone",
    description: "Identitas peramban perangkat flagship iOS Apple dengan fingerprint mobile modern.",
    deviceType: "mobile"
  },
  {
    id: "ios-ipad-pro",
    name: "Apple iPad Pro M4 (Safari 18 Desktop Mode)",
    category: "iOS",
    uaString: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
    platform: "iPadOS 18 / Apple Silicon",
    iconName: "Tablet",
    description: "Emulasi tampilan iPad Pro resolusi tinggi dengan mode desktop bawaan.",
    deviceType: "tablet"
  },

  // Android
  {
    id: "android-pixel-9",
    name: "Google Pixel 9 Pro (Chrome 130)",
    category: "Android",
    uaString: "Mozilla/5.0 (Linux; Android 15; Pixel 9 Pro Build/AP3A.241005.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36",
    platform: "Android 15 Vanilla",
    iconName: "Smartphone",
    description: "Fingerprint resmi Google Pixel 9 Android 15 murni tanpa bloatware.",
    deviceType: "mobile"
  },
  {
    id: "android-samsung-s24",
    name: "Samsung Galaxy S24 Ultra (Samsung Internet 26)",
    category: "Android",
    uaString: "Mozilla/5.0 (Linux; Android 14; SM-S928B Build/UP1A.231005.007) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/26.0 Chrome/122.0.6261.119 Mobile Safari/537.36",
    platform: "One UI 6.1 / Android 14",
    iconName: "Smartphone",
    description: "Penyamaran peramban bawaan Samsung Galaxy kelas flagship.",
    deviceType: "mobile"
  },

  // Linux (Debian, Ubuntu, Arch)
  {
    id: "linux-debian-firefox",
    name: "Debian GNU/Linux 12 'Bookworm' (Firefox ESR 128)",
    category: "Linux",
    uaString: "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0",
    platform: "Debian 12 Bookworm x86_64",
    iconName: "Terminal",
    description: "Fingerprint anonim standar distro Debian Linux open-source yang sangat privat.",
    deviceType: "desktop"
  },
  {
    id: "linux-ubuntu-chrome",
    name: "Ubuntu 24.04 LTS (Google Chrome 130)",
    category: "Linux",
    uaString: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    platform: "Ubuntu 24.04 LTS Noble Numbat",
    iconName: "Cpu",
    description: "Profil peramban workstation Linux Ubuntu dengan akselerasi hardware standar.",
    deviceType: "desktop"
  },
  {
    id: "linux-arch-librewolf",
    name: "Arch Linux Rolling (LibreWolf Hardened 131)",
    category: "Linux",
    uaString: "Mozilla/5.0 (X11; Arch Linux; Linux x86_64; rv:131.0) Gecko/20100101 Firefox/131.0",
    platform: "Arch Linux Kernel 6.11",
    iconName: "Shield",
    description: "Fingerprint peramban LibreWolf yang telah diperkuat proteksi resistensi kanvas.",
    deviceType: "desktop"
  },

  // Windows
  {
    id: "windows-11-edge",
    name: "Windows 11 Pro 24H2 (Microsoft Edge 130)",
    category: "Windows",
    uaString: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0",
    platform: "Windows 11 Pro 64-bit",
    iconName: "Monitor",
    description: "Fingerprint bisnis enterprise Microsoft Windows 11 paling umum di dunia.",
    deviceType: "desktop"
  },
  {
    id: "windows-10-firefox",
    name: "Windows 10 (Firefox Developer Edition 131)",
    category: "Windows",
    uaString: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0",
    platform: "Windows 10 x64",
    iconName: "Globe",
    description: "Penyamaran pengembang web menggunakan Mozilla Firefox pada Windows 10.",
    deviceType: "desktop"
  },

  // macOS
  {
    id: "macos-sequoia-safari",
    name: "macOS Sequoia 15.1 (Apple Safari 18.1)",
    category: "macOS",
    uaString: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15",
    platform: "macOS Sequoia (M3 Max)",
    iconName: "Laptop",
    description: "Fingerprint premium workstation Apple Mac desktop.",
    deviceType: "desktop"
  },

  // Specialized / Tor / TV
  {
    id: "tor-stealth-anonymity",
    name: "Tor Browser 14.0 (Whonix Isolated Node)",
    category: "Specialized",
    uaString: "Mozilla/5.0 (Windows NT 10.0; rv:128.0) Gecko/20100101 Firefox/128.0",
    platform: "Tor Protected Layer",
    iconName: "EyeOff",
    description: "Penyamaran User-Agent bulat Tor Project standar untuk meminimalkan entropi pelacakan.",
    deviceType: "desktop"
  },
  {
    id: "smart-tv-tizen",
    name: "Samsung Smart TV (Tizen OS 8.0 4K Display)",
    category: "Specialized",
    uaString: "Mozilla/5.0 (SMART-TV; LINUX; Tizen 8.0) AppleWebKit/537.36 (KHTML, like Gecko) 2024SamsungBrowser/6.0 Chrome/108.0.5359.125 TV Safari/537.36",
    platform: "Tizen Smart Screen",
    iconName: "Tv",
    description: "Akses web sebagai perangkat televisi pintar untuk melewati filter khusus perangkat komputer.",
    deviceType: "tv"
  }
];
