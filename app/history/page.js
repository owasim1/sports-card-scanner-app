"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function HistoryPage() {
  const [scans, setScans] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const res = await fetch("/api/history");
      const data = await res.json();
      setScans(data.scans || []);
    };
    fetchHistory();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Scan History</h1>

      {scans.length === 0 ? (
        <p>No scan history yet.</p>
      ) : (
        scans.map((scan, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              marginTop: "10px",
            }}
          >
            <p>
              <strong>Card Name:</strong>{" "}
              {scan.ximilar_data?._objects?.[0]?._identification?.best_match
                ?.full_name ??
                scan.product_data?.[0]?.["console-name"] ??
                "Unknown"}
            </p>
            <p>
              <strong>Price:</strong> $
              {scan.ximilar_data?._objects?.[0]?._identification?.best_match
                ?.pricing?.list?.[0]?.price ??
                (scan.product_data?.[0]?.["loose-price"] / 100)?.toFixed(2) ??
                "N/A"}
            </p>
          </div>
        ))
      )}

      <Link href="/">
        <button style={{ marginTop: "20px" }}>Back to Home</button>
      </Link>
    </div>
  );
}
