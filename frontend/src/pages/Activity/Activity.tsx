/// <reference types="@types/google.maps" />
import React, { useEffect, useState } from "react";
import "./Activity.css"; // Import the CSS file for styling
import { useNavigate } from "react-router-dom";

const Activity: React.FC = () => {
  const navigate = useNavigate();

  const [nearestPlace, setNearestPlace] = useState<string | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);

  useEffect(() => {
    // Load Google Maps script dynamically if not already loaded
    if (!document.querySelector("#google-maps-script")) {
      const script = document.createElement("script");
      script.id = "google-maps-script";
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAPHGXRODOE33zFmbI2l6OSgnkB9jhf8sQ&libraries=places,maps`;
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
              map.setCenter(newLocation);
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
