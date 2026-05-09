/**
 * Detect user's platform and browser
 */
export function detectPlatform() {
  const ua = navigator.userAgent || '';
  const platform = navigator.platform || '';

  const isIOS = /iPad|iPhone|iPod/.test(ua) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/.test(ua);
  const isMac = /Mac/.test(platform) && !isIOS;
  const isWindows = /Win/.test(platform);
  const isLinux = /Linux/.test(platform) && !isAndroid;

  const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);
  const isChrome = /Chrome/.test(ua) && !/Edge/.test(ua);
  const isEdge = /Edg/.test(ua);
  const isFirefox = /Firefox/.test(ua);
  const isSamsung = /SamsungBrowser/.test(ua);

  let device = 'desktop';
  if (isIOS) device = 'ios';
  else if (isAndroid) device = 'android';
  else if (isWindows) device = 'windows';
  else if (isMac) device = 'mac';
  else if (isLinux) device = 'linux';

  let browser = 'other';
  if (isSamsung) browser = 'samsung';
  else if (isEdge) browser = 'edge';
  else if (isChrome) browser = 'chrome';
  else if (isSafari) browser = 'safari';
  else if (isFirefox) browser = 'firefox';

  return { device, browser, isIOS, isAndroid, isMac, isWindows, isLinux, isSafari, isChrome, isEdge, isFirefox, isSamsung };
}

/**
 * Get install instructions based on platform/browser
 */
export function getInstallInstructions(platform) {
  const { device, browser, isIOS, isAndroid, isMac, isWindows, isLinux, isSafari, isChrome, isEdge, isSamsung } = platform;

  // iOS Safari
  if (isIOS && isSafari) {
    return {
      title: 'Cài đặt trên iPhone/iPad',
      icon: '🍎',
      steps: [
        { icon: '📤', text: 'Nhấn nút "Chia sẻ" (biểu tượng mũi tên lên) ở thanh công cụ dưới' },
        { icon: '⬇️', text: 'Cuộn xuống và chọn "Thêm vào MH chính"' },
        { icon: '✅', text: 'Nhấn "Thêm" ở góc trên bên phải' },
      ],
      note: 'Ứng dụng sẽ xuất hiện trên màn hình chính như app thật!',
    };
  }

  // iOS Chrome/Edge
  if (isIOS && !isSafari) {
    return {
      title: 'Cài đặt trên iPhone/iPad',
      icon: '🍎',
      steps: [
        { icon: '🌐', text: 'Mở trang này bằng Safari (nhấn ... → Mở bằng Safari)' },
        { icon: '📤', text: 'Trong Safari, nhấn nút "Chia sẻ" (📤) ở thanh công cụ dưới' },
        { icon: '⬇️', text: 'Cuộn xuống và chọn "Thêm vào MH chính" → "Thêm"' },
      ],
      note: 'iOS chỉ cho phép cài PWA từ trình duyệt Safari.',
    };
  }

  // Android Chrome
  if (isAndroid && isChrome) {
    return {
      title: 'Cài đặt trên Android',
      icon: '🤖',
      steps: [
        { icon: '⋮', text: 'Nhấn menu 3 chấm (⋮) ở góc trên bên phải Chrome' },
        { icon: '⬇️', text: 'Chọn "Cài đặt ứng dụng" hoặc "Thêm vào MH chính"' },
        { icon: '✅', text: 'Nhấn "Cài đặt" để xác nhận' },
      ],
      note: 'Hoặc nhấn nút "Cài đặt" bên dưới để cài nhanh!',
      showNativeButton: true,
    };
  }

  // Android Samsung
  if (isAndroid && isSamsung) {
    return {
      title: 'Cài đặt trên Samsung',
      icon: '📱',
      steps: [
        { icon: '⋮', text: 'Nhấn menu 3 chấm (⋮) ở góc trên bên phải' },
        { icon: '⬇️', text: 'Chọn "Thêm vào MH chính"' },
        { icon: '✅', text: 'Nhấn "Thêm" để xác nhận' },
      ],
      note: 'Hoặc nhấn nút "Cài đặt" bên dưới!',
      showNativeButton: true,
    };
  }

  // Android other browsers
  if (isAndroid) {
    return {
      title: 'Cài đặt trên Android',
      icon: '🤖',
      steps: [
        { icon: '🌐', text: 'Mở trang này bằng Google Chrome hoặc Samsung Internet' },
        { icon: '⋮', text: 'Nhấn menu (⋮) → "Cài đặt ứng dụng"' },
        { icon: '✅', text: 'Nhấn "Cài đặt" để xác nhận' },
      ],
      note: 'Vui lòng dùng Chrome hoặc Samsung Internet để cài PWA.',
    };
  }

  // Windows/macOS Chrome
  if ((isWindows || isMac) && isChrome) {
    return {
      title: `Cài đặt trên ${isWindows ? 'Windows' : 'macOS'}`,
      icon: isWindows ? '💻' : '🍎',
      steps: [
        { icon: '⊕', text: 'Nhấn biểu tượng cài đặt (⊕) ở cuối thanh địa chỉ bên phải' },
        { icon: '⬇️', text: 'Chọn "Cài đặt InnoHub" trong popup hiện ra' },
        { icon: '✅', text: 'Ứng dụng sẽ mở trong cửa sổ riêng, xuất hiện ở taskbar/dock' },
      ],
      note: 'Hoặc nhấn nút "Cài đặt" bên dưới!',
      showNativeButton: true,
    };
  }

  // Windows/macOS Edge
  if ((isWindows || isMac) && isEdge) {
    return {
      title: `Cài đặt trên ${isWindows ? 'Windows' : 'macOS'} (Edge)`,
      icon: '🌐',
      steps: [
        { icon: '⊕', text: 'Nhấn biểu tượng "Ứng dụng" (⊕) ở cuối thanh địa chỉ bên trái' },
        { icon: '⬇️', text: 'Chọn "Cài đặt InnoHub"' },
        { icon: '✅', text: 'Ứng dụng sẽ mở trong cửa sổ riêng' },
      ],
      note: 'Hoặc nhấn nút "Cài đặt" bên dưới!',
      showNativeButton: true,
    };
  }

  // macOS Safari
  if (isMac && isSafari) {
    return {
      title: 'Cài đặt trên macOS (Safari)',
      icon: '🍎',
      steps: [
        { icon: '📤', text: 'Vào menu "Tệp" → "Thêm vào Màn hình chính..."' },
        { icon: '✏️', text: 'Đặt tên (mặc định: InnoHub) và nhấn "Thêm"' },
        { icon: '✅', text: 'Ứng dụng sẽ xuất hiện trên Dock' },
      ],
      note: 'Safari trên macOS hỗ trợ thêm PWA vào Dock từ macOS Sonoma.',
    };
  }

  // Fallback
  return {
    title: 'Cài đặt ứng dụng',
    icon: '📱',
    steps: [
      { icon: '🌐', text: 'Mở trang này bằng Chrome, Edge hoặc Safari' },
      { icon: '⋮', text: 'Tìm tùy chọn "Cài đặt ứng dụng" trong menu trình duyệt' },
      { icon: '✅', text: 'Làm theo hướng dẫn để cài đặt' },
    ],
    note: 'PWA hoạt động tốt nhất trên Chrome, Edge và Safari.',
  };
}
