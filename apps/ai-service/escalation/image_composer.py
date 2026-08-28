"""
Image Composer Engine (Pillow) for Automated Escalation Poster Generation.
Overlays official escalation badges, SLA deadline breach counters, and responsible
zone department handles onto original civic report photos.
"""

from PIL import Image, ImageDraw, ImageFont
import io
import base64
import requests

def compose_escalation_image(
    photo_url: str,
    complaint_number: str,
    zone_name: str,
    department: str,
    days_elapsed: int
) -> str:
    """
    Composites escalation overlay and returns base64 PNG data URI.
    """
    try:
        if photo_url.startswith("http"):
            resp = requests.get(photo_url, timeout=5)
            img = Image.open(io.BytesIO(resp.content)).convert("RGB")
        else:
            img = Image.new("RGB", (800, 600), color=(30, 41, 59))
    except Exception:
        img = Image.new("RGB", (800, 600), color=(30, 41, 59))

    img = img.resize((800, 600))
    draw = ImageDraw.Draw(img)

    # 1. Top Red Escalation Banner
    draw.rectangle([(0, 0), (800, 60)], fill=(220, 38, 38))
    draw.text((20, 18), "CIVICTRACK PUBLIC ESCALATION NOTICE", fill=(255, 255, 255))
    draw.text((620, 18), complaint_number, fill=(255, 255, 255))

    # 2. Overdue Warning Card Overlay
    draw.rectangle([(20, 80), (360, 140)], fill=(0, 0, 0, 200), outline=(220, 38, 38), width=2)
    draw.text((35, 90), f"CRITICAL: {days_elapsed} DAYS UNRESOLVED", fill=(239, 68, 68))
    draw.text((35, 115), "Exceeded 15-Day Public SLA Window", fill=(255, 255, 255))

    # 3. Bottom Department Tag Bar
    draw.rectangle([(0, 520), (800, 600)], fill=(15, 23, 42))
    draw.text((20, 535), f"Jurisdiction: {zone_name} • {department}", fill=(255, 255, 255))
    draw.text((20, 565), "Responsible Handle: @Jaipur_PWD_Official", fill=(245, 158, 11))
    draw.text((580, 550), "civictrack.org", fill=(148, 163, 184))

    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    b64_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{b64_str}"
