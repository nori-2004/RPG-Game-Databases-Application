import React, { useEffect, useState } from "react";
import LoadingSpinner from "../Components/LoadingSpinner";
import { api } from "../services/api";

export default function UserAchievements() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [achievements, setAchievements] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");


  useEffect(() => {
    async function loadUsers() {
      setLoadingUsers(true);
      setMessage("");
      try {
        const res = await api.getUsers();
        if (res.success && res.data && res.data.length > 0) {
          setUsers(res.data);
          setSelectedUser(res.data[0].username);
        } else {
          setUsers([]);
          setMessage(res.message || "No users available.");
        }
      } catch (err) {
        console.error(err);
        setMessage("Failed to load users.");
      } finally {
        setLoadingUsers(false);
      }
    }

    loadUsers();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedUser) {
      setMessage("Please select a user first.");
      return;
    }

    setLoading(true);
    setMessage("");
    setAchievements([]);

    try {
      const res = await api.getUserAchievements(selectedUser);
      if (res.success && res.data && res.data.length > 0) {
        setAchievements(res.data);
      } else {
        setMessage(
          res.message ||
            `No achievements found for user "${selectedUser}".`
        );
      }
    } catch (err) {
      console.error(err);
      setMessage("Network or server error while loading achievements.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">User Achievements</h1>

      <div className="card">
        <p className="page-subtitle">
          Choose a user to see which achievements they have earned and where.
          This page is for <strong>JOIN</strong> query. It combines users,
          objectives, and achievements.
        </p>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-row">
            <label>
              User
              {loadingUsers ? (
                <div>Loading users...</div>
              ) : users.length > 0 ? (
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                >
                  {users.map((u) => (
                    <option key={u.username} value={u.username}>
                      {u.username} ({u.first_name})
                    </option>
                  ))}
                </select>
              ) : (
                <div>No users available.</div>
              )}
            </label>
          </div>

          <div className="form-row">
            <button type="submit" disabled={loading || loadingUsers}>
              {loading ? "Loading..." : "Show Achievements"}
            </button>
          </div>
        </form>

        {loading && <LoadingSpinner />}

        {message && <p className="form-message">{message}</p>}

        {!loading && achievements.length > 0 && (
          <div className="table-wrapper" style={{ marginTop: "1rem" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Achievement</th>
                  <th>Objective</th>
                  <th>Location</th>
                  <th>Completed on</th>
                </tr>
              </thead>
              <tbody>
                {achievements.map((a, idx) => (
                  <tr key={`${a.username}-${a.achievement_name}-${idx}`}>
                    <td>{a.achievement_name}</td>
                    <td>{a.objective_name}</td>
                    <td>{a.location_name}</td>
                    <td>{a.completed_on}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && achievements.length === 0 && !message && selectedUser && (
          <p>
            No achievements found for <strong>{selectedUser}</strong>.
          </p>
        )}
      </div>
    </div>
  );
}
