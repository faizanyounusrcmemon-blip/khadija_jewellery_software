// =====================================================
//      MONTHLY REPORT — ULTRA PREMIUM UI VERSION
// =====================================================

import React, { useEffect, useState } from "react";
import supabase from "../utils/supabaseClient";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function MonthlyReport({ onNavigate }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    loadMonthlyData();
  }, []);

  const loadMonthlyData = async () => {
    // SALES
    const { data: sales } = await supabase
      .from("sales")
      .select("*")
      .eq("is_deleted", false);

    // RETURNS
    const { data: returns } = await supabase
      .from("sale_returns")
      .select("amount, created_at");

    const returnMap = {};
    returns?.forEach((r) => {
      const m = r.created_at.slice(0, 7);
      returnMap[m] = (returnMap[m] || 0) + Number(r.amount || 0);
    });

    const map = {};

    // MONTHLY SALES
    for (const r of sales) {
      const month = r.sale_date.slice(0, 7);

      if (!map[month]) {
        map[month] = {
          month,
          totalSale: 0,
          totalReturn: 0,
          totalNet: 0,
          totalProfit: 0,
        };
      }
      map[month].totalSale += Number(r.amount || 0);
    }

    // MONTHLY RETURNS
    Object.keys(returnMap).forEach((m) => {
      if (!map[m]) {
        map[m] = {
          month: m,
          totalSale: 0,
          totalReturn: 0,
          totalNet: 0,
          totalProfit: 0,
        };
      }
      map[m].totalReturn = returnMap[m];
    });

    // PROFIT CALCULATION
    for (const r of sales) {
      const m = r.sale_date.slice(0, 7);
      const saleRate = Number(r.sale_rate);
      const qty = Number(r.qty);
      const discountPercent = Number(r.discount || 0);

      const discountAmount = (saleRate * qty * discountPercent) / 100;

      const { data: item } = await supabase
        .from("items")
        .select("purchase_price")
        .eq("id", r.item_code)
        .single();

      const purchase = Number(item?.purchase_price || 0);
      const netSaleRate = saleRate - discountAmount / qty;

      map[m].totalProfit += (netSaleRate - purchase) * qty;
    }

    Object.values(map).forEach((m) => {
      m.totalNet = m.totalSale - m.totalReturn;
    });

    setData(Object.values(map).sort((a, b) => a.month.localeCompare(b.month)));
  };

  return (
    <div
      className="container-fluid text-light py-3"
      style={{ fontFamily: "Inter" }}
    >
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

      {/* HEADING */}
      <h2
        className="fw-bold mb-4"
        style={{ color: "#ffcc00", fontSize: "28px" }}
      >
        📅 Monthly Sales, Return & Profit Overview
      </h2>

      {/* ====================== BAR CHART CARD ====================== */}
      <div
        className="card bg-dark border-secondary shadow-lg mb-4"
        style={{
          borderRadius: "14px",
          padding: "15px",
          boxShadow: "0 0 18px rgba(0,0,0,0.6)",
        }}
      >
        <h4 style={{ color: "#ffcc00" }}>📊 Monthly Summary</h4>

        <div style={{ height: 380, marginTop: 20 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#555" />
              <XAxis dataKey="month" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Legend />

              <Bar dataKey="totalSale" fill="#00eaff" name="Sale" />
              <Bar dataKey="totalReturn" fill="#ff4444" name="Return" />
              <Bar dataKey="totalNet" fill="#ffcc00" name="Net Sale" />
              <Bar dataKey="totalProfit" fill="#4f9bff" name="Profit" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ====================== LINE CHART CARD ====================== */}
      <div
        className="card bg-dark border-secondary shadow-lg"
        style={{
          borderRadius: "14px",
          padding: "15px",
          boxShadow: "0 0 18px rgba(0,0,0,0.6)",
        }}
      >
        <h4 style={{ color: "#ffcc00" }}>📈 Profit Line Chart</h4>

        <div style={{ height: 330, marginTop: 20 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#555" />
              <XAxis dataKey="month" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Legend />

              <Line
                type="monotone"
                dataKey="totalNet"
                stroke="#ffcc00"
                name="Net Sale"
                strokeWidth={3}
              />

              <Line
                type="monotone"
                dataKey="totalProfit"
                stroke="#ff5500"
                name="Profit"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
