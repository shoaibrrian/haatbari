import OpenAI from "openai";
import connectDB from "@/lib/db/connect";
import Product from "@/modules/product/product.model";

const client = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function POST(request) {
  const { query } = await request.json();
  if (!query?.trim()) {
    return Response.json(
      { error: "Search query is required" },
      { status: 400 },
    );
  }

  const aiRes = await client.chat.completions.create({
    model: "gemini-3.6-flash",
    messages: [
      {
        role: "user",
        content:
          "Generate exactly 10 relevant product search keywords for this query. Return only the keywords as a comma-separated list, with no numbering or extra text: " +
          query,
      },
    ],
  });
  const keywords = aiRes.choices[0].message.content
    .split(",")
    .map((keyword) => keyword.replace(/^\s*\d+[.)-]?\s*/, "").trim())
    .map((keyword) => keyword.replace(/^['"`]|['"`]$/g, "").trim())
    .filter(Boolean)
    .slice(0, 10);

  await connectDB();

  console.log("AI Keywords:", keywords);

  const products = await Product.find({
    $or: keywords.flatMap((keyword) => {
      const regex = { $regex: escapeRegex(keyword), $options: "i" };
      return [{ title: regex }, { description: regex }, { category: regex }];
    }),
  });

  return Response.json(products);
}
