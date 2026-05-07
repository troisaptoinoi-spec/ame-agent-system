# 🐍 Snake Game - Rắn Săn Mồi Hiện Đại

Trò chơi Snake cổ điển với giao diện hiện đại, hiệu ứng đẹp mắt, chạy mượt trên mọi thiết bị.

## ✨ Tính năng

- 🎨 **Giao diện Dark Theme** - Gradient tối, glassmorphism, neon glow effects
- 🎮 **Điều khiển linh hoạt** - Phím mũi tên, WASD, cảm ứng trên mobile
- ✨ **Hiệu ứng Particles** - Khi ăn thức ăn và khi game over
- 🔊 **Âm thanh** - Web Audio API, không cần file ngoài
- 📱 **Responsive** - Chơi được trên desktop và mobile
- 🏆 **Điểm cao** - Lưu vào LocalStorage
- ⚡ **Tốc độ tăng dần** - Càng chơi càng nhanh
- ⏸️ **Pause/Resume** - Nhấn Space hoặc P để tạm dừng
- ⭐ **Thức ăn bonus** - 20% cơ hội xuất hiện, gấp 3 điểm

## 🎮 Cách chơi

1. Mở file `index.html` trong trình duyệt
2. Nhấn **SPACE** hoặc chạm vào màn hình để bắt đầu
3. Sử dụng **phím mũi tên** hoặc **WASD** để di chuyển
4. Ăn thức ăn để tăng điểm và kích thước
5. Tránh va vào tường và thân rắn

## 📁 Cấu trúc dự án

```
snake-game/
├── index.html          # File chính
├── css/
│   └── style.css       # Giao diện hiện đại
├── js/
│   ├── game.js         # Game engine chính
│   ├── snake.js        # Logic con rắn
│   ├── food.js         # Logic thức ăn
│   ├── particles.js    # Hiệu ứng particles
│   ├── sound.js        # Hệ thống âm thanh
│   └── storage.js      # Lưu trữ điểm
└── README.md           # Tài liệu này
```

## 🛠️ Công nghệ

- **HTML5 Canvas** - Vẽ game
- **CSS3** - Glassmorphism, animations, responsive
- **Vanilla JavaScript** - Không framework, hiệu suất cao
- **Web Audio API** - Âm thanh tổng hợp
- **LocalStorage** - Lưu điểm cao

## 🎨 Màu sắc chủ đạo

| Element | Màu |
|---------|-----|
| Background | `#0a0a1a` (Dark blue-black) |
| Snake | `#00ff88` → `#00cc66` (Neon green) |
| Food | `#ff6b6b` (Coral red) |
| Bonus Food | `#ffd700` (Gold) |
| UI Glass | `rgba(255,255,255,0.08)` |

## 📱 Hỗ trợ thiết bị

- ✅ Desktop (Chrome, Firefox, Safari, Edge)
- ✅ Mobile (iOS Safari, Android Chrome)
- ✅ Tablet
- ✅ Cảm ứng và bàn phím

---

Made with ❤️ and pure JavaScript
