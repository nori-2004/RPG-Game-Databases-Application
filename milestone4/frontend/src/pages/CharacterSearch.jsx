import React, { useEffect, useState } from "react";
import LoadingSpinner from "../Components/LoadingSpinner";
import { api } from "../services/api";

const ATTRIBUTES = [
  { value: "chr_name", label: "Character Name" },
  { value: "chr_type", label: "Character Type" },
  { value: "bg_story", label: "Background Story" },
  { value: "location_name", label: "Location (NPCs only)" },
];

const OPERATORS = [
  { value: "=", label: "equals" },
  { value: "LIKE", label: "contains" },
];

export default function CharacterSearch() {
  const [charTypes, setCharTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [characterKind, setCharacterKind] = useState("all");
  const [conditions, setConditions] = useState([
    { attribute: "chr_type", operator: "=", value: "", connector: "AND" },
  ]);

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

  function addCondition() {
    setConditions([
      ...conditions,
      { attribute: "chr_type", operator: "=", value: "", connector: "AND" },
    ]);
  }

  function removeCondition(index) {
    if (conditions.length > 1) {
      setConditions(conditions.filter((_, i) => i !== index));
    }
  }

  function updateCondition(index, field, value) {
    const updated = [...conditions];
    updated[index] = { ...updated[index], [field]: value };
    setConditions(updated);
  }

  async function handleSearch(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setResults({ npcs: [], pcs: [] });

    // Filter out empty conditions
    const validConditions = conditions.filter((c) => c.value.trim() !== "");

    if (validConditions.length === 0) {
      setMessage("Please add at least one search condition with a value.");
      setLoading(false);
      return;
    }

    try {
      const res = await api.searchCharacters({
        character_kind: characterKind,
        conditions: validConditions,
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

  function renderValueInput(condition, index) {
    const { attribute, value } = condition;

    // For chr_type, show dropdown of available types
    if (attribute === "chr_type") {
      return (
        <select
          value={value}
          onChange={(e) => updateCondition(index, "value", e.target.value)}
        >
          <option value="">Select type...</option>
          {charTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      );
    }

    // For location_name, show dropdown of available locations
    if (attribute === "location_name") {
      return (
        <select
          value={value}
          onChange={(e) => updateCondition(index, "value", e.target.value)}
        >
          <option value="">Select location...</option>
          {locations.map((loc) => (
            <option key={loc.location_name} value={loc.location_name}>
              {loc.location_name}
            </option>
          ))}
        </select>
      );
    }

    // For other attributes, show text input
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => updateCondition(index, "value", e.target.value)}
        placeholder="Enter value..."
      />
    );
  }

  const totalResults = (results.npcs?.length || 0) + (results.pcs?.length || 0);

  return (
    <div className="page">
      <h1 className="page-title">Character Search</h1>

      <div className="card">
        <p className="page-subtitle">
          Search for NPCs and PCs using multiple conditions with AND/OR logic.
        </p>

        <form onSubmit={handleSearch} className="form">
          {/* Character Kind selector */}
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

          <hr style={{ margin: "1rem 0", borderColor: "#ddd" }} />

          <h3 style={{ marginBottom: "0.5rem" }}>Search Conditions</h3>

          {/* Dynamic conditions */}
          {conditions.map((condition, index) => (
            <div
              key={index}
              className="condition-row"
              style={{
                display: "flex",
                gap: "0.5rem",
                alignItems: "center",
                marginBottom: "0.5rem",
                flexWrap: "wrap",
              }}
            >
              {/* AND/OR connector (not shown for first condition) */}
              {index > 0 && (
                <select
                  value={condition.connector}
                  onChange={(e) =>
                    updateCondition(index, "connector", e.target.value)
                  }
                  style={{ width: "80px" }}
                >
                  <option value="AND">AND</option>
                  <option value="OR">OR</option>
                </select>
              )}

              {/* Attribute selector */}
              <select
                value={condition.attribute}
                onChange={(e) =>
                  updateCondition(index, "attribute", e.target.value)
                }
                style={{ minWidth: "150px" }}
              >
                {ATTRIBUTES.map((attr) => (
                  <option key={attr.value} value={attr.value}>
                    {attr.label}
                  </option>
                ))}
              </select>

              {/* Operator selector */}
              <select
                value={condition.operator}
                onChange={(e) =>
                  updateCondition(index, "operator", e.target.value)
                }
                style={{ width: "100px" }}
              >
                {OPERATORS.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>

              {/* Value input */}
              <div style={{ minWidth: "150px" }}>
                {loadingOptions ? (
                  <span>Loading...</span>
                ) : (
                  renderValueInput(condition, index)
                )}
              </div>

              {/* Remove button */}
              {conditions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCondition(index)}
                  className="small-button-secondary"
                  style={{ padding: "0.25rem 0.5rem" }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          {/* Add condition button */}
          <div style={{ marginTop: "0.5rem", marginBottom: "1rem" }}>
            <button
              type="button"
              onClick={addCondition}
              className="small-button-secondary"
            >
              + Add Condition
            </button>
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
