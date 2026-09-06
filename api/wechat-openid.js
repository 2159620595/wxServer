const { listSubscribers, isMpConfigured } = require("../lib/wechat-mp");
const { sendJson, assertConsoleToken } = require("../lib/http");

/** 查询公众号关注者 openid（需 CONSOLE_TOKEN） */
module.exports = async (req, res) => {
  if (req.method !== "GET") {
    return sendJson(res, 405, { code: 405, message: "请使用 GET" });
  }

  try {
    assertConsoleToken(req);
  } catch (e) {
    return sendJson(res, e.status || 401, { code: e.status || 401, message: e.message });
  }

  if (!isMpConfigured()) {
    return sendJson(res, 400, {
      code: 400,
      message: "请先配置 WECHAT_MP_APPID / SECRET / OPENID / TEMPLATE_ID",
    });
  }

  try {
    const subs = await listSubscribers();
    return sendJson(res, 200, {
      code: 0,
      message: "将 openid 填入 Vercel 环境变量 WECHAT_MP_OPENID",
      data: subs,
    });
  } catch (e) {
    return sendJson(res, 502, { code: 502, message: e.message });
  }
};
