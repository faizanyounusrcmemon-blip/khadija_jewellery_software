// ===========================================================
//   SALE ITEM DETAIL — PREMIUM ERP UI + EXIT BUTTON ADDED
// ===========================================================

import React, { useEffect, useState } from "react";
import supabase from "../utils/supabaseClient";

export default function SaleItemDetail({ onNavigate }) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [customerList, setCustomerList] = useState([]);
  const [itemList, setItemList] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [filteredSales, setFilteredSales] = useState([]);

  // Load customers and items
  useEffect(() => {
    const loadLists = async () => {
      const { data: customers } = await supabase.from("sales").select("customer_name");
      const { data: items } = await supabase.from("sales").select("item_name");

      setCustomerList([...new Set(customers?.map((c) => c.customer_name) || [])]);
      setItemList([...new Set(items?.map((i) => i.item_name) || [])]);
    };
    loadLists();
  }, []);

  // Search sales data
  const handleSearch = async () => {
    let query = supabase.from("sales").select("*");

    if (fromDate && toDate) query = query.gte("sale_date", fromDate).lte("sale_date", toDate);
    if (selectedCustomer) query = query.eq("customer_name", selectedCustomer);
    if (selectedItem) query = query.eq("item_name", selectedItem);

    const { data } = await query.order("invoice_no", { ascending: true });
    setFilteredSales(data || []);
  };

  // Group sales by invoice
  const grouped = filteredSales.reduce((acc, sale) => {
    if (!acc[sale.invoice_no]) acc[sale.invoice_no] = { customer: sale, items: [] };
    acc[sale.invoice_no].items.push(sale);
    return acc;
  }, {});
  const invoices = Object.keys(grouped);

  return (
    <div className="container-fluid py-3" style={{ fontFamily: "Inter", color: "#fff" }}>
      
      {/* EXIT BUTTON */}
      <button
        onClick={() => onNavigate("sale-detail")}
        style={{
          padding: "8px 18px",
          border: "none",
          borderRadius: "8px",
          fontWeight: "bold",
          fontSize: "14px",
          background: "linear-gradient(90deg, #ff8e00, #ff5e00)",
          color: "#fff",
          boxShadow: "0 3px 10px rgba(0,0,0,0.6)",
          cursor: "pointer",
          marginBottom: "12px",
        }}
      >
        ⬅ Exit
      </button>

      {/* HEADING */}
      <h2 className="fw-bold mb-3" style={{ color: "#ffcc00", fontSize: "26px" }}>
        🧾 Sales Item Detail Report
      </h2>

      {/* FILTER CARD */}
      <div
        className="card bg-dark border-secondary shadow mb-4"
        style={{ borderRadius: "14px", padding: "16px" }}
      >
        <h5 style={{ color: "#ffcc00" }}>Filters</h5>

        <div className="row g-3 mt-1">

          {/* From Date */}
          <div className="col-md-3">
            <label className="fw-bold">From Date</label>
            <input
              type="date"
              className="form-control form-control-sm"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={{ background: "#fff", color: "#000" }}
            />
          </div>

          {/* To Date */}
          <div className="col-md-3">
            <label className="fw-bold">To Date</label>
            <input
              type="date"
              className="form-control form-control-sm"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={{ background: "#fff", color: "#000" }}
            />
          </div>

          {/* Customer */}
          <div className="col-md-3">
            <label className="fw-bold">Customer</label>
            <input
              list="customerList"
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="form-control form-control-sm"
              placeholder="Search customer..."
              style={{ background: "#111", color: "#fff", border: "1px solid #444" }}
            />
            <datalist id="customerList">
              {customerList.map((c, i) => (
                <option key={i} value={c} />
              ))}
            </datalist>
          </div>

          {/* Item */}
          <div className="col-md-3">
            <label className="fw-bold">Item</label>
            <input
              list="itemList"
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
              className="form-control form-control-sm"
              placeholder="Search item..."
              style={{ background: "#111", color: "#fff", border: "1px solid #444" }}
            />
            <datalist id="itemList">
              {itemList.map((i, idx) => (
                <option key={idx} value={i} />
              ))}
            </datalist>
          </div>

        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="btn btn-warning fw-bold mt-3 px-4"
        >
          🔍 Search
        </button>
      </div>

      {/* RESULTS */}
      {invoices.length > 0 ? (
        invoices.map((inv) => {
          const block = grouped[inv];
          const total = block.items.reduce((s, i) => s + Number(i.amount || 0), 0);

          return (
            <div
              key={inv}
              className="card bg-dark border-secondary shadow mb-4"
              style={{ borderRadius: "14px", padding: "16px" }}
            >
              {/* Invoice Header */}
              <h5 style={{ color: "#ffcc00" }}>
                Invoice #{inv} — {block.customer.sale_date}
              </h5>

              <table className="table table-dark table-bordered mt-2">
                <thead>
                  <tr style={{ background: "#2b2b2b", color: "#ffcc00" }}>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Address</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{block.customer.customer_name}</td>
                    <td>{block.customer.customer_phone}</td>
                    <td>{block.customer.customer_address}</td>
                  </tr>
                </tbody>
              </table>

              {/* Items Table */}
              <table className="table table-dark table-bordered">
                <thead>
                  <tr style={{ background: "#2b2b2b", color: "#ffcc00" }}>
                    <th>Item</th>
                    <th>Barcode</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Discount %</th>
                    <th className="text-end">Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {block.items.map((it) => (
                    <tr key={it.id}>
                      <td>{it.item_name}</td>
                      <td>{it.barcode}</td>
                      <td>{it.qty}</td>
                      <td>{it.sale_rate}</td>
                      <td>{it.discount}</td>
                      <td className="text-end">{Number(it.amount).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total */}
              <div
                className="text-end fw-bold mt-2"
                style={{
                  fontSize: "18px",
                  color: "#4cff8f",
                  borderTop: "1px solid #555",
                  paddingTop: "6px",
                }}
              >
                Total: Rs {total.toFixed(2)}
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-center text-muted">No records found.</p>
      )}
    </div>
  );
}
