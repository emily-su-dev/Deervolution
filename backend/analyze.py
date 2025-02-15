#!/usr/bin/env python
from PIL import Image
import os
from model_loader import classifier

# Load and preprocess an image
image_path = os.environ.get('IMAGE_PATH')
if not image_path:
    raise ValueError("IMAGE_PATH environment variable must be set")

def preprocess_image(image_path, max_size=640):
    image = Image.open(image_path).convert("RGB")
    # Maintain aspect ratio while resizing
    if max(image.size) > max_size:
        ratio = max_size / max(image.size)
        new_size = tuple(int(dim * ratio) for dim in image.size)
        image = image.resize(new_size, Image.Resampling.BILINEAR)
    return image

image = preprocess_image(image_path)
result = classifier.predict(image)

if result:
    print(result)
else:
    print("No prediction made - confidence too low")
