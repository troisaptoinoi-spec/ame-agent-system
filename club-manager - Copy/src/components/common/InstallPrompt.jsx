import { useState, useEffect } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { detectPlatform, getInstallInstructions } from '../../utils/platformDetect';

export default function InstallPrompt({ isOpen, onClose }) {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [platform, setPlatform] = useState(null);
  const [instructions, setInstructions] = useState(null);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const p = detectPlatform();
      setPlatform(p);
      setInstructions(getInstallInstructions(p));
      setInstalled(false);
    }
  }, [isOpen]);

  const handleInstall = async () => {
    setInstalling(true);
    const result = await install();
    setInstalling(false);
    if (result) {
      setInstalled(true);
    }
  };

  if (!isOpen || !instructions) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal modal-md"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>{instructions.icon}</span>
            <span>{instructions.title}</span>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {installed ? (
            <div
              style={{
                textAlign: 'center',
                padding: '32px 16px',
              }}
            >
              <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
                Cài đặt thành công!
              </h3>
              <p style={{ color: 'var(--text2)', fontSize: 14 }}>
                InnoHub đã được thêm vào màn hình chính. Bạn có thể mở ứng dụng
                trực tiếp từ biểu tượng trên màn hình.
              </p>
            </div>
          ) : (
            <>
              {/* App preview */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '16px',
                  background: 'linear-gradient(135deg, #6366f120, #8b5cf620)',
                  borderRadius: 12,
                  marginBottom: 24,
                  border: '1px solid var(--border)',
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                    flexShrink: 0,
                  }}
                >
                  🚀
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>InnoHub</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>
                    CLB Khởi nghiệp Đổi mới Sáng tạo
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--text3)',
                      marginTop: 2,
                    }}
                  >
                    Miễn phí • Không cần App Store
                  </div>
                </div>
              </div>

              {/* Native install button (Android/Chrome/Edge) */}
              {isInstallable && instructions.showNativeButton && (
                <button
                  className="btn btn-primary"
                  onClick={handleInstall}
                  disabled={installing}
                  style={{
                    width: '100%',
                    padding: '14px',
                    fontSize: 15,
                    fontWeight: 700,
                    marginBottom: 20,
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    border: 'none',
                    borderRadius: 12,
                    cursor: installing ? 'wait' : 'pointer',
                  }}
                >
                  {installing ? '⏳ Đang cài đặt...' : '⬇️ Cài đặt ngay'}
                </button>
              )}

              {/* Steps */}
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--text2)',
                  marginBottom: 12,
                }}
              >
                {isInstallable && instructions.showNativeButton
                  ? 'Hoặc cài đặt thủ công:'
                  : 'Hướng dẫn cài đặt:'}
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0,
                }}
              >
                {instructions.steps.map((step, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 14,
                      padding: '14px 0',
                      borderBottom:
                        i < instructions.steps.length - 1
                          ? '1px solid var(--border)'
                          : 'none',
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: 'var(--bg3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 18,
                        flexShrink: 0,
                        border: '1px solid var(--border)',
                      }}
                    >
                      {step.icon}
                    </div>
                    <div style={{ flex: 1, paddingTop: 7 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: 'var(--primary)',
                            background: 'var(--primary-light)',
                            padding: '1px 6px',
                            borderRadius: 4,
                          }}
                        >
                          Bước {i + 1}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          color: 'var(--text)',
                          marginTop: 4,
                          lineHeight: 1.5,
                        }}
                      >
                        {step.text}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Note */}
              {instructions.note && (
                <div
                  style={{
                    marginTop: 20,
                    padding: '12px 16px',
                    background: 'var(--bg3)',
                    borderRadius: 10,
                    fontSize: 13,
                    color: 'var(--text2)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    border: '1px solid var(--border)',
                  }}
                >
                  <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
                  <span>{instructions.note}</span>
                </div>
              )}

              {/* Already installed message */}
              {isInstalled && (
                <div
                  style={{
                    marginTop: 16,
                    padding: '12px 16px',
                    background: '#10b98120',
                    borderRadius: 10,
                    fontSize: 13,
                    color: '#10b981',
                    fontWeight: 600,
                    textAlign: 'center',
                  }}
                >
                  ✅ Ứng dụng đã được cài đặt trên thiết bị này!
                </div>
              )}
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            {installed ? 'Đóng' : 'Để sau'}
          </button>
        </div>
      </div>
    </div>
  );
}
