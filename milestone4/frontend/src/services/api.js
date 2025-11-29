const USE_MOCK = false;
const API_BASE = "http://localhost:65535/api"; // change port later to match server.js

const mockData = {
  users: [
    {
      username: "alice",
      first_name: "Alice",
      email: "alice@example.com",
      created_on: "2025-01-01",
    },
    {
      username: "bob",
      first_name: "Bob",
      email: "bob@example.com",
      created_on: "2025-02-10",
    },
  ],
  items: [
    { item_name: "Bronze Sword", item_rarity: "Common", item_type: "Weapon" },
    { item_name: "Silver Shield", item_rarity: "Rare", item_type: "Armor" },
    {
      item_name: "Healing Potion",
      item_rarity: "Common",
      item_type: "Armor",
    },
  ],
  activeUsers: [
    {
      username: "alice",
      first_name: "Alice",
      email: "alice@example.com",
      savefile_count: 5,
    },
    {
      username: "bob",
      first_name: "Bob",
      email: "bob@example.com",
      savefile_count: 2,
    },
    {
      username: "charlie",
      first_name: "Charlie",
      email: "charlie@example.com",
      savefile_count: 0,
    },
  ],

  locations: [
    {
      location_name: "Dark Forest",
      biome: "Forest",
      landmark: "Ancient Oak",
    },
    {
      location_name: "Crystal Cave",
      biome: "Cave",
      landmark: "Crystal Shrine",
    },
  ],
  completionists: {
    "Dark Forest": [
      { username: "alice", first_name: "Alice", completed_objectives: 5 },
      { username: "bob", first_name: "Bob", completed_objectives: 5 },
    ],
    "Crystal Cave": [
      { username: "alice", first_name: "Alice", completed_objectives: 3 },
    ],
  },

  itemStats: [
    { item_rarity: "Common", item_count: 10, sale_value: 5, total_value: 50 },
    {
      item_rarity: "Uncommon",
      item_count: 6,
      sale_value: 10,
      total_value: 60,
    },
    { item_rarity: "Rare", item_count: 3, sale_value: 20, total_value: 60 },
    { item_rarity: "Epic", item_count: 1, sale_value: 40, total_value: 40 },
  ],

  userAchievements: {
    alice: [
      {
        username: "alice",
        achievement_name: "Forest Explorer",
        objective_name: "Find the Ancient Oak",
        location_name: "Dark Forest",
        completed_on: "2025-11-20",
      },
      {
        username: "alice",
        achievement_name: "Crystal Scholar",
        objective_name: "Study the Crystal Shrine",
        location_name: "Crystal Cave",
        completed_on: "2025-11-22",
      },
    ],
    bob: [
      {
        username: "bob",
        achievement_name: "Forest Explorer",
        objective_name: "Find the Ancient Oak",
        location_name: "Dark Forest",
        completed_on: "2025-11-21",
      },
    ],
  },

  difficulties: ["Easy", "Normal", "Hard", "Expert", "Nightmare"],

  charTypes: ["Warrior", "Mage", "Rogue"],

  savefileAnalysis: {
    byDifficulty: [
      {
        difficulty: "Easy",
        savefile_count: 3,
        avg_items_per_save: 4.5,
        total_items: 14,
      },
      {
        difficulty: "Normal",
        savefile_count: 2,
        avg_items_per_save: 3,
        total_items: 6,
      },
    ],
    overall: {
      total_savefiles: 5,
      avg_items_across_all: 3.8,
      max_items_in_save: 7,
      difficulty_with_most_saves: "Easy",
    },
  },
};

