// =====================================================
//   SNAPSHOT HISTORY (Professional UI Version)
// =====================================================

import React, { useEffect, useState } from "react";

export default function SnapshotHistory({ onNavigate }) {
  const [rows, setRows] = useState([]);

  const API = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await fetch(`${API}/api/snapshot-history`);
    const data = await res.json();
    if (data.success) setRows(data.rows || []);
  }

  return (
    <div
      className="container-fluid text-light py-3"
      style={{ fontFamily: "Inter", maxWidth: "1000px" }}
    >
      {/* EXIT BUTTON */}
      <button
        onClick={() => onNavigate("dashboard")}
        style={{
          padding: "8px 18px",
          border: "none",
          borderRadius: "8px",
          fontWeight: "bold",
          fontSize: "14px",
          background: "linear-gradient(90deg, #ffb400, #ff6a00)",
          color: "#fff",
          boxShadow: "0 3px 10px rgba(0,0,0,0.5)",
          cursor: "pointer",
          marginBottom: "12px",
        }}
      >
        ⬅ Exit
      </button>

      {/* HEADING */}
      <h2 className="fw-bold mb-3" style={{ color: "#ffcc00", fontSize: "26px" }}>
        📜 Snapshot History
      </h2>

      {/* TABLE CARD */}
      <div
        className="card bg-dark border-secondary shadow"
        style={{ borderRadius: "12px", padding: "12px" }}
      >
        <div className="table-responsive" style={{ maxHeight: "75vh" }}>
          <table
            className="table table-dark table-bordered table-sm mb-0"
            style={{ borderColor: "#555" }}
          >
            <thead
              style={{
                position: "sticky",
                top: 0,
                background: "#2b2b2b",
                color: "#ffcc00",
                zIndex: 5,
              }}
            >
              <tr>
                <th>ID</th>
                <th>From Date</th>
                <th>To Date</th>
                <th className="text-end">Items Inserted</th>
                <th>Created At</th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-3">
                    No snapshot history available.
                  </td>
                </tr>
              )}

              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.from_date || "-"}</td>
                  <td>{r.to_date}</td>
                  <td
                    className="text-end"
                    style={{ fontWeight: "bold", color: "#00ff66" }}
                  >
                    {r.items_inserted}
                  </td>
                  <td>{new Date(r.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
}
