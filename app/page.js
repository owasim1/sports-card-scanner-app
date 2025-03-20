"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function Home() {
  const [scanHistory, setScanHistory] = useState([]); // Store all scans
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const isProcessing = useRef(false);
  const detectionCanvasRef = useRef(null);
  const [isCardDetected, setIsCardDetected] = useState(false);
  // **Auto-detection loop**
  const startAutoDetection = () => {
    setInterval(() => {
      detectCardShape();
    }, 1000); // Runs every 1 second
  };
  const detectCardShape = () => {
    if (isProcessing.current) return; // Prevent overlapping detections
    isProcessing.current = true;

    const video = videoRef.current;
    const canvas = detectionCanvasRef.current;

    if (video && canvas) {
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      // Convert to grayscale
      for (let i = 0; i < pixels.length; i += 4) {
        let avg = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
        pixels[i] = avg;
        pixels[i + 1] = avg;
        pixels[i + 2] = avg;
      }

      ctx.putImageData(imageData, 0, 0);

      // Count white pixels (loose edge detection)
      let edgeCount = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i] > 200) edgeCount++; // Check if pixel is close to white
      }

      // If enough edges detected, assume a card-like shape
      const isRectangleDetected = edgeCount > 30000; // Adjust this threshold for sensitivity

      setIsCardDetected(isRectangleDetected);
    }

    isProcessing.current = false; // Unlock detection
  };

  // Automatically start the camera when the page loads
  useEffect(() => {
    const startCamera = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("⚠️ Camera not supported in this browser.");
        alert(
          "Your browser does not support camera access. Please use Chrome or Safari.",
        );
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { exact: "environment" } }, // Use back camera
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("❌ Error accessing the camera:", error);
        alert(
          "Error accessing the camera. Ensure you have granted camera permissions.",
        );
      }
    };

    startCamera();
  }, []);

  // ✅ Auto-detection loop with cleanup to prevent memory leaks
  useEffect(() => {
    const interval = setInterval(() => {
      detectCardShape();
    }, 1000); // Runs every 1 second

    return () => clearInterval(interval); // ✅ Cleanup to prevent multiple intervals
  }, []); // Runs only once when the component mounts

  const detectCard = async () => {
    if (isProcessing.current) return; // Prevent overlapping detections
    isProcessing.current = true;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      const ctx = canvas.getContext("2d");

      // Clear previous frame
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Capture current frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL("image/jpeg");

      try {
        const response = await axios.post("/api/detect", {
          imageUrl: imageData,
        });

        // ✅ Check if the response includes a card-like object
        const isDetected = response.data.ximilarData._objects?.some((obj) =>
          obj.name.toLowerCase().includes("card"),
        );
        setIsCardDetected(isDetected); // Update state for border color
      } catch (error) {
        console.error("Error detecting card:", error);
      } finally {
        isProcessing.current = false; // Unlock detection
      }
    }
  };

  const scanCard = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      const ctx = canvas.getContext("2d");

      // ✅ Clear previous frame before capturing new one
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // ✅ Capture new frame from live video feed
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL("image/jpeg");

      try {
        const response = await axios.post("/api/scan", { imageUrl: imageData });

        // ✅ Check if the response includes a card-like object
        const isDetected = response.data.ximilarData._objects?.some((obj) =>
          obj.name.toLowerCase().includes("card"),
        );
        setIsCardDetected(isDetected); // Update state for border color

        // ✅ Append new scan to history instead of replacing
        setScanHistory((prevHistory) => [...prevHistory, response.data]);
      } catch (error) {
        console.error("Error scanning card:", error);
      }
    }
  };

  console.log(JSON.stringify(scanHistory));

  return (
    <div className="container">
      <h1>Sports Card Scanner</h1>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        width="100%"
        height="400px"
        style={{
          border: `5px solid ${isCardDetected ? "green" : "red"}`, // ✅ Change border color
          borderRadius: "10px",
        }}
      />{" "}
      <canvas
        ref={detectionCanvasRef}
        style={{ display: "none" }}
        width="640"
        height="480"
      ></canvas>
      {/* ✅ Scan button directly captures and sends the image */}
      <button onClick={scanCard}>Scan Card</button>
      {/* ✅ Show all scanned cards */}
      {scanHistory.length > 0 && (
        <div>
          <h2>Scan History</h2>

          {scanHistory.map((scan, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                marginTop: "10px",
              }}
            >
              <h3>Scan #{index + 1}</h3>
              <p>
                <strong>Card Name:</strong>{" "}
                {scan.ximilarData._objects[0]._identification?.best_match
                  ?.full_name
                  ? scan.ximilarData._objects[0]._identification?.best_match
                      ?.full_name
                  : scan.productData[0]["console-name"]}
              </p>
              <p>
                <strong>Pricing:</strong> $
                {scan.ximilarData._objects[0]._identification?.best_match
                  ?.pricing
                  ? scan.ximilarData._objects[0]["_identification"][
                      "best_match"
                    ]?.pricing?.list[0]?.price
                  : (scan.productData[0]["loose-price"] / 100).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
