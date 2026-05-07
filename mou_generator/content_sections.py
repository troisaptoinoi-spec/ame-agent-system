"""
content_sections.py - Các phần nội dung MOU
Bao gồm: Header (Quốc hiệu), Tiêu đề, Căn cứ pháp lý, 
Thông tin các bên, và các Điều khoản (1, 3, 4, 5).
"""

from docx.enum.text import WD_ALIGN_PARAGRAPH

from config import (
    FONT_PRIMARY, FONT_SIZE_BODY, FONT_SIZE_TITLE, FONT_SIZE_HEADER,
    PARTY_A, PARTY_B, LEGAL_BASIS,
    ARTICLE_1, ARTICLE_3, ARTICLE_4, ARTICLE_5
)
from styles import add_formatted_paragraph


def add_header_section(doc):
    """
    PHẦN 1: TẠO TIÊU ĐỀ QUỐC HIỆU
    Thêm dòng "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM – Độc lập – Tự do – Hạnh phúc"
    Căn giữa, cỡ chữ 12, không in đậm.
    """
    # Dòng 1: CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
    add_formatted_paragraph(
        doc, 
        "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM",
        font_size=FONT_SIZE_HEADER,
        bold=False,
        alignment=WD_ALIGN_PARAGRAPH.CENTER,
        space_after=0
    )
    
    # Dòng 2: Độc lập – Tự do – Hạnh phúc
    add_formatted_paragraph(
        doc,
        "Độc lập – Tự do – Hạnh phúc",
        font_size=FONT_SIZE_HEADER,
        bold=False,
        alignment=WD_ALIGN_PARAGRAPH.CENTER,
        space_after=12
    )


def add_title_section(doc):
    """
    PHẦN 2: TẠO TIÊU ĐỀ CHÍNH
    "BẢN GHI NHỚ HỢP TÁC (MOU)"
    Căn giữa, cỡ chữ 16, in đậm.
    """
    add_formatted_paragraph(
        doc,
        "BẢN GHI NHỚ HỢP TÁC (MOU)",
        font_size=FONT_SIZE_TITLE,
        bold=True,
        alignment=WD_ALIGN_PARAGRAPH.CENTER,
        space_before=12,
        space_after=6
    )
    
    # Dòng phụ: Giữa hai bên
    add_formatted_paragraph(
        doc,
        f"Giữa {PARTY_A['name']} và {PARTY_B['name']} ({PARTY_B['short_name']})",
        font_size=FONT_SIZE_BODY,
        bold=True,
        alignment=WD_ALIGN_PARAGRAPH.CENTER,
        space_after=12
    )


def add_legal_basis(doc):
    """
    PHẦN 3: THÊM CĂN CỨ PHÁP LÝ
    Liệt kê các căn cứ pháp luật làm cơ sở cho MOU.
    """
    for basis in LEGAL_BASIS:
        add_formatted_paragraph(
            doc,
            basis,
            font_size=FONT_SIZE_BODY,
            bold=False,
            alignment=WD_ALIGN_PARAGRAPH.JUSTIFY,
            space_after=4
        )


def add_party_info(doc):
    """
    PHẦN 4: THÊM THÔNG TIN CÁC BÊN
    Hiển thị tên và địa chỉ của Bên A và Bên B.
    """
    # Tiêu đề nhỏ
    add_formatted_paragraph(
        doc,
        "THÔNG TIN CÁC BÊN:",
        font_size=FONT_SIZE_BODY,
        bold=True,
        space_before=12,
        space_after=6
    )
    
    # Bên A
    add_formatted_paragraph(
        doc,
        f"- Bên A: {PARTY_A['name']} (Địa chỉ: {PARTY_A['address']})",
        font_size=FONT_SIZE_BODY,
        bold=False,
        alignment=WD_ALIGN_PARAGRAPH.JUSTIFY,
        space_after=4
    )
    
    # Bên B
    add_formatted_paragraph(
        doc,
        f"- Bên B: {PARTY_B['name']} ({PARTY_B['short_name']} – Địa chỉ: {PARTY_B['address']})",
        font_size=FONT_SIZE_BODY,
        bold=False,
        alignment=WD_ALIGN_PARAGRAPH.JUSTIFY,
        space_after=8
    )


