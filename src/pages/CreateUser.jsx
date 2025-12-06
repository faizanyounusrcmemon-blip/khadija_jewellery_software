// =====================================================
//   CREATE / MANAGE USERS — Professional UI
// =====================================================

import React, { useEffect, useState } from "react";
import supabase from "../utils/supabaseClient";

export default function CreateUser({ onNavigate }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create User fields
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("user");
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Edit User fields
  const [editId, setEditId] = useState(null);
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [showEditPassword, setShowEditPassword] = useState(false);

  // Table password visibility
  const [showTablePassword, setShowTablePassword] = useState({});

  async function loadUsers() {
    setLoading(true);
    const { data } = await supabase.from("app_users").select("*").order("id");
    setUsers(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  // CREATE USER
  async function createUser() {
    if (!newUsername || !newPassword) {
      alert("❌ Username & Password required");
      return;
    }

    const defaultPerms = {
      sale_entry: false,
      sale_return: false,
      sale_detail: false,
      sale_item_detail: false,
      purchase_entry: false,
      purchase_return: false,
      purchase_detail: false,
      purchase_item_detail: false,
      item_profile: false,
      customer_profile: false,
      manage_users: false,
      stock_report: false,
      create_user: false,
      memory_status: false,
      snapshot_report: false,
      snapshot_history: false,
      sale_report: false,
      stock_ledger: false,
      monthly_report: false,
      rate_difference_report: false,
      archive_opening_stock: false,
      deleted_invoice_report: false,
      purchase_delete_report: false,
      month_wise_summary: false,
      day_wise_sale_report: false,
    };

    const { error } = await supabase.from("app_users").insert([
      {
        username: newUsername,
        password: newPassword,
        role: newRole,
        ...defaultPerms,
      },
    ]);

    if (error) return alert("❌ " + error.message);

    alert("✅ User created!");
    setNewUsername("");
    setNewPassword("");
    setNewRole("user");
    loadUsers();
  }

  // DELETE USER
  async function deleteUser(id) {
    const ok = confirm("⚠ Delete this user?");
    if (!ok) return;

    await supabase.from("app_users").delete().eq("id", id);
    alert("🗑 User deleted!");
    loadUsers();
  }

  // EDIT USER — Start
  function startEdit(u) {
    setEditId(u.id);
    setEditUsername(u.username);
    setEditPassword(u.password);
    setShowEditPassword(false);
  }

  // EDIT USER — Save
  async function saveEdit() {
    if (!editUsername || !editPassword) {
      alert("❌ Both fields required");
      return;
    }

    const { error } = await supabase
      .from("app_users")
      .update({
        username: editUsername,
        password: editPassword,
      })
      .eq("id", editId);

    if (error) return alert("❌ " + error.message);

    alert("✅ User updated!");
    setEditId(null);
    loadUsers();
  }

  return (
    <div
      className="container-fluid text-light py-3"
      style={{ maxWidth: "1100px", fontFamily: "Inter" }}
    >
      {/* EXIT BUTTON */}
      <button
        onClick={() => onNavigate("dashboard")}
        style={{
          padding: "8px 16px",
          border: "none",
          borderRadius: "8px",
          fontWeight: "bold",
          background: "linear-gradient(90deg,#ffb400,#ff6a00)",
          color: "#fff",
          marginBottom: "15px",
          cursor: "pointer",
          boxShadow: "0 3px 8px rgba(0,0,0,0.4)",
        }}
      >
        ⬅ Exit
      </button>

      {/* HEADING */}
      <h2
        className="fw-bold mb-3"
        style={{ color: "#ffcc00", fontSize: "26px" }}
      >
        ➕ Create & Manage Users
      </h2>

      {/* CREATE USER CARD */}
      <div
        className="card bg-dark border-secondary shadow mb-4"
        style={{ padding: "15px", borderRadius: "12px" }}
      >
        <h4 style={{ color: "#ffdd55" }}>👤 Create New User</h4>

        <div className="row g-3 mt-1">

          <div className="col-md-4">
            <label className="fw-bold">Username</label>
            <input
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="form-control form-control-sm"
            />
          </div>

          <div className="col-md-4">
            <label className="fw-bold">Password</label>
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="form-control form-control-sm"
            />

            <small>
              <input
                type="checkbox"
                checked={showNewPassword}
                onChange={(e) => setShowNewPassword(e.target.checked)}
              />{" "}
              Show Password
            </small>
          </div>

          <div className="col-md-4">
            <label className="fw-bold">Role</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="form-control form-control-sm"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <button
          onClick={createUser}
          className="btn btn-success btn-sm fw-bold mt-3"
          style={{ width: "160px", borderRadius: "8px" }}
        >
          ➕ Create User
        </button>
      </div>

      {/* USERS TABLE CARD */}
      <div
        className="card bg-dark border-secondary shadow"
        style={{ padding: "12px", borderRadius: "12px" }}
      >
        <h4 style={{ color: "#ffdd55" }}>📋 All Users</h4>

        {loading ? (
          <p className="text-info mt-2">Loading...</p>
        ) : (
          <div className="table-responsive" style={{ maxHeight: "70vh" }}>
            <table className="table table-dark table-bordered table-sm mb-0">
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
                  <th>Username</th>
                  <th>Password</th>
                  <th>Show</th>
                  <th>Role</th>
                  <th>Edit</th>
                  <th>Delete</th>
                </tr>
              </thead>

              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    {editId === u.id ? (
                      <>
                        {/* EDIT MODE */}
                        <td>
                          <input
                            value={editUsername}
                            onChange={(e) => setEditUsername(e.target.value)}
                            className="form-control form-control-sm"
                          />
                        </td>

                        <td>
                          <input
                            type={showEditPassword ? "text" : "password"}
                            value={editPassword}
                            onChange={(e) => setEditPassword(e.target.value)}
                            className="form-control form-control-sm"
                          />

                          <small>
                            <input
                              type="checkbox"
                              checked={showEditPassword}
                              onChange={(e) => setShowEditPassword(e.target.checked)}
                            />{" "}
                            Show
                          </small>
                        </td>

                        <td>{u.role}</td>

                        <td>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={saveEdit}
                          >
                            Save
                          </button>
                        </td>

                        <td>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setEditId(null)}
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        {/* NORMAL MODE */}
                        <td>{u.username}</td>

                        <td>{showTablePassword[u.id] ? u.password : "•••••••"}</td>

                        <td>
                          <input
                            type="checkbox"
                            checked={showTablePassword[u.id] || false}
                            onChange={(e) =>
                              setShowTablePassword({
                                ...showTablePassword,
                                [u.id]: e.target.checked,
                              })
                            }
                          />{" "}
                          Show
                        </td>

                        <td>{u.role}</td>

                        <td>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => startEdit(u)}
                          >
                            Edit
                          </button>
                        </td>

                        <td>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => deleteUser(u.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}
      </div>
    </div>
  );
}
