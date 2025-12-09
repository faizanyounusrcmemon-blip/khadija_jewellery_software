// ===============================================
//   STOCK REPORT (Professional UI Version)
// ===============================================

import { useEffect, useState } from "react";

export default function StockReport({ onNavigate }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Vite env (make sure .env me ye line ho)
  // VITE_BACKEND_URL="https://khadija-jewellery.vercel.app"
  const API = import.meta.env.VITE_BACKEND_URL;

  async function loadStock() {
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/stock-report`);
      const data = await res.json();

      console.log("STOCK REPORT RESPONSE 👉", data); // ✅ Debug

      if (!data.success) {
        alert("❌ Error loading stock: " + data.error);
      } else {
        // data.rows = [{ barcode, item_name, stock_qty }]
        setRows(data.rows || []);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Request failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="container-fluid text-light py-3"
      style={{ fontFamily: "Inter" }}
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

      {/* TITLE + REFRESH BUTTON */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 style={{ color: "#ffca57", fontSize: "26px" }}>📦 Stock Report</h2>

        <button
          onClick={loadStock}
          disabled={loading}
          style={{
            padding: "7px 16px",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            background: "#0bd46e",
            color: "#000",
            boxShadow: "0 3px 10px rgba(0,0,0,0.5)",
            cursor: "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          🔄 {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* DATA CARD */}
      <div
        className="card bg-dark border-secondary"
        style={{
          borderRadius: "10px",
          boxShadow: "0 0 12px rgba(0,0,0,0.4)",
        }}
      >
        <div className="card-body p-2">
          {rows.length > 0 ? (
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
                    <th style={{ width: "140px" }}>Barcode</th>
                    <th>Item Name</th>
                    <th className="text-end" style={{ width: "120px" }}>
                      Stock Qty
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i}>
                      <td>{r.barcode}</td>

                      {/* ✅ Agar backend se null/empty aaye to "-" dikhao */}
                      <td>{r.item_name && r.item_name.trim() !== "" ? r.item_name : "-"}</td>

                      <td
                        className="text-end"
                        style={{
                          fontWeight: "bold",
                          color:
                            Number(r.stock_qty) > 0 ? "#00ff66" : "#ff5555",
                        }}
                      >
                        {r.stock_qty}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            !loading && (
              <p className="text-warning text-center py-3">
                No stock available.
              </p>
            )
          )}
        </div>
      </div>
    </div>
  );
}
