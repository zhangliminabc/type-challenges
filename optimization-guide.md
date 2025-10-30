# 微信小程序包体积优化实战指南

## 一、快速诊断

### 1. 查看当前包大小

在微信开发者工具中：
1. 点击右上角「详情」
2. 查看「代码包信息」
3. 点击「代码依赖分析」查看详细占用

### 2. 找出大文件

```bash
# 在项目根目录执行
find . -type f -size +100k -not -path "*/node_modules/*" -exec ls -lh {} \; | awk '{print $9": "$5}'
```

---

## 二、立即见效的优化（30分钟内）

### ✅ 优化1：图片CDN化（节省500KB-2MB）

**问题**：图片放在本地占用大量空间

**解决**：
```javascript
// 错误 ❌
<image src="../../images/banner.jpg" />

// 正确 ✅  
<image src="https://cdn.example.com/banner.jpg" />
```

**步骤**：
1. 将所有图片上传到CDN（腾讯云COS、阿里云OSS等）
2. 替换代码中的图片路径
3. 删除本地图片文件

---

### ✅ 优化2：删除无用文件（节省100KB-500KB）

**检查清单**：
- [ ] 删除测试页面
- [ ] 删除未使用的组件
- [ ] 删除注释代码
- [ ] 删除备份文件（.bak, .old等）
- [ ] 删除node_modules（构建时会自动处理）

---

### ✅ 优化3：NPM包瘦身（节省200KB-1MB）

```javascript
// 错误 ❌ - 引入整个lodash
import _ from 'lodash'
_.debounce(func, 1000)

// 正确 ✅ - 按需引入
import debounce from 'lodash/debounce'
debounce(func, 1000)
```

**常用替换**：
```javascript
// moment.js (200KB+) → dayjs (7KB)
import dayjs from 'dayjs'

// axios → 小程序原生请求
wx.request()

// vue/react → 小程序原生
```

---

## 三、分包配置（1-2小时）

### 步骤1：规划分包结构

```
主包（<1.5MB）
├── 首页
├── TabBar页面
├── 登录页
└── 公共组件、工具

分包A - 商品模块（<2MB）
├── 商品列表
├── 商品详情
└── 商品搜索

分包B - 订单模块（<2MB）
├── 订单列表
├── 订单详情
└── 退款售后

独立分包 - 营销活动（<2MB）
├── 活动页
└── 分享页
```

### 步骤2：修改app.json

参考 `app.json.example` 文件进行配置

### 步骤3：调整目录结构

```bash
# 创建分包目录
mkdir -p packageA/pages packageB/pages packageIndependent/pages

# 移动页面到分包
mv pages/goods packageA/pages/
mv pages/order packageB/pages/
```

### 步骤4：修改页面路径

```javascript
// 跳转到分包页面
wx.navigateTo({
  url: '/packageA/pages/goods/list'  // 注意路径变化
})
```

---

## 四、代码优化（持续优化）

### 1. 使用分包异步化

```json
{
  "lazyCodeLoading": "requiredComponents"
}
```

### 2. 组件按需加载

```json
// 页面.json - 只在需要的页面引入
{
  "usingComponents": {
    "custom-component": "/components/custom/custom"
  }
}
```

### 3. 移除console.log

```javascript
// utils/logger.js
export const log = (...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args)
  }
}

// 使用
import { log } from './utils/logger'
log('debug info')
```

### 4. 压缩JSON配置

```javascript
// 移除不必要的配置项
// 保持JSON紧凑（微信工具会自动压缩）
```

---

## 五、进阶优化技巧

### 1. 使用字体图标

```css
/* app.wxss */
@font-face {
  font-family: 'iconfont';
  src: url('https://cdn.example.com/iconfont.woff2') format('woff2');
}

.icon {
  font-family: 'iconfont';
  font-size: 16px;
}
```

```html
<text class="icon">\ue600</text>
```

### 2. WebP图片格式

```html
<image 
  src="https://cdn.example.com/image.webp" 
  mode="aspectFill"
/>
```

### 3. 云开发存储

```javascript
// 将配置文件放云端
const db = wx.cloud.database()
const config = await db.collection('config').doc('app_config').get()
```

---

## 六、自动化优化脚本

### 检查大文件脚本

创建 `scripts/check-size.js`：

