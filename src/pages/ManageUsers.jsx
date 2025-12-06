import React, { useEffect, useState } from "react";
import supabase from "../utils/supabaseClient";

export default function ManageUsers({ onNavigate }) {
  const [users, setUsers] = useState([]);
  const [saving, setSaving] = useState(false);

  // ⭐ Permissions
  const perms = [
    "sale_entry",
    "sale_return",
    "sale_return_detail",
    "sale_detail",
    "sale_item_detail",

    "purchase_entry",
    "purchase_return",
    "purchase_detail",
    "purchase_item_detail",

    "item_profile",
    "customer_profile",
    "manage_users",
    "create_user",
    "memory_status",

    "stock_report",
    "stock_ledger",
    "sale_report",
    "monthly_report",
    "archive_opening_stock",
    "snapshot_report",
    "snapshot_history",

    "month_wise_summary",
    "day_wise_sale_report",
    "rate_difference_report",

    "deleted_invoice_report",
    "purchase_delete_report"
  ];

  async function loadUsers() {
    const { data } = await supabase.from("app_users").select("*");
    setUsers(data || []);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const toggle = (uIndex, perm) => {
    const copy = [...users];
    copy[uIndex][perm] = !copy[uIndex][perm];
    setUsers(copy);
  };

  const saveAll = async () => {
    setSaving(true);

    for (const u of users) {
      await supabase.from("app_users").update(u).eq("id", u.id);
    }

    await loadUsers();
    setSaving(false);
    alert("✅ Permissions updated!");
  };

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
          marginBottom: "12px",
        }}
      >
        ⬅ Exit
      </button>

      {/* HEADING */}
      <h2 className="fw-bold mb-3" style={{ color: "#ffcc00", fontSize: "28px" }}>
        ⚙ Manage User Permissions
      </h2>

      <div
        className="card bg-dark border-secondary shadow"
        style={{
          borderRadius: "14px",
          padding: "16px",
          maxHeight: "78vh",
          overflowY: "auto"
        }}
      >
        <div className="table-responsive">
          <table
            className="table table-dark table-bordered table-sm"
            style={{
              borderColor: "#555",
              minWidth: "1500px",   // ⭐ Table lamba aur wide
            }}
          >
            <thead
              style={{
                position: "sticky",
                top: 0,
                background: "#2b2b2b",
                zIndex: 5,
                color: "#ffcc00",
              }}
            >
              <tr>
                <th>User</th>
                <th>Role</th>

                {perms.map((p) => (
                  <th key={p} className="text-center">
                    {p.replace(/_/g, " ").toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {users.map((u, i) => (
                <tr
                  key={u.id}
                  style={{ cursor: "pointer" }}
                  className="table-row"
                >
                  <td className="fw-bold" style={{ color: "#4cff8f" }}>
                    {u.username}
                  </td>
                  <td className="fw-bold">{u.role}</td>

                  {perms.map((p) => (
                    <td key={p} className="text-center">
                      <input
                        type="checkbox"
                        checked={!!u[p]}
                        onChange={() => toggle(i, p)}
                        style={{ width: 18, height: 18 }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>

          </table>
        </div>

        <button
          onClick={saveAll}
          className="btn btn-success fw-bold mt-3 px-4"
          disabled={saving}
        >
          {saving ? "Saving..." : "💾 Save Permissions"}
        </button>
      </div>
    </div>
  );
}
