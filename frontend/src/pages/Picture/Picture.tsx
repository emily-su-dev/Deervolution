import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios for API requests
import "./Picture.css"; 

const Picture: React.FC = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null); // Store the selected file
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [analyzedResult, setAnalyzedResult] = useState<string | null>(null); // Store API result
    const [loading, setLoading] = useState<boolean>(false); // Track loading state

    // Handle image selection
    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setSelectedFile(file); // Store the file for submission
            const imageURL = URL.createObjectURL(file);
            setPreviewImage(imageURL);
        }
    };

    // Open file picker when "Choose from Gallery" button is clicked
    const openFilePicker = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // Function to send image to API
    const submitImage = async () => {
        if (!selectedFile) {
            alert("Please upload an image first!");
            return;
        }

        setLoading(true); // Show loading state
        setAnalyzedResult(null); // Reset previous result

        const formData = new FormData();
        formData.append("image", selectedFile);

        try {
            const response = await axios.post("http://localhost:8000/analyze-image", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setAnalyzedResult(response.data.result); // Store the returned animal name
        } catch (error) {
            console.error("Error analyzing image:", error);
            setAnalyzedResult("Error analyzing image. Please try again.");
        } finally {
            setLoading(false); // Hide loading state
        }
    };

    return (
        <div className="picture-container">
            {/* Back Button */}
            <button className="back-button" onClick={() => navigate("/activity")}>🔙 Back</button>

            {/* Page Title */}
            <h1 className="title">📸 Capture Your Animal Sighting</h1>
            <p className="subtitle">Upload a picture of the animal you found!</p>

            {/* Camera Input */}
            <div className="button-group">
                <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageChange}
                    className="hidden-input"
                />
                <button className="upload-button" onClick={openFilePicker}>📂 Choose from Gallery</button>
            </div>

            {/* Hidden File Input for Gallery Upload */}
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden-input"
            />

            {/* Preview Uploaded Image */}
            {previewImage && <img src={previewImage} alt="Uploaded" className="preview-image" />}

            {/* Submit Button */}
            {previewImage && !loading && (
                <button className="submit-button" onClick={submitImage}>📤 Submit for Analysis</button>
            )}

            {/* Loading Indicator */}
            {loading && <p className="loading-text">⏳ Analyzing image...</p>}

            {/* Display Analyzed Result */}
            {analyzedResult && <p className="result-text">🦉 This is a <strong>{analyzedResult}</strong></p>}
        </div>
    );
};

export default Picture;
