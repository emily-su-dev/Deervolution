import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import logo from "../../assets/deervolution_logo.png";
import upper from "../../assets/deerv_upper_decor.png";

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      {/* Upper Decorative Shape */}
      <img src={upper} alt="Upper Decor" className="upper-decor" />

      {/* Logo */}
      <div className="flex flex-col items-center gap-2 mt-16">
        <div>
          <img src={logo} alt="Deervolution Logo" className="logo" />
        </div>
        <h1 className="text-2xl font-bold">Deervolution</h1>
        <p className="text-sm">Discover wildlife at UTM!</p>
      </div>

      {/* Sign-up button */}
      <button onClick={() => navigate("/SignUp")}>
        Create An Account
      </button>

      {/* Sign-in link */}
      <p className="mt-4 text-xs">
        Have an account?{" "}
        <a href="#" className="underline hover:text-gray-200" onClick={() => navigate("/SignIn")}>
          Sign in
        </a>
      </p>

      {/* Styles for polygon shape */}
      <style>
        {`
          .clip-polygon {
            clip-path: polygon(0 0, 100% 0, 85% 100%, 15% 100%);
          }
        `}
      </style>
    </div>
  );
};

export default Home;
