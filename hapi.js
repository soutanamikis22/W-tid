// ハピラインふくい在線データの中継 (Netlify Function)
// /hapi-api/sp/data/xxx.json  →  https://trainlocation.hapi-line.co.jp/sp/data/xxx.json
const HOST = "https://trainlocation.hapi-line.co.jp";

exports.handler = async function (event) {
  const m = /sp\/data\/[A-Za-z0-9_\-]+\.json/.exec(event.path || "");
  if (!m) return { statusCode: 400, body: "bad path" };
  const qs = event.rawQuery ? "?" + event.rawQuery : "";
  try {
    const r = await fetch(HOST + "/" + m[0] + qs, {
      headers: {
        "Referer": HOST + "/sp/",
        "Origin": HOST,
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "ja,en;q=0.8",
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      },
    });
    const body = await r.text();
    return {
      statusCode: r.status,
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
      body: r.ok ? body : JSON.stringify({ upstream_status: r.status, body: body.slice(0, 200) }),
    };
  } catch (e) {
    return { statusCode: 502, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: String(e) }) };
  }
};
