"use client";

import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [isCardDetected, setIsCardDetected] = useState(false); // Border color state
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectionCanvasRef = useRef(null);
  const isProcessing = useRef(false); // Prevents multiple detections at once

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
          video: { facingMode: { exact: "environment" } }, // Use back camera
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        startAutoDetection();
      } catch (error) {
        console.error("❌ Error accessing the camera:", error);
        alert("Error accessing the camera. Ensure you have granted camera permissions.");
      }
    };

    startCamera();
  }, []);

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
        />
        <canvas ref={detectionCanvasRef} style={{ display: "none" }} width="640" height="480"></canvas>
      </div>
  );
}
