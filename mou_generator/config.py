"""
config.py - Cấu hình và hằng số cho MOU Generator
Chứa tất cả các hằng số, thông tin các bên, và dữ liệu bảng hợp tác.
"""

from datetime import datetime

# =============================================================================
# FONT & STYLE CONFIGURATION
# =============================================================================

# Font chính sử dụng trong document
FONT_PRIMARY = "Times New Roman"

# Font dự phòng nếu Times New Roman không khả dụng
FONT_FALLBACK = "Arial"  # hoặc "Calibri"

# Kích thước chữ
FONT_SIZE_BODY = 13        # Cỡ chữ nội dung
FONT_SIZE_TITLE = 16       # Cỡ chữ tiêu đề chính (in đậm)
FONT_SIZE_HEADER = 12      # Cỡ chữ dòng quốc hiệu

# =============================================================================
# PAGE LAYOUT
# =============================================================================

# Margins (đơn vị: cm)
MARGIN_TOP = 2.5
MARGIN_BOTTOM = 2.5
MARGIN_LEFT = 2.5
MARGIN_RIGHT = 2.5

# =============================================================================
# PARTY INFORMATION - THÔNG TIN CÁC BÊN
# =============================================================================

PARTY_A = {
    "name": "Trường Đại học Tây Nguyên",
    "address": "Số 567, Lê Duẩn, P. Ea Kao, TP. Buôn Ma Thuột, Đắk Lắk",
    "representative": "Hiệu trưởng hoặc Phó Hiệu trưởng được ủy quyền",
    "sign_label": "ĐẠI DIỆN BÊN A"
}

PARTY_B = {
    "name": "Công ty TNHH MTV Xuất nhập khẩu 2-9 Đắk Lắk",
    "short_name": "Simexco Daklak",
    "address": "23 Ngô Quyền, P. Thắng Lợi, TP. Buôn Ma Thuột, Đắk Lắk",
    "representative": "Giám đốc điều hành hoặc Giám đốc",
    "sign_label": "ĐẠI DIỆN BÊN B"
}

# =============================================================================
# LEGAL BASIS - CĂN CỨ PHÁP LÝ
# =============================================================================

LEGAL_BASIS = [
    "Căn cứ Bộ Luật Dân sự số 91/2015/QH13 ngày 24/11/2015;",
    "Căn cứ Luật Giáo dục đại học số 125/2025/QH15 được Quốc hội thông qua ngày 10/12/2025, có hiệu lực từ ngày 01/01/2026;",
    "Căn cứ nhu cầu và năng lực hợp tác giữa hai bên trong việc thúc đẩy hệ sinh thái khởi nghiệp, đổi mới sáng tạo và phát triển nguồn nhân lực chất lượng cao."
]

# =============================================================================
# COOPERATION TABLE DATA - DỮ LIỆU BẢNG ĐIỀU 2
# =============================================================================

COOPERATION_TABLE_HEADERS = ["STT", "Lĩnh vực", "Cam kết của Bên A\n(Đại học Tây Nguyên)", "Cam kết của Bên B\n(Simexco)"]

