import { useState, useRef, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as mobilenet from '@tensorflow-models/mobilenet';

export function ImageClassifier() {
  const [prediction, setPrediction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState<mobilenet.MobileNet | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize backend when component mounts
  useEffect(() => {
    const initializeTf = async () => {
      await tf.setBackend('webgl');
      console.log('TensorFlow backend initialized:', tf.getBackend());
    };
    initializeTf();
  }, []);

  // Load model on component mount
  const loadModel = async () => {
    try {
      setIsLoading(true);
      const loadedModel = await mobilenet.load();
      setModel(loadedModel);
    } catch (error) {
      console.error('Error loading model:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !model) return;

    try {
      setIsLoading(true);
      
      // Create an image element
      const img = new Image();
      img.src = URL.createObjectURL(file);
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Make prediction
      const predictions = await model.classify(img);
      
      if (predictions && predictions.length > 0) {
        setPrediction(predictions[0].className);
      }
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="image-classifier">
      <h2>Animal Classifier</h2>
      {!model && (
        <button onClick={loadModel} disabled={isLoading}>
          {isLoading ? 'Loading Model...' : 'Load Model'}
        </button>
      )}
      
      {model && (
        <>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isLoading}
          />
          {isLoading && <p>Processing image...</p>}
          {prediction && <p>Prediction: {prediction}</p>}
        </>
      )}
    </div>
  );
} 