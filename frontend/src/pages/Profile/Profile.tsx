import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext"; // Import authentication context
import "./Profile.css"; // Import CSS styles
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth(); // Get the logged-in user

    const [stats, setStats] = useState<{ [key: string]: number }>({
        Deer: 0,
        CanadaGoose: 0,
        Raccoon: 0,
        Squirrel: 0,
        Sparrow: 0,
    });

    useEffect(() => {
        if (!user) return; // Ensure user is logged in before making request

        const fetchProfileData = async () => {
            try {
                const response = await axios.get(`${VITE_BACKEND_URL}/profile/${encodeURIComponent(user.id)}`);
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

            {/* Profile Title */}
            <h1 className="profile-title">🐾 My Animal Sightings</h1>

            {/* Stats Section - Hardcoded Instead of Looping */}
            <div className="stats-container">
                <div className="stat-item">
                    <img src="/icons/deer.png" alt="Deer" className="animal-icon" />
                    <span className="animal-count">{stats.Deer}</span>
                </div>
                <div className="stat-item">
                    <img src="/icons/goose.png" alt="Canada Goose" className="animal-icon" />
                    <span className="animal-count">{stats.CanadaGoose}</span>
                </div>
                <div className="stat-item">
                    <img src="/icons/raccoon.png" alt="Raccoon" className="animal-icon" />
                    <span className="animal-count">{stats.Raccoon}</span>
                </div>
                <div className="stat-item">
                    <img src="/icons/squirrel.png" alt="Squirrel" className="animal-icon" />
                    <span className="animal-count">{stats.Squirrel}</span>
                </div>
                <div className="stat-item">
                    <img src="/icons/sparrow.png" alt="Sparrow" className="animal-icon" />
                    <span className="animal-count">{stats.Sparrow}</span>
                </div>
            </div>

        </div>
    );
};

export default Profile;
