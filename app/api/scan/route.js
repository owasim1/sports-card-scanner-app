import { NextResponse } from "next/server";
import axios from "axios";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import dotenv from "dotenv";

dotenv.config();

const XIMILAR_API_KEY = process.env.XIMILAR_API_KEY;
const SPORTSCARDSPRO_API_KEY = process.env.SPORTSCARDSPRO_API_KEY;
console.log(XIMILAR_API_KEY)
console.log(SPORTSCARDSPRO_API_KEY)
const adapter = new JSONFile("history.json");
const db = new Low(adapter, { scans: [] });

await db.read();
db.data ||= { scans: [] };

export async function POST(req) {
    await db.read();
    db.data ||= { scans: [] };

    // const { imageUrl } = await req.json();
    const imageUrl = "https://i.etsystatic.com/5850192/r/il/37282f/1285253180/il_fullxfull.1285253180_10gi.jpg"
    if (!imageUrl) return NextResponse.json({ error: "Image URL required" }, { status: 400 });

    console.log("📸 Scanning:", imageUrl);

    try {
        // Identify card using Ximilar API
        const identifyResponse = await axios.post(
            "https://api.ximilar.com/collectibles/v2/sport_id",
            { records: [{ _url: imageUrl }], pricing: false },
            { headers: { "Content-Type": "application/json", Authorization: `Token ${XIMILAR_API_KEY}` } }
        );

        const cardData = identifyResponse.data.records[0];
        if (!cardData) throw new Error("Card identification failed.");

        // Fetch price from SportsCardsPro API
        const priceResponse = await axios.get(
            `https://www.sportscardspro.com/api/products?t=${SPORTSCARDSPRO_API_KEY}&q=${encodeURIComponent(cardData)}`
        );

        if (priceResponse.data.status !== "success" || !priceResponse.data.products?.length) {
            throw new Error("No matching products found.");
        }

        const productData = priceResponse.data.products.map((product) => ({
            id: product.id,
            name: product["product-name"],
            category: product["console-name"],
        }));

        // Save scan history
        const scanResult = { cardName: cardData.name, timestamp: new Date().toISOString(), prices: productData };
        db.data.scans.push(scanResult);
        await db.write();

        return NextResponse.json(scanResult);
    } catch (error) {
        console.error("❌ Error:", error.response?.data || error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
