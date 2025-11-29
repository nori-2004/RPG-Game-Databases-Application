import React, { useEffect, useState } from "react";
import LoadingSpinner from "../Components/LoadingSpinner";
import { api } from "../services/api";

export default function Completionists() {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadLocations() {
      setLoadingLocations(true);
      setMessage("");
      try {
        const res = await api.getLocations();
        if (res.success && res.data && res.data.length > 0) {
          setLocations(res.data);
          setSelectedLocation(res.data[0].location_name);
        } else {
          setLocations([]);
          setMessage(res.message || "No locations available.");
        }
      } catch (err) {
        console.error(err);
        setMessage("Failed to load locations.");
      } finally {
        setLoadingLocations(false);
      }
    }

    loadLocations();
  }, []);

  async function handleSearch(e) {
    e.preventDefault();
    if (!selectedLocation) {
      setMessage("Please choose a location first.");
      return;
    }

    setLoading(true);
    setMessage("");
    setPlayers([]);

    try {
      const res = await api.getCompletionists(selectedLocation);
      if (res.success && res.data && res.data.length > 0) {
        setPlayers(res.data);
      } else {
        setMessage(
          res.message ||
            `No players have completed all objectives at "${selectedLocation}".`
        );
      }
    } catch (err) {
      console.error(err);
      setMessage("Network or server error while loading completionists.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">Completionists</h1>

      <div className="card">
        <p className="page-subtitle">
          Choose a location to see which players have completed
          <strong> all objectives</strong> there.
        </p>

        {/* Location selector */}
        <form onSubmit={handleSearch} className="form">
          <div className="form-row">
            <label>
              Location
              {loadingLocations ? (
                <div>Loading locations...</div>
              ) : locations.length > 0 ? (
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  {locations.map((loc) => (
                    <option key={loc.location_name} value={loc.location_name}>
                      {loc.location_name}
                    </option>
                  ))}
                </select>
              ) : (
                <div>No locations available.</div>
              )}
            </label>
          </div>

          <div className="form-row">
            <button type="submit" disabled={loading || loadingLocations}>
              {loading ? "Checking..." : "Find Completionists"}
            </button>
          </div>
        </form>

        {loading && <LoadingSpinner />}

        {message && <p className="form-message">{message}</p>}

        {!loading && players.length > 0 && (
          <div className="table-wrapper" style={{ marginTop: "1rem" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>First name</th>
                  <th>Completed objectives (at this location)</th>
                </tr>
              </thead>
              <tbody>
                {players.map((p) => (
                  <tr key={p.username}>
                    <td>{p.username}</td>
                    <td>{p.first_name}</td>
                    <td>{p.completed_objectives}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && players.length === 0 && !message && selectedLocation && (
          <p>
            No completionists found for <strong>{selectedLocation}</strong>.
          </p>
        )}
      </div>
    </div>
  );
}
