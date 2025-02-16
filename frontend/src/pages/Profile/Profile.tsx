import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext"; // Import authentication context
import "./Profile.css"; // Import CSS styles
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

import logo from "../../assets/deervolution_logo.png";
import upper from "../../assets/deerv_upper_decor.png";

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth(); // Get the logged-in user

    const [stats, setStats] = useState<{ [key: string]: number }>({
        deer: 0,
        canadagoose: 0,
        raccoon: 0,
        squirrel: 0,
        sparrow: 0,
    });

    useEffect(() => {
        if (!user) return; // Ensure user is logged in before making request

        const fetchProfileData = async () => {
            try {
                const response = await axios.get(`${VITE_BACKEND_URL}/profile/${encodeURIComponent(user.id)}`, {
                    headers: {
                        'ngrok-skip-browser-warning': '69420'
                    }
                });
                setStats(response.data);
            } catch (error) {
                console.error("Error fetching profile data:", error);
            }
        };


        fetchProfileData();
    }, [user]);
    
    return (
        <div className="profile-container">
            {/* Back Button */}
            <button className="back-button" onClick={() => navigate("/activity")}>
                🔙 Back
            </button>
            
            {/* Upper Decorative Shape */}
            <img src={upper} alt="Upper Decor" className="upper-decor" />
            <img src={logo} alt="Deervolution Logo" className="logo" />

            {/* Profile Title */}
            <div className="title-container">
                <h1 className="profile-title">🐾 My Animal Sightings</h1>
            </div>

            {/* Stats Section - Hardcoded Instead of Looping */}
            <div className="stats-container-lvl1">
                <div className="stat-item">
                    <img src="/icons/deer.png" alt="Deer" className="animal-icon" />
                    <span className="animal-count">{stats.deer}</span>
                </div>
                <div className="stat-item">
                    <img src="/icons/goose.png" alt="Canada Goose" className="animal-icon" />
                    <span className="animal-count">{stats.canadagoose}</span>
                </div>
                <div className="stat-item">
                    <img src="/icons/raccoon.png" alt="Raccoon" className="animal-icon" />
                    <span className="animal-count">{stats.raccoon}</span>
                </div>
            </div>

            <div className="stats-container-lvl2">
                <div className="stat-item">
                    <img src="/icons/squirrel.png" alt="Squirrel" className="animal-icon" />
                    <span className="animal-count">{stats.squirrel}</span>
                </div>
                <div className="stat-item">
                    <img src="/icons/sparrow.png" alt="Sparrow" className="animal-icon" />
                    <span className="animal-count">{stats.sparrow}</span>
                </div>
            </div>

        </div>
    );
};

export default Profile;
