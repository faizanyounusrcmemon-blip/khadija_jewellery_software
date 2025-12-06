import React, { useEffect, useState } from "react";
import supabase from "../utils/supabaseClient";

export default function MemoryStatus({ onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStatus = async () => {
    setLoading(true);

    const { data: result, error } = await supabase.rpc("get_memory_status");

    if (error) {
      console.error(error);
      setData(null);
    } else {
      setData(result[0]);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadStatus();
  }, []);

  return (
    <div
      className="container-fluid py-3"
      style={{ fontFamily: "Inter", color: "#fff" }}
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
          boxShadow: "0 3px 10px rgba(0,0,0,0.6)",
          cursor: "pointer",
          marginBottom: "15px",
        }}
      >
        ⬅ Exit
      </button>

      <h2 className="fw-bold" style={{ color: "#ffcc00" }}>
        📊 Supabase Memory Status
      </h2>

      <div
        className="card bg-dark border-secondary shadow mt-3"
        style={{ borderRadius: "14px", padding: "16px" }}
      >
        {loading ? (
          <p className="text-warning">Loading memory status...</p>
        ) : data ? (
          <>
            <h4 style={{ color: "#4cff8f" }}>Database Usage</h4>

            <table className="table table-dark table-bordered mt-3">
              <tbody>
                <tr>
                  <th style={{ width: "200px" }}>Used Space</th>
                  <td>{data.used}</td>
                </tr>

                <tr>
                  <th>Remaining Space</th>
                  <td>{data.remaining}</td>
                </tr>

                <tr>
                  <th>Approx Remaining Rows</th>
                  <td>{data.approx_remaining_rows}</td>
                </tr>
              </tbody>
            </table>

            <button
              className="btn btn-warning fw-bold mt-3"
              onClick={loadStatus}
            >
              🔄 Refresh
            </button>
          </>
        ) : (
          <p className="text-danger">Failed to load data.</p>
        )}
      </div>
    </div>
  );
}
