/** HTTP 工具：Vercel Serverless 响应与请求解析 */

function sendJson(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json;charset=utf-8");
  res.end(JSON.stringify(body));
}

function parseBody(req) {
  const raw = req.body;
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return {};
}

function readBearerToken(req) {
  const header = String(req.headers.authorization || "");
  return header.replace(/^Bearer\s+/i, "").trim();
}

function readQueryToken(req) {
  return String(req.query?.token || "").trim();
}

function assertConsoleToken(req) {
  const expected = String(process.env.CONSOLE_TOKEN || "").trim();
  const got = readBearerToken(req) || readQueryToken(req);
  if (!expected || got !== expected) {
    const err = new Error("需要有效的 CONSOLE_TOKEN");
    err.status = 401;
    throw err;
  }
}

function assertSendKey(req) {
  const expected = String(process.env.SENDKEY || "").trim();
  const got = String(req.query.key || "").trim();
  if (!expected || got !== expected) {
    const err = new Error("SendKey 无效");
    err.status = 401;
    throw err;
  }
}

function normalizePushPayload(body) {
  const title = String(body.title || "").replace(/\n/g, " ").trim();
  const desp = String(body.desp || body.content || body.text || "").trim();
  const remark = String(body.remark || "").trim();
  return { title, desp, remark };
}

module.exports = {
  sendJson,
  parseBody,
  assertConsoleToken,
  assertSendKey,
  normalizePushPayload,
};
