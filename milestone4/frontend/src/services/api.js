const USE_MOCK = true; 
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
      { item_name: "Healing Potion", item_rarity: "Common", item_type: "Armor" },
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
        { location_name: "Dark Forest", biome: "Forest", landmark: "Ancient Oak" },
        { location_name: "Crystal Cave", biome: "Cave", landmark: "Crystal Shrine" },
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
        { item_rarity: "Uncommon", item_count: 6, sale_value: 10, total_value: 60 },
        { item_rarity: "Rare", item_count: 3, sale_value: 20, total_value: 60 },
        { item_rarity: "Epic", item_count: 1, sale_value: 40, total_value: 40 },
      ],
  };

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
      const index = mockData.users.findIndex(
        (u) => u.username === username
      );
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
      return { success: true, data: filtered };
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
      return { success: true, data: list };
    }

    const params = new URLSearchParams();
    params.set("location_name", locationName);

    const res = await fetch(
      `${API_BASE}/completionists?${params.toString()}`
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
  
};
