"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function Home() {
  const [image, setImage] = useState(null);
  const [scanHistory, setScanHistory] = useState([]); // Store all scans
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Automatically start the camera when the page loads
  useEffect(() => {
    const startCamera = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("⚠️ Camera not supported in this browser.");
        alert("Your browser does not support camera access. Please use Chrome or Safari.");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { exact: "environment" } } // Use back camera
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("❌ Error accessing the camera:", error);
        alert("Error accessing the camera. Ensure you have granted camera permissions.");
      }
    };

    startCamera();
  }, []);

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const ctx = canvas.getContext("2d");

      // ✅ Clear previous frame before capturing new one
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL("image/jpeg");
      setImage(imageData);
    }
  };

  const scanCard = async () => {
    if (!image) return alert("Capture an image first!");

    try {
      const response = await axios.post("/api/scan", { imageUrl: image });

      // ✅ Append new scan to history instead of replacing
      setScanHistory((prevHistory) => [...prevHistory, response.data]);
    } catch (error) {
      console.error("Error scanning card:", error);
    }
  };

  console.log(JSON.stringify(scanHistory));

  return (
      <div className="container">
        <h1>Sports Card Scanner</h1>
        <video ref={videoRef} autoPlay playsInline width="100%" height="400px" />
        <canvas ref={canvasRef} style={{ display: "none" }} width="640" height="480"></canvas>

        <button onClick={captureImage}>Capture Image</button>
        <button onClick={scanCard}>Scan Card</button>

        {image && <img src={image} alt="Captured" style={{ marginTop: "20px", width: "100%" }} />}

        {/* ✅ Show all scanned cards */}
        {scanHistory.length > 0 && (
            <div>
              <h2>Scan History</h2>
              {scanHistory.map((scan, index) => (
                  <div key={index} style={{ border: "1px solid #ccc", padding: "10px", marginTop: "10px" }}>
                    <h3>Scan #{index + 1}</h3>
                    <p><strong>Card Name:</strong> {scan.ximilarData._objects[0]["_identification"]["best_match"]["full_name"]}</p>
                    <p><strong>Pricing:</strong> ${scan.ximilarData._objects[0]["_identification"]["best_match"]?.pricing?.list[0]?.price ?? (scan.productData[0]["pricing-price"] / 100).toFixed(2)}</p>
                  </div>
              ))}
            </div>
        )}
      </div>
  );
}
