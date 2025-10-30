# 微信小程序主包超包解决方案

## 问题背景

微信小程序对包体积有严格限制：
- **主包大小限制**：2MB
- **总包大小限制**：20MB (使用分包后)
- **单个分包大小限制**：2MB

当主包超过2MB时，小程序将无法上传发布。

---

## 解决方案目录

1. [使用分包加载](#1-使用分包加载)
2. [使用独立分包](#2-使用独立分包)
3. [图片资源优化](#3-图片资源优化)
4. [代码优化](#4-代码优化)
5. [NPM包优化](#5-npm包优化)
6. [分包预下载](#6-分包预下载)
7. [其他优化技巧](#7-其他优化技巧)

---

## 1. 使用分包加载

### 1.1 配置分包

在 `app.json` 中配置分包结构：

```json
{
  "pages": [
    "pages/index/index",
    "pages/home/home"
  ],
  "subpackages": [
    {
      "root": "packageA",
      "name": "moduleA",
      "pages": [
        "pages/cat/cat",
        "pages/dog/dog"
      ]
    },
    {
      "root": "packageB",
      "name": "moduleB",
      "pages": [
        "pages/apple/apple",
        "pages/banana/banana"
      ]
    }
  ]
}
```

### 1.2 分包原则

- **主包**：保留首页、tabBar页面、公共资源
- **分包**：按功能模块划分，将低频页面放入分包
- **分包不能相互引用**：各分包之间不能互相访问

### 1.3 访问分包页面

```javascript
// 跳转到分包页面
wx.navigateTo({
  url: '/packageA/pages/cat/cat'
})
```

---

## 2. 使用独立分包

独立分包可以**独立于主包运行**，不需要下载主包即可使用。

### 2.1 配置独立分包

```json
{
  "pages": [
    "pages/index/index"
  ],
  "subpackages": [
    {
      "root": "packageIndependent",
      "pages": [
        "pages/activity/activity"
      ],
      "independent": true
    }
  ]
}
```

### 2.2 独立分包限制

- 不能依赖主包和其他分包的内容
- App.onLaunch 在独立分包进入时不触发
- 适合营销活动、广告落地页等场景

---

## 3. 图片资源优化

### 3.1 图片CDN化

❌ **错误做法**：图片放在小程序包内
```html
<image src="../../images/banner.png" />
```

✅ **正确做法**：图片放在CDN上
```html
<image src="https://cdn.example.com/images/banner.png" />
```

### 3.2 图片压缩

使用工具压缩图片：
- [TinyPNG](https://tinypng.com/) - PNG/JPG压缩
- [ImageOptim](https://imageoptim.com/) - 批量压缩
- [Squoosh](https://squoosh.app/) - Google图片压缩工具

### 3.3 使用WebP格式

```html
<!-- 优先使用WebP，fallback到PNG -->
<image src="https://cdn.example.com/image.webp" />
```

### 3.4 iconfont替代图标

使用字体图标替代小图标：

```css
@font-face {
  font-family: 'iconfont';
  src: url('https://cdn.example.com/iconfont.woff2');
}

.icon {
  font-family: 'iconfont';
}
```

---

## 4. 代码优化

### 4.1 删除无用代码

```bash
# 检查未使用的文件
# 删除未引用的页面、组件、工具函数
```

### 4.2 代码压缩

确保开启代码压缩（微信开发者工具默认开启）：
- ES6转ES5
- 代码压缩
- 样式自动补全

### 4.3 抽取公共代码

```javascript
// utils/common.js - 公共工具函数
export const formatTime = (date) => {
  // ...
}

// 在页面中使用
import { formatTime } from '../../utils/common'
```

### 4.4 按需加载组件

```json
{
  "usingComponents": {
    "custom-component": "/components/custom/custom"
  }
}
```

只在需要的页面引入组件，不要全局引入。

---

## 5. NPM包优化

### 5.1 按需引入

❌ **错误做法**：引入整个库
```javascript
import _ from 'lodash'
```

✅ **正确做法**：按需引入
```javascript
import debounce from 'lodash/debounce'
import throttle from 'lodash/throttle'
```

### 5.2 使用小程序版本的库

- 使用 `lodash-es` 而不是 `lodash`
- 使用 `dayjs` 而不是 `moment`（dayjs更小）
- 选择轻量级替代方案

### 5.3 检查依赖大小

```bash
# 查看npm包大小
npm install -g cost-of-modules
cost-of-modules
```

---

## 6. 分包预下载

在进入某个页面时，预下载其他分包，提升用户体验。

### 6.1 配置预下载

```json
{
  "preloadRule": {
    "pages/index/index": {
      "network": "all",
      "packages": ["packageA"]
    },
    "pages/home/home": {
      "network": "wifi",
      "packages": ["packageB"]
    }
  }
}
```

### 6.2 预下载策略

- `network: "all"` - 在任何网络下预下载
- `network: "wifi"` - 仅在WiFi下预下载

---

## 7. 其他优化技巧

### 7.1 清理微信开发者工具缓存

有时候显示的包大小不准确，清理缓存后重新编译：
- 工具 → 清除缓存 → 清除文件缓存

### 7.2 使用分包异步化

如果主包需要使用分包的内容，可以使用分包异步化：

```json
{
  "lazyCodeLoading": "requiredComponents"
}
```

### 7.3 删除console.log

生产环境删除所有console.log：

```javascript
// 使用条件编译
if (process.env.NODE_ENV === 'development') {
  console.log('debug info')
}
```

### 7.4 优化JSON文件

- 删除不必要的配置项
- 压缩JSON文件（去除空格）

### 7.5 使用云开发

将一些资源文件放到云存储中：
- 配置文件
- 静态资源
- 数据文件

---

## 8. 实战案例：分包配置示例

### 8.1 项目结构

```
miniprogram/
├── pages/                # 主包页面
│   ├── index/           # 首页
│   ├── home/            # 首页
│   └── mine/            # 我的
├── packageA/            # 分包A（商品模块）
│   └── pages/
│       ├── list/        # 商品列表
│       └── detail/      # 商品详情
├── packageB/            # 分包B（订单模块）
│   └── pages/
│       ├── order/       # 订单列表
│       └── detail/      # 订单详情
├── packageC/            # 独立分包（活动页）
│   └── pages/
│       └── activity/    # 活动页
├── components/          # 公共组件
├── utils/              # 工具函数
└── app.json
```

### 8.2 完整配置

```json
{
  "pages": [
    "pages/index/index",
    "pages/home/home",
    "pages/mine/mine"
  ],
  "subpackages": [
    {
      "root": "packageA",
      "name": "goods",
      "pages": [
        "pages/list/list",
        "pages/detail/detail"
      ]
    },
    {
      "root": "packageB",
      "name": "order",
      "pages": [
        "pages/order/order",
        "pages/detail/detail"
      ]
    },
    {
      "root": "packageC",
      "name": "activity",
      "pages": [
        "pages/activity/activity"
      ],
      "independent": true
    }
  ],
  "preloadRule": {
    "pages/index/index": {
      "network": "all",
      "packages": ["goods"]
    }
  },
  "tabBar": {
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页"
      },
      {
        "pagePath": "pages/home/home",
        "text": "分类"
      },
      {
        "pagePath": "pages/mine/mine",
        "text": "我的"
      }
    ]
  }
}
```

---

## 9. 包大小检查工具

### 9.1 微信开发者工具

- 点击「详情」→「基本信息」查看包大小
- 点击「代码依赖分析」查看各文件大小占比

### 9.2 命令行工具

```bash
# 分析包大小
npx miniprogram-ci analyze --project-path ./dist
```

---

## 10. 优化效果评估

### 优化前
```
主包: 2.5MB ❌ 超限
总包: 2.5MB
```

### 优化后
```
主包: 1.2MB ✅ 合格
├─ 分包A: 800KB
├─ 分包B: 600KB
└─ 独立分包C: 400KB
总包: 3.0MB ✅ 合格
```

---

## 11. 快速检查清单

- [ ] 所有图片已上传CDN
- [ ] 已配置分包结构
- [ ] 删除未使用的页面和组件
- [ ] NPM包按需引入
- [ ] 删除console.log
- [ ] 使用iconfont替代小图标
- [ ] 配置分包预下载
- [ ] 清理开发工具缓存
- [ ] 代码压缩已开启

---

## 12. 参考资料

- [微信小程序分包加载官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/subpackages.html)
- [微信小程序独立分包](https://developers.weixin.qq.com/miniprogram/dev/framework/subpackages/independent.html)
- [微信小程序分包预下载](https://developers.weixin.qq.com/miniprogram/dev/framework/subpackages/preload.html)

---

## 总结

解决主包超包的核心策略：
1. **分包拆分**：将非核心功能拆分到分包
2. **资源外置**：图片等静态资源上传CDN
3. **代码优化**：删除无用代码，按需引入NPM包
4. **独立分包**：营销活动等独立页面使用独立分包

通过以上方法，通常可以将主包大小控制在1MB以内，为后续功能扩展预留充足空间。
