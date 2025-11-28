import React, { useEffect, useState } from "react";
import LoadingSpinner from "../Components/LoadingSpinner";
import { api } from "../services/api";

export default function ActiveUsers() {
  const [users, setUsers] = useState([]);
  const [minSavefiles, setMinSavefiles] = useState(1);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadActiveUsers(threshold = minSavefiles) {
    setLoading(true);
    setMessage("");

    try {
      const res = await api.getActiveUsers({ minSavefiles: threshold });
      if (res.success && res.data && res.data.length > 0) {
        setUsers(res.data);
      } else {
        setUsers([]);
        setMessage(
          res.message || `No users with at least ${threshold} save file(s).`
        );
      }
    } catch (err) {
      setMessage("Network or server error while loading active users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadActiveUsers(minSavefiles);
  }, []);

  function handleThresholdChange(e) {
    const value = Number(e.target.value) || 0;
    setMinSavefiles(value);
  }

  function handleApply() {
    loadActiveUsers(minSavefiles);
  }

  return (
    <div className="page">
      <h1 className="page-title">Active Users</h1>

      <div className="card">
        <p className="page-subtitle">
          Shows players who have at least a chosen number of save files.
        </p>

        {/* Filter row: minimum save files */}
        <div className="form form-row-inline" style={{ marginBottom: "0.75rem" }}>
          <div className="form-row">
            <label>
              Minimum save files
              <input
                type="number"
                min="0"
                value={minSavefiles}
                onChange={handleThresholdChange}
                style={{ maxWidth: "120px" }}
              />
            </label>
          </div>
          <button type="button" className="small-button-secondary" onClick={handleApply}>
            Apply
          </button>
        </div>

        {loading && <LoadingSpinner />}

        {message && <p className="form-message">{message}</p>}

        {!loading && users.length > 0 && (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>First name</th>
                  <th>Email</th>
                  <th>Save files</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.username}>
                    <td>{u.username}</td>
                    <td>{u.first_name}</td>
                    <td>{u.email}</td>
                    <td>{u.savefile_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && users.length === 0 && !message && (
          <p>No active users match this threshold.</p>
        )}
      </div>
    </div>
  );
}
