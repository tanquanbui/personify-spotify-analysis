import React, { useEffect, useState } from "react";
import axios from "axios";

const TrackFeatures = ({ token, trackId, apiLink }) => {
  const [features, setFeatures] = useState(null);

  useEffect(() => {
    const fetchTrackFeatures = async () => {
      try {
        const response = await axios.get(`https://api.spotify.com/v1/audio-features/audio-features/${trackId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 200) {
          setFeatures(response.data); // assuming data contains the track features
        } else {
          console.error("Failed to fetch track features");
        }
      } catch (error) {
        console.error("Error fetching track features:", error);
      }
    };

    if (token && trackId && apiLink) {
      fetchTrackFeatures();
    }
  }, [token, trackId, apiLink]);

  if (!features) {
    return <p>Loading track features...</p>;
  }

  return (
    <div className="track-features">
      <h2>Track Features</h2>
      <ul>
        <li>Duration: {features.duration_ms} ms</li>
        <li>Key: {features.key}</li>
        <li>Mode: {features.mode}</li>
        <li>Tempo: {features.tempo} BPM</li>
        <li>Time Signature: {features.time_signature}</li>
        {/* Add more features as needed */}
      </ul>
    </div>
  );
};

export default TrackFeatures;
