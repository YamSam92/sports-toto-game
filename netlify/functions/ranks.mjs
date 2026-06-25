import { getStore } from "@netlify/blobs";
const KEY = "top10";
const json = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { "content-type": "application/json", "cache-control": "no-store" } });
export default async (req) => {
  const store = getStore("leaderboard");
  if (req.method === "POST") {
    let b;
    try { b = await req.json(); } catch { return json({ error: "bad json" }, 400); }
    const name = (String(b.name || "").trim().slice(0, 10)) || "익명";
    const start = Math.round(Number(b.start) || 0);
    const profit = Math.round(Number(b.profit) || 0);
    const balance = Math.round(Number(b.balance) || 0);
    if (start <= 0) return json({ error: "bad start" }, 400);
    const pct = Math.round((profit / start * 100) * 10) / 10;
    const list = (await store.get(KEY, { type: "json" })) || [];
    list.push({ name, profit, balance, start, pct, t: Date.now() });
    list.sort((a, b) => b.pct - a.pct);
    const top = list.slice(0, 10);
    await store.setJSON(KEY, top);
    return json(top);
  }
  const list = (await store.get(KEY, { type: "json" })) || [];
  list.sort((a, b) => b.pct - a.pct);
  return json(list.slice(0, 10));
};