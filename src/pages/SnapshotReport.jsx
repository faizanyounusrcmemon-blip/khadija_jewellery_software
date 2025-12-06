// =====================================================
//   SNAPSHOT REPORT (Professional UI Version)
// =====================================================

import React, { useState } from "react";

export default function SnapshotReport({ onNavigate }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [previewData, setPreviewData] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const API = import.meta.env.VITE_BACKEND_URL;

  // ---------------------------------------------------
  // 🔍 PREVIEW STOCK
  // ---------------------------------------------------
  async function previewStock() {
    if (!endDate) {
      setMessage("⚠ Please select END DATE.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API}/api/snapshot-preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ end_date: endDate }),
      });

      const data = await res.json();

      if (!data.success) {
        setMessage("❌ " + data.error);
      } else {
        setPreviewData(data.rows);
        setMessage("");
      }
    } catch (err) {
      setMessage("❌ Preview request failed.");
    }

    setLoading(false);
  }

  // ---------------------------------------------------
  // 📥 CREATE SNAPSHOT
  // ---------------------------------------------------
  async function createSnapshot() {
    const password = prompt("Enter password:");
    if (!password) return;

    if (!endDate) {
      setMessage("⚠ Please select END DATE.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API}/api/snapshot-create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start_date: startDate || null,
          end_date: endDate,
          password,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage(`✅ Snapshot Created Successfully! Rows: ${data.inserted}`);
      } else {
        setMessage("❌ " + data.error);
      }
    } catch (err) {
      setMessage("❌ Snapshot request failed.");
    }

  setLoading(false);
  }

  // ====================================================
  // UI (Beautiful + Professional ERP Look)
  // ====================================================
  return (
    <div className="container-fluid text-light py-3" style={{ fontFamily: "Inter", maxWidth: "950px" }}>
      
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
        📦 Create Stock Snapshot
      </h2>

      {/* FILTER CARD */}
      <div
        className="card bg-dark border-secondary shadow mb-3"
        style={{ borderRadius: "12px", padding: "15px" }}
      >
        <div className="row g-3">

          {/* FROM DATE */}
          <div className="col-md-3">
            <label className="fw-bold">From Date (optional)</label>
            <input
              type="date"
              className="form-control form-control-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                background: "#fff",
                color: "#000",
                border: "1px solid #ccc",
                borderRadius: "6px",
              }}
            />
          </div>

          {/* END DATE */}
          <div className="col-md-3">
            <label className="fw-bold">Snapshot Date</label>
            <input
              type="date"
              className="form-control form-control-sm"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                background: "#fff",
                color: "#000",
                border: "1px solid #ccc",
                borderRadius: "6px",
              }}
            />
          </div>

          {/* BUTTONS */}
          <div className="col-md-6 d-flex align-items-end gap-2">

            <button
              className="btn btn-warning fw-bold w-50"
              onClick={previewStock}
              disabled={loading}
              style={{
                color: "#000",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
              }}
            >
              🔍 {loading ? "Loading..." : "Preview"}
            </button>

            <button
              className="btn btn-success fw-bold w-50"
              onClick={createSnapshot}
              disabled={loading}
              style={{
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
              }}
            >
              📥 {loading ? "Saving..." : "Save Snapshot"}
            </button>

          </div>
        </div>
      </div>

      {/* MESSAGE */}
      {message && (
        <div
          className="alert alert-dark shadow-sm"
          style={{ borderRadius: "8px", fontWeight: "bold" }}
        >
          {message}
        </div>
      )}

      {/* PREVIEW TABLE */}
      {previewData.length > 0 && (
        <div className="mt-3 card bg-dark border-secondary shadow"
          style={{ borderRadius: "12px", padding: "15px" }}>
          
          <h4 style={{ color: "#ffcc00" }}>📊 Stock Preview</h4>

          <div className="table-responsive mt-2" style={{ maxHeight: "70vh" }}>
            <table className="table table-dark table-bordered table-sm">
              <thead
                style={{
                  background: "#333",
                  position: "sticky",
                  top: 0,
                  zIndex: 5,
                  color: "#ffcc00",
                }}
              >
                <tr>
                  <th>Barcode</th>
                  <th>Item</th>
                  <th className="text-end">Stock</th>
                </tr>
              </thead>

              <tbody>
                {previewData.map((row, i) => (
                  <tr key={i}>
                    <td>{row.barcode}</td>
                    <td>{row.item_name}</td>
                    <td className="text-end" style={{ fontWeight: "bold", color: "#00ff66" }}>
                      {row.stock_qty}
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </div>
      )}

    </div>
  );
}
