// src/pages/SaleEntry.jsx

import React, { useEffect, useState } from "react";
import supabase from "../utils/supabaseClient";
import ThermalPrint from "./ThermalPrint";

export default function SaleEntry() {
  const [invoiceNo, setInvoiceNo] = useState("");
  const [saleDate, setSaleDate] = useState(new Date().toISOString().slice(0, 10));
  const [focusedField, setFocusedField] = useState("");

  // ✅ Customer states
  const [customerCode, setCustomerCode] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerList, setCustomerList] = useState([]);

  // ✅ Customer search dropdown
  const [customerSearch, setCustomerSearch] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // ✅ Item states
  const [barcode, setBarcode] = useState("");
  const [itemCode, setItemCode] = useState("");
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [saleRate, setSaleRate] = useState("");
  const [qty, setQty] = useState("");
  const [discount, setDiscount] = useState("");
  const [amount, setAmount] = useState(0);
  const [itemList, setItemList] = useState([]);

  // ✅ Item search dropdown
  const [itemSearch, setItemSearch] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [showItemDropdown, setShowItemDropdown] = useState(false);

  const [entries, setEntries] = useState([]);
  const [printData, setPrintData] = useState(null);
  const [reprintInvoice, setReprintInvoice] = useState("");

  // ✅ Load customers, items, invoice no
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("customers").select("*");
      setCustomerList(data || []);
    })();

    (async () => {
      const { data } = await supabase.from("items").select("*");
      setItemList(data || []);
    })();

    // ✅ NEW INVOICE — 100% SAFE UNIQUE EXTRACT METHOD
    (async () => {
      const { data } = await supabase.from("sales").select("invoice_no");

      const unique = [
        ...new Set((data || []).map((d) => d.invoice_no).filter((x) => x)),
      ];

      setInvoiceNo(`INV-${unique.length + 1}`);
    })();
  }, []);

  // ✅ Auto customer lookup
  useEffect(() => {
    if (!customerCode) return;

    const c = customerList.find(
      (x) => String(x.customer_code) === String(customerCode)
    );

    if (c) {
      setCustomerName(c.customer_name);
      setCustomerSearch(c.customer_name);
      setCustomerAddress(c.address);
      setCustomerPhone(c.phone);
    }
  }, [customerCode]);

  // ✅ Auto item lookup
  useEffect(() => {
    if (!itemCode && !barcode) return;

    const i =
      itemList.find(
        (x) =>
          String(x.id) === String(itemCode) ||
          String(x.barcode) === String(barcode)
      ) || null;

    if (i) {
      setItemCode(i.id);
      setBarcode(i.barcode);
      setItemName(i.item_name);
      setItemSearch(i.item_name);
      setCategory(i.category);
      setDescription(i.description);
      setSaleRate(i.sale_price);
    }
  }, [itemCode, barcode]);

  // ✅ amount calc
  useEffect(() => {
    const rate = parseFloat(saleRate || 0);
    const q = parseFloat(qty || 0);
    const d = parseFloat(discount || 0);
    const a = rate * q - (rate * q * d) / 100;
    setAmount(isNaN(a) ? 0 : a);
  }, [saleRate, qty, discount]);

  // ✅ item search filter
  useEffect(() => {
    if (!itemSearch) {
      setFilteredItems([]);
      return;
    }
    const f = itemList.filter((x) =>
      x.item_name.toLowerCase().includes(itemSearch.toLowerCase())
    );
    setFilteredItems(f);
  }, [itemSearch, itemList]);

  // ✅ customer search filter
  useEffect(() => {
    if (!customerSearch) {
      setFilteredCustomers([]);
      return;
    }
    const f = customerList.filter((x) =>
      x.customer_name.toLowerCase().includes(customerSearch.toLowerCase())
    );
    setFilteredCustomers(f);
  }, [customerSearch, customerList]);

  // ✅ Add item row
  const handleAdd = () => {
    if (!itemName || !qty) return alert("Item or Qty missing!");

    const newItem = {
      itemCode,
      barcode,
      itemName,
      category,
      description,
      saleRate,
      qty,
      discount,
      amount,
    };

    setEntries([...entries, newItem]);

    // ✅ Clear fields
    setItemCode("");
    setBarcode("");
    setItemName("");
    setItemSearch("");
    setCategory("");
    setDescription("");
    setSaleRate("");
    setQty("");
    setDiscount("");
    setAmount(0);

    // ✅ After add focus → Item Code
    setTimeout(() => document.getElementById("itemCode").focus(), 80);
  };

  // ✅ Remove item
  const handleRemove = (index) => {
    const updated = [...entries];
    updated.splice(index, 1);
    setEntries(updated);
  };

  // ✅ SAVE SALE — invoice fix included
  const handleSave = async () => {
    if (!entries.length) return alert("No items added!");

    const total = entries.reduce((s, e) => s + Number(e.amount || 0), 0);

    const rows = entries.map((e) => ({
      invoice_no: invoiceNo,
      sale_date: saleDate,

      customer_code: customerCode,
      customer_name: customerName,
      customer_address: customerAddress,
      customer_phone: customerPhone,

      item_code: e.itemCode,
      item_name: e.itemName,
      barcode: e.barcode,
      category: e.category,
      description: e.description,
      sale_rate: e.saleRate,
      qty: e.qty,
      discount: e.discount,
      amount: e.amount,

      total_amount: total,
      created_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from("sales").insert(rows);
    if (error) return alert("Error saving sale: " + error.message);

    // decrease stock
    for (const e of entries)
      await supabase.rpc("decrease_stock", {
        p_barcode: e.barcode,
        p_qty: e.qty,
      });

    alert("Sale saved successfully!");

    // ✅ Print
    setPrintData({
      invoiceNo,
      saleDate,
      customerName,
      customerPhone,
      entries,
      total,
      discount,
    });

    // ✅ Clear items
    setEntries([]);

    // ✅ Get new invoice (same fix again)
    const { data } = await supabase.from("sales").select("invoice_no");

    const unique = [
      ...new Set((data || []).map((d) => d.invoice_no).filter((x) => x)),
    ];

    setInvoiceNo(`INV-${unique.length + 1}`);

    // ✅ Focus to customer code again
    setTimeout(() => document.getElementById("customerCode").focus(), 100);
  };

  // ✅ Reprint
  const handleReprint = async () => {
    if (!reprintInvoice) return alert("Enter invoice number");

    const { data, error } = await supabase
      .from("sales")
      .select("*")
      .eq("invoice_no", reprintInvoice);

    if (error || !data?.length) return alert("Invoice not found!");

    const entries = data.map((d) => ({
      itemName: d.item_name,
      qty: d.qty,
      saleRate: d.sale_rate,
      amount: d.amount,
      discount: d.discount,
    }));

    setPrintData({
      invoiceNo: reprintInvoice,
      saleDate: data[0].sale_date,
      customerName: data[0].customer_name,
      customerPhone: data[0].customer_phone,
      entries,
      total: data[0].total_amount,
      discount: data[0].discount,
    });
  };

  // ✅ Focus Style
  const focusStyle = (name) => ({
    border: focusedField === name ? "2px solid blue" : "1px solid #ccc",
    outline: "none",
  });

  // ✅ ENTER navigation: Item Code
  const handleItemCodeEnter = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const found = itemList.find((x) => String(x.id) === String(itemCode));

      if (found) {
        setBarcode(found.barcode);
        setItemName(found.item_name);
        setItemSearch(found.item_name);
        setCategory(found.category);
        setDescription(found.description);
        setSaleRate(found.sale_price);
      }

      setItemCode("");
      document.getElementById("barcode").focus();
    }
  };

  // ✅ ENTER navigation: Barcode
  const handleBarcodeEnter = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      const found = itemList.find(
        (x) => String(x.barcode) === String(barcode)
      );

      if (found) {
        setItemCode(found.id);
        setItemName(found.item_name);
        setItemSearch(found.item_name);
        setCategory(found.category);
        setDescription(found.description);
        setSaleRate(found.sale_price);
      }

      setBarcode("");
      document.getElementById("itemName").focus();
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h2 style={{ textAlign: "center" }}>Sale Entry</h2>

      {/* ✅ Invoice + Date + Print */}
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          marginBottom: 12,
          border: "1px solid #ccc",
          padding: 8,
          borderRadius: 6,
        }}
      >
        <div>
          <label>Invoice No</label>
          <input
            value={invoiceNo}
            readOnly
            style={{
              border: "1px solid #ccc",
              padding: 5,
              marginLeft: 5,
              background: "#f3f3f3",
            }}
          />
        </div>

        <div>
          <label>Date</label>
          <input
            type="date"
            value={saleDate}
            onChange={(e) => setSaleDate(e.target.value)}
            style={{ border: "1px solid #ccc", padding: 5, marginLeft: 5 }}
          />
        </div>

        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <input
            placeholder="Enter Invoice No to Print"
            value={reprintInvoice}
            onChange={(e) => setReprintInvoice(e.target.value)}
            style={{ border: "1px solid #ccc", padding: 5 }}
          />
          <button
            onClick={handleReprint}
            style={{
              background: "#007bff",
              color: "white",
              border: "none",
              padding: "5px 10px",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            🖨️ Print
          </button>
        </div>
      </div>

      {/* ✅ CUSTOMER INFO */}
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        
        {/* Customer Code */}
        <div>
          <label>Customer Code</label>
          <input
            id="customerCode"
            style={focusStyle("customerCode")}
            onFocus={() => setFocusedField("customerCode")}
            onBlur={() => setFocusedField("")}
            value={customerCode}
            onChange={(e) => setCustomerCode(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" &&
              document.getElementById("customerName").focus()
            }
          />
        </div>

        {/* ✅ Customer Name + ENTER fix */}
        <div style={{ position: "relative" }}>
          <label>Customer Name</label>
          <input
            id="customerName"
            style={focusStyle("customerName")}
            onFocus={() => {
              setFocusedField("customerName");
              setShowCustomerDropdown(true);
            }}
            onBlur={() => setFocusedField("")}
            value={customerSearch}
            onChange={(e) => {
              setCustomerSearch(e.target.value);
              setShowCustomerDropdown(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                setShowCustomerDropdown(false);
                document.getElementById("customerAddress").focus();
              }
            }}
            autoComplete="off"
          />

          {showCustomerDropdown && filteredCustomers.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "50px",
                left: 0,
                width: "250px",
                maxHeight: "200px",
                overflowY: "auto",
                background: "white",
                border: "1px solid #ccc",
                zIndex: 999,
              }}
            >
              {filteredCustomers.map((c) => (
                <div
                  key={c.customer_code}
                  style={{
                    padding: "6px",
                    cursor: "pointer",
                    borderBottom: "1px solid #eee",
                  }}
                  onMouseDown={() => {
                    setCustomerCode(c.customer_code);
                    setCustomerName(c.customer_name);
                    setCustomerSearch(c.customer_name);
                    setCustomerAddress(c.address);
                    setCustomerPhone(c.phone);

                    setShowCustomerDropdown(false);
                    setTimeout(
                      () => document.getElementById("customerAddress").focus(),
                      40
                    );
                  }}
                >
                  {c.customer_name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Address */}
        <div>
          <label>Address</label>
          <input
            id="customerAddress"
            style={focusStyle("customerAddress")}
            onFocus={() => setFocusedField("customerAddress")}
            onBlur={() => setFocusedField("")}
            value={customerAddress}
            onChange={(e) => setCustomerAddress(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" &&
              document.getElementById("customerPhone").focus()
            }
          />
        </div>

        {/* Phone */}
        <div>
          <label>Phone</label>
          <input
            id="customerPhone"
            style={focusStyle("customerPhone")}
            onFocus={() => setFocusedField("customerPhone")}
            onBlur={() => setFocusedField("")}
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && document.getElementById("itemCode").focus()
            }
          />
        </div>
      </div>

      {/* ✅ ITEM ENTRY */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          border: "1px solid #ddd",
          padding: 10,
          borderRadius: 6,
        }}
      >
        {/* Item Code */}
        <div>
          <label>Item Code</label>
          <input
            id="itemCode"
            style={focusStyle("itemCode")}
            onFocus={() => setFocusedField("itemCode")}
            onBlur={() => setFocusedField("")}
            value={itemCode}
            onChange={(e) => setItemCode(e.target.value)}
            onKeyDown={handleItemCodeEnter}
          />
        </div>

        {/* Barcode */}
        <div>
          <label>Barcode</label>
          <input
            id="barcode"
            style={focusStyle("barcode")}
            onFocus={() => setFocusedField("barcode")}
            onBlur={() => setFocusedField("")}
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={handleBarcodeEnter}
          />
        </div>

        {/* ✅ Item Name + ENTER FIX */}
        <div style={{ position: "relative" }}>
          <label>Item Name</label>
          <input
            id="itemName"
            style={focusStyle("itemName")}
            onFocus={() => {
              setFocusedField("itemName");
              setShowItemDropdown(true);
            }}
            onBlur={() => setFocusedField("")}
            value={itemSearch}
            onChange={(e) => {
              setItemSearch(e.target.value);
              setShowItemDropdown(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                setShowItemDropdown(false);
                document.getElementById("category").focus();
              }
            }}
            autoComplete="off"
          />

          {showItemDropdown && filteredItems.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "50px",
                left: 0,
                width: "250px",
                maxHeight: "200px",
                overflowY: "auto",
                background: "white",
                border: "1px solid #ccc",
                zIndex: 999,
              }}
            >
              {filteredItems.map((it) => (
                <div
                  key={it.id}
                  style={{
                    padding: "6px",
                    cursor: "pointer",
                    borderBottom: "1px solid #eee",
                  }}
                  onMouseDown={() => {
                    setItemCode(it.id);
                    setBarcode(it.barcode);
                    setItemName(it.item_name);
                    setItemSearch(it.item_name);
                    setCategory(it.category);
                    setDescription(it.description);
                    setSaleRate(it.sale_price);

                    setShowItemDropdown(false);

                    setTimeout(() => {
                      document.getElementById("category").focus();
                    }, 40);
                  }}
                >
                  {it.item_name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category */}
        <div>
          <label>Category</label>
          <input
            id="category"
            style={focusStyle("category")}
            onFocus={() => setFocusedField("category")}
            onBlur={() => setFocusedField("")}
            value={category}
            readOnly
            onKeyDown={(e) =>
              e.key === "Enter" &&
              document.getElementById("description").focus()
            }
          />
        </div>

        {/* Description */}
        <div>
          <label>Description</label>
          <input
            id="description"
            style={focusStyle("description")}
            onFocus={() => setFocusedField("description")}
            onBlur={() => setFocusedField("")}
            value={description}
            readOnly
            onKeyDown={(e) =>
              e.key === "Enter" && document.getElementById("saleRate").focus()
            }
          />
        </div>

        {/* Rate */}
        <div>
          <label>Rate</label>
          <input
            id="saleRate"
            style={focusStyle("saleRate")}
            onFocus={() => setFocusedField("saleRate")}
            onBlur={() => setFocusedField("")}
            value={saleRate}
            onChange={(e) => setSaleRate(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && document.getElementById("qty").focus()
            }
          />
        </div>

        {/* Qty */}
        <div>
          <label>Qty</label>
          <input
            id="qty"
            style={focusStyle("qty")}
            onFocus={() => setFocusedField("qty")}
            onBlur={() => setFocusedField("")}
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && document.getElementById("discount").focus()
            }
          />
        </div>

        {/* Discount */}
        <div>
          <label>Discount %</label>
          <input
            id="discount"
            style={focusStyle("discount")}
            onFocus={() => setFocusedField("discount")}
            onBlur={() => setFocusedField("")}
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && document.getElementById("addItemBtn").focus()
            }
          />
        </div>

        {/* ✅ Add Item Button */}
        <div style={{ alignSelf: "flex-end" }}>
          <button
            id="addItemBtn"
            style={{
              background: focusedField === "addItemBtn" ? "blue" : "#ddd",
              color: focusedField === "addItemBtn" ? "white" : "black",
            }}
            onFocus={() => setFocusedField("addItemBtn")}
            onBlur={() => setFocusedField("")}
            onClick={handleAdd}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          >
            Add Item
          </button>
        </div>
      </div>

      {/* ✅ Items Table */}
      <table
        border="1"
        width="100%"
        style={{ marginTop: 10, borderCollapse: "collapse" }}
      >
        <thead>
          <tr style={{ background: "#f1f1f1" }}>
            <th>#</th>
            <th>Item</th>
            <th>Rate</th>
            <th>Qty</th>
            <th>Disc%</th>
            <th>Amount</th>
            <th>❌</th>
          </tr>
        </thead>

        <tbody>
          {entries.map((e, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{e.itemName}</td>
              <td>{e.saleRate}</td>
              <td>{e.qty}</td>
              <td>{e.discount}</td>
              <td>{e.amount.toFixed(2)}</td>
              <td>
                <button
                  onClick={() => handleRemove(i)}
                  style={{
                    background: "red",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    padding: "2px 6px",
                  }}
                >
                  ✖
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ✅ SAVE */}
      <div style={{ marginTop: 10, textAlign: "right" }}>
        <button onClick={handleSave}>💾 Save & Print</button>
        <button
          onClick={() => window.location.reload()}
          style={{ marginLeft: 6 }}
        >
          ❌ Exit
        </button>
      </div>

      {printData && (
        <ThermalPrint data={printData} onClose={() => setPrintData(null)} />
      )}
    </div>
  );
}
