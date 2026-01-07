import React, { useEffect, useState } from "react";
import supabase from "../utils/supabaseClient";

export default function StorageDashboard() {
  const [summary, setSummary] = useState(null);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);

    try {
      // 🔹 Summary
      const { data: s, error: summaryError } = await supabase.rpc("get_memory_status");
      if (summaryError) console.error(summaryError);
      setSummary(s?.[0] || { used_mb: 0, free_mb: 0, total_rows: 0, avg_row_size: 0, approx_remaining_rows: 0 });

      // 🔹 Table-wise rows
      const { data: t, error: tablesError } = await supabase.rpc("get_table_rows");
      if (tablesError) console.error(tablesError);
      setTables(t || []);
    } catch (err) {
      console.error(err);
      setSummary({ used_mb: 0, free_mb: 0, total_rows: 0, avg_row_size: 0, approx_remaining_rows: 0 });
      setTables([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <p style={{ color: "#fff" }}>Loading...</p>;
  }

  // Ensure numeric values
  const usedMB = parseFloat(summary?.used_mb) || 0;
  const freeMB = parseFloat(summary?.free_mb) || 0;
  const percent = Math.round((usedMB / 500) * 100) || 0;

  return (
    <div style={{ padding: 20, color: "#000" }}>
      {/* ================= SUMMARY CARD ================= */}
      <div
        style={{
          background: "#fff",
          borderRadius: 10,
          padding: 20,
          maxWidth: 700,
          boxShadow: "0 5px 20px rgba(0,0,0,0.2)",
        }}
      >
        <p><b>Total Storage Limit:</b> 500 MB</p>
        <p><b>Used Storage:</b> {usedMB.toFixed(2)} MB</p>
        <p><b>Free Storage:</b> {freeMB.toFixed(2)} MB</p>

        {/* Progress bar */}
        <div style={{ background: "#eee", borderRadius: 8, height: 18 }}>
          <div
            style={{
              width: `${percent}%`,
              height: "100%",
              background: "#28a745",
              color: "#fff",
              fontSize: 12,
              textAlign: "center",
              borderRadius: 8,
              lineHeight: "18px",
            }}
          >
            {percent}%
          </div>
        </div>

        <hr />

        <p><b>Total Rows (All Tables):</b> {summary.total_rows}</p>
        <p><b>Average Row Size:</b> {summary.avg_row_size}</p>
        <p style={{ color: "green", fontWeight: "bold" }}>
          👉 Estimated More Rows Possible: {summary.approx_remaining_rows}
        </p>
      </div>

      {/* ================= TABLE LIST ================= */}
      <div
        style={{
          marginTop: 30,
          background: "#fff",
          borderRadius: 10,
          padding: 20,
          maxWidth: 700,
        }}
      >
        <table width="100%" border="1" cellPadding="8">
          <thead style={{ background: "#222", color: "#fff" }}>
            <tr>
              <th align="left">Table</th>
              <th align="right">Rows</th>
            </tr>
          </thead>
          <tbody>
            {tables.map((t) => (
              <tr key={t.table_name}>
                <td>{t.table_name}</td>
                <td align="right">{t.rows ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
