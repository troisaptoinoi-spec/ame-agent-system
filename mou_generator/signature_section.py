"""
signature_section.py - Phần chữ ký cuối file MOU
Tạo bảng 2 cột cho chữ ký của Bên A và Bên B,
kèm theo dòng ngày tháng và placeholder động.
"""

from docx.shared import Pt, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

from config import (
    FONT_PRIMARY, FONT_SIZE_BODY, FONT_SIZE_HEADER,
    PARTY_A, PARTY_B, get_current_date_string
)
from styles import add_formatted_paragraph, set_cell_font


def add_signature_section(doc):
    """
    Tạo phần chữ ký dạng bảng 2 cột:
    - Cột trái: Đại diện Bên A (Trường Đại học Tây Nguyên)
    - Cột phải: Đại diện Bên B (Simexco Daklak)
    - Mỗi cột có: tiêu đề, tên tổ chức, ghi chú đại diện, dòng kẻ ký tên
    
    Args:
        doc: Document object
    """
    # Tạo bảng 2 cột, 6 hàng
    table = doc.add_table(rows=6, cols=2)
    
    # Loại bỏ viền cho bảng chữ ký (chỉ hiển thị nội dung)
    _remove_table_borders(table)
    
    # Căn giữa bảng
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    
    # Thiết lập độ rộng cột đều nhau
    for row in table.rows:
        for idx, cell in enumerate(row.cells):
            cell.width = Cm(7.5)
    
    # --- HÀNG 0: Tiêu đề "ĐẠI DIỆN BÊN A" | "ĐẠI DIỆN BÊN B" ---
    set_cell_font(
        table.rows[0].cells[0], PARTY_A["sign_label"],
        font_name=FONT_PRIMARY, font_size=FONT_SIZE_BODY,
        bold=True, alignment=WD_ALIGN_PARAGRAPH.CENTER
    )
    set_cell_font(
        table.rows[0].cells[1], PARTY_B["sign_label"],
        font_name=FONT_PRIMARY, font_size=FONT_SIZE_BODY,
        bold=True, alignment=WD_ALIGN_PARAGRAPH.CENTER
    )
    
    # --- HÀNG 1: Tên tổ chức ---
    set_cell_font(
        table.rows[1].cells[0], PARTY_A["name"].upper(),
        font_name=FONT_PRIMARY, font_size=FONT_SIZE_BODY,
        bold=True, alignment=WD_ALIGN_PARAGRAPH.CENTER
    )
    set_cell_font(
        table.rows[1].cells[1], f"{PARTY_B['name'].upper()} ({PARTY_B['short_name'].upper()})",
        font_name=FONT_PRIMARY, font_size=FONT_SIZE_BODY,
        bold=True, alignment=WD_ALIGN_PARAGRAPH.CENTER
    )
    
    # --- HÀNG 2: Ghi chú đại diện ---
    set_cell_font(
        table.rows[2].cells[0], f"(Đại diện: {PARTY_A['representative']})",
        font_name=FONT_PRIMARY, font_size=FONT_SIZE_BODY - 1,
        bold=False, alignment=WD_ALIGN_PARAGRAPH.CENTER
    )
    set_cell_font(
        table.rows[2].cells[1], f"(Đại diện: {PARTY_B['representative']})",
        font_name=FONT_PRIMARY, font_size=FONT_SIZE_BODY - 1,
        bold=False, alignment=WD_ALIGN_PARAGRAPH.CENTER
    )
    
    # --- HÀNG 3: Dòng trống (khoảng cách cho chữ ký) ---
    set_cell_font(
        table.rows[3].cells[0], "",
        font_name=FONT_PRIMARY, font_size=FONT_SIZE_BODY,
        bold=False, alignment=WD_ALIGN_PARAGRAPH.CENTER
    )
    set_cell_font(
        table.rows[3].cells[1], "",
        font_name=FONT_PRIMARY, font_size=FONT_SIZE_BODY,
        bold=False, alignment=WD_ALIGN_PARAGRAPH.CENTER
    )
    
    # --- HÀNG 4: Dòng trống thêm (khoảng cách cho dấu) ---
    set_cell_font(
        table.rows[4].cells[0], "",
        font_name=FONT_PRIMARY, font_size=FONT_SIZE_BODY,
        bold=False, alignment=WD_ALIGN_PARAGRAPH.CENTER
    )
    set_cell_font(
        table.rows[4].cells[1], "",
        font_name=FONT_PRIMARY, font_size=FONT_SIZE_BODY,
        bold=False, alignment=WD_ALIGN_PARAGRAPH.CENTER
    )
    
    # --- HÀNG 5: Dòng ký tên (chữ ký & họ tên) ---
    set_cell_font(
        table.rows[5].cells[0], "Ký tên, họ tên",
        font_name=FONT_PRIMARY, font_size=FONT_SIZE_BODY,
        bold=False, alignment=WD_ALIGN_PARAGRAPH.CENTER
    )
    set_cell_font(
        table.rows[5].cells[1], "Ký tên, họ tên",
        font_name=FONT_PRIMARY, font_size=FONT_SIZE_BODY,
        bold=False, alignment=WD_ALIGN_PARAGRAPH.CENTER
    )
    
    # Thêm khoảng cách sau bảng chữ ký
    add_formatted_paragraph(doc, "", font_size=6, space_after=6)
    
    # --- DÒNG NGÀY THÁNG ---
    current_date = get_current_date_string()
    add_formatted_paragraph(
        doc,
        f"Ngày …… tháng …… năm …… (tại ………………)",
        font_size=FONT_SIZE_BODY,
        bold=False,
        alignment=WD_ALIGN_PARAGRAPH.CENTER,
        space_before=12,
        space_after=4
    )
    
    # Ghi chú ngày hiện tại (placeholder)
    add_formatted_paragraph(
        doc,
        f"[Ngày tạo văn bản: {current_date}]",
        font_size=FONT_SIZE_BODY - 2,
        bold=False,
        italic=True,
        alignment=WD_ALIGN_PARAGRAPH.CENTER,
        space_after=0
    )


def _remove_table_borders(table):
    """
    Loại bỏ viền cho bảng (dùng cho bảng chữ ký).
    
    Args:
        table: Table object
    """
    tbl = table._tbl
    tblPr = tbl.tblPr if tbl.tblPr is not None else OxmlElement('w:tblPr')
    
    borders = OxmlElement('w:tblBorders')
    
    for border_name in ['top', 'left', 'bottom', 'right', 'insideH', 'insideV']:
        border = OxmlElement(f'w:{border_name}')
        border.set(qn('w:val'), 'none')
        border.set(qn('w:sz'), '0')
        border.set(qn('w:space'), '0')
        border.set(qn('w:color'), 'auto')
        borders.append(border)
    
    tblPr.append(borders)
