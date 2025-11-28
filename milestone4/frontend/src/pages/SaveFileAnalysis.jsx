import React, { useState } from "react";
import { api } from "../services/api";
import LoadingSpinner from "../Components/LoadingSpinner";

export default function SavefileAnalysis() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleRunAnalysis() {
    setLoading(true);
    setMessage("");
    setAnalysis(null);

    try {
      const res = await api.getSavefileAnalysis();

      if (!res || res.success === false) {
        setMessage(res?.error || "Failed to fetch savefile analysis");
        return;
      }

      setAnalysis(res.data);
      if (!res.data || !res.data.byDifficulty || res.data.byDifficulty.length === 0) {
        setMessage("No savefile data found.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Network or server error while fetching analysis.");
    } finally {
      setLoading(false);
    }
  }

  const hasByDifficulty = analysis && Array.isArray(analysis.byDifficulty);
  const overall = analysis?.overall || null;

  return (
    <div className="page">
      <h1 className="page-title">Savefile Analysis</h1>

      <div className="card">
  <p className="page-description">
    This report summarizes save files across all difficulties. It shows how many saves
    exist for each difficulty and how many items players tend to carry, plus overall
    aggregates.
  </p>

  <form
    className="form"
    onSubmit={(e) => {
      e.preventDefault();
      handleRunAnalysis();
    }}
  >
    <div className="form-row">
      <button type="submit" disabled={loading}>
        {loading ? "Running analysis..." : "Run Savefile Analysis"}
      </button>
    </div>
  </form>

  {loading && <LoadingSpinner />}
  {message && <p className="form-message">{message}</p>}
        {/* By Difficulty table */}
        {hasByDifficulty && analysis.byDifficulty.length > 0 && (
          <div className="section">
            <h2 className="section-title">By Difficulty</h2>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Difficulty</th>
                    <th># Savefiles</th>
                    <th>Avg Items per Save</th>
                    <th>Total Items</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.byDifficulty.map((row) => (
                    <tr key={row.difficulty}>
                      <td>{row.difficulty}</td>
                      <td>{row.savefile_count}</td>
                      <td>{row.avg_items_per_save}</td>
                      <td>{row.total_items}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Overall summary */}
        {overall && (
          <div className="section">
            <h2 className="section-title">Overall Summary</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Total Savefiles</div>
                <div className="stat-value">{overall.total_savefiles}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Avg Items (All Saves)</div>
                <div className="stat-value">{overall.avg_items_across_all}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Max Items in a Save</div>
                <div className="stat-value">{overall.max_items_in_save}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Difficulty With Most Saves</div>
                <div className="stat-value">
                  {overall.difficulty_with_most_saves || "N/A"}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
