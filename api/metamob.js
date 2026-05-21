// api/metamob.js — Proxy Vercel pour l'API Metamob (contourne le CORS)
export default async function handler(req, res) {
  // Autorise les appels depuis ton site
  res.setHeader("Access-Control-Allow-Origin", "https://aventure-skycell.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") { res.status(200).end(); return; }

  const { slug, apikey } = req.query;
  if (!slug || !apikey) {
    return res.status(400).json({ error: "slug et apikey requis" });
  }

  try {
    const response = await fetch(
      `https://www.metamob.fr/api/v1/quests/${slug}/zones`,
      { headers: { "Authorization": `Bearer ${apikey}` } }
    );
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