COOPERATION_TABLE_DATA = [
    {
        "stt": "1",
        "field": "Đào tạo & Chia sẻ chuyên môn",
        "party_a": "Tổ chức workshop, talkshow, tọa đàm theo nhu cầu của Bên B",
        "party_b": "Cử diễn giả tham gia tối thiểu 2 lần/năm học; chia sẻ thực tế về xu hướng khởi nghiệp"
    },
    {
        "stt": "2",
        "field": "Thực tập & Phát triển nguồn nhân lực",
        "party_a": "Giới thiệu sinh viên xuất sắc của CLB Khởi nghiệp đến Bên B",
        "party_b": "Tiếp nhận sinh viên kiến tập, thực tập; dành quota thực tập đặc cách; ưu tiên tuyển dụng sinh viên tốt nghiệp loại Giỏi trở lên"
    },
    {
        "stt": "3",
        "field": "Trải nghiệm doanh nghiệp",
        "party_a": "Bố trí mặt bằng, vị trí, nhân sự hướng dẫn",
        "party_b": "Hỗ trợ gian hàng trải nghiệm (quầy kệ, sản phẩm mẫu, nhân sự) tại các sự kiện của Nhà trường"
    },
    {
        "stt": "4",
        "field": "Tư vấn & Hỗ trợ dự án khởi nghiệp",
        "party_a": "Giới thiệu các dự án khởi nghiệp tiềm năng của sinh viên",
        "party_b": "Cử chuyên gia/cố vấn góp ý, hỗ trợ phát triển dự án; kết nối đầu ra cho dự án khả thi"
    },
    {
        "stt": "5",
        "field": "Truyền thông & Hợp tác phát triển",
        "party_a": "Đưa tin, quảng bá hoạt động hợp tác trên các kênh truyền thông của Nhà trường",
        "party_b": "Được phép sử dụng logo, hình ảnh của Nhà trường trên các ấn phẩm truyền thông liên quan đến hoạt động hợp tác"
    }
]

# =============================================================================
# ARTICLE CONTENT - NỘI DUNG CÁC ĐIỀU KHOẢN
# =============================================================================

ARTICLE_1 = {
    "title": "Điều 1: ĐỐI TƯỢNG, MỤC TIÊU VÀ PHẠM VI HỢP TÁC",
    "items": [
        "1.1. Đối tượng: Hợp tác trong lĩnh vực giáo dục, đào tạo, nghiên cứu khoa học và chuyển giao công nghệ.",
        "1.2. Mục tiêu: Xây dựng đối tác chiến lược, kết nối lý thuyết giảng đường với thực tiễn doanh nghiệp.",
        "1.3. Phạm vi: Các nội dung chi tiết tại Điều 2."
    ]
}

ARTICLE_3 = {
    "title": "Điều 3: THỜI HẠN, HIỆU LỰC VÀ CHẤM DỨT",
    "items": [
        "Thời hạn: 02 (hai) năm, kể từ ngày ký. Tự động gia hạn từng năm nếu không có thông báo chấm dứt.",
        "Sửa đổi, bổ sung: Phải lập thành văn bản và có chữ ký của đại diện có thẩm quyền của cả hai bên.",
        "Chấm dứt hợp tác: Mỗi bên có quyền chấm dứt hiệu lực của Bản ghi nhớ này bằng văn bản thông báo trước ít nhất 30 ngày."
    ]
}

ARTICLE_4 = {
    "title": "Điều 4: ĐIỀU KHOẢN CHUNG",
    "content": [
        "Bản ghi nhớ này không phải là hợp đồng ràng buộc pháp lý về mặt thương mại hoặc tài chính.",
        "Điều khoản về bảo mật thông tin, sở hữu trí tuệ phát sinh trong quá trình hợp tác sẽ được quy định cụ thể trong các hợp đồng/phụ lục kèm theo."
    ]
}

ARTICLE_5 = {
    "title": "Điều 5: CAM KẾT CỦA CÁC BÊN",
    "content": "Hai bên cam kết thực hiện đúng các nội dung đã thỏa thuận trong Bản ghi nhớ hợp tác này, luôn làm việc trên tinh thần thiện chí, tôn trọng, bình đẳng và cùng có lợi."
}

# =============================================================================
# OUTPUT CONFIGURATION
# =============================================================================

def get_output_filename():
    """Tạo tên file output với ngày tháng hiện tại"""
    now = datetime.now()
    return f"MOU_DHTN_Simexco_{now.day:02d}_{now.month:02d}_{now.year}.docx"

def get_current_date_string():
    """Lấy ngày tháng hiện tại định dạng DD/MM/YYYY"""
    now = datetime.now()
    return f"{now.day:02d}/{now.month:02d}/{now.year}"
