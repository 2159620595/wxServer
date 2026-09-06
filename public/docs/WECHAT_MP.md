# 微信公众号推送配置

wxServer 通过 **模板消息** 将通知推到 **关注公众号的个人微信**。

推荐先用 **微信公众平台测试号**（免费），详见下文。

---

## 1. 申请测试号

1. 打开 https://mp.weixin.qq.com/debug/cgi-bin/sandboxinfo?action=showmenu&t=sandbox/index
2. 微信扫码登录
3. 记录 **appID**、**appsecret**
4. 扫测试号二维码关注

## 2. 添加模板

测试号页面 → **模板消息接口** → 新增：

```
{{first.DATA}}
内容：{{keyword1.DATA}}
{{remark.DATA}}
```

记下 **模板 ID**。

字段名不同时，在 Vercel 设置 `WECHAT_MP_FIELD_TITLE` / `BODY` / `REMARK`。

## 3. 获取 openid

部署后访问：

```
GET https://你的域名/api/wechat-openid?token=你的CONSOLE_TOKEN
```

`data.openids` 中即关注者 openid。

## 4. Vercel 环境变量

```env
WECHAT_MP_APPID=
WECHAT_MP_SECRET=
WECHAT_MP_OPENID=
WECHAT_MP_TEMPLATE_ID=
SENDKEY=
CONSOLE_TOKEN=
```

## 5. 测试

```bash
curl -X POST "https://你的域名/你的SENDKEY.send" \
  -H "Content-Type: application/json" \
  -d '{"title":"测试","desp":"公众号推送成功"}'
```

---

## 常见错误

| errcode | 原因 |
|---------|------|
| 43004 | 未关注公众号 |
| 40037 | 模板 ID 错误 |
| 47003 | 模板字段名不匹配 |

---

## 与 Server酱 对比

| | Server酱 | wxServer |
|--|----------|----------|
| 公众号 | 方糖服务号 | **你自己的** 测试号/服务号 |
| 配置 | 扫码即用 | AppID + 模板 + openid |
| 数据 | 第三方 | 仅 Vercel 转发 |
