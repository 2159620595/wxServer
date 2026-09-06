const { listChannelStatus, hasAnyChannel } = require("../lib/channels");
const { sendJson } = require("../lib/http");

module.exports = (req, res) => {
  const sendkey = String(process.env.SENDKEY || "").trim();
  const channels = listChannelStatus();
  const enabled = channels.filter((c) => c.enabled);

  sendJson(res, 200, {
    ok: Boolean(sendkey) && hasAnyChannel(),
    service: "wxServer",
    version: "1.0.0",
    sendkey_configured: Boolean(sendkey),
    sendkey_hint: sendkey ? `***${sendkey.slice(-4)}` : null,
    api: "POST /{SendKey}.send",
    channels,
    enabled_count: enabled.length,
    enabled_ids: enabled.map((c) => c.id),
  });
};
