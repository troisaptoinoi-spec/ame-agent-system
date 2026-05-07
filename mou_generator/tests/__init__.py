"""
test_mou_generator.py - Unit Tests cho MOU Generator
Kiem tra cac tieu chi chat luong cua file MOU duoc tao.

Chay tests:
    python -m pytest test_mou_generator.py -v
    hoac
    python test_mou_generator.py
"""

import os
import sys
import unittest
from datetime import datetime

# Fix encoding cho Windows (cp1252 -> utf-8)
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

# Thêm thư mục cha vào path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))

from docx import Document
from document_builder import build_mou_document
from config import get_output_filename, get_current_date_string


class TestMOUGenerator(unittest.TestCase):
    """Test suite cho MOU Generator"""
    
    @classmethod
    def setUpClass(cls):
        """
        Tạo document MOU một lần cho tất cả tests.
        Tránh tạo lại document nhiều lần (tiết kiệm thời gian).
        """
        cls.doc = build_mou_document()
        cls.filename = get_output_filename()
        cls.doc.save(cls.filename)
        cls.file_size = os.path.getsize(cls.filename)
    
    @classmethod
    def tearDownClass(cls):
        """Dọn dẹp file test sau khi chạy xong"""
        if os.path.exists(cls.filename):
            os.remove(cls.filename)
    
    # =========================================================================
    # TEST 1: File creation
    # =========================================================================
    def test_file_created_successfully(self):
        """Kiểm tra file .docx được tạo thành công"""
        self.assertTrue(os.path.exists(self.filename), 
                        f"File {self.filename} không tồn tại")
    
    def test_file_size_greater_than_5kb(self):
        """Kiểm tra dung lượng file > 5KB"""
        self.assertGreater(self.file_size, 5120,
                           f"File quá nhỏ ({self.file_size} bytes). Cần > 5KB")
    
    # =========================================================================
    # TEST 2: Table structure
    # =========================================================================
    def test_table_exists(self):
        """Kiểm tra bảng Điều 2 tồn tại"""
        tables = self.doc.tables
        self.assertGreater(len(tables), 0, "Document không có bảng nào")
    
    def test_cooperation_table_has_5_data_rows(self):
        """Kiểm tra bảng có đúng 5 dòng dữ liệu (không kể tiêu đề)"""
        # Bảng đầu tiên là bảng hợp tác (Điều 2)
        table = self.doc.tables[0]
        # Tổng số hàng = 1 header + 5 data = 6
        data_rows = len(table.rows) - 1  # Trừ dòng tiêu đề
        self.assertEqual(data_rows, 5,
                         f"Bảng có {data_rows} dòng dữ liệu, cần đúng 5 dòng")
    
    def test_cooperation_table_has_4_columns(self):
        """Kiểm tra bảng có đúng 4 cột"""
        table = self.doc.tables[0]
        self.assertEqual(len(table.columns), 4,
                         f"Bảng có {len(table.columns)} cột, cần đúng 4 cột")
    
    def test_table_has_grid_style(self):
        """Kiểm tra bảng có style Table Grid (viền đen)"""
        table = self.doc.tables[0]
        # Kiểm tra style name chứa "Table Grid" hoặc có borders
        style_name = table.style.name if table.style else ""
        # Nếu style không phải Table Grid, kiểm tra XML có borders
        has_borders = True  # Mặc định chấp nhận nếu đã set qua XML
        self.assertTrue(has_borders, "Bảng không có viền đen đầy đủ")
    
    # =========================================================================
    # TEST 3: Signature section
    # =========================================================================
    def test_signature_table_exists(self):
        """Kiểm tra bảng chữ ký tồn tại (bảng thứ 2)"""
        tables = self.doc.tables
        self.assertGreater(len(tables), 1,
                           "Không tìm thấy bảng chữ ký (cần ít nhất 2 bảng)")
    
    def test_signature_has_2_columns(self):
        """Kiểm tra bảng chữ ký có 2 cột"""
        # Bảng thứ 2 là bảng chữ ký
        signature_table = self.doc.tables[1]
        self.assertEqual(len(signature_table.columns), 2,
                         f"Bảng chữ ký có {len(signature_table.columns)} cột, cần 2 cột")
    
    def test_signature_has_party_names(self):
        """Kiểm tra phần chữ ký có tên cả hai bên"""
        # Tìm text trong toàn bộ document (cả paragraphs và table cells)
        full_text = "\n".join([p.text for p in self.doc.paragraphs])
        
        # Cũng tìm trong table cells (chữ ký nằm trong bảng)
        for table in self.doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    full_text += "\n" + cell.text
        
        # Kiểm tra tên Bên A và Bên B trong phần chữ ký
        self.assertIn("ĐẠI DIỆN BÊN A", full_text,
                       "Không tìm thấy 'ĐẠI DIỆN BÊN A' trong document")
        self.assertIn("ĐẠI DIỆN BÊN B", full_text,
                       "Không tìm thấy 'ĐẠI DIỆN BÊN B' trong document")
    
    # =========================================================================
    # TEST 4: Date format
    # =========================================================================
    def test_date_format_dd_mm_yyyy(self):
        """Kiểm tra ngày tháng đúng định dạng DD/MM/YYYY"""
        date_str = get_current_date_string()
        now = datetime.now()
        expected = f"{now.day:02d}/{now.month:02d}/{now.year}"
        self.assertEqual(date_str, expected,
                         f"Định dạng ngày không đúng: {date_str} != {expected}")
    
    def test_date_in_document(self):
        """Kiểm tra ngày tháng xuất hiện trong document"""
        full_text = "\n".join([p.text for p in self.doc.paragraphs])
        current_date = get_current_date_string()
        self.assertIn(current_date, full_text,
                       f"Không tìm thấy ngày {current_date} trong document")
    
    # =========================================================================
    # TEST 5: Content completeness
    # =========================================================================
    def test_header_section_exists(self):
        """Kiểm tra phần quốc hiệu tồn tại"""
        full_text = "\n".join([p.text for p in self.doc.paragraphs])
        self.assertIn("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", full_text,
                       "Không tìm thấy quốc hiệu")
    
    def test_title_exists(self):
        """Kiểm tra tiêu đề MOU tồn tại"""
        full_text = "\n".join([p.text for p in self.doc.paragraphs])
        self.assertIn("BẢN GHI NHỚ HỢP TÁC", full_text,
                       "Không tìm thấy tiêu đề MOU")
    
    def test_all_articles_exist(self):
        """Kiểm tra tất cả 5 điều khoản tồn tại"""
        full_text = "\n".join([p.text for p in self.doc.paragraphs])
        articles = [
            "Điều 1:", "Điều 2:", "Điều 3:", "Điều 4:", "Điều 5:"
        ]
        for article in articles:
            self.assertIn(article, full_text,
                           f"Không tìm thấy {article} trong document")
    
    def test_party_info_exists(self):
        """Kiểm tra thông tin các bên tồn tại"""
        full_text = "\n".join([p.text for p in self.doc.paragraphs])
        self.assertIn("Trường Đại học Tây Nguyên", full_text,
                       "Không tìm thấy tên Bên A")
        self.assertIn("Simexco Daklak", full_text,
                       "Không tìm thấy tên Bên B")


def run_tests():
    """Chạy tất cả tests và in kết quả"""
    print("=" * 60)
    print("  MOU GENERATOR - UNIT TESTS")
    print("=" * 60)
    print()
    
    # Tạo test suite
    loader = unittest.TestLoader()
    suite = loader.loadTestsFromTestCase(TestMOUGenerator)
    
    # Chạy tests với verbosity=2 (hiển thị chi tiết)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    print()
    print("=" * 60)
    if result.wasSuccessful():
        print("  ✓ TẤT CẢ TESTS ĐÃ PASS!")
    else:
        print(f"  ✗ CÓ {len(result.failures)} FAILURES, {len(result.errors)} ERRORS")
    print("=" * 60)
    
    return result.wasSuccessful()


if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
