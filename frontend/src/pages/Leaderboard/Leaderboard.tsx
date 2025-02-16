import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Leaderboard.css";
import { useNavigate } from "react-router-dom";

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

interface User {
    email: string;
    totalpoints: number;
}

const Leaderboard: React.FC = () => {
    const navigate = useNavigate();
    const [leaderboard, setLeaderboard] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await axios.get(`${VITE_BACKEND_URL}/leaderboard`);
                setLeaderboard(response.data);
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    return (
        <div className="leaderboard-container">
            {/* Back Button */}
            <button className="back-button" onClick={() => navigate("/activity")}>🔙 Back</button>

            <h1 className="leaderboard-title">🏆 Leaderboard</h1>

            {loading ? (
                <p className="loading-text">Loading...</p>
            ) : (
                <table className="leaderboard-table">
                    <thead>
                        <tr>
                            <th><strong>Rank</strong></th>
                            <th><strong>User Email</strong></th>
                            <th><strong>Total Points</strong></th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboard.map((user, index) => (
                            <tr key={user.email}>
                                <td>{index + 1}</td>
                                <td>{user.email}</td>
                                <td className="points-column">{user.totalpoints}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Legend for Points Calculation */}
            <div className="legend">
                <h2>📌 Point Values:</h2>
                <ul>
                    <li>🦌 Deer: 5 Points</li>
                    <li>🦢 Canada Goose: 4 Points</li>
                    <li>🦝 Raccoon: 3 Points</li>
                    <li>🐿️ Squirrel: 2 Points</li>
                    <li>🐦 Sparrow: 1 Point</li>
                </ul>
            </div>
        </div>
    );
};

export default Leaderboard;
