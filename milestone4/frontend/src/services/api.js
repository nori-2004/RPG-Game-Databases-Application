const USE_MOCK = true; 
const API_BASE = "http://localhost:65535/api"; // change port later to match server.js

export const api = {
  async createUser(data) {
    if (USE_MOCK) {
      return {
        success: true,
        data: { ...data },
      };
    }

    const res = await fetch(`${API_BASE}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    return res.json();
  },
};
