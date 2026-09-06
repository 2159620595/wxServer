(() => {
  const host = location.origin;
  const els = {
    badge: document.getElementById("badge"),
    apiLine: document.getElementById("api-line"),
    channels: document.getElementById("channels"),
    btnTest: document.getElementById("btn-test"),
    testMsg: document.getElementById("test-msg"),
    token: document.getElementById("token"),
    curl: document.getElementById("curl"),
  };

  els.curl.textContent =
    `curl -X POST "${host}/你的SendKey.send" \\\n` +
    `  -H "Content-Type: application/json" \\\n` +
    `  -d '{"title":"标题","desp":"正文"}'`;

  async function loadHealth() {
    try {
      const res = await fetch("/api/health");
      const data = await res.json();

      if (data.ok) {
        els.badge.textContent = `运行正常 · ${data.enabled_count} 个通道已启用`;
        els.badge.className = "badge ok";
      } else {
        els.badge.textContent = data.sendkey_configured
          ? "SendKey 已配置，但未启用任何通道"
          : "请配置 SENDKEY 与推送通道";
        els.badge.className = "badge bad";
      }

      els.apiLine.textContent = data.sendkey_hint
        ? `POST ${host}/{SendKey}.send · SendKey 尾号 ${data.sendkey_hint}`
        : `POST ${host}/{SendKey}.send · 请在 Vercel 设置 SENDKEY`;

      els.channels.innerHTML = (data.channels || [])
        .map(
          (c) => `
        <div class="card ${c.enabled ? "on" : "off"}">
          <div class="card-name">${c.name}</div>
          <div class="card-status">${c.enabled ? "已启用" : "未配置"}</div>
          <div class="card-env">${c.hint}<br>${c.env.join(" + ")}</div>
        </div>`,
        )
        .join("");

      els.btnTest.disabled = !data.ok;
    } catch {
      els.badge.textContent = "无法连接 /api/health";
      els.badge.className = "badge bad";
    }
  }

  els.btnTest.addEventListener("click", async () => {
    const token = els.token.value.trim();
    if (!token) {
      els.testMsg.className = "msg err";
      els.testMsg.textContent = "请填写 CONSOLE_TOKEN";
      return;
    }

    els.btnTest.disabled = true;
    els.testMsg.textContent = "发送中…";
    els.testMsg.className = "msg";

    try {
      const res = await fetch("/api/test", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.code === 0) {
        els.testMsg.className = "msg ok";
        els.testMsg.textContent = `成功 → ${(data.data?.channels || []).join(", ")}`;
      } else {
        els.testMsg.className = "msg err";
        els.testMsg.textContent = data.message || "失败";
      }
    } catch (err) {
      els.testMsg.className = "msg err";
      els.testMsg.textContent = String(err);
    } finally {
      els.btnTest.disabled = false;
    }
  });

  loadHealth();
})();
