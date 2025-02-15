from transformers import AutoModelForImageClassification, AutoFeatureExtractor
import torch

class AnimalClassifier:
    _instance = None
    _model = None
    _feature_extractor = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AnimalClassifier, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if not self._model:
            self.model_name = "daniyalb/utm-animal-detect"
            self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
            self._model = AutoModelForImageClassification.from_pretrained(self.model_name).to(self.device)
            self._feature_extractor = AutoFeatureExtractor.from_pretrained(self.model_name)
            self.confidence_threshold = 0.80
            
            # Enable inference mode for better performance
            self._model.eval()
            torch.set_grad_enabled(False)

    def predict(self, image):
        # Preprocess the image
        inputs = self._feature_extractor(images=image, return_tensors="pt")

        # Perform inference
        with torch.no_grad():
            outputs = self._model(**inputs)

        # Apply softmax to get probabilities
        probabilities = torch.nn.functional.softmax(outputs.logits, dim=-1)
        confidence = probabilities.max().item()

        # Only show prediction if confidence is above threshold
        if confidence >= self.confidence_threshold:
            predicted_class = outputs.logits.argmax(-1).item()
            return self._model.config.id2label[predicted_class]
        
        return None

# Create a singleton instance
classifier = AnimalClassifier() 