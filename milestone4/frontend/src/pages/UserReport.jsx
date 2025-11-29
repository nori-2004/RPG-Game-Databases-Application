import React, { useEffect, useState } from "react";
import LoadingSpinner from "../Components/LoadingSpinner";
import { api } from "../services/api";

export default function UserReport() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [columns, setColumns] = useState({
    username: true,
    first_name: true,
    email: true,
    created_on: false,
  });

  useEffect(() => {
    async function loadUsers() {
      setLoading(true);
      setMessage("");

      try {
        const res = await api.getUsers();
        if (res.success && res.data && res.data.length > 0) {
          setUsers(res.data);
        } else {
          setUsers([]);
          setMessage(res.message || "No users found");
        }
      } catch (err) {
        setMessage("Network or server error while loading users");
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  function toggleColumn(name) {
    setColumns((prev) => ({ ...prev, [name]: !prev[name] }));
  }

  function handleSelectAll() {
    setColumns({
      username: true,
      first_name: true,
      email: true,
      created_on: true,
    });
  }

  function handleClear() {
    setColumns({
      username: false,
      first_name: false,
      email: false,
      created_on: false,
    });
  }

  const anyColumnSelected = Object.values(columns).some(Boolean);

  return (
    <div className="page">
      <h1 className="page-title">User Report</h1>

      <div className="card">
        <p className="page-subtitle">
          Choose which user attributes to include in the report. The table will
          update to show only the selected columns.
        </p>

        {/* Column chooser */}
        <div className="form form-row-inline">
          <div className="column-toggle">
            <label>
              <input
                type="checkbox"
                checked={columns.username}
                onChange={() => toggleColumn("username")}
              />
              Username
            </label>
          </div>

          <div className="column-toggle">
            <label>
              <input
                type="checkbox"
                checked={columns.first_name}
                onChange={() => toggleColumn("first_name")}
              />
              First name
            </label>
          </div>

          <div className="column-toggle">
            <label>
              <input
                type="checkbox"
                checked={columns.email}
                onChange={() => toggleColumn("email")}
              />
              Email
            </label>
          </div>

          <div className="column-toggle">
            <label>
              <input
                type="checkbox"
                checked={columns.created_on}
                onChange={() => toggleColumn("created_on")}
              />
              Created on
            </label>
          </div>

          <div className="column-toggle-buttons">
            <button type="button" className="small-button-secondary" onClick={handleSelectAll}>
              Select all
            </button>
            <button type="button" className="small-button-secondary" onClick={handleClear}>
              Clear
            </button>
          </div>
        </div>

        {loading && <LoadingSpinner />}

        {message && <p className="form-message">{message}</p>}

        {!loading && users.length > 0 && !anyColumnSelected && (
          <p style={{ marginTop: "0.75rem" }}>
            Select at least one column to view the report.
          </p>
        )}

        {!loading && users.length > 0 && anyColumnSelected && (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  {columns.username && <th>Username</th>}
                  {columns.first_name && <th>First name</th>}
                  {columns.email && <th>Email</th>}
                  {columns.created_on && <th>Created on</th>}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.username}>
                    {columns.username && <td>{u.username}</td>}
                    {columns.first_name && <td>{u.first_name}</td>}
                    {columns.email && <td>{u.email}</td>}
                    {columns.created_on && <td>{u.created_on}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && users.length === 0 && !message && (
          <p>No users found.</p>
        )}
      </div>
    </div>
  );
}
