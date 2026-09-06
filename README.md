# wxServer

自托管 **微信公众号推送** 中转服务，API 兼容 [Server酱 Turbo](https://sct.ftqq.com)，一键部署 [Vercel](https://vercel.com)。

```
脚本 / 面板  ──POST /{SendKey}.send──▶  wxServer  ──▶  微信公众号 / 群机器人 / Telegram …
```

## 特性

- **Server酱兼容**：`POST /{SendKey}.send`，JSON `{ title, desp }`
- **公众号推个人微信**：测试号 / 认证服务号模板消息
- **多通道并行**：企业微信、钉钉、飞书、Telegram、Bark
- **Web 控制台**：部署后访问首页查看通道状态、发送测试
- **零数据库**：配置全在 Vercel 环境变量

## 快速开始

### 1. 部署到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/2159620595/wxServer)

或 CLI：

```bash
git clone https://github.com/2159620595/wxServer.git
cd wxServer
npx vercel login
npx vercel --prod
```

### 2. 配置环境变量

Vercel → Project → **Settings → Environment Variables**

| 变量 | 必填 | 说明 |
|------|------|------|
| `SENDKEY` | ✅ | API 密钥，如 `SCTmyKey2026` |
| `WECHAT_MP_APPID` | 公众号必填 | 测试号/服务号 AppID |
| `WECHAT_MP_SECRET` | 公众号必填 | AppSecret |
| `WECHAT_MP_OPENID` | 公众号必填 | 接收者 openid |
| `WECHAT_MP_TEMPLATE_ID` | 公众号必填 | 模板消息 ID |
| `CONSOLE_TOKEN` | 推荐 | 控制台测试 / 查 openid |
| `WECHAT_WEBHOOK` 等 | 可选 | 其它推送通道 |

公众号详细配置：[docs/WECHAT_MP.md](docs/WECHAT_MP.md)

### 3. 调用

```bash
curl -X POST "https://你的域名/SCTmyKey2026.send" \
  -H "Content-Type: application/json" \
  -d '{"title":"通知标题","desp":"正文内容"}'
```

成功响应：

```json
{ "code": 0, "message": "", "data": { "pushid": "...", "channels": ["wechat_mp"] } }
```

## API

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/{SendKey}.send` | 发送推送（Server酱兼容） |
| GET | `/api/health` | 服务与通道状态 |
| POST | `/api/test` | 测试推送，Header: `Authorization: Bearer {CONSOLE_TOKEN}` |
| GET | `/api/wechat-openid?token=` | 查询公众号关注者 openid |

## 项目结构

```
wxServer/
├── api/           # Vercel Serverless 入口
├── lib/           # 通道与 HTTP 工具
├── public/        # 控制台静态页
├── docs/          # 配置文档
├── vercel.json    # 路由重写
└── .env.example   # 环境变量模板
```

## 接入示例（秒杀面板）

```toml
[notify]
webhook_url = "https://你的域名/SCTmyKey2026.send"
```

## 安全

- **切勿**将 `SENDKEY`、`WECHAT_MP_SECRET` 提交到 Git
- SendKey 泄露后他人可向你推送消息
- 建议在 Vercel 仅 Production 环境配置密钥

## License

MIT
