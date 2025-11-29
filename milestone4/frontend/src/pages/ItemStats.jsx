import React, { useEffect, useState } from "react";
import LoadingSpinner from "../Components/LoadingSpinner";
import { api } from "../services/api";

export default function ItemStats() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadStats() {
    setLoading(true);
    setMessage("");

    try {
      const res = await api.getItemStats();
      if (res.success && res.data && res.data.length > 0) {
        setStats(res.data);
      } else {
        setStats([]);
        setMessage(res.message || "No item stats available.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Network or server error while loading item stats");
    } finally {
      setLoading(false);
    }
  }



  const grandTotal = stats.reduce(
    (sum, row) => sum + Number(row.total_value || 0),
    0
  );

  return (
    <div className="page">
      <h1 className="page-title">Item Stats by Rarity</h1>

      <div className="card">
        <p className="page-subtitle">
          Shows how many items exist for each rarity, the sale value per item,
          and the total value if all items of that rarity are sold.
        </p>

        <div className="form form-row-inline" style={{ marginBottom: "0.75rem" }}>
          <button
            type="button"
            className="small-button-secondary"
            onClick={loadStats}
          >
            Click to Run Query
          </button>

        </div>

        {loading && <LoadingSpinner />}

        {message && <p className="form-message">{message}</p>}

        {!loading && stats.length > 0 && (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Rarity</th>
                  <th>Item count</th>
                  <th>Sale value (per item)</th>
                  <th>Total value</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((row) => (
                  <tr key={row.item_rarity}>
                    <td>{row.item_rarity}</td>
                    <td>{row.item_count}</td>
                    <td>{row.sale_value}</td>
                    <td>{row.total_value}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={3} style={{ fontWeight: "bold", textAlign: "right" }}>
                    Grand total:
                  </td>
                  <td style={{ fontWeight: "bold" }}>{grandTotal}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {!loading && stats.length === 0 && !message && (
          <p>No item stats available.</p>
        )}

      </div>
    </div>
  );
}
