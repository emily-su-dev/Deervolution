from transformers import AutoModelForImageClassification, AutoFeatureExtractor
from PIL import Image
import torch
import os

# Load the model and feature extractor
model_name = "daniyalb/utm-animal-detect"
model = AutoModelForImageClassification.from_pretrained(model_name)
feature_extractor = AutoFeatureExtractor.from_pretrained(model_name)

# Load and preprocess an image
image_path = os.environ.get('IMAGE_PATH')
if not image_path:
    raise ValueError("IMAGE_PATH environment variable must be set")
image = Image.open(image_path).convert("RGB")
inputs = feature_extractor(images=image, return_tensors="pt")

# Perform inference
with torch.no_grad():
    outputs = model(**inputs)

# Apply softmax to get probabilities
probabilities = torch.nn.functional.softmax(outputs.logits, dim=-1)
confidence = probabilities.max().item()

# Only show prediction if confidence is above 90%
if confidence >= 0.80:
    predicted_class = outputs.logits.argmax(-1).item()
    labels = model.config.id2label
    print(f"{labels[predicted_class]}")
else:
    print("No prediction made - confidence too low")
