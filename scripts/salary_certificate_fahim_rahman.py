"""Generate a salary certificate PDF for Western Wheelcraft.

Employee: Fahim Rahman — Operational Manager (CAD)
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    Image,
    HRFlowable,
)

# --- Brand palette (pulled from the Western Wheelcraft logo) ---
DARK = HexColor("#2b2b2b")
RED = HexColor("#b1112c")
GREY = HexColor("#555555")
LIGHT_GREY = HexColor("#888888")
RULE = HexColor("#cccccc")

LOGO_PATH = "public/images/logo.png"
OUTPUT = "Salary_Certificate_Fahim_Rahman.pdf"

# --- Certificate data ---
COMPANY_NAME = "Western Wheelcraft"
COMPANY_TAGLINE = "Mobile Wheel Refinishing Experts"
COMPANY_ADDRESS = "3756 Napier St, Burnaby, BC V5C 3E5"
COMPANY_EMAIL = "info@westernwheelcraft.ca"
COMPANY_PHONE = "(604) 710-6174"

REF_NO = "WW-HR-0042/2026"
ISSUE_DATE = "August 17, 2026"

EMP_NAME = "Fahim Rahman"
EMP_DESIGNATION = "Operational Manager (CAD)"
EMP_JOINING = "01 June 2025"
EMP_STATUS = "Full-Time / Permanent"
MONTHLY_SALARY = "CAD $5,500"


def build():
    doc = SimpleDocTemplate(
        OUTPUT,
        pagesize=letter,
        topMargin=0.6 * inch,
        bottomMargin=0.7 * inch,
        leftMargin=0.85 * inch,
        rightMargin=0.85 * inch,
        title="Salary Certificate - Fahim Rahman",
        author=COMPANY_NAME,
    )

    styles = {}
    styles["contact"] = ParagraphStyle(
        "contact", fontName="Helvetica", fontSize=8.5, leading=12,
        textColor=GREY, alignment=TA_LEFT,
    )
    styles["contact_label"] = ParagraphStyle(
        "contact_label", fontName="Helvetica-Bold", fontSize=8.5, leading=12,
        textColor=DARK,
    )
    styles["meta"] = ParagraphStyle(
        "meta", fontName="Helvetica-Bold", fontSize=9.5, leading=13, textColor=DARK,
    )
    styles["title"] = ParagraphStyle(
        "title", fontName="Helvetica-Bold", fontSize=17, leading=22,
        textColor=DARK, alignment=TA_CENTER, spaceBefore=6, spaceAfter=4,
    )
    styles["body"] = ParagraphStyle(
        "body", fontName="Helvetica", fontSize=10.5, leading=17,
        textColor=DARK, alignment=TA_LEFT,
    )
    styles["label"] = ParagraphStyle(
        "label", fontName="Helvetica", fontSize=10, leading=14, textColor=GREY,
    )
    styles["value"] = ParagraphStyle(
        "value", fontName="Helvetica-Bold", fontSize=10, leading=14, textColor=DARK,
    )
    styles["total_label"] = ParagraphStyle(
        "total_label", fontName="Helvetica-Bold", fontSize=11, leading=15, textColor=DARK,
    )
    styles["total_value"] = ParagraphStyle(
        "total_value", fontName="Helvetica-Bold", fontSize=11, leading=15, textColor=RED,
    )
    styles["note"] = ParagraphStyle(
        "note", fontName="Helvetica-Oblique", fontSize=9.5, leading=14, textColor=GREY,
    )
    styles["sig_name"] = ParagraphStyle(
        "sig_name", fontName="Helvetica-Bold", fontSize=10, leading=13, textColor=DARK,
    )
    styles["sig_sub"] = ParagraphStyle(
        "sig_sub", fontName="Helvetica", fontSize=9, leading=12, textColor=GREY,
    )
    styles["footer"] = ParagraphStyle(
        "footer", fontName="Helvetica", fontSize=7.5, leading=10,
        textColor=LIGHT_GREY, alignment=TA_CENTER,
    )

    story = []

    # --- Header: logo (left) + contact block (right) ---
    logo_w = 2.9 * inch
    logo_h = logo_w * (470.0 / 1400.0)
    logo = Image(LOGO_PATH, width=logo_w, height=logo_h)

    contact_html = (
        f'<font name="Helvetica-Bold" color="#2b2b2b">Address</font><br/>'
        f"{COMPANY_ADDRESS}<br/>"
        f'<font name="Helvetica-Bold" color="#2b2b2b">Email</font>&nbsp;&nbsp;{COMPANY_EMAIL}<br/>'
        f'<font name="Helvetica-Bold" color="#2b2b2b">Phone</font>&nbsp;&nbsp;{COMPANY_PHONE}'
    )
    contact = Paragraph(contact_html, styles["contact"])

    header = Table(
        [[logo, contact]],
        colWidths=[3.3 * inch, 3.5 * inch],
    )
    header.setStyle(
        TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("ALIGN", (1, 0), (1, 0), "RIGHT"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ])
    )
    story.append(header)
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=2.2, color=RED, spaceAfter=2))
    story.append(HRFlowable(width="100%", thickness=0.6, color=RULE, spaceAfter=12))

    # --- Ref + Date ---
    meta = Table(
        [[Paragraph(f"Ref: {REF_NO}", styles["meta"]),
          Paragraph(f"Date: {ISSUE_DATE}", styles["meta"])]],
        colWidths=[3.4 * inch, 3.4 * inch],
    )
    meta.setStyle(
        TableStyle([
            ("ALIGN", (1, 0), (1, 0), "RIGHT"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ])
    )
    story.append(meta)
    story.append(Spacer(1, 10))

    # --- Title ---
    story.append(Paragraph("Letter of Salary Certificate", styles["title"]))
    story.append(HRFlowable(width="34%", thickness=1.4, color=RED, spaceBefore=0, spaceAfter=14))

    # --- Body ---
    body_html = (
        f"This is to certify that <b>Mr. {EMP_NAME}</b> has been serving at "
        f"<b>{COMPANY_NAME}</b>, a mobile wheel refinishing company based in Burnaby, "
        f"British Columbia, as an <b>{EMP_DESIGNATION}</b> since <b>01st June 2025</b> "
        f"to date. He is currently working with us on a full-time basis and is drawing a "
        f"monthly salary as per the details mentioned below:"
    )
    story.append(Paragraph(body_html, styles["body"]))
    story.append(Spacer(1, 14))

    # --- Details table ---
    def row(label, value):
        return [Paragraph(label, styles["label"]), Paragraph(value, styles["value"])]

    details = [
        row("Name:", EMP_NAME),
        row("Designation:", EMP_DESIGNATION),
        row("Date of Joining:", EMP_JOINING),
        row("Employment Status:", EMP_STATUS),
        row("Monthly Salary:", MONTHLY_SALARY),
    ]

    detail_table = Table(details, colWidths=[2.1 * inch, 4.7 * inch])
    detail_table.setStyle(
        TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (0, -1), 8),
            ("LEFTPADDING", (1, 0), (1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LINEBELOW", (0, 0), (-1, -2), 0.4, RULE),
        ])
    )
    story.append(detail_table)

    # --- Total gross salary bar ---
    total = Table(
        [[Paragraph("Total Gross Monthly Salary", styles["total_label"]),
          Paragraph(MONTHLY_SALARY, styles["total_value"])]],
        colWidths=[2.1 * inch, 4.7 * inch],
    )
    total.setStyle(
        TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (0, -1), 8),
            ("LEFTPADDING", (1, 0), (1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("BACKGROUND", (0, 0), (-1, -1), HexColor("#f4f4f4")),
            ("LINEABOVE", (0, 0), (-1, 0), 1.0, DARK),
            ("LINEBELOW", (0, 0), (-1, 0), 1.0, DARK),
        ])
    )
    story.append(total)
    story.append(Spacer(1, 18))

    # --- Note ---
    story.append(Paragraph(
        "This salary certificate has been issued upon the request of the employee for "
        "official purposes.", styles["note"]))
    story.append(Spacer(1, 40))

    # --- Signature block ---
    story.append(Paragraph("Thanking you,", styles["body"]))
    story.append(Spacer(1, 48))  # blank space for the authorized signature

    sig = Table(
        [[HRFlowable(width=2.4 * inch, thickness=0.8, color=DARK, spaceAfter=4)],
         [Paragraph("Authorized Signature", styles["sig_name"])],
         [Paragraph("Human Resources Department", styles["sig_sub"])],
         [Paragraph(COMPANY_NAME, styles["sig_sub"])]],
        colWidths=[2.6 * inch],
    )
    sig.setStyle(
        TableStyle([
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 1),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
        ])
    )
    story.append(sig)

    # --- Footer ---
    def footer(canvas, d):
        canvas.saveState()
        canvas.setStrokeColor(RULE)
        canvas.setLineWidth(0.5)
        canvas.line(d.leftMargin, 0.6 * inch, letter[0] - d.rightMargin, 0.6 * inch)
        canvas.setFont("Helvetica", 7.5)
        canvas.setFillColor(LIGHT_GREY)
        canvas.drawCentredString(
            letter[0] / 2.0, 0.42 * inch,
            f"{COMPANY_NAME}  •  {COMPANY_ADDRESS}  •  {COMPANY_PHONE}  •  {COMPANY_EMAIL}",
        )
        canvas.restoreState()

    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    print(f"Wrote {OUTPUT}")


if __name__ == "__main__":
    build()
