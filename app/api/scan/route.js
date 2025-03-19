import { NextResponse } from "next/server";
import axios from "axios";
import {Low, Memory} from "lowdb";
import dotenv from "dotenv";

dotenv.config();

const XIMILAR_API_KEY = process.env.XIMILAR_API_KEY;
const SPORTSCARDSPRO_API_KEY = process.env.SPORTSCARDSPRO_API_KEY;
console.log(XIMILAR_API_KEY)
console.log(SPORTSCARDSPRO_API_KEY)
const adapter = new Memory();
const db = new Low(adapter, { scans: [] });

await db.read();
db.data ||= { scans: [] };

export async function POST(req) {
    await db.read();
    db.data ||= { scans: [] };

    const { imageUrl } = await req.json();
    // const imageUrl = "https://i.etsystatic.com/5850192/r/il/37282f/1285253180/il_fullxfull.1285253180_10gi.jpg"
    if (!imageUrl) return NextResponse.json({ error: "Image URL required" }, { status: 400 });

    console.log("📸 Scanning:", imageUrl);

    try {
        // Identify card using Ximilar API
        const ximilarResponse = await axios.post(
            "https://api.ximilar.com/collectibles/v2/sport_id",
            // { records: [{ _url: imageUrl }], pricing: true },
            { records: [{ _base64: imageUrl }], pricing: true },
            { headers: { "Content-Type": "application/json", Authorization: `Token ${XIMILAR_API_KEY}` } }
        );
        console.log(JSON.stringify(ximilarResponse.data), "JKSDAHDKJAS")
        const cardData = ximilarResponse.data.records[0];
        if (!cardData) throw new Error("Card identification failed.");

        // Grade card using Ximilar API
        // const gradeResponse = await axios.post(
        //     "https://api.ximilar.com/card-grader/v2/grade",
        //     { records: [{ _url: imageUrl }] },
        //     { headers: { "Content-Type": "application/json", Authorization: `Token ${XIMILAR_API_KEY}` } }
        // );
        // console.log("📊 Card Grading Result:", JSON.stringify(gradeResponse.data));

// Extract grading data
//         const gradeData = gradeResponse.data.records[0]?.grades || {};

        // Fetch price from SportsCardsPro API
        const sportscardsproResponse = await axios.get(
            `https://www.sportscardspro.com/api/products?t=${SPORTSCARDSPRO_API_KEY}&q=${encodeURIComponent(cardData)}`
        );

        if (sportscardsproResponse.data.status !== "success" || !sportscardsproResponse.data.products?.length) {
            throw new Error("No matching products found.");
        }

        const productData = sportscardsproResponse.data.products

        // Save scan history
        const scanResult = {
            timestamp: new Date().toISOString(),
            productData: productData,
            ximilarData: cardData
            // grading: gradeData
        };
        db.data.scans.push(scanResult);
        await db.write();

        return NextResponse.json(scanResult);
    } catch (error) {
        console.error("❌ Error:", error.response?.data || error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
