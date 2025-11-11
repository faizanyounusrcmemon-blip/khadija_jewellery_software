import React, { useEffect, useState } from "react";
import supabase from "../utils/supabaseClient";

export default function PurchaseItemDetail() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rows, setRows] = useState([]);
  const [itemQuery, setItemQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Default date range (last 30 days)
  useEffect(() => {
    const t = new Date();
    const f = new Date();
    f.setDate(t.getDate() - 30);
    setFrom(f.toISOString().slice(0, 10));
    setTo(t.toISOString().slice(0, 10));
  }, []);

  // Load items on mount and when filters change
  useEffect(() => {
    if (from && to) load();
  }, [from, to, itemQuery]);

  // Load purchase items
  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("purchases")
      .select(
        "id, invoice_no, company_name, purchase_date, item_code, item_name, sale_price, qty, barcode"
      )
      .gte("purchase_date", from)
      .lte("purchase_date", to)
      .order("purchase_date", { ascending: false });

    if (error) {
      console.error(error);
      setRows([]);
    } else {
      let list = data || [];

      if (itemQuery.trim()) {
        const q = itemQuery.toLowerCase();
        list = list.filter(
          (r) =>
            (r.item_name || "").toLowerCase().includes(q) ||
            (r.item_code || "").toLowerCase().includes(q)
        );
      }

      setRows(list);
    }
    setLoading(false);
  }

  // Search suggestions from items table
  async function loadSuggestions(q) {
    setItemQuery(q);
    if (!q.trim()) return setSuggestions([]);
    const { data } = await supabase
      .from("items")
      .select("item_name, item_code")
      .ilike("item_name", `%${q}%`)
      .limit(10);
    setSuggestions(data || []);
  }

  // Print single item barcode
  function printBarcodes(r) {
    localStorage.setItem("print_invoice", r.invoice_no);
    localStorage.setItem("print_barcode", r.barcode);
    localStorage.setItem("print_name", r.item_name);
    localStorage.setItem("print_price", r.sale_price || 0);
    localStorage.setItem("print_qty", r.qty);
    window.open("/print.html", "_blank"); // ✅ standalone page
  }

  return (
    <div style={{ padding: 12, color: "#fff", minHeight: "100vh" }}>
      <h2 style={{ color: "#f3c46b" }}>Purchase Item Detail</h2>

      {/* Filters */}
      <div style={{ marginBottom: 12 }}>
        <label>From: </label>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          style={{ padding: 4, marginRight: 8 }}
        />

        <label>To: </label>
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          style={{ padding: 4, marginRight: 12 }}
        />

        <input
          value={itemQuery}
          onChange={(e) => loadSuggestions(e.target.value)}
          placeholder="🔍 Search item…"
          style={{
            padding: 6,
            width: 250,
            borderRadius: 4,
            border: "1px solid #ccc",
          }}
        />
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div
          style={{
            background: "#222",
            padding: 6,
            borderRadius: 4,
            width: 250,
            marginBottom: 10,
            position: "absolute",
            zIndex: 100,
          }}
        >
          {suggestions.map((s) => (
            <div
              key={s.item_code}
              onClick={() => {
                setItemQuery(s.item_name);
                setSuggestions([]);
              }}
              style={{
                padding: 6,
                cursor: "pointer",
                borderBottom: "1px solid #333",
              }}
            >
              {s.item_name}
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <p>Loading...</p>
      ) : rows.length > 0 ? (
        <table
          border="1"
          style={{
            width: "100%",
            marginTop: 20,
            borderCollapse: "collapse",
            background: "#1c1c1c",
          }}
        >
          <thead>
            <tr style={{ background: "#333", color: "#f3c46b" }}>
              <th style={{ padding: 6 }}>Inv</th>
              <th style={{ padding: 6 }}>Date</th>
              <th style={{ padding: 6 }}>Company</th>
              <th style={{ padding: 6 }}>Item</th>
              <th style={{ padding: 6 }}>Qty</th>
              <th style={{ padding: 6 }}>Barcode</th>
              <th style={{ padding: 6 }}>Print</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} style={{ borderBottom: "1px solid #555" }}>
                <td style={{ padding: 6 }}>{r.invoice_no}</td>
                <td style={{ padding: 6 }}>{r.purchase_date}</td>
                <td style={{ padding: 6 }}>{r.company_name}</td>
                <td style={{ padding: 6 }}>{r.item_name}</td>
                <td style={{ padding: 6 }}>{r.qty}</td>
                <td style={{ padding: 6 }}>{r.barcode}</td>
                <td style={{ padding: 6 }}>
                  <button
                    onClick={() => printBarcodes(r)}
                    style={{
                      background: "#f3c46b",
                      color: "#000",
                      border: "none",
                      padding: "4px 8px",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    Print
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ marginTop: 20, color: "#ccc" }}>No records found.</p>
      )}
    </div>
  );
}