def add_article_1(doc):
    """
    PHẦN 5: ĐIỀU 1 - ĐỐI TƯỢNG, MỤC TIÊU VÀ PHẠM VI HỢP TÁC
    """
    # Tiêu đề điều
    add_formatted_paragraph(
        doc,
        ARTICLE_1["title"],
        font_size=FONT_SIZE_BODY,
        bold=True,
        space_before=12,
        space_after=6
    )
    
    # Các mục con
    for item in ARTICLE_1["items"]:
        add_formatted_paragraph(
            doc,
            item,
            font_size=FONT_SIZE_BODY,
            bold=False,
            alignment=WD_ALIGN_PARAGRAPH.JUSTIFY,
            space_after=4,
            first_line_indent=1.0
        )


def add_article_2_title(doc):
    """
    PHẦN 6: TIÊU ĐỀ ĐIỀU 2 - NỘI DUNG HỢP TÁC
    (Bảng sẽ được thêm bởi table_generator)
    """
    add_formatted_paragraph(
        doc,
        "Điều 2: NỘI DUNG HỢP TÁC",
        font_size=FONT_SIZE_BODY,
        bold=True,
        space_before=12,
        space_after=6
    )


def add_article_3(doc):
    """
    PHẦN 7: ĐIỀU 3 - THỜI HẠN, HIỆU LỰC VÀ CHẤM DỨT
    """
    add_formatted_paragraph(
        doc,
        ARTICLE_3["title"],
        font_size=FONT_SIZE_BODY,
        bold=True,
        space_before=12,
        space_after=6
    )
    
    for item in ARTICLE_3["items"]:
        add_formatted_paragraph(
            doc,
            f"- {item}",
            font_size=FONT_SIZE_BODY,
            bold=False,
            alignment=WD_ALIGN_PARAGRAPH.JUSTIFY,
            space_after=4,
            first_line_indent=1.0
        )


def add_article_4(doc):
    """
    PHẦN 8: ĐIỀU 4 - ĐIỀU KHOẢN CHUNG
    """
    add_formatted_paragraph(
        doc,
        ARTICLE_4["title"],
        font_size=FONT_SIZE_BODY,
        bold=True,
        space_before=12,
        space_after=6
    )
    
    for content in ARTICLE_4["content"]:
        add_formatted_paragraph(
            doc,
            content,
            font_size=FONT_SIZE_BODY,
            bold=False,
            alignment=WD_ALIGN_PARAGRAPH.JUSTIFY,
            space_after=4,
            first_line_indent=1.0
        )


def add_article_5(doc):
    """
    PHẦN 9: ĐIỀU 5 - CAM KẾT CỦA CÁC BÊN
    """
    add_formatted_paragraph(
        doc,
        ARTICLE_5["title"],
        font_size=FONT_SIZE_BODY,
        bold=True,
        space_before=12,
        space_after=6
    )
    
    add_formatted_paragraph(
        doc,
        ARTICLE_5["content"],
        font_size=FONT_SIZE_BODY,
        bold=False,
        alignment=WD_ALIGN_PARAGRAPH.JUSTIFY,
        space_after=8,
        first_line_indent=1.0
    )


def add_signing_note(doc):
    """
    PHẦN 10: GHI CHÚ KÝ TÊN
    Dòng "(Ký tên, đóng dấu)" trước phần chữ ký.
    """
    add_formatted_paragraph(
        doc,
        "(Ký tên, đóng dấu)",
        font_size=FONT_SIZE_BODY,
        bold=False,
        italic=True,
        alignment=WD_ALIGN_PARAGRAPH.CENTER,
        space_before=12,
        space_after=12
    )
