import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const GUIDES = [
  {
    icon: '👥',
    title: 'Quản lý Thành viên',
    content: [
      'Vào tab "Thành viên" để xem danh sách tất cả thành viên CLB.',
      'Nhấn nút "+ Thêm thành viên" để thêm người mới vào CLB.',
      'Chọn chế độ xem dạng lưới (▦) hoặc danh sách (☰) để tùy chỉnh hiển thị.',
      'Sử dụng ô tìm kiếm để lọc thành viên theo tên hoặc email.',
      'Lọc theo Ban hoặc Vai trò bằng dropdown phía trên danh sách.',
      'Nhấn vào thẻ thành viên để xem hồ sơ chi tiết.',
      'Quản trị viên và Chủ nhiệm có thể chỉnh sửa/xóa thành viên.',
      'Nhấn "Xuất CSV" để tải danh sách thành viên về máy.',
    ],
  },
  {
    icon: '📋',
    title: 'Quản lý Nhiệm vụ',
    content: [
      'Vào tab "Nhiệm vụ" để xem bảng Kanban quản lý công việc.',
      'Kéo thả thẻ nhiệm vụ giữa các cột: Cần làm → Đang làm → Hoàn thành.',
      'Nhấn "+ Thêm nhiệm vụ" để tạo nhiệm vụ mới.',
      'Gán người phụ trách, đặt hạn chót, chọn độ ưu tiên cho mỗi nhiệm vụ.',
      'Sử dụng nhãn (tags) để phân loại nhiệm vụ dễ dàng hơn.',
      'Nhấn vào thẻ nhiệm vụ để xem chi tiết, bình luận và đính kèm tệp.',
      'Trưởng ban có thể duyệt nhiệm vụ hoàn thành bằng nút "Duyệt Hoàn thành".',
      'Chuyển sang tab "Lịch sử" để xem các nhiệm vụ đã lưu trữ.',
    ],
  },
  {
    icon: '📅',
    title: 'Quản lý Sự kiện',
    content: [
      'Vào tab "Lịch sự kiện" để xem lịch trình các hoạt động CLB.',
      'Nhấn "+ Thêm sự kiện" để tạo sự kiện mới (họp, workshop, demo day).',
      'Nhấn vào ngày trên lịch để nhanh chóng thêm sự kiện vào ngày đó.',
      'Sự kiện sắp tới hiển thị ở panel bên phải.',
      'Hạn chót nhiệm vụ cũng được hiển thị trên lịch để dễ theo dõi.',
      'Nhấn vào sự kiện trên lịch để chỉnh sửa hoặc xóa.',
    ],
  },
  {
    icon: '🏆',
    title: 'Bảng Xếp hạng',
    content: [
      'Vào tab "Xếp hạng" để xem bảng xếp hạng thành viên theo điểm.',
      'Điểm được cộng khi hoàn thành nhiệm vụ (tùy độ ưu tiên: 10-50 điểm).',
      'Huy hiệu được trao theo mức điểm: 🔥 Star → ⭐ Rocket → 👑 Crown → 💎 Diamond.',
      'Lọc theo Ban hoặc Kỳ (tuần/tháng/quý) để xem xếp hạng chi tiết.',
      'Nhấn "Xuất CSV" để tải bảng xếp hạng về máy.',
    ],
  },
  {
    icon: '📊',
    title: 'Dashboard Tổng quan',
    content: [
      'Trang Tổng quan hiển thị cái nhìn toàn cảnh về hoạt động CLB.',
      'Thống kê tổng thành viên, nhiệm vụ, tỷ lệ hoàn thành.',
      'Biểu đồ tiến độ theo từng Ban chuyên môn.',
      'Bảng công việc mini hiển thị nhiệm vụ Cần làm và Đang làm.',
      'Hoạt động gần đây cập nhật realtime các thay đổi.',
      'Giao diện thay đổi tùy vai trò: Admin/Chủ nhiệm thấy toàn CLB, Trưởng ban thấy ban mình, Thành viên thấy cá nhân.',
    ],
  },
  {
    icon: '⚙️',
    title: 'Cài đặt Hệ thống',
    content: [
      'Chỉ Quản trị viên mới truy cập được tab "Cài đặt".',
      'Quản lý Ban: thêm/xóa các ban chuyên môn trong CLB.',
      'Xuất/Nhập dữ liệu: sao lưu toàn bộ dữ liệu CLB dưới dạng JSON.',
      'Reset dữ liệu: đưa hệ thống về trạng thái demo ban đầu.',
      'Cấu hình Gemini AI: nhập API Key để sử dụng tính năng trợ lý AI.',
    ],
  },
  {
    icon: '⌨️',
    title: 'Phím tắt & Mẹo',
    content: [
      'Ctrl + K: Mở tìm kiếm toàn cục nhanh.',
      'Kéo thả nhiệm vụ trên bảng Kanban để thay đổi trạng thái.',
      'Nhấn vào avatar thành viên để xem hồ sơ nhanh.',
      'Sử dụng nút 🌙/☀️ ở header để chuyển Dark/Light mode.',
      'Sử dụng nút 🇻🇳/🇬🇧 để chuyển ngôn ngữ Tiếng Việt/English.',
      'Thu nhỏ sidebar bằng nút ☰ để có thêm không gian làm việc.',
    ],
  },
];