export const api = {
  async createUser(data) {
    if (USE_MOCK) {
      return {
        success: true,
        data: {
          ...data,
          created_on: "2025-01-01",
        },
      };
    }

    const res = await fetch(`${API_BASE}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    return res.json();
  },

  async createSaveFile(data) {
    if (USE_MOCK) {
      return {
        success: true,
        data: {
          ...data,
          created_on: "2025-01-01",
        },
      };
    }

    const res = await fetch(`${API_BASE}/savefiles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getUsers() {
    if (USE_MOCK) {
      return {
        success: true,
        data: mockData.users,
      };
    }

    const res = await fetch(`${API_BASE}/users`);
    return res.json();
  },

  async deleteUser(username) {
    if (USE_MOCK) {
      const index = mockData.users.findIndex((u) => u.username === username);
      if (index !== -1) {
        mockData.users.splice(index, 1);
        return {
          success: true,
          message: `User '${username}' deleted (mock)`,
        };
      }
      return {
        success: false,
        message: "User not found (mock)",
      };
    }

    const res = await fetch(
      `${API_BASE}/users/${encodeURIComponent(username)}`,
      {
        method: "DELETE",
      }
    );
    return res.json();
  },

  async getItems() {
    if (USE_MOCK) {
      return { success: true, data: mockData.items };
    }

    const res = await fetch(`${API_BASE}/items`);
    return res.json();
  },

  async updateItem(itemName, payload) {
    if (USE_MOCK) {
      const item = mockData.items.find((i) => i.item_name === itemName);
      if (!item) {
        return { success: false, message: "Item not found (mock)" };
      }
      if (payload.item_rarity) item.item_rarity = payload.item_rarity;
      if (payload.item_type) item.item_type = payload.item_type;
      return {
        success: true,
        message: "Item updated successfully (mock)",
        data: { ...item },
      };
    }

    const res = await fetch(
      `${API_BASE}/items/${encodeURIComponent(itemName)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    return res.json();
  },

  async getActiveUsers(options = {}) {
    const minSavefiles = Number(options.minSavefiles ?? 1);

    if (USE_MOCK) {
      const filtered = mockData.activeUsers.filter(
        (u) => u.savefile_count >= minSavefiles
      );
      return { success: true, threshold: minSavefiles, data: filtered };
    }

    const params = new URLSearchParams();
    params.set("min_savefiles", String(minSavefiles));

    const res = await fetch(`${API_BASE}/users/active?${params.toString()}`);
    return res.json();
  },

  async getLocations() {
    if (USE_MOCK) {
      return { success: true, data: mockData.locations || [] };
    }
    const res = await fetch(`${API_BASE}/locations`);
    return res.json();
  },

  async getCompletionists(locationName) {
    if (USE_MOCK) {
      const list = mockData.completionists[locationName] || [];
      // adapt to backend shape: completed_count vs completed_objectives
      const data = list.map((u) => ({
        username: u.username,
        first_name: u.first_name,
        completed_count: u.completed_objectives,
        total_objectives: u.completed_objectives,
      }));
      return {
        success: true,
        location: locationName,
        data,
        total: data.length,
      };
    }

    const params = new URLSearchParams();
    params.set("location_name", locationName);

    const res = await fetch(
      `${API_BASE}/users/completionists?${params.toString()}`
    );
    return res.json();
  },

  async getItemStats() {
    if (USE_MOCK) {
      return { success: true, data: mockData.itemStats };
    }

    const res = await fetch(`${API_BASE}/items/stats/by-rarity`);
    return res.json();
  },

  async getSavefileAnalysis() {
    if (USE_MOCK) {
      return { success: true, data: mockData.savefileAnalysis };
    }

    const res = await fetch(`${API_BASE}/savefiles/analysis`);
    return res.json();
  },

  async getUserAchievements(username) {
    if (USE_MOCK) {
      const list = mockData.userAchievements[username] || [];
      return { success: true, data: list };
    }

    const params = new URLSearchParams();
    if (username) params.set("username", username);

    const res = await fetch(
      `${API_BASE}/achievements/details?${params.toString()}`
    );
    return res.json();
  },

  async getCharacterTypes() {
    if (USE_MOCK) {
      return {
        success: true,
        data: mockData.charTypes,
        total: mockData.charTypes.length,
      };
    }

    const res = await fetch(`${API_BASE}/chartypes`);
    return res.json();
  },

  async getDifficulties() {
    if (USE_MOCK) {
      return {
        success: true,
        data: mockData.difficulties,
        total: mockData.difficulties.length,
      };
    }

    const res = await fetch(`${API_BASE}/difficulties`);
    return res.json();
  },

  // TO DO
  async searchCharacters({ chr_type, location_name, character_kind }) {
    if (USE_MOCK) {
      return {
        success: true,
        data: { npcs: [], pcs: [] },
        total: 0,
      };
    }

    const params = new URLSearchParams();
    if (chr_type) params.set("chr_type", chr_type);
    if (location_name) params.set("location_name", location_name);
    if (character_kind) params.set("character_kind", character_kind);

    const res = await fetch(
      `${API_BASE}/characters/search?${params.toString()}`
    );
    return res.json();
  },

  async getUserReport(fieldsArray) {
    if (USE_MOCK) {
      const fields = fieldsArray;
      const data = mockData.users.map((u) => {
        const obj = {};
        fields.forEach((f) => {
          obj[f] = u[f];
        });
        return obj;
      });
      return { success: true, fields, data, total: data.length };
    }

    const params = new URLSearchParams();
    params.set("fields", fieldsArray.join(","));
    const res = await fetch(`${API_BASE}/users/report?${params.toString()}`);
    return res.json();
  },
};
