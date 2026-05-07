"""
document_builder.py - Xây dựng Document MOU hoàn chỉnh
Tổng hợp tất cả các module: styles, content_sections, table_generator, signature_section
để tạo ra file .docx hoàn chỉnh.
"""

from docx import Document
from docx.shared import Cm

from config import MARGIN_TOP, MARGIN_BOTTOM, MARGIN_LEFT, MARGIN_RIGHT
from styles import set_default_font
from content_sections import (
    add_header_section,
    add_title_section,
    add_legal_basis,
    add_party_info,
    add_article_1,
    add_article_2_title,
    add_article_3,
    add_article_4,
    add_article_5,
    add_signing_note
)
from table_generator import create_cooperation_table
from signature_section import add_signature_section


def setup_page_layout(doc):
    """
    Thiết lập layout trang: margins 2.5cm cho tất cả các cạnh.
    
    Args:
        doc: Document object
    """
    for section in doc.sections:
        section.top_margin = Cm(MARGIN_TOP)
        section.bottom_margin = Cm(MARGIN_BOTTOM)
        section.left_margin = Cm(MARGIN_LEFT)
        section.right_margin = Cm(MARGIN_RIGHT)


def build_mou_document():
    """
    Xây dựng toàn bộ document MOU.
    
    Quy trình:
    1. Tạo document mới
    2. Thiết lập layout trang (margins)
    3. Thiết lập font mặc định
    4. Thêm các phần nội dung theo thứ tự:
       - Header (Quốc hiệu)
       - Tiêu đề (BẢN GHI NHỚ HỢP TÁC)
       - Căn cứ pháp lý
       - Thông tin các bên
       - Điều 1: Đối tượng, mục tiêu, phạm vi
       - Điều 2: Nội dung hợp tác (BẢNG)
       - Điều 3: Thời hạn, hiệu lực
       - Điều 4: Điều khoản chung
       - Điều 5: Cam kết
       - Chữ ký
    
    Returns:
        Document object hoàn chỉnh
    """
    # Bước 1: Tạo document mới
    doc = Document()
    
    # Bước 2: Thiết lập layout trang
    setup_page_layout(doc)
    
    # Bước 3: Thiết lập font mặc định
    set_default_font(doc)
    
    # Bước 4: Thêm các phần nội dung
    
    # PHẦN 1: TIÊU ĐỀ QUỐC HIỆU
    add_header_section(doc)
    
    # PHẦN 2: TIÊU ĐỀ CHÍNH
    add_title_section(doc)
    
    # PHẦN 3: CĂN CỨ PHÁP LÝ
    add_legal_basis(doc)
    
    # PHẦN 4: THÔNG TIN CÁC BÊN
    add_party_info(doc)
    
    # PHẦN 5: ĐIỀU 1 - ĐỐI TƯỢNG, MỤC TIÊU, PHẠM VI
    add_article_1(doc)
    
    # PHẦN 6: ĐIỀU 2 - NỘI DUNG HỢP TÁC (BẢNG)
    add_article_2_title(doc)
    create_cooperation_table(doc)
    
    # PHẦN 7: ĐIỀU 3 - THỜI HẠN, HIỆU LỰC
    add_article_3(doc)
    
    # PHẦN 8: ĐIỀU 4 - ĐIỀU KHOẢN CHUNG
    add_article_4(doc)
    
    # PHẦN 9: ĐIỀU 5 - CAM KẾT
    add_article_5(doc)
    
    # PHẦN 10: GHI CHÚ KÝ TÊN
    add_signing_note(doc)
    
    # PHẦN 11: CHỮ KÝ
    add_signature_section(doc)
    
    return doc
