app.get("/api/stock-report", async (req, res) => {
  try {
    // 1) Last Snapshot
    const lastSnapRes = await pg.query(`
      SELECT snap_date 
      FROM stock_snapshots
      ORDER BY snap_date DESC
      LIMIT 1
    `);

    let baseDate = "1900-01-01";
    if (lastSnapRes.rows.length > 0) baseDate = lastSnapRes.rows[0].snap_date;

    // 👉 Load all item names here (main fix)
    const itemsRes = await pg.query(`
      SELECT barcode::text, item_name 
      FROM items
    `);

    let itemNames = {};
    itemsRes.rows.forEach(r => {
      itemNames[r.barcode] = r.item_name;
    });

    // 2) Base Snapshot Stock
    const base = await pg.query(`
      SELECT barcode::text, SUM(stock_qty) AS qty
      FROM stock_snapshots
      WHERE snap_date = $1
      GROUP BY barcode::text
    `, [baseDate]);

    let map = {};
    base.rows.forEach(r => {
      map[r.barcode] = {
        barcode: r.barcode,
        item_name: itemNames[r.barcode] || "",   // ⭐ FIX
        stock_qty: Number(r.qty)
      };
    });

    // 3) Purchases
    const pur = await pg.query(`
      SELECT barcode::text, SUM(qty) AS qty
      FROM purchases
      WHERE is_deleted = false AND purchase_date > $1
      GROUP BY barcode::text
    `, [baseDate]);

    pur.rows.forEach(r => {
      if (!map[r.barcode]) map[r.barcode] = {
        barcode: r.barcode,
        item_name: itemNames[r.barcode] || "",   // ⭐ FIX
        stock_qty: 0
      };
      map[r.barcode].stock_qty += Number(r.qty);
    });

    // 4) Sales
    const sal = await pg.query(`
      SELECT barcode::text, SUM(qty) AS qty
      FROM sales
      WHERE is_deleted = false AND sale_date > $1
      GROUP BY barcode::text
    `, [baseDate]);

    sal.rows.forEach(r => {
      if (!map[r.barcode]) map[r.barcode] = {
        barcode: r.barcode,
        item_name: itemNames[r.barcode] || "",   // ⭐ FIX
        stock_qty: 0
      };
      map[r.barcode].stock_qty -= Number(r.qty);
    });

    // 5) Returns
    const ret = await pg.query(`
      SELECT barcode::text, SUM(return_qty) AS qty
      FROM sale_returns
      WHERE created_at::date > $1
      GROUP BY barcode::text
    `, [baseDate]);

    ret.rows.forEach(r => {
      if (!map[r.barcode]) map[r.barcode] = {
        barcode: r.barcode,
        item_name: itemNames[r.barcode] || "",   // ⭐ FIX
        stock_qty: 0
      };
      map[r.barcode].stock_qty += Number(r.qty);
    });

    // Remove zero stock
    const final = Object.values(map).filter(r => r.stock_qty !== 0);

    res.json({ success: true, rows: final });

  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});
