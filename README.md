# 微信小程序主包超包解决方案

本仓库提供了微信小程序主包体积超限的完整解决方案和优化指南。

## 📚 文档列表

### 1. [完整解决方案](./wechat-miniprogram-package-size-solution.md)
详细的微信小程序包体积优化方案，包含12个章节的系统性解决方案：
- 问题背景与限制
- 分包加载配置
- 独立分包使用
- 图片资源优化
- 代码优化技巧
- NPM包优化
- 分包预下载
- 实战案例

### 2. [优化实战指南](./optimization-guide.md)
按优先级排序的实战优化步骤，适合快速上手：
- 快速诊断方法
- 立即见效的优化（30分钟）
- 分包配置详解（1-2小时）
- 进阶优化技巧
- 自动化检查脚本
- 常见问题解答

### 3. [分包配置示例](./app.json.example)
完整的 `app.json` 配置示例，包含：
- 普通分包配置
- 独立分包配置
- 分包预下载配置
- TabBar 配置

### 4. [包体积检查工具](./check-package-size.js)
自动化检查脚本，帮你快速发现问题：
```bash
node check-package-size.js
```

## 🚀 快速开始

### 方案一：立即优化（30分钟见效）

1. **图片CDN化** - 最有效的优化方式
   ```javascript
   // 将所有本地图片上传到CDN
   // 修改图片路径
   <image src="https://cdn.example.com/image.jpg" />
   ```

2. **删除无用文件**
   ```bash
   # 删除测试页面、备份文件、未使用的组件
   ```

3. **NPM包瘦身**
   ```javascript
   // 按需引入
   import debounce from 'lodash/debounce'  // ✅
   import _ from 'lodash'                  // ❌
   ```

### 方案二：分包配置（1-2小时）

1. 复制 `app.json.example` 的分包配置
2. 按功能模块划分页面
3. 调整目录结构
4. 修改页面跳转路径

详见：[优化实战指南](./optimization-guide.md)

## 📊 检查包体积

运行自动化检查工具：

```bash
node check-package-size.js
```

输出示例：
```
📦 微信小程序包体积分析报告

📊 总体统计:
  总文件数: 156
  总大小: 2.35MB
  ⚠️  警告: 当前大小已超过主包限制(2MB)

🖼️  图片资源:
  图片数量: 45
  图片总大小: 1.2MB
  占比: 51.06%
  🔥 建议: 图片占用过大，强烈建议使用CDN
```

## 💡 核心解决方案

| 优化方案 | 节省空间 | 难度 | 优先级 |
|---------|---------|------|--------|
| 图片CDN化 | 500KB-2MB | ⭐ | 🔥🔥🔥 |
| 配置分包 | 解决超限 | ⭐⭐ | 🔥🔥🔥 |
| NPM包优化 | 200KB-1MB | ⭐⭐ | 🔥🔥 |
| 删除无用代码 | 100KB-500KB | ⭐ | 🔥🔥 |
| 使用iconfont | 50KB-200KB | ⭐⭐ | 🔥 |

## 📖 包体积限制

- **主包大小**: 2MB
- **总包大小**: 20MB（使用分包后）
- **单个分包**: 2MB

## 🎯 优化目标

- ✅ 主包控制在 1.5MB 以内
- ✅ 为后续功能预留空间
- ✅ 提升加载速度

## 📋 优化检查清单

- [ ] 所有图片已上传CDN
- [ ] 已配置分包结构  
- [ ] 删除未使用的页面和组件
- [ ] NPM包按需引入
- [ ] 删除console.log
- [ ] 使用iconfont替代小图标
- [ ] 配置分包预下载
- [ ] 清理开发工具缓存
- [ ] 代码压缩已开启

## 🔗 参考资料

- [微信小程序分包加载](https://developers.weixin.qq.com/miniprogram/dev/framework/subpackages.html)
- [微信小程序独立分包](https://developers.weixin.qq.com/miniprogram/dev/framework/subpackages/independent.html)
- [微信小程序分包预下载](https://developers.weixin.qq.com/miniprogram/dev/framework/subpackages/preload.html)

## 📞 问题反馈

如有问题或建议，欢迎提Issue。

---

**立即开始优化，让你的小程序包体积回到健康状态！** 🚀