function AccordionItem({ item, isOpen, onToggle }) {
  return (
    <div
      className="card"
      style={{
        padding: 0,
        overflow: 'hidden',
        border: isOpen ? '1px solid var(--primary)' : '1px solid var(--border)',
        transition: 'border-color 0.2s',
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 18px',
          background: isOpen ? 'var(--primary-light)' : 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'var(--font)',
          fontSize: 15,
          fontWeight: 600,
          color: 'var(--text)',
          textAlign: 'left',
          transition: 'background 0.2s',
        }}
      >
        <span style={{ fontSize: 22 }}>{item.icon}</span>
        <span style={{ flex: 1 }}>{item.title}</span>
        <span style={{
          fontSize: 18,
          color: 'var(--text3)',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s',
        }}>
          ▾
        </span>
      </button>
      {isOpen && (
        <div style={{ padding: '0 18px 16px', animation: 'fadeIn 0.2s ease' }}>
          <ul style={{
            margin: 0, paddingLeft: 20,
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            {item.content.map((step, i) => (
              <li key={i} style={{
                fontSize: 13, color: 'var(--text2)', lineHeight: 1.6,
              }}>
                {step}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function SupportPage() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="page-enter">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', fontWeight: 800 }}>
          🆘 Hỗ Trợ
        </h1>
        <p style={{ color: 'var(--text2)', marginTop: 4, fontSize: 14 }}>
          Liên hệ quản trị viên và tìm hiểu cách sử dụng hệ thống
        </p>
      </div>

      {/* Contact Admin Section */}
      <div
        className="card"
        style={{
          marginBottom: 24,
          padding: 24,
          background: 'linear-gradient(135deg, rgba(139,124,247,0.08), rgba(6,182,212,0.05))',
          border: '1px solid rgba(139,124,247,0.15)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>📞 Liên hệ Admin</h2>
          <p style={{ fontSize: 13, color: 'var(--text2)' }}>
            Gặp vấn đề? Liên hệ trực tiếp với quản trị viên qua các kênh bên dưới
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 24 }}>
          {/* Facebook */}
          <a
            href="https://www.facebook.com/hoang.minh.952513"
            target="_blank"
            rel="noopener noreferrer"
            title="Nhắn Facebook"
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
              padding: '20px 32px', borderRadius: 16,
              background: 'rgba(24,119,242,0.1)', border: '2px solid rgba(24,119,242,0.2)',
              textDecoration: 'none', transition: 'all 0.2s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(24,119,242,0.2)';
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(24,119,242,0.25)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(24,119,242,0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: '#1877F2', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, color: 'white', fontWeight: 800,
              boxShadow: '0 4px 12px rgba(24,119,242,0.4)',
            }}>
              f
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1877F2' }}>Facebook</div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>Nhắn tin trực tiếp</div>
          </a>

          {/* Zalo */}
          <a
            href="https://zalo.me/0385081016"
            target="_blank"
            rel="noopener noreferrer"
            title="Nhắn Zalo"
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
              padding: '20px 32px', borderRadius: 16,
              background: 'rgba(0,104,255,0.1)', border: '2px solid rgba(0,104,255,0.2)',
              textDecoration: 'none', transition: 'all 0.2s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(0,104,255,0.2)';
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,104,255,0.25)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(0,104,255,0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: '#0068FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, color: 'white', fontWeight: 800,
              boxShadow: '0 4px 12px rgba(0,104,255,0.4)',
            }}>
              Z
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#0068FF' }}>Zalo</div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>0385081016</div>
          </a>
        </div>
      </div>

      {/* User Guide Section */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>📖 Hướng dẫn sử dụng Hệ thống</h2>
        <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 16 }}>
          Nhấn vào từng mục bên dưới để xem hướng dẫn chi tiết
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {GUIDES.map((guide, i) => (
          <AccordionItem
            key={i}
            item={guide}
            isOpen={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
          />
        ))}
      </div>
    </div>
  );
}
