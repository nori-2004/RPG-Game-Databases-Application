import React, { useEffect, useState } from "react";
import LoadingSpinner from "../Components/LoadingSpinner";
import { api } from "../services/api";

export default function DeleteUser() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadUsers() {
    setLoading(true);
    setMessage("");
    try {
      const res = await api.getUsers();
      if (res.success) {
        setUsers(res.data || []);
      } else {
        setMessage(res.message || "Failed to load users");
      }
    } catch (err) {
      setMessage("Network or server error while loading users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleDelete(username) {
    if (!window.confirm(`Delete user '${username}'?`)) return;

    setMessage("");
    try {
      const res = await api.deleteUser(username);
      if (res.success) {
        setUsers((prev) => prev.filter((u) => u.username !== username));
        setMessage(res.message || `User '${username}' deleted`);
      } else {
        setMessage(res.message || "Failed to delete user");
      }
    } catch (err) {
      setMessage("Network or server error while deleting user");
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">Delete User</h1>

      <div className="card">
        {loading && <LoadingSpinner />}

        {message && <p className="form-message">{message}</p>}

        {!loading && users.length === 0 && (
          <p>No users found in the system.</p>
        )}

        {!loading && users.length > 0 && (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>First name</th>
                  <th>Email</th>
                  <th>Created on</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.username}>
                    <td>{u.username}</td>
                    <td>{u.first_name}</td>
                    <td>{u.email}</td>
                    <td>{u.created_on}</td>
                    <td>
                      <button
                        type="button"
                        className="danger-button"
                        onClick={() => handleDelete(u.username)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
