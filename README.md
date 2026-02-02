# 小程序二维码动态生成（前端示例）

本示例演示**前端如何动态生成并展示小程序二维码**。需要注意：

- 小程序二维码必须由**服务端**调用微信接口生成，前端无法直接拿到 `access_token`。
- 前端负责收集参数、调用后端接口、展示与下载二维码。

## 目录结构

```
.
├── index.html   # 页面与表单
├── app.js       # 前端逻辑（请求后端、展示二维码）
└── styles.css   # 简单样式
```

## 使用方式

1. 启动任意静态服务（也可以直接打开 `index.html`）。
2. 修改页面中的 **API Base**，指向你的后端服务。
3. 填写 `scene` 等参数，点击「生成二维码」。

## 后端接口约定（示例）

前端默认请求：

```
POST /api/wxacode
Content-Type: application/json
```

请求体示例（与微信 `getwxacodeunlimit` 参数对应）：

```json
{
  "scene": "order_id=123",
  "page": "pages/home/index",
  "width": 430,
  "env_version": "release",
  "check_path": true,
  "is_hyaline": false
}
```

后端响应支持以下两种形式：

1. **直接返回图片**

```
Content-Type: image/png
<binary>
```

2. **返回 JSON（含 base64）**

```json
{
  "base64": "data:image/png;base64,iVBORw0KGgoAAA..."
}
```

或者：

```json
{
  "data": "iVBORw0KGgoAAA..."
}
```

## 关键说明

- 小程序二维码接口需要 `access_token`，只能由服务端调用。
- 前端如果跨域访问后端，请在后端配置 CORS。
- 本示例仅展示前端实现，后端可用任意语言实现。