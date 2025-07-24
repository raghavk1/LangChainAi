// testUpload.js
import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

// 🔑 Load creds
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_API
);

// 🧪 Dummy test
const dummyEmbedding = Array(384).fill(0.5); // 👈 MUST be 384 floats
const content = "This is a test upload directly to Supabase vector DB";
const metadata = { source: "unit_test", timestamp: Date.now() };

// 🧠 Insert test
const { data, error } = await supabase.from("documents").insert([
    {
        content,
        metadata,
        embedding: dummyEmbedding
    }
]);

if (error) {
    console.error("❌ Upload error:", error);
} else {
    console.log("✅ Successfully uploaded:", data);
}
