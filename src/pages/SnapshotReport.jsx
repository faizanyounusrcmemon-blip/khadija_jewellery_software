// =====================================================
//   SNAPSHOT REPORT (Slim Buttons Matching Your UI)
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
    if (!endDate) return setMessage("⚠ Please select END DATE.");

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API}/api/snapshot-preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ end_date: endDate }),
      });

      const data = await res.json();
      if (!data.success) setMessage("❌ " + data.error);
      else setPreviewData(data.rows);
    } catch {
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

    if (!endDate) return setMessage("⚠ Please select END DATE.");

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
      if (data.success)
        setMessage(`✅ Snapshot Created Successfully! Rows: ${data.inserted}`);
      else setMessage("❌ " + data.error);
    } catch {
      setMessage("❌ Snapshot request failed.");
    }

    setLoading(false);
  }

  // BUTTON STYLES — EXACT MATCHING YOUR SCREENSHOT
  const btnPreview = {
    background: "#f4c542",
    color: "black",
    padding: "4px 16px",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  };

  const btnSave = {
    background: "#28c76f",
    color: "black",
    padding: "4px 16px",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  };

  const btnExit = {
    background: "#ff9f43",
    color: "white",
    padding: "6px 14px",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    fontSize: "14px",
    marginBottom: "10px",
  };

  return (
    <div className="container-fluid text-light py-3" style={{ maxWidth: "950px" }}>
      
      {/* EXIT BUTTON */}
      <button style={btnExit} onClick={() => onNavigate("dashboard")}>⬅ Exit</button>

      <h2 className="fw-bold mb-3" style={{ color: "#ffcc00" }}>
        📦 Create Stock Snapshot
      </h2>

      {/* CARD */}
      <div className="card bg-dark border-secondary p-3" style={{ borderRadius: "12px" }}>
        
        <div className="row g-2">

          <div className="col-md-3">
            <label className="fw-bold">From Date</label>
            <input
              type="date"
              className="form-control form-control-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="col-md-3">
            <label className="fw-bold">To Date</label>
            <input
              type="date"
              className="form-control form-control-sm"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {/* BUTTONS EXACT STYLE */}
          <div className="col-md-6 d-flex align-items-end gap-2">
            
            <button style={btnPreview} onClick={previewStock} disabled={loading}>
              🔍 {loading ? "..." : "Preview"}
            </button>

            <button style={btnSave} onClick={createSnapshot} disabled={loading}>
              💾 {loading ? "..." : "Save"}
            </button>

          </div>
        </div>
      </div>

      {/* MESSAGE */}
      {message && (
        <div className="alert alert-dark mt-2">{message}</div>
      )}

      {/* PREVIEW TABLE */}
      {previewData.length > 0 && (
        <div className="card bg-dark border-secondary mt-3 p-3" style={{ borderRadius: "12px" }}>
          <h4 style={{ color: "#ffcc00" }}>📊 Stock Preview</h4>

          <table className="table table-dark table-bordered table-sm mt-2">
            <thead style={{ background: "#333", color: "#ffcc00" }}>
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
                  <td className="text-end" style={{ color: "#00ff66", fontWeight: "bold" }}>
                    {row.stock_qty}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}
    </div>
  );
}
