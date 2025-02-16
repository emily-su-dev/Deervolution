import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios for API requests
import "./Picture.css";
import logo from "../../assets/deervolution_logo.png";
import upper from "../../assets/deerv_upper_decor.png";
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

const Picture: React.FC = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null); // Store the selected file
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [analyzedResult, setAnalyzedResult] = useState<string | null>(null); // Store API result
    const [loading, setLoading] = useState<boolean>(false); // Track loading state
    const [canMakePosting, setCanMakePosting] = useState<boolean>(false);
    const [geoLocation, setGeoLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [timestamp, setTimestamp] = useState<string | null>(null);

    // Handle image selection
    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setSelectedFile(file); // Store the file for submission
            const imageURL = URL.createObjectURL(file);
            setPreviewImage(imageURL);

            // Get current timestamp
            setTimestamp(new Date().toLocaleString());

            // Get geolocation
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setGeoLocation({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        });
                    },
                    (error) => console.error("Geolocation error:", error)
                );
            }
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
        setCanMakePosting(false);

        const formData = new FormData();
        formData.append("image", selectedFile);

        try {
            const response = await axios.post(`${VITE_BACKEND_URL}/analyze-image`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                timeout: 60000, // 60 seconds (1 minute) timeout
            });

            let result = response.data.result;

            if (result === "No prediction made - confidence too low") {
                result = "Sorry, we couldn't confidently identify the animal. Try a clearer image!";
            } else {
                result = "This is a... " + result + "!";
                setCanMakePosting(true); // Allow posting if a valid prediction was made
            }

            setAnalyzedResult(result); // Store the returned animal name
        } catch (error) {
            console.error("Error analyzing image:", error);
            setAnalyzedResult("Error analyzing image. Please try again.");
        } finally {
            setLoading(false); // Hide loading state
        }
    };

    return (
        <div>
            {/* Back Button */}
            <button className="back-button" onClick={() => navigate("/activity")}>🔙 Back</button>

            {/* Upper Decorative Shape */}
            <img src={upper} alt="Upper Decor" className="upper-decor" />

            <div className="picture-container">
                <div>
                    <img src={logo} alt="Deervolution Logo" className={previewImage ? "logo-uploaded" : "logo"} />
                </div>

                {/* Page Title */}
                <div>
                    {!previewImage ? (
                        <div className="title-container">
                            <h1 className="title">📸 Capture Your Animal Sighting</h1>
                            <div className="subtitle-container">
                                <p className="subtitle">Upload a picture of the animal you found!</p>
                            </div>
                        </div>
                    ) : (
                        <div className="title-container">
                            <h1 className="title">📸 Capture Your Animal Sighting</h1>
                        </div>
                    )}
                </div>

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
                {loading && (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p className="loading-text">Analyzing image...</p>
                    </div>
                )}

                {/* Display Analyzed Result */}
                {analyzedResult && <p className="result-text">🦉 <strong>{analyzedResult}</strong></p>}

                {/* Show Time */}
                {timestamp && <p className="info-text">🕒 Current Time: {timestamp}</p>}

                {/* Show "Make Posting and Update Stats" button only if analysis is valid */}
                {canMakePosting && (
                    <button className="posting-button" onClick={() => navigate("/activity")}>📌 Make Posting and Update Stats!</button>
                )}
            </div>
        </div>
    );
};

export default Picture;
