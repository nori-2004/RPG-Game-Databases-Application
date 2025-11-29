import { useState } from "react";
import LoadingSpinner from "../Components/LoadingSpinner";
import { api } from "../services/api";

export default function UserReport() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Track which columns user wants to project
  const [columns, setColumns] = useState({
    username: true,
    first_name: true,
    email: true,
    created_on: false,
  });

  // Track which columns were actually fetched from DB
  const [fetchedColumns, setFetchedColumns] = useState([]);

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

  async function handleRunQuery() {
    const selectedFields = Object.entries(columns)
      .filter(([, selected]) => selected)
      .map(([field]) => field);

    if (selectedFields.length === 0) {
      setMessage("Please select at least one column.");
      return;
    }

    setLoading(true);
    setMessage("");
    setUsers([]);
    setFetchedColumns([]);

    try {
      const res = await api.getUserReport(selectedFields);
      if (res.success && res.data && res.data.length > 0) {
        setUsers(res.data);
        setFetchedColumns(res.fields || selectedFields);
      } else {
        setUsers([]);
        setMessage(res.message || "No users found");
      }
    } catch (err) {
      console.error(err);
      setMessage("Network or server error while loading users");
    } finally {
      setLoading(false);
    }
  }

  const anyColumnSelected = Object.values(columns).some(Boolean);

  const columnLabels = {
    username: "Username",
    first_name: "First name",
    email: "Email",
    created_on: "Created on",
  };

  return (
    <div className="page">
      <h1 className="page-title">User Report (Projection)</h1>

      <div className="card">
        <p className="page-subtitle">
          Select which attributes to include in the report. Only the selected
          columns will be fetched from the database (server-side projection).
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
            <button
              type="button"
              className="small-button-secondary"
              onClick={handleSelectAll}
            >
              Select all
            </button>
            <button
              type="button"
              className="small-button-secondary"
              onClick={handleClear}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Run Query button */}
        <div style={{ marginTop: "1rem" }}>
          <button
            type="button"
            onClick={handleRunQuery}
            disabled={loading || !anyColumnSelected}
          >
            {loading ? "Loading..." : "Run Projection Query"}
          </button>
        </div>

        {loading && <LoadingSpinner />}

        {message && <p className="form-message">{message}</p>}

        {!loading && !anyColumnSelected && (
          <p style={{ marginTop: "0.75rem" }}>
            Select at least one column to view the report.
          </p>
        )}

        {!loading && users.length > 0 && fetchedColumns.length > 0 && (
          <div className="table-wrapper" style={{ marginTop: "1rem" }}>
            <table className="table">
              <thead>
                <tr>
                  {fetchedColumns.map((col) => (
                    <th key={col}>{columnLabels[col] || col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, idx) => (
                  <tr key={u.username || idx}>
                    {fetchedColumns.map((col) => (
                      <td key={col}>{u[col]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && users.length === 0 && fetchedColumns.length > 0 && (
          <p>No users found.</p>
        )}
      </div>
    </div>
  );
}
