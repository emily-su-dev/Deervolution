import './App.css'

import React from "react";

const App: React.FC = () => {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#A8652C] text-white">
      {/* Background Shape */}
      <div className="absolute top-0 left-0 w-full h-32 bg-[#8A5224] clip-polygon"></div>

      {/* Logo */}
      <div className="flex flex-col items-center gap-2 mt-16">
        <div className="w-16 h-16 flex items-center justify-center border-2 border-white rounded-lg">
          <span className="text-4xl">🦌</span> {/* Replace with actual SVG */}
        </div>
        <h1 className="text-2xl font-bold">Deervolution</h1>
        <p className="text-sm">Discover wild life at UTM!</p>
      </div>

      {/* Button */}
      <button className="mt-6 px-6 py-3 bg-[#5C2E15] rounded-lg text-white font-bold text-lg shadow-md hover:bg-[#6F3B1F] transition">
        Create an account
      </button>

      {/* Sign-in link */}
      <p className="mt-4 text-xs">
        Have an account?{" "}
        <a href="#" className="underline hover:text-gray-200">
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

export default App;
