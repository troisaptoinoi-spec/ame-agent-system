"""
styles.py - Quản lý Font và Styles cho MOU Document
Xử lý việc thiết lập font chữ, kiểm tra font khả dụng, và tạo styles.
"""

import sys
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

from docx import Document
from docx.shared import Pt, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from docx.text.paragraph import Paragraph
from docx.table import _Cell

from config import FONT_PRIMARY, FONT_FALLBACK, FONT_SIZE_BODY, FONT_SIZE_TITLE, FONT_SIZE_HEADER


def get_available_font() -> str:
    """Kiểm tra font khả dụng trên hệ thống."""
    print(f"[INFO] Sử dụng font chính: {FONT_PRIMARY}")
    print(f"[INFO] Font dự phòng (fallback): {FONT_FALLBACK}")
    return FONT_PRIMARY


def _set_east_asian_font(element: OxmlElement, font_name: str) -> None:
    """Set East Asian font cho tiếng Việt qua XML."""
    rPr = element.get_or_add_rPr()
    rFonts = rPr.find(qn('w:rFonts'))
    if rFonts is None:
        rFonts = OxmlElement('w:rFonts')
        rPr.insert(0, rFonts)
    rFonts.set(qn('w:eastAsia'), font_name)


def set_default_font(doc: Document) -> None:
    """Thiết lập font mặc định cho toàn bộ document."""
    font_name = get_available_font()

    style = doc.styles['Normal']
    font = style.font
    font.name = font_name
    font.size = Pt(FONT_SIZE_BODY)

    _set_east_asian_font(style.element, font_name)

    pf = style.paragraph_format
    pf.space_before = Pt(0)
    pf.space_after = Pt(6)
    pf.line_spacing = 1.15


def set_paragraph_font(
    paragraph: Paragraph,
    font_name: str | None = None,
    font_size: int | None = None,
    bold: bool = False,
    italic: bool = False,
    alignment: int | None = None
) -> None:
    """Thiết lập font cho một paragraph cụ thể."""
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
        _set_east_asian_font(run._element, font_name)


def add_formatted_paragraph(
    doc: Document,
    text: str,
    font_name: str | None = None,
    font_size: int | None = None,
    bold: bool = False,
    italic: bool = False,
    alignment: int | None = None,
    space_before: int | None = None,
    space_after: int | None = None,
    first_line_indent: float | None = None
) -> Paragraph:
    """Thêm paragraph với định dạng cụ thể."""
    if font_name is None:
        font_name = FONT_PRIMARY
    if font_size is None:
        font_size = FONT_SIZE_BODY

    paragraph = doc.add_paragraph()

    if alignment is not None:
        paragraph.alignment = alignment

    pf = paragraph.paragraph_format
    if space_before is not None:
        pf.space_before = Pt(space_before)
    if space_after is not None:
        pf.space_after = Pt(space_after)
    if first_line_indent is not None:
        pf.first_line_indent = Cm(first_line_indent)

    run = paragraph.add_run(text)
    run.font.name = font_name
    run.font.size = Pt(font_size)
    run.font.bold = bold
    run.font.italic = italic
    _set_east_asian_font(run._element, font_name)

    return paragraph


def set_cell_font(
    cell: _Cell,
    text: str,
    font_name: str | None = None,
    font_size: int | None = None,
    bold: bool = False,
    alignment: int | None = None
) -> None:
    """Thiết lập font cho cell trong bảng."""
    if font_name is None:
        font_name = FONT_PRIMARY
    if font_size is None:
        font_size = FONT_SIZE_BODY

    cell.text = ""

    paragraph = cell.paragraphs[0]
    if alignment is not None:
        paragraph.alignment = alignment

    run = paragraph.add_run(text)
    run.font.name = font_name
    run.font.size = Pt(font_size)
    run.font.bold = bold
    _set_east_asian_font(run._element, font_name)
