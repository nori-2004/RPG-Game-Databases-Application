import React, { useEffect, useState } from "react";
import LoadingSpinner from "../Components/LoadingSpinner";
import { api } from "../services/api";

export default function CharacterSearch() {
  const [charTypes, setCharTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [selectedType, setSelectedType] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [characterKind, setCharacterKind] = useState("all");

  const [results, setResults] = useState({ npcs: [], pcs: [] });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadOptions() {
      setLoadingOptions(true);
      try {
        const [typesRes, locsRes] = await Promise.all([
          api.getCharacterTypes(),
          api.getLocations(),
        ]);

        if (typesRes.success && typesRes.data) {
          setCharTypes(typesRes.data);
        }
        if (locsRes.success && locsRes.data) {
          setLocations(locsRes.data);
        }
      } catch (err) {
        console.error(err);
        setMessage("Failed to load filter options.");
      } finally {
        setLoadingOptions(false);
      }
    }

    loadOptions();
  }, []);

  async function handleSearch(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setResults({ npcs: [], pcs: [] });

    try {
      const res = await api.searchCharacters({
        chr_type: selectedType || undefined,
        location_name: selectedLocation || undefined,
        character_kind: characterKind,
      });

      if (res.success) {
        setResults(res.data || { npcs: [], pcs: [] });
        if (res.total === 0) {
          setMessage("No characters found matching your criteria.");
        }
      } else {
        setMessage(res.error || "Failed to search characters.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Network or server error while searching characters.");
    } finally {
      setLoading(false);
    }
  }

  const totalResults = (results.npcs?.length || 0) + (results.pcs?.length || 0);

  return (
    <div className="page">
      <h1 className="page-title">Character Search</h1>

      <div className="card">
        <p className="page-subtitle">
          Search for NPCs and PCs by character type and/or location.
        </p>

        <form onSubmit={handleSearch} className="form">
          <div className="form-row">
            <label>
              Character Type
              {loadingOptions ? (
                <div>Loading...</div>
              ) : (
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="">All Types</option>
                  {charTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              )}
            </label>
          </div>

          <div className="form-row">
            <label>
              Location (NPCs only)
              {loadingOptions ? (
                <div>Loading...</div>
              ) : (
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  <option value="">All Locations</option>
                  {locations.map((loc) => (
                    <option key={loc.location_name} value={loc.location_name}>
                      {loc.location_name}
                    </option>
                  ))}
                </select>
              )}
            </label>
          </div>

          <div className="form-row">
            <label>
              Character Kind
              <select
                value={characterKind}
                onChange={(e) => setCharacterKind(e.target.value)}
              >
                <option value="all">All (NPCs + PCs)</option>
                <option value="NPC">NPCs Only</option>
                <option value="PC">PCs Only</option>
              </select>
            </label>
          </div>

          <div className="form-row">
            <button type="submit" disabled={loading || loadingOptions}>
              {loading ? "Searching..." : "Search Characters"}
            </button>
          </div>
        </form>

        {loading && <LoadingSpinner />}

        {message && <p className="form-message">{message}</p>}

        {!loading && totalResults > 0 && (
          <>
            {results.npcs && results.npcs.length > 0 && (
              <div style={{ marginTop: "1rem" }}>
                <h3>NPCs ({results.npcs.length})</h3>
                <div className="table-wrapper">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Background</th>
                        <th>Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.npcs.map((npc) => (
                        <tr key={npc.chr_name}>
                          <td>{npc.chr_name}</td>
                          <td>{npc.chr_type}</td>
                          <td>{npc.bg_story}</td>
                          <td>{npc.location_name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {results.pcs && results.pcs.length > 0 && (
              <div style={{ marginTop: "1rem" }}>
                <h3>PCs ({results.pcs.length})</h3>
                <div className="table-wrapper">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Background</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.pcs.map((pc) => (
                        <tr key={pc.chr_name}>
                          <td>{pc.chr_name}</td>
                          <td>{pc.chr_type}</td>
                          <td>{pc.bg_story}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
