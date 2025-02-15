from transformers import AutoModelForImageClassification, AutoFeatureExtractor
import torch

class AnimalClassifier:
    def __init__(self):
        self.model_name = "daniyalb/utm-animal-detect"
        self.model = AutoModelForImageClassification.from_pretrained(self.model_name)
        self.feature_extractor = AutoFeatureExtractor.from_pretrained(self.model_name)
        self.confidence_threshold = 0.80

    def predict(self, image):
        # Preprocess the image
        inputs = self.feature_extractor(images=image, return_tensors="pt")

        # Perform inference
        with torch.no_grad():
            outputs = self.model(**inputs)

        # Apply softmax to get probabilities
        probabilities = torch.nn.functional.softmax(outputs.logits, dim=-1)
        confidence = probabilities.max().item()

        # Only show prediction if confidence is above threshold
        if confidence >= self.confidence_threshold:
            predicted_class = outputs.logits.argmax(-1).item()
            return self.model.config.id2label[predicted_class]
        
        return None

# Create a singleton instance
classifier = AnimalClassifier() 