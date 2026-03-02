import io
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from typing import Dict, Any, List

DARK_BG = HexColor("#1a1a2e")
EMERALD = HexColor("#10b981")
AMBER = HexColor("#f59e0b")
RED = HexColor("#ef4444")
WHITE = HexColor("#ffffff")
GRAY = HexColor("#6b7280")

def _score_color(score: float) -> HexColor:
    if score >= 70:
        return EMERALD
    elif score >= 40:
        return AMBER
    return RED

def generate_pdf_report(
    stability_data: Dict[str, Any],
    stress_results: List[Dict[str, Any]],
    recommendations: List[Dict[str, Any]],
    member_count: int,
    exposure_count: int,
) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch)
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle("Title2", parent=styles["Title"], fontSize=20, spaceAfter=12)
    heading_style = ParagraphStyle("Heading", parent=styles["Heading2"], fontSize=14, spaceAfter=8)
    body_style = styles["BodyText"]

    elements = []

    elements.append(Paragraph("Community Financial Stability Report", title_style))
    elements.append(Spacer(1, 12))

    score = stability_data.get("stability_index", 0)
    components = stability_data.get("components", {})
    elements.append(Paragraph(f"<b>Stability Index: {score}/100</b>", heading_style))
    elements.append(Paragraph(f"Community Size: {member_count} members, {exposure_count} exposures", body_style))
    elements.append(Spacer(1, 8))

    elements.append(Paragraph("Stability Components", heading_style))
    comp_data = [["Component", "Value"]]
    comp_data.append(["Default Rate", f"{components.get('default_rate', 0)*100:.1f}%"])
    comp_data.append(["Avg Liquidity Ratio", f"{components.get('avg_liquidity_ratio', 0):.4f}"])
    comp_data.append(["Risk Concentration", f"{components.get('risk_concentration_index', 0):.4f}"])
    comp_data.append(["Network Resilience", f"{components.get('network_resilience_score', 0):.4f}"])

    table = Table(comp_data, colWidths=[3*inch, 2*inch])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), HexColor("#374151")),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
        ("GRID", (0, 0), (-1, -1), 0.5, GRAY),
    ]))
    elements.append(table)
    elements.append(Spacer(1, 16))

    if stress_results:
        elements.append(Paragraph("Stress Test Results", heading_style))
        stress_data = [["Scenario", "Avg Default %", "Worst Case %", "Stability"]]
        for sr in stress_results:
            stress_data.append([
                sr.get("scenario", ""),
                f"{sr.get('average_default_rate', 0)*100:.1f}%",
                f"{sr.get('worst_case_default_rate', 0)*100:.1f}%",
                f"{sr.get('average_stability_score', 0):.1f}",
            ])
        st_table = Table(stress_data, colWidths=[2*inch, 1.2*inch, 1.2*inch, 1.2*inch])
        st_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), HexColor("#374151")),
            ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
            ("ALIGN", (0, 0), (-1, -1), "LEFT"),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("GRID", (0, 0), (-1, -1), 0.5, GRAY),
        ]))
        elements.append(st_table)
        elements.append(Spacer(1, 16))

    if recommendations:
        elements.append(Paragraph("Policy Recommendations", heading_style))
        for i, rec in enumerate(recommendations, 1):
            elements.append(Paragraph(
                f"<b>{i}. {rec['title']}</b> (Impact: {rec['impact_score']})",
                body_style
            ))
            elements.append(Paragraph(rec["explanation"], body_style))
            elements.append(Spacer(1, 6))

    doc.build(elements)
    buffer.seek(0)
    return buffer.read()
