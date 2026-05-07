"""
table_generator.py - Tạo bảng Điều 2: NỘI DUNG HỢP TÁC
Bảng 4 cột: STT | Lĩnh vực | Cam kết Bên A | Cam kết Bên B
5 dòng dữ liệu + 1 dòng tiêu đề, viền đen đầy đủ (Table Grid).
"""

from docx.shared import Pt, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

from config import (
    FONT_PRIMARY, FONT_SIZE_BODY,
    COOPERATION_TABLE_HEADERS, COOPERATION_TABLE_DATA
)
from styles import set_cell_font


def set_table_borders(table):
    """
    Thiết lập viền đen đầy đủ cho bảng.
    Sử dụng XML manipulation để đảm bảo viền hiển thị chính xác.
    
    Args:
        table: Table object của python-docx
    """
    tbl = table._tbl
    tblPr = tbl.tblPr if tbl.tblPr is not None else OxmlElement('w:tblPr')
    
    # Tạo element borders
    borders = OxmlElement('w:tblBorders')
    
    for border_name in ['top', 'left', 'bottom', 'right', 'insideH', 'insideV']:
        border = OxmlElement(f'w:{border_name}')
        border.set(qn('w:val'), 'single')
        border.set(qn('w:sz'), '4')      # Độ dày viền
        border.set(qn('w:space'), '0')
        border.set(qn('w:color'), '000000')  # Màu đen
        borders.append(border)
    
    tblPr.append(borders)


def set_cell_vertical_alignment(cell, align="center"):
    """
    Thiết lập căn lề dọc cho cell.
    
    Args:
        cell: Cell object
        align: "top", "center", hoặc "bottom"
    """
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    vAlign = OxmlElement('w:vAlign')
    vAlign.set(qn('w:val'), align)
    tcPr.append(vAlign)


def create_cooperation_table(doc):
    """
    Tạo bảng Điều 2 với cấu trúc:
    - 1 dòng tiêu đề (in đậm, nền xám nhạt)
    - 5 dòng dữ liệu
    - 4 cột: STT | Lĩnh vực | Cam kết Bên A | Cam kết Bên B
    - Viền đen đầy đủ (Table Grid style)
    
    Args:
        doc: Document object
    
    Returns:
        Table object đã tạo
    """
    # Số hàng = 1 header + 5 data rows = 6
    num_rows = 1 + len(COOPERATION_TABLE_DATA)
    num_cols = 4
    
    # Tạo bảng
    table = doc.add_table(rows=num_rows, cols=num_cols)
    
    # Thiết lập style Table Grid (viền đen)
    try:
        table.style = 'Table Grid'
    except KeyError:
        # Nếu style Table Grid không có sẵn, thiết lập viền thủ công
        print("[WARNING] Style 'Table Grid' không khả dụng, thiết lập viền thủ công")
        set_table_borders(table)
    
    # Căn giữa bảng
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    
    # Thiết lập độ rộng cột
    # Cột STT: 1.2cm, Lĩnh vực: 4cm, Bên A: 5.5cm, Bên B: 5.5cm
    col_widths = [Cm(1.2), Cm(4.0), Cm(5.5), Cm(5.5)]
    
    # --- DÒNG TIÊU ĐỀ ---
    header_row = table.rows[0]
    for idx, (header_text, width) in enumerate(zip(COOPERATION_TABLE_HEADERS, col_widths)):
        cell = header_row.cells[idx]
        cell.width = width
        
        # Set font cho tiêu đề (in đậm, căn giữa)
        set_cell_font(
            cell, header_text,
            font_name=FONT_PRIMARY,
            font_size=FONT_SIZE_BODY,
            bold=True,
            alignment=WD_ALIGN_PARAGRAPH.CENTER
        )
        
        # Căn lề dọc giữa
        set_cell_vertical_alignment(cell, "center")
        
        # Tô nền xám nhạt cho tiêu đề
        _set_cell_shading(cell, "D9E2F3")
    
    # --- CÁC DÒNG DỮ LIỆU ---
    for row_idx, row_data in enumerate(COOPERATION_TABLE_DATA):
        row = table.rows[row_idx + 1]  # +1 vì dòng 0 là header
        
        # Cột 1: STT
        set_cell_font(
            row.cells[0], row_data["stt"],
            font_name=FONT_PRIMARY,
            font_size=FONT_SIZE_BODY,
            bold=False,
            alignment=WD_ALIGN_PARAGRAPH.CENTER
        )
        row.cells[0].width = col_widths[0]
        set_cell_vertical_alignment(row.cells[0], "center")
        
        # Cột 2: Lĩnh vực
        set_cell_font(
            row.cells[1], row_data["field"],
            font_name=FONT_PRIMARY,
            font_size=FONT_SIZE_BODY,
            bold=False,
            alignment=WD_ALIGN_PARAGRAPH.LEFT
        )
        row.cells[1].width = col_widths[1]
        set_cell_vertical_alignment(row.cells[1], "center")
        
        # Cột 3: Cam kết Bên A
        set_cell_font(
            row.cells[2], row_data["party_a"],
            font_name=FONT_PRIMARY,
            font_size=FONT_SIZE_BODY,
            bold=False,
            alignment=WD_ALIGN_PARAGRAPH.JUSTIFY
        )
        row.cells[2].width = col_widths[2]
        set_cell_vertical_alignment(row.cells[2], "center")
        
        # Cột 4: Cam kết Bên B
        set_cell_font(
            row.cells[3], row_data["party_b"],
            font_name=FONT_PRIMARY,
            font_size=FONT_SIZE_BODY,
            bold=False,
            alignment=WD_ALIGN_PARAGRAPH.JUSTIFY
        )
        row.cells[3].width = col_widths[3]
        set_cell_vertical_alignment(row.cells[3], "center")
    
    return table


def _set_cell_shading(cell, color_hex):
    """
    Thiết lập màu nền cho cell.
    
    Args:
        cell: Cell object
        color_hex: Mã màu hex (ví dụ: "D9E2F3" cho xám nhạt)
    """
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    shading = OxmlElement('w:shd')
    shading.set(qn('w:fill'), color_hex)
    shading.set(qn('w:val'), 'clear')
    tcPr.append(shading)
