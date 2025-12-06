// ===================================================
//   Archive & Opening Stock Manager (PRO UI VERSION)
// ===================================================

import React, { useState } from "react";

export default function ArchiveOpeningStock({ onNavigate }) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("danger");

  const API = import.meta.env.VITE_BACKEND_URL;
  const PASSWORD = "faizanyounus2122";

  const askPassword = (label) => prompt(`🔐 Enter password to ${label}:`);

  // ===================================================
  // LOAD PREVIEW
  // ===================================================
  const loadPreview = async () => {
    if (!fromDate || !toDate) {
      setMsg("Please select date range");
      setMsgType("danger");
      return;
    }

    setLoading(true);
    setMsg("");

    try {
      const res = await fetch(`${API}/api/archive-preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start_date: fromDate, end_date: toDate }),
      });

      const json = await res.json();

      if (!json.success) {
        setMsg(json.error || "Failed to load preview");
        setMsgType("danger");
        setRows([]);
      } else {
        setRows(json.rows || []);
      }
    } catch (err) {
      setMsg(err.message);
      setMsgType("danger");
      setRows([]);
    }

    setLoading(false);
  };

  // ===================================================
  // DELETE DATA
  // ===================================================
  const deleteData = async () => {
    const pass = askPassword("DELETE OLD DATA");
    if (pass !== PASSWORD) return alert("❌ Wrong Password!");

    if (!fromDate || !toDate) {
      setMsg("Select date range first");
      setMsgType("danger");
      return;
    }

    if (!window.confirm("⚠ Are you sure? This will permanently delete records.")) return;

    setMsg("Deleting...");
    setMsgType("info");

    try {
      const res = await fetch(`${API}/api/archive-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start_date: fromDate,
          end_date: toDate,
          password: pass,
        }),
      });

      const json = await res.json();

      if (json.success) {
        setMsg("🗑️ Data Deleted Successfully!");
        setMsgType("success");
        setRows([]);
      } else {
        setMsg(json.error || "Delete failed");
        setMsgType("danger");
      }
    } catch (err) {
      setMsg(err.message);
      setMsgType("danger");
    }
  };

  // ===================================================
  // MESSAGE BOX
  // ===================================================
  const MessageBox = () =>
    msg && (
      <div
        className={`alert alert-${msgType} fw-bold shadow-sm`}
        style={{
          fontSize: "14px",
          borderRadius: "8px",
          marginTop: "8px",
        }}
      >
        {msg}
      </div>
    );

  // ===================================================
  // UI
  // ===================================================
  return (
    <div className="container-fluid text-light py-3" style={{ fontFamily: "Inter" }}>

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

      {/* TITLE */}
      <h2
        className="fw-bold mb-3"
        style={{ color: "#ffca57", fontSize: "26px" }}
      >
        📦 Archive & Opening Stock Manager
      </h2>

      {/* FILTER CARD */}
      <div
        className="card bg-dark border-secondary shadow mb-3"
        style={{
          borderRadius: "12px",
          boxShadow: "0 0 12px rgba(0,0,0,0.4)",
        }}
      >
        <div className="card-body">
          <div className="row g-3 align-items-end">

            {/* FROM DATE */}
            <div className="col-md-3">
              <label className="fw-bold">From Date</label>
              <input
                type="date"
                className="form-control form-control-sm"
                style={{
                  background: "#fff",        // White date field
                  color: "#000",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                }}
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            {/* TO DATE */}
            <div className="col-md-3">
              <label className="fw-bold">To Date</label>
              <input
                type="date"
                className="form-control form-control-sm"
                style={{
                  background: "#fff",
                  color: "#000",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                }}
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            {/* ACTION BUTTONS */}
            <div className="col-md-6 d-flex flex-wrap gap-2 justify-content-end">

              {/* PREVIEW */}
              <button
                className="btn fw-bold btn-sm"
                style={{
                  background: "#ffca57",
                  color: "#000",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                }}
                onClick={loadPreview}
              >
                🔍 Preview
              </button>

              {/* DELETE */}
              <button
                className="btn fw-bold btn-sm"
                style={{
                  background: "#ff3b3b",
                  color: "#fff",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                }}
                onClick={deleteData}
              >
                🗑 Delete
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* MESSAGE */}
      <MessageBox />

      {/* LOADING */}
      {loading && (
        <p className="text-info fw-bold mt-2">⏳ Loading summary…</p>
      )}

      {/* RESULT TABLE */}
      {rows.length > 0 && (
        <div
          className="card bg-dark border-secondary shadow mt-3"
          style={{
            borderRadius: "12px",
            padding: "12px",
            boxShadow: "0 0 12px rgba(0,0,0,0.4)",
          }}
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
                  color: "#ffca57",
                  zIndex: 5,
                }}
              >
                <tr>
                  <th style={{ width: "120px" }}>Barcode</th>
                  <th>Item</th>
                  <th className="text-end">Purchase</th>
                  <th className="text-end">Sale</th>
                  <th className="text-end">Return</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td>{r.item_code || r.barcode}</td>
                    <td>{r.item_name}</td>
                    <td className="text-end">{r.purchase_qty}</td>
                    <td className="text-end">{r.sale_qty}</td>
                    <td className="text-end">{r.return_qty}</td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </div>
      )}

      {!loading && rows.length === 0 && (
        <p className="text-warning mt-3 fw-bold">No data found.</p>
      )}
    </div>
  );
}
