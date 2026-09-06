# 公众号模板配置（秒杀通知）

## 为什么顶部一直显示 `1`？

查过你当前的模板（ID `SpBuvdMs-...`）：

| 项目 | 当前值 | 说明 |
|------|--------|------|
| **模板标题** | `1` | 创建时填错了，**卡片顶部显示的就是这个** |
| **模板内容** | `{{first.DATA}}` … | 内容是对的，不用改结构 |

所以不是程序没推标题，而是 **微信把「模板标题」显示在卡片顶部**，跟 `first` 字段无关。

---

## 正确模板（复制即用）

测试号后台 → [模板消息接口](https://mp.weixin.qq.com/debug/cgi-bin/sandboxinfo?action=showmenu&t=sandbox/index) → **新增测试模板**

**模板标题：**

```
腾讯云秒杀
```

**模板内容：**

```
{{first.DATA}}
内容：{{keyword1.DATA}}
{{remark.DATA}}
```

保存后记下 **模板 ID**，更新 Vercel：

```env
WECHAT_MP_TEMPLATE_ID=新的模板ID
```

也可直接复制 [`../template/seckill-notify.txt`](../template/seckill-notify.txt)。

---

## 推送效果

| 字段 | 示例 |
|------|------|
| 卡片顶部（模板标题） | 腾讯云秒杀 |
| first | 腾讯云秒杀 · 抢购失败 |
| keyword1（内容：） | 下午15:00 没抢到（已售罄） |
| remark | 抢窗内收到售罄：库存已被抢走… |

---

## 操作步骤

1. 测试号后台 **删除** 旧模板（标题为 `1` 那条）
2. 按上文 **新增** 模板，标题填 `腾讯云秒杀`
3. 复制新 **模板 ID** → Vercel `WECHAT_MP_TEMPLATE_ID`
4. 测试推送：

```bash
curl -X POST "https://wx-server.vercel.app/SCTseckill2026.send" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"腾讯云秒杀 · 抢购失败\",\"desp\":\"下午15:00 没抢到（已售罄）\",\"remark\":\"请关注下一场\"}"
```

或在项目根目录：

```powershell
.\.venv\Scripts\python.exe tools\push_real_log_test.py
```

---

## 查看当前模板（可选）

```powershell
cd wxServer
node scripts/list-templates.js
```
