import React, { useState, useEffect, useRef } from "react";

export default function Navbar({ onNavigate = () => {} }) {
  const [openMenu, setOpenMenu] = useState(null);
  const navRef = useRef(null);

  const user = JSON.parse(sessionStorage.getItem("user")) || {};

  const can = (perm) =>
    user?.role === "admin" || user?.[perm] === true;

  // 🔹 Outside click close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = (name) => {
    setOpenMenu((prev) => (prev === name ? null : name));
  };

  const handleNavigate = (route) => {
    setOpenMenu(null);
    onNavigate(route);
  };

  return (
    <div
      ref={navRef}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#1a1a2e",
        padding: "10px 20px",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
        flexWrap: "wrap",
        boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      {/* LEFT MENUS */}
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
        {/* BRAND */}
        <div
          style={{
            fontWeight: "bold",
            fontSize: 18,
            cursor: "pointer",
            marginRight: 20,
            padding: "4px 8px",
            borderRadius: 6,
            background: "linear-gradient(90deg,#ff6a00,#ffb400)",
            color: "#fff",
            boxShadow: "0 2px 6px rgba(255,180,0,0.5)",
            userSelect: "none",
          }}
          onClick={() => handleNavigate("dashboard")}
        >
          💎 KHADIJA JEWELLERY 💎
        </div>

        {/* MENU COMPONENT */}
        {[
          {
            key: "sales",
            label: "🛒 Sales",
            items: [
              { perm: "sale_entry", label: "Sale Entry", route: "sale-entry" },
              { perm: "sale_return", label: "Sale Return", route: "sale-return" },
              { perm: "sale_return_detail", label: "Sale Return Detail", route: "sale-return-detail" },
              { perm: "sale_detail", label: "Sale Detail", route: "sale-detail" },
              { perm: "sale_item_detail", label: "Sale Item Detail", route: "sale-item-detail" },
            ],
          },
          {
            key: "purchase",
            label: "📦 Purchase",
            items: [
              { perm: "purchase_entry", label: "Purchase Entry", route: "purchase-entry" },
              { perm: "purchase_return", label: "Purchase Return", route: "purchase-return" },
              { perm: "purchase_detail", label: "Purchase Detail", route: "purchase-detail" },
              { perm: "purchase_item_detail", label: "Purchase Item Detail", route: "purchase-item-detail" },
            ],
          },
          {
            key: "master",
            label: "📇 Master",
            items: [
              { perm: "item_profile", label: "Item Profile", route: "item-profile" },
              { perm: "customer_profile", label: "Customer Profile", route: "customer-profile" },
              { perm: "manage_users", label: "Manage Users", route: "manage-users" },
              { perm: "create_user", label: "➕ Create User", route: "create-user" },
            ],
          },
          {
            key: "openingStock",
            label: "🧊 Opening Stock",
            items: [
              { perm: "opening_stock_generate", label: "📦 Archive & Opening Stock", route: "archive-stock" },
              { perm: "opening_stock_generate", label: "📸 Snapshot Report", route: "snapshot-report" },
              { perm: "opening_stock_generate", label: "📸 Snapshot History", route: "snapshot-history" },
              { perm: "memory_status", label: "📊 Memory Status", route: "memory-status" },
            ],
          },
          {
            key: "reports",
            label: "📊 Reports",
            items: [
              { perm: "stock_report", label: "Stock Report", route: "stock-report" },
              { perm: "stock_ledger", label: "Stock Ledger", route: "stock-ledger" },
              { perm: "sale_report", label: "Sales Profit Report", route: "sale-report" },
              { perm: "monthly_report", label: "Monthly Graph Report", route: "monthly-report" },
              { perm: "month_wise_summary", label: "📦 Month Wise Summary", route: "month-wise-summary" },
              { perm: "day_wise_sale_report", label: "📅 Day Wise Sale Report", route: "day-wise-sale-report" },
              { perm: "Rate_Difference_report", label: "Rate Difference Report", route: "rate-difference-report" },
              { perm: "deleted_invoice_report", label: "🗑 Deleted Invoice Report", route: "deleted-invoice-report" },
              { perm: "purchase_delete_report", label: "🗑 Deleted Purchase Report", route: "purchase-delete-report" },
            ],
          },
        ].map((menu) => (
          <div key={menu.key} style={{ position: "relative", marginRight: 10 }}>
            <button
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
                background: openMenu === menu.key ? "#ffb400" : "#222",
                color: openMenu === menu.key ? "#000" : "#fff",
                transition: "0.3s all",
              }}
              onClick={() => toggleMenu(menu.key)}
            >
              {menu.label}
            </button>

            {openMenu === menu.key && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  background: "#222",
                  borderRadius: 6,
                  padding: 8,
                  minWidth: 180,
                  boxShadow: "0 4px 10px rgba(0,0,0,0.6)",
                  zIndex: 100,
                  animation: "fadeIn 0.2s ease",
                }}
              >
                {menu.items
                  .filter((i) => can(i.perm))
                  .map((i) => (
                    <button
                      key={i.route}
                      onClick={() => handleNavigate(i.route)}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "6px 10px",
                        margin: "2px 0",
                        borderRadius: 4,
                        background: "#111",
                        color: "#ffd966",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                        fontWeight: "500",
                        transition: "0.2s all",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#ffb400"; // Hover bg
                        e.currentTarget.style.color = "#000";         // Hover font
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#111";    // Reset bg
                        e.currentTarget.style.color = "#ffd966";     // Reset font
                      }}
                    >
                      {i.label}
                    </button>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* RIGHT ACTIONS */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          style={{
            padding: "6px 14px",
            borderRadius: 6,
            border: "none",
            fontWeight: "bold",
            cursor: "pointer",
            background: "linear-gradient(90deg,#6f42c1,#a866f9)",
            color: "#fff",
            boxShadow: "0 3px 8px rgba(0,0,0,0.5)",
          }}
          onClick={() => handleNavigate("restore")}
        >
          🔄 Restore
        </button>

        <div
          style={{
            padding: "6px 12px",
            borderRadius: 6,
            background: "#333",
            fontWeight: "bold",
            color: "#0bd46e",
          }}
        >
          🟢 {user?.username || "User"} ({user?.role || "guest"})
        </div>

        <button
          style={{
            padding: "6px 14px",
            borderRadius: 6,
            border: "none",
            fontWeight: "bold",
            cursor: "pointer",
            background: "linear-gradient(90deg,#ff6a00,#ffb400)",
            color: "#000",
            boxShadow: "0 3px 8px rgba(0,0,0,0.5)",
          }}
          onClick={() => {
            sessionStorage.clear();
            localStorage.clear();
            onNavigate("login");
            window.location.reload();
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
