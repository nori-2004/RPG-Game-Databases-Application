import React, { useState } from "react";
import LoadingSpinner from "../Components/LoadingSpinner";
import { api } from "../services/api";

export default function AddUser() {
  const [form, setForm] = useState({
    username: "",
    first_name: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await api.createUser(form);
      if (res.success) {
        setMessage("User created successfully (mock)!");
        setForm({ username: "", first_name: "", email: "" });
      } else {
        setMessage(res.message || "Failed to create user");
      }
    } catch (err) {
      setMessage("Network or server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">Add User</h1>

      <div className="card">
        <form onSubmit={handleSubmit} className="form">
          <div className="form-row">
            <label>
              Username
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              First name
              <input
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Email
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Create User"}
          </button>
        </form>

        {loading && <LoadingSpinner />}
        {message && <p className="form-message">{message}</p>}
      </div>
    </div>
  );
}
