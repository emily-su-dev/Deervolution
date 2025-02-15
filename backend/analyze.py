from PIL import Image
import os
from model_loader import classifier

# Load and preprocess an image
image_path = os.environ.get('IMAGE_PATH')
if not image_path:
    raise ValueError("IMAGE_PATH environment variable must be set")

image = Image.open(image_path).convert("RGB")
result = classifier.predict(image)

if result:
    print(result)
else:
    print("No prediction made - confidence too low")
