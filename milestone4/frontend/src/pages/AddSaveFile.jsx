import { useEffect, useState } from "react";
import LoadingSpinner from "../Components/LoadingSpinner";
import { api } from "../services/api";

export default function AddSaveFile() {
  const [users, setUsers] = useState([]);
  const [difficulties, setDifficulties] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [form, setForm] = useState({
    username: "",
    difficulty: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"

  useEffect(() => {
    async function loadOptions() {
      setLoadingOptions(true);
      try {
        const [usersRes, diffRes] = await Promise.all([
          api.getUsers(),
          api.getDifficulties(),
        ]);

        if (usersRes.success && usersRes.data?.length > 0) {
          setUsers(usersRes.data);
          setForm((prev) => ({ ...prev, username: usersRes.data[0].username }));
        }

        if (diffRes.success && diffRes.data?.length > 0) {
          setDifficulties(diffRes.data);
          setForm((prev) => ({ ...prev, difficulty: diffRes.data[0] }));
        }
      } catch (err) {
        console.error(err);
        setMessage("Failed to load users or difficulties.");
        setMessageType("error");
      } finally {
        setLoadingOptions(false);
      }
    }

    loadOptions();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setMessageType("");

    if (!form.username || !form.difficulty) {
      setMessage("Please select both a user and a difficulty.");
      setMessageType("error");
      setLoading(false);
      return;
    }

    try {
      const res = await api.createSaveFile(form);
      if (res.success) {
        setMessage(res.message || "Save file created successfully!");
        setMessageType("success");
      } else {
        setMessage(res.error || res.message || "Failed to create save file");
        setMessageType("error");
      }
    } catch {
      setMessage("Network or server error");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">Add Save File</h1>

      <div className="card">
        <p className="page-subtitle">
          Create a new save file for an existing user. This demonstrates an
          INSERT on a table with foreign keys (username → Users, difficulty →
          Difficulty).
        </p>

        {loadingOptions ? (
          <LoadingSpinner />
        ) : (
          <form onSubmit={handleSubmit} className="form">
            <div className="form-row">
              <label>
                User
                {users.length > 0 ? (
                  <select
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                  >
                    {users.map((u) => (
                      <option key={u.username} value={u.username}>
                        {u.username} ({u.first_name})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div>No users available. Create a user first.</div>
                )}
              </label>
            </div>

            <div className="form-row">
              <label>
                Difficulty
                {difficulties.length > 0 ? (
                  <select
                    name="difficulty"
                    value={form.difficulty}
                    onChange={handleChange}
                  >
                    {difficulties.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div>No difficulties available.</div>
                )}
              </label>
            </div>

            <button
              type="submit"
              disabled={
                loading || users.length === 0 || difficulties.length === 0
              }
            >
              {loading ? "Creating..." : "Create Save File"}
            </button>
          </form>
        )}

        {message && (
          <p
            className="form-message"
            style={{ color: messageType === "success" ? "green" : "red" }}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
