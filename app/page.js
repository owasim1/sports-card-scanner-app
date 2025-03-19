"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function Home() {
  const [image, setImage] = useState(null);
  const [scanResult, setScanResult] = useState(null);
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
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL("image/jpeg");
      setImage(imageData);
    }
  };

  const scanCard = async () => {
    // if (!image) return alert("Capture an image first!");

    try {
      const response = await axios.post("/api/scan", { imageUrl: image });
      setScanResult(response.data);
    } catch (error) {
      console.error("Error scanning card:", error);
    }
  };
console.log(JSON.stringify(scanResult))
  return (
      <div className="container">
        <h1>Sports Card Scanner</h1>
        <video ref={videoRef} autoPlay playsInline width="100%" height="400px" />
        <canvas ref={canvasRef} style={{ display: "none" }} width="640" height="480"></canvas>

        <button onClick={captureImage}>Capture Image</button>
        <button onClick={scanCard}>Scan Card</button>

        {image && <img src={image} alt="Captured" style={{ marginTop: "20px", width: "100%" }} />}
        {scanResult && (
            <div>
              <h2>Scan Result</h2>
              <p><strong>Card Name:</strong> {scanResult.prices[0]["product-name"]}</p>
              <p><h3>Pricing:</h3>
                {scanResult.prices[0]["loose-price"]}</p>
              <p><h3>Grade:</h3>
                {scanResult.grading["final"]}</p>
            </div>
        )}
      </div>
  );
}
