/** 推送通道注册与并行分发 */

const { pushWechatMp, isMpConfigured } = require("./wechat-mp");

/** @type {import('./channels').ChannelMeta[]} */
const CHANNELS = [
  {
    id: "wechat_mp",
    name: "微信公众号",
    env: ["WECHAT_MP_APPID", "WECHAT_MP_SECRET", "WECHAT_MP_OPENID", "WECHAT_MP_TEMPLATE_ID"],
    hint: "测试号/服务号模板消息 → 个人微信",
  },
  {
    id: "wechat_work",
    name: "企业微信群机器人",
    env: ["WECHAT_WEBHOOK"],
    hint: "企业微信 → 群机器人 Webhook",
  },
  {
    id: "dingtalk",
    name: "钉钉群机器人",
    env: ["DINGTALK_WEBHOOK"],
    hint: "钉钉群 → 自定义机器人",
  },
  {
    id: "feishu",
    name: "飞书群机器人",
    env: ["FEISHU_WEBHOOK"],
    hint: "飞书群 → 群机器人",
  },
  {
    id: "telegram",
    name: "Telegram",
    env: ["TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID"],
    hint: "Bot 私聊通知",
  },
  {
    id: "bark",
    name: "Bark (iOS)",
    env: ["BARK_URL"],
    hint: "iPhone 推送",
  },
];

function formatText(title, desp) {
  return desp ? `${title}\n\n${desp}` : title;
}

async function postJson(url, payload) {
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await resp.json().catch(() => ({}));
  return { ok: resp.ok, data };
}

async function pushWechatWork(webhook, title, desp) {
  const { ok, data } = await postJson(webhook, {
    msgtype: "text",
    text: { content: formatText(title, desp) },
  });
  if (!ok || data.errcode) throw new Error(data.errmsg || "企业微信推送失败");
  return "wechat_work";
}

async function pushDingtalk(webhook, title, desp) {
  const { ok, data } = await postJson(webhook, {
    msgtype: "text",
    text: { content: formatText(title, desp) },
  });
  if (!ok || data.errcode) throw new Error(data.errmsg || "钉钉推送失败");
  return "dingtalk";
}

async function pushFeishu(webhook, title, desp) {
  const { ok, data } = await postJson(webhook, {
    msg_type: "text",
    content: { text: formatText(title, desp) },
  });
  if (!ok || data.code) throw new Error(data.msg || "飞书推送失败");
  return "feishu";
}

async function pushTelegram(token, chatId, title, desp) {
  const { ok, data } = await postJson(`https://api.telegram.org/bot${token}/sendMessage`, {
    chat_id: chatId,
    text: formatText(title, desp),
  });
  if (!ok || !data.ok) throw new Error(data.description || "Telegram 推送失败");
  return "telegram";
}

async function pushBark(barkUrl, title, desp) {
  const base = barkUrl.replace(/\/$/, "");
  const query = desp ? `?body=${encodeURIComponent(desp)}` : "";
  const resp = await fetch(`${base}/${encodeURIComponent(title)}${query}`);
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok || data.code !== 200) throw new Error(data.message || "Bark 推送失败");
  return "bark";
}

function isChannelReady(meta) {
  return meta.env.every((key) => String(process.env[key] || "").trim());
}

function listChannelStatus() {
  return CHANNELS.map((channel) => ({
    id: channel.id,
    name: channel.name,
    hint: channel.hint,
    env: channel.env,
    enabled: isChannelReady(channel),
  }));
}

function hasAnyChannel() {
  return CHANNELS.some(isChannelReady);
}

async function dispatchAll(title, desp) {
  /** @type {Promise<string>[]} */
  const tasks = [];

  if (isMpConfigured()) tasks.push(pushWechatMp(title, desp));
  if (process.env.WECHAT_WEBHOOK) {
    tasks.push(pushWechatWork(process.env.WECHAT_WEBHOOK, title, desp));
  }
  if (process.env.DINGTALK_WEBHOOK) {
    tasks.push(pushDingtalk(process.env.DINGTALK_WEBHOOK, title, desp));
  }
  if (process.env.FEISHU_WEBHOOK) {
    tasks.push(pushFeishu(process.env.FEISHU_WEBHOOK, title, desp));
  }
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    tasks.push(
      pushTelegram(process.env.TELEGRAM_BOT_TOKEN, process.env.TELEGRAM_CHAT_ID, title, desp),
    );
  }
  if (process.env.BARK_URL) {
    tasks.push(pushBark(process.env.BARK_URL, title, desp));
  }

  const pushed = [];
  const errors = [];
  const results = await Promise.allSettled(tasks);

  for (const result of results) {
    if (result.status === "fulfilled") pushed.push(result.value);
    else errors.push(result.reason?.message || String(result.reason));
  }

  return { pushed, errors };
}

module.exports = {
  CHANNELS,
  listChannelStatus,
  hasAnyChannel,
  dispatchAll,
};
