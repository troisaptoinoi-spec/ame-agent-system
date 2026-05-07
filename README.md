# MOU Generator - Tạo Bản Ghi Nhớ Hợp Tác (.docx)

Tự động tạo file Word (.docx) chứa **Bản Ghi Nhớ Hợp Tác (MOU)** giữa:
- **Bên A**: Trường Đại học Tây Nguyên
- **Bên B**: Công ty TNHH MTV Xuất nhập khẩu 2-9 Đắk Lắk (Simexco Daklak)

## 📋 Tính Năng

- ✅ Tạo file .docx với định dạng chuyên nghiệp
- ✅ Font Times New Roman, cỡ chữ 13 (body), 16 (title)
- ✅ Margins 2.5cm tất cả các cạnh
- ✅ Bảng Điều 2 với viền đen đầy đủ (Table Grid)
- ✅ Phần chữ ký 2 cột (Bên A & Bên B)
- ✅ Ngày tháng tự động lấy từ hệ thống
- ✅ Unit tests kiểm tra chất lượng file output

## 🚀 Cài Đặt

### Bước 1: Cài đặt dependencies

```bash
pip install -r requirements.txt
```

Hoặc cài trực tiếp:

```bash
pip install python-docx
```

### Bước 2: Chạy tạo file MOU

```bash
cd mou_generator
python main.py
```

### Bước 3: Lấy file output

File sẽ được tạo trong thư mục hiện tại với tên:
```
MOU_DHTN_Simexco_DD_MM_YYYY.docx
```

Ví dụ: `MOU_DHTN_Simexco_03_05_2026.docx`

Mở file bằng Microsoft Word để xem và chỉnh sửa.

## 🧪 Chạy Unit Tests

```bash
cd mou_generator
python tests/__init__.py
```

Hoặc sử dụng pytest:

```bash
cd mou_generator
python -m pytest tests/ -v
```

## 📁 Cấu Trúc Dự Án

```
mou_generator/
├── __init__.py              # Package init
├── config.py                # Cấu hình và hằng số
├── styles.py                # Quản lý font và styles
├── content_sections.py      # Các phần nội dung MOU
├── table_generator.py       # Tạo bảng Điều 2
├── signature_section.py     # Phần chữ ký
├── document_builder.py      # Xây dựng document tổng thể
├── main.py                  # Entry point chính
├── requirements.txt         # Dependencies
└── tests/
    └── __init__.py          # Unit tests
```

## ⚙️ Cấu Hình

Chỉnh sửa file `config.py` để thay đổi:

- **Font chữ**: `FONT_PRIMARY`, `FONT_FALLBACK`
- **Cỡ chữ**: `FONT_SIZE_BODY`, `FONT_SIZE_TITLE`, `FONT_SIZE_HEADER`
- **Margins**: `MARGIN_TOP`, `MARGIN_BOTTOM`, `MARGIN_LEFT`, `MARGIN_RIGHT`
- **Thông tin các bên**: `PARTY_A`, `PARTY_B`
- **Nội dung bảng**: `COOPERATION_TABLE_DATA`

## 📝 Lưu Ý

1. **Font fallback**: Nếu Times New Roman không khả dụng, code sẽ sử dụng Arial
2. **Encoding**: File output sử dụng UTF-8, hỗ trợ tiếng Việt đầy đủ
3. **Table Grid**: Nếu style Table Grid không có sẵn, code sẽ tạo viền thủ công qua XML
4. **Ngày tháng**: Luôn sử dụng ngày hiện tại của hệ thống

## 📄 License

MIT License
