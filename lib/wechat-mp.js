/** 微信公众号模板消息（测试号 / 认证服务号） */

const MP_ENV_KEYS = [
  "WECHAT_MP_APPID",
  "WECHAT_MP_SECRET",
  "WECHAT_MP_OPENID",
  "WECHAT_MP_TEMPLATE_ID",
];

const TOKEN_URL = "https://api.weixin.qq.com/cgi-bin/token";
const TEMPLATE_URL = "https://api.weixin.qq.com/cgi-bin/message/template/send";
const USER_LIST_URL = "https://api.weixin.qq.com/cgi-bin/user/get";

async function getAccessToken(appid, secret) {
  const url = `${TOKEN_URL}?grant_type=client_credential&appid=${appid}&secret=${secret}`;
  const resp = await fetch(url);
  const data = await resp.json();
  if (data.errcode) {
    throw new Error(data.errmsg || `获取 access_token 失败 (${data.errcode})`);
  }
  return data.access_token;
}

const BOX_CHARS = /[┏┓┗┛┣┫━│┌┐└┘├┤─]/g;

/** 模板 keyword 不支持换行/框线，否则客户端可能显示空白 */
function sanitizeForWechatMp(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(BOX_CHARS, "")
    .replace(/\n+/g, " · ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function splitDesp(desp) {
  const raw = String(desp || "");
  const splitAt = raw.search(/[┣├]/);
  if (splitAt < 0) {
    return { body: raw, tip: "" };
  }
  return {
    body: raw.slice(0, splitAt),
    tip: raw.slice(splitAt),
  };
}

function buildTemplateData(title, desp) {
  const fieldTitle = process.env.WECHAT_MP_FIELD_TITLE || "first";
  const fieldBody = process.env.WECHAT_MP_FIELD_BODY || "keyword1";
  const fieldRemark = process.env.WECHAT_MP_FIELD_REMARK || "remark";

  const { body, tip } = splitDesp(desp);
  const bodyText = sanitizeForWechatMp(body);
  const tipText = sanitizeForWechatMp(tip);
  const time = new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" });

  const data = {
    [fieldTitle]: { value: clipField(sanitizeForWechatMp(title), 100) },
    [fieldBody]: { value: clipField(bodyText || "—", 200) },
  };

  if (fieldRemark) {
    const remark = tipText ? `${tipText} · ${time}` : time;
    data[fieldRemark] = { value: clipField(remark, 200) };
  }
  return data;
}

function clipField(text, maxLen = 200) {
  const s = String(text || "");
  if (s.length <= maxLen) return s;
  return `${s.slice(0, maxLen - 3)}...`;
}

async function pushWechatMp(title, desp) {
  const appid = process.env.WECHAT_MP_APPID;
  const secret = process.env.WECHAT_MP_SECRET;
  const openid = process.env.WECHAT_MP_OPENID;
  const templateId = process.env.WECHAT_MP_TEMPLATE_ID;

  const token = await getAccessToken(appid, secret);
  const resp = await fetch(`${TEMPLATE_URL}?access_token=${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      touser: openid,
      template_id: templateId,
      data: buildTemplateData(title, desp),
    }),
  });

  const data = await resp.json();
  if (data.errcode) {
    throw new Error(data.errmsg || `模板消息发送失败 (${data.errcode})`);
  }
  return "wechat_mp";
}

async function listSubscribers() {
  const token = await getAccessToken(
    process.env.WECHAT_MP_APPID,
    process.env.WECHAT_MP_SECRET,
  );
  const resp = await fetch(`${USER_LIST_URL}?access_token=${token}&next_openid=`);
  const data = await resp.json();
  if (data.errcode) {
    throw new Error(data.errmsg || `获取关注者失败 (${data.errcode})`);
  }
  return {
    total: data.total || 0,
    count: data.count || 0,
    openids: data.data?.openid || [],
  };
}

function isMpConfigured() {
  return MP_ENV_KEYS.every((key) => String(process.env[key] || "").trim());
}

module.exports = {
  pushWechatMp,
  listSubscribers,
  isMpConfigured,
};
