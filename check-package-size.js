#!/usr/bin/env node

/**
 * 微信小程序包体积检查工具
 * 用于检测项目中的大文件和优化建议
 */

const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  targetDir: './miniprogram', // 小程序源码目录
  warningSize: 100 * 1024,    // 100KB 警告阈值
  errorSize: 500 * 1024,      // 500KB 错误阈值
  excludeDirs: ['node_modules', '.git', 'dist', 'build'],
  imageExts: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
  codeExts: ['.js', '.json', '.wxml', '.wxss', '.ts']
};

// 统计数据
const stats = {
  totalSize: 0,
  fileCount: 0,
  images: { count: 0, size: 0, files: [] },
  code: { count: 0, size: 0 },
  largeFiles: [],
  warnings: []
};

/**
 * 格式化文件大小
 */
function formatSize(bytes) {
  if (bytes < 1024) return bytes + 'B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + 'KB';
  return (bytes / (1024 * 1024)).toFixed(2) + 'MB';
}

/**
 * 获取文件扩展名
 */
function getExt(filePath) {
  return path.extname(filePath).toLowerCase();
}

/**
 * 检查是否应该排除该目录
 */
function shouldExclude(filePath) {
  return CONFIG.excludeDirs.some(dir => filePath.includes(dir));
}

/**
 * 递归扫描目录
 */
function scanDirectory(dir) {
  if (!fs.existsSync(dir)) {
    console.error(`❌ 目录不存在: ${dir}`);
    console.log('💡 提示: 请修改 targetDir 配置为你的小程序源码目录');
    return;
  }

  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    
    if (shouldExclude(filePath)) return;

    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      scanDirectory(filePath);
    } else {
      analyzeFile(filePath, stat.size);
    }
  });
}

/**
 * 分析单个文件
 */
function analyzeFile(filePath, size) {
  stats.totalSize += size;
  stats.fileCount++;

  const ext = getExt(filePath);
  const relativePath = path.relative(process.cwd(), filePath);

  // 统计图片
  if (CONFIG.imageExts.includes(ext)) {
    stats.images.count++;
    stats.images.size += size;
    stats.images.files.push({ path: relativePath, size });

    // 图片过大警告
    if (size > CONFIG.warningSize) {
      stats.warnings.push({
        type: 'image',
        path: relativePath,
        size,
        message: '建议上传到CDN或压缩'
      });
    }
  }

  // 统计代码
  if (CONFIG.codeExts.includes(ext)) {
    stats.code.count++;
    stats.code.size += size;
  }

  // 大文件检测
  if (size > CONFIG.errorSize) {
    stats.largeFiles.push({ path: relativePath, size, ext });
  }
}

/**
 * 生成报告
 */
function generateReport() {
  console.log('\n📦 微信小程序包体积分析报告\n');
  console.log('='.repeat(60));

  // 总体统计
  console.log('\n📊 总体统计:');
  console.log(`  总文件数: ${stats.fileCount}`);
  console.log(`  总大小: ${formatSize(stats.totalSize)}`);
  
  if (stats.totalSize > 2 * 1024 * 1024) {
    console.log(`  ⚠️  警告: 当前大小已超过主包限制(2MB)`);
  } else if (stats.totalSize > 1.5 * 1024 * 1024) {
    console.log(`  ⚠️  提示: 接近主包限制，建议优化`);
  } else {
    console.log(`  ✅ 良好: 距离主包限制还有 ${formatSize(2 * 1024 * 1024 - stats.totalSize)}`);
  }

  // 图片统计
  console.log('\n🖼️  图片资源:');
  console.log(`  图片数量: ${stats.images.count}`);
  console.log(`  图片总大小: ${formatSize(stats.images.size)}`);
  console.log(`  占比: ${((stats.images.size / stats.totalSize) * 100).toFixed(2)}%`);

  if (stats.images.size > 500 * 1024) {
    console.log(`  🔥 建议: 图片占用过大，强烈建议使用CDN`);
  }

  // 代码统计
  console.log('\n💻 代码文件:');
  console.log(`  代码文件数: ${stats.code.count}`);
  console.log(`  代码总大小: ${formatSize(stats.code.size)}`);
  console.log(`  占比: ${((stats.code.size / stats.totalSize) * 100).toFixed(2)}%`);

  // 大文件列表
  if (stats.largeFiles.length > 0) {
    console.log('\n⚠️  大文件列表 (>500KB):');
    stats.largeFiles
      .sort((a, b) => b.size - a.size)
      .slice(0, 10)
      .forEach(file => {
        console.log(`  ${formatSize(file.size).padEnd(10)} ${file.path}`);
      });
  }

  // 前10大图片
  if (stats.images.files.length > 0) {
    console.log('\n🖼️  最大的10张图片:');
    stats.images.files
      .sort((a, b) => b.size - a.size)
      .slice(0, 10)
      .forEach(file => {
        const sizeStr = formatSize(file.size).padEnd(10);
        const icon = file.size > CONFIG.errorSize ? '🔴' : 
                     file.size > CONFIG.warningSize ? '🟡' : '🟢';
        console.log(`  ${icon} ${sizeStr} ${file.path}`);
      });
  }

  // 优化建议
  console.log('\n💡 优化建议:\n');

  let suggestionCount = 1;

  if (stats.images.size > 200 * 1024) {
    console.log(`${suggestionCount++}. 🔥 图片CDN化 (可节省 ~${formatSize(stats.images.size)})`);
    console.log('   - 将所有图片上传到CDN（腾讯云COS、阿里云OSS等）');
    console.log('   - 修改代码中的图片路径为CDN地址');
    console.log('   - 删除本地图片文件\n');
  }

  if (stats.totalSize > 1.5 * 1024 * 1024) {
    console.log(`${suggestionCount++}. 📦 配置分包加载`);
    console.log('   - 将低频页面拆分到分包');
    console.log('   - 主包只保留核心页面和公共资源');
    console.log('   - 参考: app.json.example\n');
  }

  if (stats.images.files.some(f => f.size > CONFIG.warningSize)) {
    console.log(`${suggestionCount++}. 🗜️  图片压缩`);
    console.log('   - 使用 TinyPNG 压缩图片');
    console.log('   - 转换为 WebP 格式');
    console.log('   - 使用 iconfont 替代小图标\n');
  }

  console.log(`${suggestionCount++}. 🧹 删除无用文件`);
  console.log('   - 检查并删除未使用的页面、组件');
  console.log('   - 删除测试代码和注释');
  console.log('   - 清理备份文件\n');

  console.log(`${suggestionCount++}. 📚 NPM包优化`);
  console.log('   - 按需引入第三方库');
  console.log('   - 使用轻量级替代方案');
  console.log('   - 示例: lodash → lodash/debounce\n');

  // 结尾
  console.log('='.repeat(60));
  console.log('\n📖 详细优化方案请查看: optimization-guide.md');
  console.log('📄 分包配置示例请查看: app.json.example\n');
}

/**
 * 主函数
 */
function main() {
  console.log('🔍 正在扫描项目...\n');

  const startTime = Date.now();
  scanDirectory(CONFIG.targetDir);
  const duration = Date.now() - startTime;

  generateReport();

  console.log(`⏱️  扫描完成，耗时: ${duration}ms\n`);
}

// 运行
try {
  main();
} catch (error) {
  console.error('❌ 运行出错:', error.message);
  process.exit(1);
}
