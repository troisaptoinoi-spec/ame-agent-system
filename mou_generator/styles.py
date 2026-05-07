"""
styles.py - Quan ly Font va Styles cho MOU Document
Xu ly viec thiet lap font chu, kiem tra font kha dung, va tao styles.
"""

import sys
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

from docx.shared import Pt, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

from config import FONT_PRIMARY, FONT_FALLBACK, FONT_SIZE_BODY, FONT_SIZE_TITLE, FONT_SIZE_HEADER


def get_available_font():
    """
    Kiểm tra font khả dụng trên hệ thống.
    Trả về font chính (Times New Roman) nếu có, nếu không thì fallback.
    
    NOTE: python-docx không có API kiểm tra font trực tiếp.
    Chúng ta luôn set Times New Roman và để Word tự fallback nếu cần.
    """
    # python-docx chỉ ghi tên font vào XML, Word sẽ tự động fallback nếu font không có
    # Chúng ta ưu tiên Times New Roman, ghi warning nếu cần
    print(f"[INFO] Sử dụng font chính: {FONT_PRIMARY}")
    print(f"[INFO] Font dự phòng (fallback): {FONT_FALLBACK}")
    return FONT_PRIMARY


def set_default_font(doc):
    """
    Thiết lập font mặc định cho toàn bộ document.
    Áp dụng cho style 'Normal' của document.
    
    Args:
        doc: Document object của python-docx
    """
    font_name = get_available_font()
    
    # Thiết lập font cho style Normal
    style = doc.styles['Normal']
    font = style.font
    font.name = font_name
    font.size = Pt(FONT_SIZE_BODY)
    
    # Thiết lập font cho tiếng Việt (East Asian font)
    # Cần set qua XML vì python-docx không hỗ trợ trực tiếp
    rPr = style.element.get_or_add_rPr()
    rFonts = rPr.find(qn('w:rFonts'))
    if rFonts is None:
        rFonts = OxmlElement('w:rFonts')
        rPr.insert(0, rFonts)
    rFonts.set(qn('w:eastAsia'), font_name)
    
    # Thiết lập paragraph spacing mặc định
    pf = style.paragraph_format
    pf.space_before = Pt(0)
    pf.space_after = Pt(6)
    pf.line_spacing = 1.15
    
    return style


def set_paragraph_font(paragraph, font_name=None, font_size=None, bold=False, italic=False, alignment=None):
    """
    Thiết lập font cho một paragraph cụ thể.
    
    Args:
        paragraph: Paragraph object
        font_name: Tên font (mặc định: FONT_PRIMARY)
        font_size: Cỡ chữ (mặc định: FONT_SIZE_BODY)
        bold: In đậm (mặc định: False)
        italic: In nghiêng (mặc định: False)
        alignment: Căn lề (mặc định: None - giữ nguyên)
    """
    if font_name is None:
        font_name = FONT_PRIMARY
    if font_size is None:
        font_size = FONT_SIZE_BODY
    
    if alignment is not None:
        paragraph.alignment = alignment
    
    for run in paragraph.runs:
        run.font.name = font_name
        run.font.size = Pt(font_size)
        run.font.bold = bold
        run.font.italic = italic
        
        # Set East Asian font cho tiếng Việt
        rPr = run._element.get_or_add_rPr()
        rFonts = rPr.find(qn('w:rFonts'))
        if rFonts is None:
            rFonts = OxmlElement('w:rFonts')
            rPr.insert(0, rFonts)
        rFonts.set(qn('w:eastAsia'), font_name)


def add_formatted_paragraph(doc, text, font_name=None, font_size=None, bold=False, 
                            italic=False, alignment=None, space_before=None, 
                            space_after=None, first_line_indent=None):
    """
    Thêm paragraph với định dạng cụ thể.
    
    Args:
        doc: Document object
        text: Nội dung văn bản
        font_name: Tên font
        font_size: Cỡ chữ
        bold: In đậm
        italic: In nghiêng
        alignment: Căn lề
        space_before: Khoảng cách trước (Pt)
        space_after: Khoảng cách sau (Pt)
        first_line_indent: Thụt lề dòng đầu (Cm)
    
    Returns:
        Paragraph object đã tạo
    """
    if font_name is None:
        font_name = FONT_PRIMARY
    if font_size is None:
        font_size = FONT_SIZE_BODY
    
    paragraph = doc.add_paragraph()
    
    # Thiết lập alignment
    if alignment is not None:
        paragraph.alignment = alignment
    
    # Thiết lập spacing
    pf = paragraph.paragraph_format
    if space_before is not None:
        pf.space_before = Pt(space_before)
    if space_after is not None:
        pf.space_after = Pt(space_after)
    if first_line_indent is not None:
        pf.first_line_indent = Cm(first_line_indent)
    
    # Thêm run với font
    run = paragraph.add_run(text)
    run.font.name = font_name
    run.font.size = Pt(font_size)
    run.font.bold = bold
    run.font.italic = italic
    
    # Set East Asian font
    rPr = run._element.get_or_add_rPr()
    rFonts = rPr.find(qn('w:rFonts'))
    if rFonts is None:
        rFonts = OxmlElement('w:rFonts')
        rPr.insert(0, rFonts)
    rFonts.set(qn('w:eastAsia'), font_name)
    
    return paragraph


def set_cell_font(cell, text, font_name=None, font_size=None, bold=False, alignment=None):
    """
    Thiết lập font cho cell trong bảng.
    
    Args:
        cell: Cell object trong table
        text: Nội dung văn bản
        font_name: Tên font
        font_size: Cỡ chữ
        bold: In đậm
        alignment: Căn lề
    """
    if font_name is None:
        font_name = FONT_PRIMARY
    if font_size is None:
        font_size = FONT_SIZE_BODY
    
    # Xóa nội dung mặc định
    cell.text = ""
    
    # Tạo paragraph mới trong cell
    paragraph = cell.paragraphs[0]
    if alignment is not None:
        paragraph.alignment = alignment
    
    run = paragraph.add_run(text)
    run.font.name = font_name
    run.font.size = Pt(font_size)
    run.font.bold = bold
    
    # Set East Asian font
    rPr = run._element.get_or_add_rPr()
    rFonts = rPr.find(qn('w:rFonts'))
    if rFonts is None:
        rFonts = OxmlElement('w:rFonts')
        rPr.insert(0, rFonts)
    rFonts.set(qn('w:eastAsia'), font_name)
