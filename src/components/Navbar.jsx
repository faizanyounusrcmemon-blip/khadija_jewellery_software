import React, { useState } from "react";
import "./Navbar.css";

export default function Navbar({ onNavigate }) {
  const [openMenu, setOpenMenu] = useState(null);
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  const can = (perm) => user?.role === "admin" || user?.[perm] === true;

  return (
    <div className="topbar">
      <div className="nav-left">

        <div className="brand">💎 KHADIJA JEWELLERY</div>

        {/* SALES */}
        <div
          className="menu"
          onMouseEnter={() => setOpenMenu("sales")}
          onMouseLeave={() => setOpenMenu(null)}
        >
          <button className="menu-btn">🛒 Sales</button>

          {openMenu === "sales" && (
            <div className="menu-list">
              {can("sale_entry") && <button onClick={() => onNavigate("sale-entry")}>Sale Entry</button>}
              {can("sale_return") && <button onClick={() => onNavigate("sale-return")}>Sale Return</button>}
              {can("sale_return_detail") && <button onClick={() => onNavigate("sale-return-detail")}>Sale Return detail</button>}
              {can("sale_detail") && <button onClick={() => onNavigate("sale-detail")}>Sale Detail</button>}
              {can("sale_item_detail") && (
                <button onClick={() => onNavigate("sale-item-detail")}>Sale Item Detail</button>
              )}
            </div>
          )}
        </div>

        {/* PURCHASE */}
        <div
          className="menu"
          onMouseEnter={() => setOpenMenu("purchase")}
          onMouseLeave={() => setOpenMenu(null)}
        >
          <button className="menu-btn">📦 Purchase</button>

          {openMenu === "purchase" && (
            <div className="menu-list">
              {can("purchase_entry") && <button onClick={() => onNavigate("purchase-entry")}>Purchase Entry</button>}
              {can("purchase_return") && <button onClick={() => onNavigate("purchase-return")}>Purchase Return</button>}
              {can("purchase_detail") && <button onClick={() => onNavigate("purchase-detail")}>Purchase Detail</button>}
              {can("purchase_item_detail") && (
                <button onClick={() => onNavigate("purchase-item-detail")}>Purchase Item Detail</button>
              )}
            </div>
          )}
        </div>

        {/* MASTER */}
        <div
          className="menu"
          onMouseEnter={() => setOpenMenu("master")}
          onMouseLeave={() => setOpenMenu(null)}
        >
          <button className="menu-btn">📇 Master</button>

          {openMenu === "master" && (
            <div className="menu-list">
              {can("item_profile") && (
                <button onClick={() => onNavigate("item-profile")}>Item Profile</button>
              )}

              {can("customer_profile") && (
                <button onClick={() => onNavigate("customer-profile")}>Customer Profile</button>
              )}

              {can("manage_users") && (
                <button onClick={() => onNavigate("manage-users")}>Manage Users</button>
              )}

              {can("create_user") && (
                <button onClick={() => onNavigate("create-user")}>➕ Create User</button>
              )}
            </div>
          )}
        </div>

        {/* OPENING STOCK MENU (Updated with SnapshotReport) */}
        <div
          className="menu"
          onMouseEnter={() => setOpenMenu("openingStock")}
          onMouseLeave={() => setOpenMenu(null)}
        >
          <button className="menu-btn">🧊 Opening Stock</button>

          {openMenu === "openingStock" && (
            <div className="menu-list">

              {can("opening_stock_generate") && (
                <button onClick={() => onNavigate("archive-stock")}>
                  📦 Archive & Opening Stock
                </button>
              )}

              {/* ⭐ NEW: SnapshotReport added */}
              {can("opening_stock_generate") && (
                <button onClick={() => onNavigate("snapshot-report")}>
                  📸 Snapshot Report
                </button>
              )}

              {can("opening_stock_generate") && (
                <button onClick={() => onNavigate("snapshot-history")}>
                  📸 Snapshot History
                </button>
              )}

              {can("memory_status") && (
                <button onClick={() => onNavigate("memory-status")}>
                 📊 Memory Status
                </button>
              )}

            </div>
          )}
        </div>

        {/* REPORTS */}
        <div
          className="menu"
          onMouseEnter={() => setOpenMenu("reports")}
          onMouseLeave={() => setOpenMenu(null)}
        >
          <button className="menu-btn">📊 Reports</button>

          {openMenu === "reports" && (
            <div className="menu-list">
              {can("stock_report") && (
                <button onClick={() => onNavigate("stock-report")}>Stock Report</button>
              )}

              {can("stock_ledger") && (
                <button onClick={() => onNavigate("stock-ledger")}>Stock Ledger</button>
              )}

              {can("sale_report") && (
                <button onClick={() => onNavigate("sale-report")}>Sales Profit Report</button>
              )}

              {can("monthly_report") && (
                <button onClick={() => onNavigate("monthly-report")}>Monthly Graph Report</button>
              )}

              {can("month_wise_summary") && (
                <button onClick={() => onNavigate("month-wise-summary")}>
                  📦 Month Wise Summary
                </button>
              )}

              {can("day_wise_sale_report") && (
                <button onClick={() => onNavigate("day-wise-sale-report")}>
                  📅 Day Wise Sale Report
                </button>
              )}

              {can("Rate_Difference_report") && (
                <button onClick={() => onNavigate("rate-difference-report")}>
                  Rate Difference report
                </button>
              )}

              {can("deleted_invoice_report") && (
                <button onClick={() => onNavigate("deleted-invoice-report")}>
                  🗑 Deleted Invoice Report
                </button>
              )}

              {can("purchase_delete_report") && (
                <button onClick={() => onNavigate("purchase-delete-report")}>
                  🗑 Deleted Purchase Report
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDE BUTTONS */}
      <div className="right-actions">

        <button
          className="logout-btn"
          style={{ marginRight: "10px", background: "#6f42c1" }}
          onClick={() => onNavigate("restore")}
        >
          🔄 Restore
        </button>

        <div className="status">
          🟢 {user?.username} ({user?.role})
        </div>

        <button
          className="logout-btn"
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
