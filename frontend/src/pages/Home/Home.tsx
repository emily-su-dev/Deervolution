import React from "react";
import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <img src="/image.svg" alt="DeerVolution Logo" style={{ width: 100, marginBottom: 20 }} />
      <h1>Home Page</h1>
      <button onClick={() => navigate("/activity")}>Go to Activity</button>
    </div>
  );
};

export default Home;
