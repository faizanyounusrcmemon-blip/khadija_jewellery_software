// ===============================================
//   STOCK REPORT (Search + Rate + Amount FINAL)
// ===============================================

import { useEffect, useState, useMemo } from "react";

export default function StockReport({ onNavigate }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const API = import.meta.env.VITE_BACKEND_URL;

  // ===============================
  // LOAD STOCK
  // ===============================
  async function loadStock() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/stock-report`);
      const data = await res.json();

      if (!data.success) {
        alert("❌ Error loading stock: " + data.error);
      } else {
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
    // eslint-disable-next-line
  }, []);

  // ===============================
  // 🔍 SEARCH FILTER (SAFE)
  // ===============================
  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((r) => {
      const barcode = String(r.barcode || "").toLowerCase();
      const name = String(r.item_name || "").toLowerCase();
      return barcode.includes(q) || name.includes(q);
    });
  }, [rows, search]);

  return (
    <div className="container-fluid text-light py-3" style={{ fontFamily: "Inter" }}>
      {/* EXIT */}
      <button
        onClick={() => onNavigate("dashboard")}
        style={{
          padding: "8px 18px",
          border: "none",
          borderRadius: 8,
          fontWeight: "bold",
          fontSize: 14,
          background: "linear-gradient(90deg,#ffb400,#ff6a00)",
          color: "#fff",
          boxShadow: "0 3px 10px rgba(0,0,0,0.5)",
          cursor: "pointer",
          marginBottom: 12,
        }}
      >
        ⬅ Exit
      </button>

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h2 style={{ color: "#ffca57" }}>📦 Stock Report</h2>

        <button
          onClick={loadStock}
          disabled={loading}
          style={{
            padding: "7px 16px",
            border: "none",
            borderRadius: 8,
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

      {/* 🔍 SEARCH BAR */}
      <input
        type="text"
        placeholder="🔍 Search by barcode or item name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 14px",
          borderRadius: 8,
          border: "1px solid #555",
          background: "#111",
          color: "#fff",
          marginBottom: 10,
        }}
      />

      {/* TABLE */}
      <div
        className="card bg-dark border-secondary"
        style={{
          borderRadius: 10,
          boxShadow: "0 0 12px rgba(0,0,0,0.4)",
        }}
      >
        <div className="card-body p-2">
          {filteredRows.length > 0 ? (
            <div className="table-responsive" style={{ maxHeight: "75vh" }}>
              <table className="table table-dark table-bordered table-sm mb-0">
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
                    <th>Barcode</th>
                    <th>Item Name</th>
                    <th className="text-end">Stock</th>
                    <th className="text-end">Rate</th>
                    <th className="text-end">Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRows.map((r, i) => {
                    const qty = Number(r.stock_qty || 0);
                    const rate = Number(r.rate || 0);

                    // ✅ backend amount preferred, fallback safe
                    const amount =
                      r.amount !== undefined
                        ? Number(r.amount)
                        : qty * rate;

                    return (
                      <tr key={i}>
                        <td>{r.barcode}</td>
                        <td>{r.item_name || "-"}</td>

                        <td
                          className="text-end"
                          style={{
                            fontWeight: "bold",
                            color: qty > 0 ? "#00ff66" : "#ff5555",
                          }}
                        >
                          {qty}
                        </td>

                        <td className="text-end">
                          {rate.toLocaleString()}
                        </td>

                        <td
                          className="text-end"
                          style={{
                            fontWeight: "bold",
                            color: "#00e5ff",
                          }}
                        >
                          {amount.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            !loading && (
              <p className="text-warning text-center py-3">
                No matching stock found.
              </p>
            )
          )}
        </div>
      </div>
    </div>
  );
}
