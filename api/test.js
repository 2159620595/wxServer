const { dispatchAll, hasAnyChannel } = require("../lib/channels");
const { sendJson, assertConsoleToken } = require("../lib/http");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return sendJson(res, 405, { code: 405, message: "请使用 POST" });
  }

  try {
    assertConsoleToken(req);
  } catch (e) {
    return sendJson(res, e.status || 401, { code: e.status || 401, message: e.message });
  }

  if (!hasAnyChannel()) {
    return sendJson(res, 500, { code: 500, message: "未配置推送通道" });
  }

  const now = new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" });
  const { pushed, errors } = await dispatchAll("wxServer 测试", `推送测试 ${now}`);

  if (!pushed.length) {
    return sendJson(res, 502, { code: 502, message: errors.join("; ") });
  }

  return sendJson(res, 200, {
    code: 0,
    message: "测试推送已发送",
    data: { channels: pushed, warnings: errors.length ? errors : undefined },
  });
};
