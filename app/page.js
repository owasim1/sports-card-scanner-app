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
  const autoScanTriggered = useRef(false);

  const detectCardShape = () => {
    if (isProcessing.current) return;
    isProcessing.current = true;

    const video = videoRef.current;
    const canvas = detectionCanvasRef.current;

    if (!video || !canvas) {
      isProcessing.current = false;
      return;
    }

    const ctx = canvas.getContext("2d");

    // Set canvas size to match video
    const width = 320;
    const height = 240;
    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(video, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;

    const edgePixels = [];

    // Convert to grayscale + collect edge pixels
    for (let y = 0; y < height; y += 10) {
      for (let x = 0; x < width; x += 10) {
        const index = (y * width + x) * 4;
        const avg = (pixels[index] + pixels[index + 1] + pixels[index + 2]) / 3;

        if (avg > 220) {
          edgePixels.push({ x, y });
          ctx.fillStyle = "red";
          ctx.fillRect(x, y, 1, 1); // Visualize edges
        }
      }
    }

    // Detect corners based on quadrants
    const tolerance = 85;
    const topLeft = edgePixels.find((p) => p.x < tolerance && p.y < tolerance);
    const topRight = edgePixels.find(
      (p) => p.x > width - tolerance && p.y < tolerance,
    );
    const bottomLeft = edgePixels.find(
      (p) => p.x < tolerance && p.y > height - tolerance,
    );
    const bottomRight = edgePixels.find(
      (p) => p.x > width - tolerance && p.y > height - tolerance,
    );

    if (topLeft)
      (ctx.fillStyle = "blue"), ctx.fillRect(topLeft.x, topLeft.y, 4, 4);
    if (topRight)
      (ctx.fillStyle = "blue"), ctx.fillRect(topRight.x, topRight.y, 4, 4);
    if (bottomLeft)
      (ctx.fillStyle = "blue"), ctx.fillRect(bottomLeft.x, bottomLeft.y, 4, 4);
    if (bottomRight)
      (ctx.fillStyle = "blue"),
        ctx.fillRect(bottomRight.x, bottomRight.y, 4, 4);

    const cornersDetected = [topLeft, topRight, bottomLeft, bottomRight].filter(
      Boolean,
    ).length;
    const isRectangleDetected = cornersDetected >= 3;
    setIsCardDetected(isRectangleDetected);

    // ✅ Automatically scan if card is detected and not already triggered
    if (isRectangleDetected && !autoScanTriggered.current) {
      autoScanTriggered.current = true;
      scanCard().finally(() => {
        // ✅ Re-allow auto-scan after short delay
        setTimeout(() => {
          autoScanTriggered.current = false;
        }, 3000); // wait 3 seconds before allowing next auto scan
      });
    }

    setIsCardDetected(isRectangleDetected);
    isProcessing.current = false;
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
      />
      <div
        style={{
          position: "absolute",
          top: "120px", // adjust as needed
          left: "50%",
          transform: "translateX(-50%)",
          width: "180px",
          height: "252px",
          border: "2px dashed #00ff00",
          borderRadius: "8px",
          zIndex: 2,
          pointerEvents: "none",
        }}
      ></div>
      <canvas
        ref={detectionCanvasRef}
        width="320"
        height="240"
        style={{ display: "none" }}
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
