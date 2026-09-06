const { dispatchAll, hasAnyChannel } = require("../lib/channels");
const {
  sendJson,
  parseBody,
  assertSendKey,
  normalizePushPayload,
} = require("../lib/http");

/** Server酱 兼容：POST /{SendKey}.send */
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return sendJson(res, 405, { code: 405, message: "请使用 POST" });
  }

  try {
    assertSendKey(req);
  } catch (e) {
    return sendJson(res, e.status || 401, { code: e.status || 401, message: e.message });
  }

  const { title, desp, remark } = normalizePushPayload(parseBody(req));
  if (!title) {
    return sendJson(res, 400, { code: 400, message: "缺少 title" });
  }

  if (!hasAnyChannel()) {
    return sendJson(res, 500, {
      code: 500,
      message: "未配置推送通道，请在 Vercel 环境变量中添加",
    });
  }

  const { pushed, errors } = await dispatchAll(title, desp, remark);
  if (!pushed.length) {
    return sendJson(res, 502, { code: 502, message: errors.join("; ") || "推送失败" });
  }

  return sendJson(res, 200, {
    code: 0,
    message: "",
    data: {
      pushid: String(Date.now()),
      channels: pushed,
      warnings: errors.length ? errors : undefined,
    },
  });
};
