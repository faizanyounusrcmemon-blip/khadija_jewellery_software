// =====================================================
//      SALE REPORT — ULTRA PREMIUM UI VERSION
// =====================================================

import React, { useEffect, useState } from "react";
import supabase from "../utils/supabaseClient";

export default function SaleReport({ onNavigate }) {
  const [todaySale, setTodaySale] = useState(0);
  const [todayProfit, setTodayProfit] = useState(0);
  const [todayDiscount, setTodayDiscount] = useState(0);
  const [todayReturn, setTodayReturn] = useState(0);
  const [todayNet, setTodayNet] = useState(0);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [records, setRecords] = useState([]);

  const [filteredSale, setFilteredSale] = useState(0);
  const [filteredProfit, setFilteredProfit] = useState(0);
  const [filteredDiscount, setFilteredDiscount] = useState(0);
  const [filteredReturn, setFilteredReturn] = useState(0);
  const [filteredNet, setFilteredNet] = useState(0);

  useEffect(() => {
    loadToday();
  }, []);

  // ======================================================
  //   TODAY REPORT
  // ======================================================
  const loadToday = async () => {
    const today = new Date().toISOString().slice(0, 10);

    const { data: sales } = await supabase
      .from("sales")
      .select("*")
      .eq("sale_date", today)
      .eq("is_deleted", false);

    const { data: returns } = await supabase.from("sale_returns").select("*");

    if (!sales || sales.length === 0) return;

    const invoiceMap = {};

    for (const r of sales) {
      if (!invoiceMap[r.invoice_no]) {
        invoiceMap[r.invoice_no] = {
          totalAmount: 0,
          totalProfit: 0,
          totalDiscount: 0,
        };
      }

      invoiceMap[r.invoice_no].totalAmount += Number(r.amount);

      const saleRate = Number(r.sale_rate);
      const qty = Number(r.qty);
      const discPercent = Number(r.discount || 0);

      const discountAmount = (saleRate * qty * discPercent) / 100;
      invoiceMap[r.invoice_no].totalDiscount += discountAmount;

      const { data: item } = await supabase
        .from("items")
        .select("purchase_price")
        .eq("id", r.item_code)
        .single();

      const purchase = Number(item?.purchase_price || 0);
      const netSale = saleRate - discountAmount / qty;

      invoiceMap[r.invoice_no].totalProfit += (netSale - purchase) * qty;
    }

    let saleSum = 0,
      profitSum = 0,
      discountSum = 0,
      returnSum = 0;

    Object.values(invoiceMap).forEach((v) => {
      saleSum += v.totalAmount;
      profitSum += v.totalProfit;
      discountSum += v.totalDiscount;
    });

    returns
      ?.filter((r) => r.created_at.slice(0, 10) === today)
      .forEach((r) => (returnSum += Number(r.amount)));

    setTodaySale(saleSum);
    setTodayProfit(profitSum);
    setTodayDiscount(discountSum);
    setTodayReturn(returnSum);
    setTodayNet(saleSum - discountSum - returnSum + profitSum);
  };

  // ======================================================
  //   DATE RANGE REPORT
  // ======================================================
  const handleFilter = async () => {
    if (!fromDate || !toDate) return alert("Please select dates!");

    const { data: sales } = await supabase
      .from("sales")
      .select("*")
      .gte("sale_date", fromDate)
      .lte("sale_date", toDate)
      .eq("is_deleted", false);

    const { data: returns } = await supabase.from("sale_returns").select("*");

    if (!sales || sales.length === 0) {
      setRecords([]);
      return;
    }

    const invoiceMap = {};

    for (const r of sales) {
      if (!invoiceMap[r.invoice_no]) {
        invoiceMap[r.invoice_no] = {
          invoice_no: r.invoice_no,
          sale_date: r.sale_date,
          totalAmount: 0,
          totalProfit: 0,
          totalDiscount: 0,
          totalReturn: 0,
        };
      }

      invoiceMap[r.invoice_no].totalAmount += Number(r.amount);

      const saleRate = Number(r.sale_rate);
      const qty = Number(r.qty);
      const discPercent = Number(r.discount || 0);

      const discountAmount = (saleRate * qty * discPercent) / 100;
      invoiceMap[r.invoice_no].totalDiscount += discountAmount;

      const { data: item } = await supabase
        .from("items")
        .select("purchase_price")
        .eq("id", r.item_code)
        .single();

      const purchase = Number(item?.purchase_price || 0);
      const netSale = saleRate - discountAmount / qty;

      invoiceMap[r.invoice_no].totalProfit += (netSale - purchase) * qty;
    }

    returns
      ?.filter(
        (r) =>
          r.created_at.slice(0, 10) >= fromDate &&
          r.created_at.slice(0, 10) <= toDate
      )
      .forEach((r) => {
        if (invoiceMap[r.invoice_no]) {
          invoiceMap[r.invoice_no].totalReturn += Number(r.amount);
        }
      });

    const result = Object.values(invoiceMap);
    setRecords(result);

    let saleSum = 0,
      profitSum = 0,
      discountSum = 0,
      returnSum = 0;

    result.forEach((v) => {
      saleSum += v.totalAmount;
      profitSum += v.totalProfit;
      discountSum += v.totalDiscount;
      returnSum += v.totalReturn;
    });

    setFilteredSale(saleSum);
    setFilteredProfit(profitSum);
    setFilteredDiscount(discountSum);
    setFilteredReturn(returnSum);
    setFilteredNet(saleSum - discountSum - returnSum + profitSum);
  };

  // ======================================================
  //   UI — ULTRA PREMIUM DESIGN
  // ======================================================
  return (
    <div className="container-fluid text-light py-3" style={{ fontFamily: "Inter" }}>
      
      {/* EXIT BUTTON */}
      <button
        onClick={() => onNavigate("dashboard")}
        style={{
          padding: "10px 22px",
          border: "none",
          borderRadius: "10px",
          fontWeight: "bold",
          background: "linear-gradient(90deg, #ff8e00, #ff5500)",
          color: "#fff",
          fontSize: "15px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.6)",
          cursor: "pointer",
          marginBottom: "15px",
        }}
      >
        ⬅ Exit
      </button>

      {/* TITLE */}
      <h2 className="fw-bold mb-4" style={{ color: "#ffcc00", fontSize: "28px" }}>
        📊 Sales / Profit / Discount / Return Report
      </h2>

      {/* ================= TODAY SUMMARY ================= */}
      <div
        className="card bg-dark border-secondary shadow-lg mb-4"
        style={{ borderRadius: "14px", padding: "18px" }}
      >
        <h4 className="mb-3" style={{ color: "#ffcc00" }}>📅 Today Summary</h4>

        <div className="row text-center fw-bold">
          {[
            { label: "Sale", value: todaySale, color: "#00eaff" },
            { label: "Discount", value: todayDiscount, color: "#00ff66" },
            { label: "Profit", value: todayProfit, color: "#4f9bff" },
            { label: "Return", value: todayReturn, color: "#ff4444" },
            { label: "Net", value: todayNet, color: "#ffcc00" },
          ].map((box, i) => (
            <div key={i} className="col-md-2 card p-2 mx-2"
              style={{
                background: "#111",
                borderRadius: "12px",
                boxShadow: `0 0 12px ${box.color}80`,
              }}>
              <div style={{ color: "#bbb", fontSize: "13px" }}>{box.label}</div>
              <div style={{ color: box.color, fontSize: "18px" }}>
                Rs {box.value.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= DATE FILTER ================= */}
      <div
        className="card bg-dark border-secondary shadow-lg mb-4"
        style={{ borderRadius: "14px", padding: "18px" }}
      >
        <h4 className="mb-3" style={{ color: "#ffcc00" }}>📅 Date Range Report</h4>

        <div className="row g-3">
          <div className="col-md-3">
            <label className="fw-bold">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="form-control form-control-sm"
              style={{ background: "#fff", color: "#000" }}
            />
          </div>

          <div className="col-md-3">
            <label className="fw-bold">To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="form-control form-control-sm"
              style={{ background: "#fff", color: "#000" }}
            />
          </div>

          <div className="col-md-3 d-flex align-items-end">
            <button
              className="btn btn-warning fw-bold w-100"
              onClick={handleFilter}
              style={{
                color: "#000",
                borderRadius: "8px",
                fontSize: "14px",
              }}
            >
              Search
            </button>
          </div>
        </div>

        {/* RANGE SUMMARY BOXES */}
        <div className="row text-center fw-bold mt-3">
          {[
            { label: "Sale", value: filteredSale, color: "#00eaff" },
            { label: "Discount", value: filteredDiscount, color: "#00ff66" },
            { label: "Profit", value: filteredProfit, color: "#4f9bff" },
            { label: "Return", value: filteredReturn, color: "#ff4444" },
            { label: "Net", value: filteredNet, color: "#ffcc00" },
          ].map((box, i) => (
            <div key={i} className="col-md-2 card p-2 mx-2"
              style={{
                background: "#111",
                borderRadius: "12px",
                boxShadow: `0 0 12px ${box.color}80`,
              }}>
              <div style={{ color: "#bbb", fontSize: "13px" }}>{box.label}</div>
              <div style={{ color: box.color, fontSize: "18px" }}>
                Rs {box.value.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= RESULT TABLE ================= */}
      {records.length > 0 && (
        <div
          className="card bg-dark border-secondary shadow-lg"
          style={{ borderRadius: "14px", padding: "15px" }}
        >
          <div className="table-responsive" style={{ maxHeight: "70vh" }}>
            <table className="table table-dark table-bordered table-sm">
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
                  <th>Date</th>
                  <th>Invoice</th>
                  <th className="text-end">Sale</th>
                  <th className="text-end">Discount</th>
                  <th className="text-end">Profit</th>
                  <th className="text-end">Return</th>
                  <th className="text-end">Net</th>
                </tr>
              </thead>

              <tbody>
                {records.map((r, i) => (
                  <tr key={i}>
                    <td>{r.sale_date}</td>
                    <td>{r.invoice_no}</td>
                    <td className="text-end" style={{ color: "#00eaff" }}>
                      Rs {r.totalAmount.toFixed(2)}
                    </td>
                    <td className="text-end" style={{ color: "#00ff66" }}>
                      Rs {r.totalDiscount.toFixed(2)}
                    </td>
                    <td className="text-end" style={{ color: "#4f9bff" }}>
                      Rs {r.totalProfit.toFixed(2)}
                    </td>
                    <td className="text-end" style={{ color: "#ff4444" }}>
                      Rs {r.totalReturn.toFixed(2)}
                    </td>
                    <td className="text-end" style={{ color: "#ffcc00" }}>
                      Rs {(r.totalAmount - r.totalDiscount - r.totalReturn + r.totalProfit).toFixed(2)}
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
