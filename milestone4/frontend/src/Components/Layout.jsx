import React from "react";

export default function Layout({ children, currentPage, onNavigate }) {
  const pages = [
    "Add User",
    "Delete User",
    "Update Item",
    "Character Search",
    "User Report",
    "Achievements",
    "Item Stats",
    "Active Users",
    "Save File Analysis",
    "Completionists",
  ];

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>DB App</h2>
        <nav>
          {pages.map((p) => (
            <button
              key={p}
              onClick={() => onNavigate(p)}
              className={p === currentPage ? "active" : ""}
            >
              {p}
            </button>
          ))}
        </nav>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
