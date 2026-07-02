from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.colors import black, grey
from io import BytesIO

def generate_resume_pdf(resume_lines):
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)

    width, height = A4
    x_margin = 50
    y = height - 60

    # =====================
    # NAME (BIG + BOLD)
    # =====================
    c.setFont("Helvetica-Bold", 20)
    c.setFillColor(black)
    c.drawString(x_margin, y, resume_lines[0])
    y -= 28

    # =====================
    # CONTACT DETAILS
    # =====================
    c.setFont("Helvetica", 10)
    c.setFillColor(grey)
    for line in resume_lines[1:4]:
        if line.strip():
            c.drawString(x_margin, y, line)
            y -= 14

    y -= 10
    c.line(x_margin, y, width - x_margin, y)
    y -= 25

    # =====================
    # CONTENT
    # =====================
    for line in resume_lines[4:]:
        line = line.strip()

        if not line:
            y -= 10
            continue

        # SECTION TITLES
        if line.isupper():
            c.setFont("Helvetica-Bold", 12)
            c.setFillColor(grey)
            c.drawString(x_margin, y, line)
            y -= 12
            c.line(x_margin, y, width - x_margin, y)
            y -= 18
            c.setFillColor(black)
            c.setFont("Helvetica", 11)
        else:
            c.drawString(x_margin, y, line)
            y -= 14

        if y < 60:
            c.showPage()
            c.setFont("Helvetica", 11)
            y = height - 60

    c.save()
    buffer.seek(0)
    return buffer