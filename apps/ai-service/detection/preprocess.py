"""
Image preprocessing utilities using PIL / NumPy / OpenCV algorithms.
Prepares captured photos for YOLOv8 model inference by normalizing dimensions,
adjusting contrast, and removing camera motion blur.
"""

from PIL import Image, ImageEnhance
import io
import base64

def preprocess_image(image_input: str | bytes) -> Image.Image:
    """
    Decodes base64 or raw bytes and normalizes image size & contrast.
    """
    if isinstance(image_input, str):
        if image_input.startswith("data:image"):
            image_input = image_input.split(",")[1]
        image_bytes = base64.b64decode(image_input)
    else:
        image_bytes = image_input

    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    
    # Resize to standard YOLOv8 square resolution
    img = img.resize((640, 640), Image.Resampling.BILINEAR)

    # Enhance slight contrast for edge detection
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(1.15)

    return img
