import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Picture.css"; // Import the CSS file

const Picture: React.FC = () => {
    const navigate = useNavigate(); // Navigation hook
    const fileInputRef = useRef<HTMLInputElement>(null); // Reference for file input
    const [previewImage, setPreviewImage] = useState<string | null>(null); // Preview uploaded image

    // Handle image selection
    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const imageURL = URL.createObjectURL(file); // Create preview URL
            setPreviewImage(imageURL);
        }
    };

    // Open file picker when "Choose from Gallery" button is clicked
    const openFilePicker = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
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
                    capture="environment" // Opens the camera by default
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
        </div>
    );
};

export default Picture;