```javascript
const fs = require('fs')
const path = require('path')

function checkFileSize(dir, threshold = 100 * 1024) {
  const files = fs.readdirSync(dir)
  
  files.forEach(file => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    
    if (stat.isDirectory()) {
      if (!file.includes('node_modules')) {
        checkFileSize(filePath, threshold)
      }
    } else if (stat.size > threshold) {
      console.log(`⚠️  ${filePath}: ${(stat.size / 1024).toFixed(2)}KB`)
    }
  })
}

checkFileSize('./miniprogram')
```

运行：
```bash
node scripts/check-size.js
```

---

## 七、优化效果对比

### 案例1：电商小程序

**优化前**：
```
主包: 2.8MB ❌
无法上传
```

**优化后**：
```
主包: 1.1MB ✅
├─ packageGoods: 1.5MB
├─ packageOrder: 900KB
├─ packageUser: 600KB
└─ packageActivity (独立): 400KB
总计: 4.5MB ✅
```

**优化措施**：
- 图片CDN化：-1.2MB
- 分包拆分：-0.5MB
- NPM瘦身：-200KB

---

### 案例2：内容小程序

**优化前**：
```
主包: 2.3MB ❌
```

**优化后**：
```
主包: 800KB ✅
├─ packageContent: 1.8MB
└─ packageUser: 500KB
总计: 3.1MB ✅
```

**优化措施**：
- 删除无用组件库：-800KB
- 图片优化：-600KB
- 代码分包：-100KB

---

## 八、常见问题

### Q1: 分包后如何共享代码？

**A**: 公共代码放主包

```javascript
// 主包 utils/common.js
export const formatTime = () => {}

// 分包中使用
import { formatTime } from '../../utils/common'
```

---

### Q2: 分包之间如何通信？

**A**: 使用全局变量或事件总线

```javascript
// app.js
App({
  globalData: {
    userInfo: null
  }
})

// 任意页面获取
const app = getApp()
console.log(app.globalData.userInfo)
```

---

### Q3: 独立分包如何使用插件？

**A**: 独立分包需要单独配置插件

```json
{
  "subpackages": [{
    "root": "packageIndependent",
    "pages": ["pages/activity/activity"],
    "independent": true,
    "plugins": {
      "myPlugin": {
        "version": "1.0.0",
        "provider": "wxidxxxxxxxx"
      }
    }
  }]
}
```

---

### Q4: 如何查看真实包大小？

**A**: 上传体验版查看

1. 点击「上传」
2. 登录小程序后台
3. 查看「开发管理」→「开发版本」
4. 查看真实包大小

---

## 九、优化检查清单

### 🔥 紧急优化（必做）
- [ ] 所有图片转CDN
- [ ] 删除无用文件
- [ ] 配置分包

### 📦 包体积优化
- [ ] NPM包按需引入
- [ ] 删除未使用的组件
- [ ] 图片压缩（如必须本地）
- [ ] 使用iconfont

### ⚡ 性能优化
- [ ] 配置分包预下载
- [ ] 启用懒加载
- [ ] 删除console.log
- [ ] 代码压缩

### 🔧 工程优化
- [ ] 添加包大小检查脚本
- [ ] 配置CI检查
- [ ] 文档更新

---

## 十、持续监控

### 1. Git Hook检查

创建 `.git/hooks/pre-commit`：

```bash
#!/bin/bash

# 检查是否有大文件
large_files=$(find miniprogram -type f -size +200k -not -path "*/node_modules/*")

if [ -n "$large_files" ]; then
    echo "⚠️  发现大文件："
    echo "$large_files"
    echo "建议将图片等资源上传CDN"
fi
```

### 2. CI/CD集成

```yaml
# .github/workflows/check-size.yml
name: Check Package Size

on: [push, pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Check large files
        run: |
          find miniprogram -type f -size +200k -not -path "*/node_modules/*" | while read file; do
            echo "⚠️  Large file: $file"
          done
```

---

## 总结

**优先级排序**：
1. 🔥 图片CDN化（效果最明显）
2. 🔥 配置分包（必须）
3. ⚡ NPM包优化（见效快）
4. 📦 删除无用代码（持续优化）
5. 🔧 使用图标字体（可选）

**时间规划**：
- 0-30分钟：图片CDN化、删除无用文件
- 30-90分钟：配置分包结构
- 90-120分钟：NPM包优化、代码清理
- 持续优化：监控、自动化

通过以上优化，**95%的小程序都能将主包控制在1.5MB以内**。
