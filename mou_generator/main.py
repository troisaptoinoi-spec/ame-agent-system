"""
main.py - Entry Point chính cho MOU Generator
Chạy file này để tạo file MOU .docx hoàn chỉnh.

Sử dụng:
    python main.py
    
Output:
    MOU_DHTN_Simexco_DD_MM_YYYY.docx (trong thư mục hiện tại)
"""

import os
import sys
from datetime import datetime

# Fix encoding cho Windows (cp1252 -> utf-8)
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

# Thêm thư mục cha vào path để import các module
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from document_builder import build_mou_document
from config import get_output_filename


def main():
    """
    Hàm chính: Tạo file MOU và lưu vào thư mục hiện tại.
    
    Quy trình:
    1. Tạo document MOU bằng document_builder
    2. Tạo tên file với ngày tháng hiện tại
    3. Lưu file .docx
    4. In thông báo đường dẫn file
    """
    print("=" * 60)
    print("  MOU GENERATOR - Tạo Bản Ghi Nhớ Hợp Tác")
    print("  Trường Đại học Tây Nguyên & Simexco Daklak")
    print("=" * 60)
    print()
    
    # Bước 1: Tạo document
    print("[1/3] Đang tạo document MOU...")
    try:
        doc = build_mou_document()
        print("      ✓ Document đã tạo thành công!")
    except Exception as e:
        print(f"      ✗ Lỗi khi tạo document: {e}")
        sys.exit(1)
    
    # Bước 2: Tạo tên file
    filename = get_output_filename()
    print(f"[2/3] Tên file: {filename}")
    
    # Bước 3: Lưu file
    print("[3/3] Đang lưu file...")
    try:
        # Lưu vào thư mục hiện tại (Desktop)
        output_path = os.path.join(os.getcwd(), filename)
        doc.save(output_path)
        
        # Kiểm tra file đã tạo
        file_size = os.path.getsize(output_path)
        print(f"      ✓ Đã lưu thành công!")
        print()
        print(f"  📄 File: {filename}")
        print(f"  📁 Đường dẫn: {output_path}")
        print(f"  📊 Dung lượng: {file_size:,} bytes ({file_size/1024:.1f} KB)")
        print()
        
        if file_size < 5120:  # < 5KB
            print("  ⚠ WARNING: File nhỏ hơn 5KB, có thể thiếu nội dung!")
        else:
            print("  ✓ Dung lượng file hợp lệ (> 5KB)")
        
    except Exception as e:
        print(f"      ✗ Lỗi khi lưu file: {e}")
        sys.exit(1)
    
    print()
    print("=" * 60)
    print("  HOÀN THÀNH! Mở file bằng Microsoft Word để xem.")
    print("=" * 60)


if __name__ == "__main__":
    main()
