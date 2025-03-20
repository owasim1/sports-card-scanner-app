import { NextResponse } from "next/server";
import axios from "axios";
import { Low, Memory } from "lowdb";
import dotenv from "dotenv";

dotenv.config();

const XIMILAR_API_KEY = process.env.XIMILAR_API_KEY;
const SPORTSCARDSPRO_API_KEY = process.env.SPORTSCARDSPRO_API_KEY;
console.log(XIMILAR_API_KEY);
console.log(SPORTSCARDSPRO_API_KEY);
const adapter = new Memory();
const db = new Low(adapter, { scans: [] });

await db.read();
db.data ||= { scans: [] };

export async function POST(req) {
  await db.read();
  db.data ||= { scans: [] };

  const { imageUrl } = await req.json();
  // const imageUrl = "https://i.imgur.com/TBfr5vf.jpeg"
  if (!imageUrl)
    return NextResponse.json({ error: "Image URL required" }, { status: 400 });

  console.log("📸 Scanning:", imageUrl);

  try {
    // Identify card using Ximilar API
    // const ximilarResponse = await axios.post(
    //     "https://api.ximilar.com/collectibles/v2/sport_id",
    //     // { records: [{ _url: imageUrl }], pricing: true },
    //     { records: [{ _base64: imageUrl }], pricing: true },
    //     { headers: { "Content-Type": "application/json", Authorization: `Token ${XIMILAR_API_KEY}` } }
    // );
    const ximilarResponse = {
      data: {
        records: [
          {
            _url: "https://m.media-amazon.com/images/I/51DmnDKFJnL._AC_UF1000,1000_QL80_.jpg",
            _status: {
              code: 200,
              text: "OK",
              request_id: "fb52bb1a-4fe9-46a5-8f96-a454a3fdb62b",
            },
            _id: "30b1e92f-bfb2-4bfd-a144-8c5c3d77feae",
            _width: 782,
            _height: 1000,
            Category: "Card/Sport Card",
            _objects: [
              {
                name: "Card",
                id: "76fa9ec3-e0d9-408a-b582-55a1cd6712e0",
                bound_box: [60, 33, 720, 945],
                prob: 0.8761416673660278,
                area: 0.7697186700767263,
                "Top Category": [
                  {
                    id: "8ae26c4a-ae79-4c01-9b54-ac4e2b42e914",
                    name: "Card",
                    prob: 1,
                  },
                ],
                _tags: {
                  Category: [
                    {
                      name: "Card/Sport Card",
                      prob: 1,
                      id: "a5634621-4a37-4b37-aa3d-720b2d6b35ec",
                      "pre-filled": true,
                    },
                  ],
                  Side: [
                    {
                      prob: 0.96443,
                      name: "front",
                      id: "651c8141-2b18-479b-a8b1-b959bc34b729",
                    },
                  ],
                  Subcategory: [
                    {
                      prob: 0.97466,
                      name: "Baseball",
                      id: "356e718f-280d-4696-a24c-ec3141aa0681",
                    },
                  ],
                  Autograph: [
                    {
                      prob: 0.78878,
                      name: "not signed",
                      id: "5c1bb98b-cd69-42c9-ab2a-75e480ffa2b0",
                    },
                  ],
                  "Foil/Holo": [
                    {
                      prob: 0.9827,
                      name: "Non-Foil",
                      id: "78b14f77-192d-45e4-919e-b7f403759e07",
                    },
                  ],
                  Graded: [
                    {
                      prob: 0.96284,
                      name: "no",
                      id: "3a532911-7d7c-4b9b-8442-f0f293952be6",
                    },
                  ],
                },
                _tags_simple: [
                  "Card/Sport Card",
                  "front",
                  "Baseball",
                  "not signed",
                  "Non-Foil",
                ],
                _identification: {
                  best_match: {
                    name: "Mickey Mantle",
                    set_name: "Update",
                    year: "2010",
                    sub_set: "2010 Topps - The Cards Your Mom Threw Out",
                    card_number: "CMT-1",
                    subcategory: "Baseball",
                    company: "Topps",
                    full_name:
                      "Mickey Mantle 2010 #CMT-1 Topps Update 2010 Topps - The Cards Your Mom Threw Out",
                    links: {
                      "ebay.com":
                        "https://www.ebay.com/sch/i.html?_nkw=Mickey+Mantle+2010+Update+2010+Topps+-+The+Cards+Your+Mom+Threw+Out+%23CMT-1+&_sacat=212",
                      "comc.com":
                        "https://www.comc.com/Cards,=Mickey+Mantle+2010+Update+2010+Topps+-+The+Cards+Your+Mom+Threw+Out+%23CMT-1+",
                      "beckett.com":
                        "https://marketplace.beckett.com/search_new/?term=Mickey+Mantle+2010+Update+2010+Topps+-+The+Cards+Your+Mom+Threw+Out+%23CMT-1+",
                    },
                  },
                  alternatives: [
                    {
                      name: "Mickey Mantle",
                      set_name: "Update",
                      year: "2010",
                      sub_set:
                        "2010 Topps - The Cards Your Mom Threw Out (Original Back)",
                      card_number: "311",
                      subcategory: "Baseball",
                      company: "Topps",
                      full_name:
                        "Mickey Mantle 2010 #311 Topps Update 2010 Topps - The Cards Your Mom Threw Out (Original Back)",
                      links: {
                        "ebay.com":
                          "https://www.ebay.com/sch/i.html?_nkw=Mickey+Mantle+2010+Update+2010+Topps+-+The+Cards+Your+Mom+Threw+Out+%28Original+Back%29+%23311+&_sacat=212",
                        "comc.com":
                          "https://www.comc.com/Cards,=Mickey+Mantle+2010+Update+2010+Topps+-+The+Cards+Your+Mom+Threw+Out+%28Original+Back%29+%23311+",
                        "beckett.com":
                          "https://marketplace.beckett.com/search_new/?term=Mickey+Mantle+2010+Update+2010+Topps+-+The+Cards+Your+Mom+Threw+Out+%28Original+Back%29+%23311+",
                      },
                    },
                    {
                      name: "Jonathan Villar",
                      set_name: "Heritage",
                      year: "2014",
                      card_number: "307",
                      subcategory: "Baseball",
                      sub_set: "",
                      company: "Topps",
                      full_name: "Jonathan Villar 2014 #307 Topps Heritage",
                      links: {
                        "ebay.com":
                          "https://www.ebay.com/sch/i.html?_nkw=Jonathan+Villar+2014+Heritage+%23307+&_sacat=212",
                        "comc.com":
                          "https://www.comc.com/Cards,=Jonathan+Villar+2014+Heritage+%23307+",
                        "beckett.com":
                          "https://marketplace.beckett.com/search_new/?term=Jonathan+Villar+2014+Heritage+%23307+",
                      },
                    },
                    {
                      name: "Mickey Mantle",
                      set_name: "",
                      year: "2008",
                      sub_set: "Factory Set Bonus: Mickey Mantle Reprints Blue",
                      card_number: "MMR-52",
                      subcategory: "Baseball",
                      company: "Topps",
                      full_name:
                        "Mickey Mantle 2008 #MMR-52 Topps Factory Set Bonus: Mickey Mantle Reprints Blue",
                      links: {
                        "ebay.com":
                          "https://www.ebay.com/sch/i.html?_nkw=Mickey+Mantle+2008+Factory+Set+Bonus%3A+Mickey+Mantle+Reprints+Blue+%23MMR-52+&_sacat=212",
                        "comc.com":
                          "https://www.comc.com/Cards,=Mickey+Mantle+2008+Factory+Set+Bonus%3A+Mickey+Mantle+Reprints+Blue+%23MMR-52+",
                        "beckett.com":
                          "https://marketplace.beckett.com/search_new/?term=Mickey+Mantle+2008+Factory+Set+Bonus%3A+Mickey+Mantle+Reprints+Blue+%23MMR-52+",
                      },
                    },
                    {
                      name: "Mickey Mantle",
                      set_name: "",
                      year: "2008",
                      sub_set: "Mickey Mantle Reprints Blue",
                      card_number: "MMR-52",
                      subcategory: "Baseball",
                      company: "Topps",
                      full_name:
                        "Mickey Mantle 2008 #MMR-52 Topps Mickey Mantle Reprints Blue",
                      links: {
                        "ebay.com":
                          "https://www.ebay.com/sch/i.html?_nkw=Mickey+Mantle+2008+Mickey+Mantle+Reprints+Blue+%23MMR-52+&_sacat=212",
                        "comc.com":
                          "https://www.comc.com/Cards,=Mickey+Mantle+2008+Mickey+Mantle+Reprints+Blue+%23MMR-52+",
                        "beckett.com":
                          "https://marketplace.beckett.com/search_new/?term=Mickey+Mantle+2008+Mickey+Mantle+Reprints+Blue+%23MMR-52+",
                      },
                    },
                    {
                      name: "Mickey Mantle",
                      set_name: "",
                      year: "1952",
                      sub_set: "Red Back",
                      card_number: "311",
                      subcategory: "Baseball",
                      company: "Topps",
                      full_name: "Mickey Mantle 1952 #311 Topps Red Back",
                      links: {
                        "ebay.com":
                          "https://www.ebay.com/sch/i.html?_nkw=Mickey+Mantle+1952+Red+Back+%23311+&_sacat=212",
                        "comc.com":
                          "https://www.comc.com/Cards,=Mickey+Mantle+1952+Red+Back+%23311+",
                        "beckett.com":
                          "https://marketplace.beckett.com/search_new/?term=Mickey+Mantle+1952+Red+Back+%23311+",
                      },
                    },
                  ],
                  distances: [
                    0.4860901, 0.51644003, 0.5427535, 0.570174, 0.570174,
                    0.59372145,
                  ],
                },
              },
            ],
            "Graded Slab": [
              {
                prob: 0.96284,
                name: "no",
                id: "3a532911-7d7c-4b9b-8442-f0f293952be6",
              },
              {
                prob: 0.03716,
                name: "yes",
                id: "9d7bf709-dfbc-4595-91be-a9d779b5f33c",
              },
            ],
          },
        ],
        pricing: true,
        status: {
          code: 200,
          text: "OK",
          request_id: "fb52bb1a-4fe9-46a5-8f96-a454a3fdb62b",
          proc_id: "2e7ae256-6a47-4ad5-86d3-d544ef237e15",
        },
        statistics: {
          "processing time": 1.6097102165222168,
        },
      },
    };
    // console.log(JSON.stringify(ximilarResponse.data), "JKSDAHDKJAS")
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
    const bestMatch = cardData._objects[0]._identification.best_match;
    const sportscardsproResponse = await axios.get(
      `https://www.sportscardspro.com/api/products?t=${SPORTSCARDSPRO_API_KEY}&q=${encodeURIComponent(cardData._objects[0]._identification.best_match.full_name)}`,
    );

    if (
      sportscardsproResponse.data.status !== "success" ||
      !sportscardsproResponse.data.products?.length
    ) {
      throw new Error("No matching products found.");
    }

    const productData = sportscardsproResponse.data.products;

    // Save scan history
    const scanResult = {
      timestamp: new Date().toISOString(),
      productData: productData,
      ximilarData: cardData,
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
