// src/pages/UpdateItem.jsx
import React, { useEffect, useState } from "react";
import LoadingSpinner from "../Components/LoadingSpinner";
import { api } from "../services/api";

const ITEM_RARITIES = ["Common", "Uncommon", "Rare", "Epic", "Legendary"];
const ITEM_TYPES = ["Armour", "Weapon"];

export default function UpdateItem() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [selectedName, setSelectedName] = useState("");
  const [rarity, setRarity] = useState("");
  const [type, setType] = useState("");

  useEffect(() => {
    async function loadItems() {
      setLoading(true);
      setMessage("");

      try {
        const res = await api.getItems();
        if (res.success && res.data && res.data.length > 0) {
          setItems(res.data);
          // default selection: first item
          const first = res.data[0];
          setSelectedName(first.item_name);
          setRarity(first.item_rarity || ITEM_RARITIES[0]);
          setType(first.item_type || ITEM_TYPES[0]);
        } else {
          setItems([]);
          setSelectedName("");
          setMessage(res.message || "No items found");
        }
      } catch (err) {
        setMessage("Network or server error while loading items");
      } finally {
        setLoading(false);
      }
    }

    loadItems();
  }, []);

  function handleRowClick(itemName) {
    setSelectedName(itemName);
    const item = items.find((i) => i.item_name === itemName);
    if (item) {
      setRarity(item.item_rarity || ITEM_RARITIES[0]);
      setType(item.item_type || ITEM_TYPES[0]);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedName) return;

    setSaving(true);
    setMessage("");

    try {
      const payload = {
        item_rarity: rarity,
        item_type: type,
      };

      const res = await api.updateItem(selectedName, payload);
      if (res.success) {
        // update local list so table reflects new values
        setItems((prev) =>
          prev.map((i) =>
            i.item_name === selectedName
              ? { ...i, item_rarity: rarity, item_type: type }
              : i
          )
        );
        setMessage(res.message || `Item '${selectedName}' updated successfully`);
      } else {
        setMessage(res.message || `Failed to update '${selectedName}'`);
      }
    } catch (err) {
      setMessage("Network or server error while updating item");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">Update Item</h1>

      <div className="card">
        <p style={{ marginTop: 0, marginBottom: "0.75rem", fontSize: "0.9rem" }}>
          Click an item in the table, then update its rarity/type using the form below.
        </p>

        {loading && <LoadingSpinner />}

        {message && <p className="form-message">{message}</p>}

        {!loading && items.length === 0 && (
          <p>No items available to update.</p>
        )}

        {!loading && items.length > 0 && (
          <>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Item name</th>
                    <th>Rarity</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const isSelected = item.item_name === selectedName;
                    return (
                      <tr
                        key={item.item_name}
                        onClick={() => handleRowClick(item.item_name)}
                        className={isSelected ? "row-selected" : ""}
                        style={{ cursor: "pointer" }}
                      >
                        <td>{item.item_name}</td>
                        <td>{item.item_rarity}</td>
                        <td>{item.item_type}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {selectedName && (
              <form onSubmit={handleSubmit} className="form" style={{ marginTop: "1rem" }}>
                <div className="form-row">
                  <label>
                    Selected item
                    <input value={selectedName} disabled />
                  </label>
                </div>

                <div className="form-row">
                  <label>
                    Rarity
                    <select
                      value={rarity}
                      onChange={(e) => setRarity(e.target.value)}
                    >
                      {ITEM_RARITIES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="form-row">
                  <label>
                    Type
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                    >
                      {ITEM_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
