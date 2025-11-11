import React, { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

export default function BarcodePrint() {
  const barcode = localStorage.getItem("print_barcode");
  const name = localStorage.getItem("print_name");
  const price = localStorage.getItem("print_price");
  const qty = Number(localStorage.getItem("print_qty") || 1);
  const refs = useRef([]);

  useEffect(() => {
    refs.current.forEach((ref) => {
      if (ref) {
        JsBarcode(ref, barcode, {
          format: "CODE128",
          width: 1.2,
          height: 40,
          displayValue: false,
        });
      }
    });

    setTimeout(() => window.print(), 400);
  }, []);

  const labels = Array.from({ length: qty });

  return (
    <div
      style={{
        background: "#fff",
        width: "80mm",
        padding: "2mm",
        margin: "0 auto",
        fontFamily: "Arial",
      }}
    >
      <style>
        {`
          @media print {
            @page { margin: 0; }
            body { margin: 0; }
            button { display: none; }
          }
        `}
      </style>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          columnGap: "1mm",
          rowGap: "2mm",
          justifyContent: "space-between",
        }}
      >
        {labels.map((_, i) => (
          <div
            key={i}
            style={{
              width: "25mm",
              textAlign: "center",
              padding: "1mm",
              border: "1px solid #ddd",
              borderRadius: "2px",
            }}
          >
            <div style={{ fontSize: "9px", fontWeight: "bold" }}>{name}</div>

            <canvas
              ref={(el) => (refs.current[i] = el)}
              style={{ width: "100%" }}
            />

            <div style={{ fontSize: "8px" }}>{barcode}</div>
            <div style={{ fontSize: "9px", fontWeight: "bold" }}>
              Rs {price}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => window.close()}
        style={{
          width: "100%",
          marginTop: "5mm",
          padding: "10px",
          background: "#f3c46b",
          border: "none",
          fontSize: "14px",
        }}
      >
        Close
      </button>
    </div>
  );
}
