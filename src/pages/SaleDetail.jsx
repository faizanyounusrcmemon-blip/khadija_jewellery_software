// --- BEAUTIFUL SaleDetail.jsx (Borders + Exit Button + Premium UI) ---

import React, { useState, useEffect } from "react";
import supabase from "../utils/supabaseClient";

export default function SaleDetail({ onNavigate }) {
  const [sales, setSales] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // ⭐ Load Sales & Returns
  useEffect(() => {
    const loadAll = async () => {
      const { data: salesData } = await supabase
        .from("sales")
        .select("*")
        .eq("is_deleted", false);

      const { data: returnData } = await supabase
        .from("sale_returns")
        .select("invoice_no, amount");

      const returnMap = {};
      returnData?.forEach((r) => {
        returnMap[r.invoice_no] =
          (returnMap[r.invoice_no] || 0) + Number(r.amount || 0);
      });

      const merged = salesData?.map((s) => ({
        ...s,
        return_amount: returnMap[s.invoice_no] || 0,
      }));

      setSales(merged || []);
      setFiltered(merged || []);
    };

    loadAll();
  }, []);

  // ⭐ Filters
  useEffect(() => {
    let result = [...sales];

    if (search)
      result = result.filter((r) =>
        r.customer_name?.toLowerCase().includes(search.toLowerCase())
      );

    if (invoiceSearch)
      result = result.filter((r) =>
        r.invoice_no?.toLowerCase().includes(invoiceSearch.toLowerCase())
      );

    if (fromDate && toDate) {
      const f = new Date(fromDate);
      const t = new Date(toDate);
      result = result.filter((r) => {
        const d = new Date(r.sale_date);
        return d >= f && d <= t;
      });
    }

    setFiltered(result);
  }, [search, invoiceSearch, fromDate, toDate, sales]);

  // ⭐ Group by invoice
  const groupedInvoices = Object.values(
    filtered.reduce((acc, s) => {
      if (!acc[s.invoice_no]) {
        acc[s.invoice_no] = {
          ...s,
          total_amount: 0,
          return_amount: s.return_amount || 0,
        };
      }
      acc[s.invoice_no].total_amount += Number(s.amount || 0);
      return acc;
    }, {})
  );

  const handleEdit = (invoiceNo) => {
    localStorage.setItem("edit_invoice", invoiceNo);
    onNavigate("invoice-edit");
  };

  const handleDelete = async (invoiceNo) => {
    if (!confirm("Delete invoice?")) return;

    await supabase
      .from("sales")
      .update({ is_deleted: true })
      .eq("invoice_no", invoiceNo);

    alert("Invoice deleted");
    window.location.reload();
  };

  const handleExit = () => {
    if (onNavigate) onNavigate("dashboard");
  };

  return (
    <div className="container-fluid py-3 text-light" style={{ fontFamily: "Inter" }}>
      
      {/* EXIT BUTTON */}
      <button
        onClick={handleExit}
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

      <h2 className="fw-bold mb-3" style={{ color: "#ffcc00", fontSize: "26px" }}>
        🧾 Sales Invoice Detail
      </h2>

      {/* FILTER CARD */}
      <div
        className="card bg-dark border-secondary shadow mb-3"
        style={{ borderRadius: "12px" }}
      >
        <div className="card-body">
          <div className="row g-2">
            <div className="col-md-3">
              <input
                placeholder="Search Customer"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-control form-control-sm bg-black text-light border-secondary"
              />
            </div>

            <div className="col-md-3">
              <input
                placeholder="Search Invoice"
                value={invoiceSearch}
                onChange={(e) => setInvoiceSearch(e.target.value)}
                className="form-control form-control-sm bg-black text-light border-secondary"
              />
            </div>

            <div className="col-md-2">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="form-control form-control-sm bg-black text-light border-secondary"
              />
            </div>

            <div className="col-md-2">
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="form-control form-control-sm bg-black text-light border-secondary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* TABLE CARD */}
      <div
        className="card bg-dark border-secondary shadow"
        style={{ borderRadius: "12px" }}
      >
        <div className="card-body p-2">
          <div className="table-responsive" style={{ maxHeight: "70vh" }}>
            <table
              className="table table-dark table-bordered table-sm mb-0"
              style={{ borderColor: "#555" }}
            >
              <thead
                style={{
                  background: "#2b2b2b",
                  color: "#ffcc00",
                  position: "sticky",
                  top: 0,
                  zIndex: 5,
                }}
              >
                <tr>
                  <th>Invoice</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th className="text-end">Total Sale</th>
                  <th className="text-end">Return</th>
                  <th className="text-end">Net</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {groupedInvoices.map((inv) => (
                  <tr key={inv.invoice_no} className="table-row">
                    <td>{inv.invoice_no}</td>
                    <td>{inv.sale_date}</td>
                    <td>{inv.customer_name}</td>

                    <td className="text-end">{inv.total_amount.toFixed(2)}</td>

                    <td className="text-end" style={{ color: "red" }}>
                      {inv.return_amount.toFixed(2)}
                    </td>

                    <td className="text-end" style={{ color: "#4cff8f", fontWeight: "bold" }}>
                      {(inv.total_amount - inv.return_amount).toFixed(2)}
                    </td>

                    <td className="text-center">
                      <button
                        onClick={() => handleEdit(inv.invoice_no)}
                        className="btn btn-sm btn-primary me-1"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(inv.invoice_no)}
                        className="btn btn-sm btn-danger"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {groupedInvoices.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-3">
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
