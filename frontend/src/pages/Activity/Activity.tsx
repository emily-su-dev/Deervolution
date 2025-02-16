/// <reference types="@types/google.maps" />
import React, { useEffect, useState } from "react";
import "./Activity.css"; // Import the CSS file for styling
import { useNavigate } from "react-router-dom";
import axios from "axios";
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

interface AnimalSighting {
  lat: number;
  lng: number;
  type: string;
}

const Activity: React.FC = () => {
  const navigate = useNavigate();

  const [nearestPlace, setNearestPlace] = useState<string | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);

  const [animalSightings, setAnimalSightings] = useState<AnimalSighting[]>([]);

  const animalIcons: { [key: string]: string } = {
    Deer: "/icons/deer.png",
    Squirrel: "/icons/squirrel.png",
    Raccoon: "/icons/raccoon.png",
    CanadaGoose: "/icons/goose.png",
    Sparrow: "/icons/sparrow.png",
  };

  useEffect(() => {
    const fetchSightings = async () => {
      try {
        const response = await axios.get(`${VITE_BACKEND_URL}/recent-findings`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': '69420' // This header is used to bypass the ngrok warning
            // idk it works
          }
        });
        
        // Check if response.data is an array
        if (Array.isArray(response.data)) {
          setAnimalSightings(response.data);
        } else if (typeof response.data === 'object') {
          // If it's an object, check if it has the expected data structure
          const sightingsData = response.data.data || response.data.sightings;
          if (Array.isArray(sightingsData)) {
            setAnimalSightings(sightingsData);
          } else {
            console.error("Unexpected data structure:", response.data);
            setAnimalSightings([]);
          }
        } else {
          console.error("Invalid response format:", response.data);
          setAnimalSightings([]);
        }
      } catch (error) {
        console.error("Error fetching sightings:", error);
        setAnimalSightings([]);
      }
    };

    fetchSightings();
  }, []);

  // // To artifically inflate the number of sightings for demo purposes
  // useEffect(() => {
  //   // Manually add test sightings
  //   setAnimalSightings([
  //     { lat: 43.5399123, lng: -79.6842989, type: "Deer" },
  //     { lat: 43.5297128, lng: -79.6862992, type: "Squirrel" },
  //     { lat: 43.5599121, lng: -79.6822980, type: "Raccoon" },
  //     { lat: 43.5499125, lng: -79.6802985, type: "CanadaGoose" },
  //     { lat: 43.5379122, lng: -79.6742999, type: "Sparrow" }
  //   ]);
  // }, []);

  useEffect(() => {
    // Load Google Maps script dynamically if not already loaded
    if (!document.querySelector("#google-maps-script")) {
      const script = document.createElement("script");
      script.id = "google-maps-script";
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAPHGXRODOE33zFmbI2l6OSgnkB9jhf8sQ&libraries=maps,marker,places`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onload = () => {
        if (window.google) {
          initializeMap();
        }
      };
    } else {
      initializeMap();
    }
  }, []);

  // Helper to create animal icons
  const createMarkerContent = (type: string) => {
    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.width = "40px";
    container.style.height = "40px";

    const img = document.createElement("img");
    img.src = animalIcons[type] || "https://default-icon.png";
    img.style.width = "100%";
    img.style.height = "100%";

    container.appendChild(img);
    return container;
  };

  const initializeMap = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userLatLng = { lat: latitude, lng: longitude };

          const mapInstance = new google.maps.Map(document.getElementById("map") as HTMLElement, {
            center: userLatLng,
            zoom: 15,
            mapId: "MAP1",
          });

          const markerInstance = new google.maps.Marker({
            position: userLatLng,
            map: mapInstance,
            title: "Your Location",
          });

          setMap(mapInstance);
          setMarker(markerInstance);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  useEffect(() => {
    if (map && animalSightings && Array.isArray(animalSightings)) {
      animalSightings.forEach((sighting) => {
        new google.maps.marker.AdvancedMarkerElement({
          position: { lat: sighting.lat, lng: sighting.lng },
          map,
          title: sighting.type,
          content: createMarkerContent(sighting.type),
        });
      });
    }
  }, [map, animalSightings]);

  // Reverse Geocode to get nearest place name
  const getNearestPlace = (location: { lat: number; lng: number }) => {
    if (window.google) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location }, (results: google.maps.GeocoderResult[] | null, status) => {
        if (status === "OK" && results && results[0]?.formatted_address) {
          setNearestPlace(results[0].formatted_address);
        } else {
          console.error("Geocode failed:", status);
          setNearestPlace("Unknown Location");
        }
      });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const newLocation = { lat: latitude, lng: longitude };
            getNearestPlace(newLocation); // Fetch updated place name

            if (map && marker) {
              marker.setPosition(newLocation);
            }
          },
          (error) => {
            console.error("Error updating location:", error);
          }
        );
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [map, marker]);

  return (
    <div className="activity-container">
      {/* Top Buttons */}
      <div className="top-buttons">
        {/* Leaderboard Button */}
        <button className="leaderboard-button" onClick={() => navigate("/leaderboard")}>
          <img src="/icons/deerv_trophy.png" className="leaderboard-icon" alt="Leaderboard" />
        </button>

        {/* Profile Button */}
        <button className="profile-button" onClick={() => navigate("/profile")}>
          <img src="/icons/default_profile.jpg" className="profile-icon" alt="Profile" />
        </button>
      </div>

      <h1 className="title">🌍 Nearby Animal Sightings</h1>
      <div className="map-container">
        <div id="map" className="map"></div>
      </div>
      {nearestPlace && (
        <p className="location-text">
          📍 Current Location: <strong>{nearestPlace}</strong>
        </p>
      )}
      <button className="animal-button" onClick={() => navigate("/picture")}>🐾 I Found an Animal!</button>
    </div>
  );
};

export default Activity;
