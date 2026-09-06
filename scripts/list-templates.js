/** 列出当前公众号已配置的模板（需 vercel.env） */

const fs = require("fs");
const path = require("path");

function loadEnv() {
  const file = path.join(__dirname, "..", "vercel.env");
  if (!fs.existsSync(file)) {
    console.error("缺少 vercel.env");
    process.exit(1);
  }
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i > 0) process.env[line.slice(0, i)] = line.slice(i + 1);
  }
}

async function main() {
  loadEnv();
  const appid = process.env.WECHAT_MP_APPID;
  const secret = process.env.WECHAT_MP_SECRET;
  const tokenResp = await fetch(
    `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`,
  );
  const tokenData = await tokenResp.json();
  if (!tokenData.access_token) {
    console.error("获取 token 失败:", tokenData);
    process.exit(1);
  }

  const resp = await fetch(
    `https://api.weixin.qq.com/cgi-bin/template/get_all_private_template?access_token=${tokenData.access_token}`,
  );
  const data = await resp.json();
  console.log(JSON.stringify(data, null, 2));

  for (const tpl of data.template_list || []) {
    console.log("\n---");
    console.log("模板标题(卡片顶部):", tpl.title);
    console.log("模板 ID:", tpl.template_id);
    console.log("模板内容:\n", tpl.content);
    if (tpl.title === "1") {
      console.log("\n⚠ 模板标题是「1」，请在测试号后台删除并重建，标题改为「腾讯云秒杀」");
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
