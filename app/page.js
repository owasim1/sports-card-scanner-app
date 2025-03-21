"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function Home() {
  const [scanHistory, setScanHistory] = useState([]); // Store all scans
  const videoRef = useRef(null);
  const isProcessing = useRef(false);
  const detectionCanvasRef = useRef(null);
  const [loadingScans, setLoadingScans] = useState([]); // Track loading state for each scan
  const [isCardDetected, setIsCardDetected] = useState(false);
  const captureCanvasRef = useRef(null);

  const detectCardShape = () => {
    if (isProcessing.current) return; // Prevent overlapping detections
    isProcessing.current = true;

    const video = videoRef.current;
    const canvas = detectionCanvasRef.current;

    if (video && canvas) {
      const ctx = canvas.getContext("2d");

      // ✅ Use a slightly larger resolution for better detection
      const WIDTH = 400;
      const HEIGHT = 300;
      ctx.drawImage(video, 0, 0, WIDTH, HEIGHT);
      const imageData = ctx.getImageData(0, 0, WIDTH, HEIGHT);
      const pixels = imageData.data;

      // Convert to grayscale (simplifies edge detection)
      for (let i = 0; i < pixels.length; i += 4) {
        let avg = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
        pixels[i] = avg;
        pixels[i + 1] = avg;
        pixels[i + 2] = avg;
      }

      ctx.putImageData(imageData, 0, 0);

      // **🔍 Detect edges using white pixels threshold**
      let edgePixels = [];
      for (let y = 0; y < HEIGHT; y += 5) {
        // Increase density for better accuracy
        for (let x = 0; x < WIDTH; x += 5) {
          const index = (y * WIDTH + x) * 4;
          if (pixels[index] > 220) edgePixels.push({ x, y });
        }
      }

      // **🟩 Improved corner detection with flexible margins**
      let marginX = WIDTH * 0.2; // 20% of width (allows flexibility)
      let marginY = HEIGHT * 0.2; // 20% of height

      let topLeft = edgePixels.find((p) => p.x < marginX && p.y < marginY);
      let topRight = edgePixels.find(
        (p) => p.x > WIDTH - marginX && p.y < marginY,
      );
      let bottomLeft = edgePixels.find(
        (p) => p.x < marginX && p.y > HEIGHT - marginY,
      );
      let bottomRight = edgePixels.find(
        (p) => p.x > WIDTH - marginX && p.y > HEIGHT - marginY,
      );

      // **🔢 Detect aspect ratio (allow flexibility for perspective)**
      let detectedWidth =
        topRight && topLeft ? Math.abs(topRight.x - topLeft.x) : 0;
      let detectedHeight =
        bottomLeft && topLeft ? Math.abs(bottomLeft.y - topLeft.y) : 0;

      let aspectRatio =
        detectedWidth && detectedHeight ? detectedWidth / detectedHeight : 0;

      // **✅ Aspect Ratio Check**
      const isCorrectAspectRatio = aspectRatio >= 0.65 && aspectRatio <= 0.75; // 2.5x3.5 ratio with slight tolerance
      const detectedCorners = [
        topLeft,
        topRight,
        bottomLeft,
        bottomRight,
      ].filter(Boolean).length;

      // **✅ Confirm detection (at least 3 corners & correct ratio)**
      const isRectangleDetected = detectedCorners >= 3 && isCorrectAspectRatio;

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
    }, 500); // Runs every 1 second

    return () => clearInterval(interval); // ✅ Cleanup to prevent multiple intervals
  }, []); // Runs only once when the component mounts

  const scanCard = async () => {
    const video = videoRef.current;
    const canvas = captureCanvasRef.current;
    if (!video || !canvas) {
      alert("Error: Camera or canvas not available!");
      return;
    }

    const ctx = canvas.getContext("2d");

    // ✅ Use requestAnimationFrame to avoid freezing
    requestAnimationFrame(async () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL("image/jpeg");

      // ✅ Add a placeholder with loading state
      const scanId = Date.now();
      setScanHistory((prevHistory) => [
        ...prevHistory,
        { id: scanId, loading: true },
      ]);
      setLoadingScans((prevLoading) => [...prevLoading, scanId]);

      try {
        // ✅ Delay execution slightly to allow UI to update
        setTimeout(async () => {
          const response = await axios.post("/api/scan", {
            imageUrl: imageData,
          });

          // ✅ Replace placeholder with actual scan data
          setScanHistory((prevHistory) =>
            prevHistory.map((scan) =>
              scan.id === scanId
                ? { ...response.data, id: scanId, loading: false }
                : scan,
            ),
          );
          setLoadingScans((prevLoading) =>
            prevLoading.filter((id) => id !== scanId),
          ); // ✅ Remove loading state
        }, 100); // ✅ Small delay to prevent UI freeze
      } catch (error) {
        console.error("Error scanning card:", error);
      }
    });
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
      <canvas
        ref={captureCanvasRef}
        style={{ display: "none" }}
        width="640"
        height="480"
      ></canvas>
      {/* ✅ Scan button directly captures and sends the image */}
      <button onClick={scanCard}>Scan Card</button>
      {/* ✅ Show all scanned cards */}
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

          {scan.loading ? (
            <p style={{ color: "blue" }}>🔄 Scanning... Please wait</p>
          ) : (
            <>
              <p>
                <strong>Card Name:</strong>{" "}
                {scan.ximilarData?._objects[0]._identification?.best_match
                  ?.full_name
                  ? scan.ximilarData._objects[0]._identification?.best_match
                      ?.full_name
                  : (scan.productData?.[0]?.["console-name"] ?? "Unknown")}
              </p>
              <p>
                <strong>Pricing:</strong> $
                {scan.ximilarData?._objects[0]._identification?.best_match
                  ?.pricing
                  ? scan.ximilarData._objects[0]["_identification"][
                      "best_match"
                    ]?.pricing?.list?.[0]?.price
                  : ((scan.productData?.[0]?.["loose-price"] / 100)?.toFixed(
                      2,
                    ) ?? "N/A")}
              </p>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
