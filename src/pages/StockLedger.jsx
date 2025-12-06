// ===============================================
//   STOCK LEDGER (Professional UI Version)
// ===============================================

import React, { useEffect, useState } from "react";
import supabase from "../utils/supabaseClient";

export default function StockLedger({ onNavigate }) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [items, setItems] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [rows, setRows] = useState([]);
  const [openingStock, setOpeningStock] = useState(0);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const toYMD = (value) => (value ? String(value).slice(0, 10) : "");

  // ===============================================
  // LOAD ITEM LIST
  // ===============================================
  useEffect(() => {
    async function loadItems() {
      const { data } = await supabase
        .from("items")
        .select("barcode, item_name")
        .order("item_name", { ascending: true });

      setItems(data || []);
    }
    loadItems();
  }, []);

  const filteredItems = items.filter((it) => {
    const q = searchText.toLowerCase();
    return (
      it.item_name?.toLowerCase().includes(q) ||
      String(it.barcode).toLowerCase().includes(q)
    );
  });

  // ===============================================
  // LOAD LEDGER
  // ===============================================
  const loadLedger = async () => {
    setMsg("");
    setRows([]);
    setOpeningStock(0);

    if (!fromDate || !toDate) {
      setMsg("⚠ Please select From Date and To Date");
      return;
    }

    if (!selectedItem?.barcode) {
      setMsg("⚠ Please select an item from the list");
      return;
    }

    setLoading(true);

    try {
      const barcode = String(selectedItem.barcode);

      // Snapshot
      const { data: snapRows } = await supabase
        .from("stock_snapshots")
        .select("snap_date, stock_qty")
        .eq("barcode", barcode)
        .lte("snap_date", fromDate)
        .order("snap_date", { ascending: false })
        .limit(1);

      let snapshotDate = "1900-01-01";
      let baseQty = 0;

      if (snapRows?.length) {
        snapshotDate = toYMD(snapRows[0].snap_date);
        baseQty = Number(snapRows[0].stock_qty);
      }

      // Purchases
      const { data: pur } = await supabase
        .from("purchases")
        .select("id, purchase_date, qty, invoice_no")
        .eq("barcode", barcode)
        .eq("is_deleted", false)
        .gt("purchase_date", snapshotDate)
        .lte("purchase_date", toDate);

      // Sales
      const { data: sal } = await supabase
        .from("sales")
        .select("id, sale_date, qty, invoice_no")
        .eq("barcode", barcode)
        .eq("is_deleted", false)
        .gt("sale_date", snapshotDate)
        .lte("sale_date", toDate);

      // Returns
      const { data: ret } = await supabase
        .from("sale_returns")
        .select("id, created_at, return_qty, invoice_no")
        .eq("barcode", barcode)
        .gt("created_at", snapshotDate)
        .lte("created_at", toDate + "T23:59:59");

      // Opening Stock
      let opening = baseQty;

      (pur || []).forEach((p) => {
        if (toYMD(p.purchase_date) < fromDate) opening += Number(p.qty);
      });

      (sal || []).forEach((s) => {
        if (toYMD(s.sale_date) < fromDate) opening -= Number(s.qty);
      });

      (ret || []).forEach((r) => {
        if (toYMD(r.created_at) < fromDate) opening += Number(r.return_qty);
      });

      setOpeningStock(opening);

      // Ledger Rows
      const ledger = [];

      ledger.push({
        _type: "OPENING",
        date: fromDate,
        docNo: "",
        narration: "Opening Balance",
        inQty: 0,
        outQty: 0,
        balance: opening,
      });

      (pur || []).forEach((p) => {
        const d = toYMD(p.purchase_date);
        if (d >= fromDate && d <= toDate)
          ledger.push({
            _type: "PUR",
            date: d,
            docNo: p.invoice_no || p.id,
            narration: "Purchase",
            inQty: Number(p.qty),
            outQty: 0,
          });
      });

      (sal || []).forEach((s) => {
        const d = toYMD(s.sale_date);
        if (d >= fromDate && d <= toDate)
          ledger.push({
            _type: "SAL",
            date: d,
            docNo: s.invoice_no || s.id,
            narration: "Sale",
            inQty: 0,
            outQty: Number(s.qty),
          });
      });

      (ret || []).forEach((r) => {
        const d = toYMD(r.created_at);
        if (d >= fromDate && d <= toDate)
          ledger.push({
            _type: "RET",
            date: d,
            docNo: r.invoice_no || r.id,
            narration: "Sale Return",
            inQty: Number(r.return_qty),
            outQty: 0,
          });
      });

      ledger.sort((a, b) => {
        if (a._type === "OPENING") return -1;
        if (b._type === "OPENING") return 1;
        return a.date.localeCompare(b.date);
      });

      let bal = opening;
      const final = ledger.map((row) => {
        if (row._type === "OPENING") return { ...row, balance: bal };
        bal += (row.inQty || 0) - (row.outQty || 0);
        return { ...row, balance: bal };
      });

      setRows(final);
    } catch (err) {
      setMsg("❌ Error: " + err.message);
    }

    setLoading(false);
  };

  // ===============================================
  // UI (BEAUTIFUL + PROFESSIONAL)
  // ===============================================
  return (
    <div className="container-fluid py-3 text-light" style={{ fontFamily: "Inter" }}>

      {/* EXIT BUTTON — BEAUTIFUL GRADIENT */}
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

      <h2
        className="fw-bold mb-3"
        style={{ color: "#ffca57", fontSize: "26px" }}
      >
        📒 Stock Ledger (Snapshot Based)
      </h2>

      {/* Filters Card */}
      <div
        className="card bg-dark border-secondary mb-3"
        style={{
          borderRadius: "10px",
          boxShadow: "0 0 12px rgba(0,0,0,0.4)",
        }}
      >
        <div className="card-body">
          <div className="row g-3">

            {/* FROM DATE — FIXED WHITE DATE PICKER */}
            <div className="col-md-2">
              <label className="form-label fw-bold">From Date</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                style={{
                  background: "#fff",
                  color: "#000",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                }}
              />
            </div>

            {/* TO DATE — FIXED WHITE DATE PICKER */}
            <div className="col-md-2">
              <label className="form-label fw-bold">To Date</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                style={{
                  background: "#fff",
                  color: "#000",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                }}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label fw-bold">Selected Item</label>
              <div
                className="form-control form-control-sm"
                style={{
                  background: "#000",
                  color: "#ffca57",
                  border: "1px solid #333",
                }}
              >
                {selectedItem
                  ? `${selectedItem.item_name} (${selectedItem.barcode})`
                  : "No item selected"}
              </div>
            </div>

            <div className="col-md-2">
              <label className="form-label fw-bold">Opening Stock</label>
              <div
                className="form-control form-control-sm"
                style={{
                  background: "#000",
                  color: "#4fc3f7",
                  border: "1px solid #333",
                }}
              >
                {openingStock}
              </div>
            </div>

            <div className="col-md-3 d-flex align-items-end justify-content-end">
              <button
                className="btn btn-warning fw-bold px-4 btn-sm"
                onClick={loadLedger}
                disabled={loading}
              >
                {loading ? "Loading..." : "📊 Load Ledger"}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Message */}
      {msg && (
        <div className="alert alert-warning py-2">{msg}</div>
      )}

      <div className="row">

        {/* ITEM LIST */}
        <div className="col-md-3 mb-3">
          <div
            className="card bg-dark border-secondary h-100"
            style={{ borderRadius: "10px", boxShadow: "0 0 10px #000" }}
          >
            <div className="card-header py-2">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search item or barcode..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{
                  background: "#111",
                  color: "#fff",
                  border: "1px solid #444",
                }}
              />
            </div>

            <div
              className="list-group list-group-flush"
              style={{ maxHeight: "65vh", overflowY: "auto" }}
            >
              {filteredItems.map((it) => (
                <button
                  key={it.barcode}
                  className={
                    "list-group-item list-group-item-action small bg-dark text-light " +
                    (selectedItem?.barcode === it.barcode ? "active" : "")
                  }
                  onClick={() => setSelectedItem(it)}
                >
                  <div className="fw-bold">{it.item_name}</div>
                  <div className="text-muted small">{it.barcode}</div>
                </button>
              ))}

              {filteredItems.length === 0 && (
                <div className="text-muted small p-2">
                  No item found for "{searchText}"
                </div>
              )}
            </div>
          </div>
        </div>

        {/* LEDGER TABLE */}
        <div className="col-md-9">
          <div
            className="card bg-dark border-secondary"
            style={{
              borderRadius: "10px",
              boxShadow: "0 0 12px rgba(0,0,0,0.5)",
            }}
          >
            <div className="card-body p-2">

              <div className="table-responsive" style={{ maxHeight: "70vh" }}>
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
                      <th>Date</th>
                      <th>Doc No</th>
                      <th>Description</th>
                      <th className="text-end">In</th>
                      <th className="text-end">Out</th>
                      <th className="text-end">Balance</th>
                    </tr>
                  </thead>

                  <tbody>
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center text-muted py-3">
                          Ledger empty. Select item + date range and click "Load Ledger".
                        </td>
                      </tr>
                    )}

                    {rows.map((r, idx) => (
                      <tr
                        key={idx}
                        style={
                          r._type === "OPENING"
                            ? { background: "#1c1c1c", fontWeight: "bold" }
                            : {}
                        }
                      >
                        <td>{r.date}</td>
                        <td>{r.docNo}</td>
                        <td>{r.narration}</td>
                        <td className="text-end">{r.inQty || ""}</td>
                        <td className="text-end">{r.outQty || ""}</td>
                        <td className="text-end">{r.balance}</td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
