/**
 * SQLite3 安装诊断脚本
 * 功能：检查环境并提供解决建议
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('========================================');
console.log('  SQLite3 安装诊断工具');
console.log('========================================');
console.log();

const issues = [];
const suggestions = [];

// 1. 检查 Node.js 版本
console.log('📦 Node.js 环境');
try {
  const nodeVersion = process.version;
  console.log(`  版本: ${nodeVersion}`);
  
  const major = parseInt(nodeVersion.slice(1).split('.')[0]);
  if (major < 14) {
    issues.push('Node.js 版本过低（需要 >= 14.x）');
    suggestions.push('升级 Node.js 到最新 LTS 版本');
  } else {
    console.log('  ✅ 版本符合要求');
  }
} catch (err) {
  issues.push('无法检测 Node.js 版本');
}
console.log();

// 2. 检查 npm 版本
console.log('📦 npm 环境');
try {
  const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  console.log(`  版本: v${npmVersion}`);
  console.log('  ✅ npm 可用');
} catch (err) {
  issues.push('npm 不可用');
  suggestions.push('重新安装 Node.js');
}
console.log();

// 3. 检查操作系统
console.log('💻 操作系统');
console.log(`  平台: ${os.platform()}`);
console.log(`  架构: ${os.arch()}`);
console.log(`  版本: ${os.release()}`);
console.log();

// 4. 检查 Python（Windows 构建需要）
if (os.platform() === 'win32') {
  console.log('🐍 Python 环境（Windows 构建需要）');
  try {
    const pythonVersion = execSync('python --version', { encoding: 'utf8' }).trim();
    console.log(`  ${pythonVersion}`);
    console.log('  ✅ Python 已安装');
  } catch (err) {
    try {
      const python3Version = execSync('python3 --version', { encoding: 'utf8' }).trim();
      console.log(`  ${python3Version}`);
      console.log('  ✅ Python3 已安装');
    } catch (err2) {
      issues.push('未安装 Python');
      suggestions.push('安装 windows-build-tools: npm install --global windows-build-tools');
    }
  }
  console.log();
}

// 5. 检查 node-gyp
console.log('🔧 node-gyp 构建工具');
try {
  const gypVersion = execSync('node-gyp --version', { encoding: 'utf8' }).trim();
  console.log(`  版本: v${gypVersion}`);
  console.log('  ✅ node-gyp 已安装');
} catch (err) {
  issues.push('node-gyp 未安装');
  suggestions.push('安装 node-gyp: npm install -g node-gyp');
}
console.log();

// 6. 检查 Visual Studio Build Tools（Windows）
if (os.platform() === 'win32') {
  console.log('🛠️  Visual Studio Build Tools');
  const vsWherePath = 'C:\\Program Files (x86)\\Microsoft Visual Studio\\Installer\\vswhere.exe';
  
  if (fs.existsSync(vsWherePath)) {
    try {
      const vsInfo = execSync(`"${vsWherePath}" -latest -property installationPath`, { encoding: 'utf8' }).trim();
      if (vsInfo) {
        console.log('  ✅ Visual Studio 已安装');
        console.log(`  路径: ${vsInfo}`);
      }
    } catch (err) {
      issues.push('Visual Studio Build Tools 未找到');
      suggestions.push('安装 windows-build-tools 或 Visual Studio Build Tools');
    }
  } else {
    issues.push('Visual Studio Build Tools 未安装');
    suggestions.push('安装 windows-build-tools: npm install --global windows-build-tools');
  }
  console.log();
}

// 7. 检查 sqlite3 是否已安装
console.log('📦 sqlite3 模块');
try {
  const sqlite3Path = path.join(process.cwd(), 'node_modules', 'sqlite3');
  if (fs.existsSync(sqlite3Path)) {
    console.log('  ✅ sqlite3 已在 node_modules 中');
    
    // 检查是否有编译的二进制文件
    const bindingPath = path.join(sqlite3Path, 'lib', 'binding');
    if (fs.existsSync(bindingPath)) {
      const bindings = fs.readdirSync(bindingPath);
      if (bindings.length > 0) {
        console.log('  ✅ 编译文件存在');
        console.log(`  平台: ${bindings.join(', ')}`);
      } else {
        issues.push('sqlite3 已安装但缺少编译文件');
        suggestions.push('重新编译: npm rebuild sqlite3');
      }
    } else {
      issues.push('sqlite3 绑定目录不存在');
      suggestions.push('重新安装: npm install sqlite3');
    }
  } else {
    console.log('  ℹ️  sqlite3 未安装');
  }
} catch (err) {
  console.log(`  ⚠️  检查失败: ${err.message}`);
}
console.log();

// 8. 检查 better-sqlite3 是否已安装
console.log('📦 better-sqlite3 模块');
try {
  const betterSqlitePath = path.join(process.cwd(), 'node_modules', 'better-sqlite3');
  if (fs.existsSync(betterSqlitePath)) {
    console.log('  ✅ better-sqlite3 已安装');
  } else {
    console.log('  ℹ️  better-sqlite3 未安装（推荐替代方案）');
    suggestions.push('使用 better-sqlite3: node scripts/fix-sqlite3.js');
  }
} catch (err) {
  console.log(`  ⚠️  检查失败: ${err.message}`);
}
console.log();

// 9. 测试 sqlite3（如果已安装）
console.log('🧪 功能测试');
try {
  require('sqlite3');
  console.log('  ✅ sqlite3 可以正常加载');
} catch (err) {
  if (err.code === 'MODULE_NOT_FOUND') {
    console.log('  ℹ️  sqlite3 未安装');
  } else {
    console.log('  ❌ sqlite3 加载失败');
    console.log(`  错误: ${err.message}`);
    issues.push('sqlite3 无法加载');
    suggestions.push('重新安装或切换到 better-sqlite3');
  }
}

try {
  require('better-sqlite3');
  console.log('  ✅ better-sqlite3 可以正常加载');
} catch (err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    console.log('  ❌ better-sqlite3 加载失败');
    console.log(`  错误: ${err.message}`);
  }
}
console.log();

// 10. 输出诊断结果
console.log('========================================');
console.log('  诊断结果');
console.log('========================================');
console.log();

if (issues.length === 0) {
  console.log('✅ 环境检查通过，没有发现问题');
} else {
  console.log('⚠️  发现以下问题:');
  issues.forEach((issue, index) => {
    console.log(`  ${index + 1}. ${issue}`);
  });
}
console.log();

if (suggestions.length > 0) {
  console.log('💡 建议的解决方案:');
  suggestions.forEach((suggestion, index) => {
    console.log(`  ${index + 1}. ${suggestion}`);
  });
  console.log();
}

// 11. 推荐操作
console.log('========================================');
console.log('  推荐操作');
console.log('========================================');
console.log();

console.log('🎯 方案1（推荐）: 切换到 better-sqlite3');
console.log('   node scripts/fix-sqlite3.js');
console.log();

if (os.platform() === 'win32') {
  console.log('🎯 方案2: 安装 Windows 构建工具');
  console.log('   npm install --global windows-build-tools');
  console.log('   然后: npm install sqlite3');
  console.log();
}

console.log('🎯 方案3: 使用预编译版本');
console.log('   npm install sqlite3 --build-from-source=false');
console.log();

console.log('📖 详细文档:');
console.log('   docs/SQLITE3-INSTALL.md');
console.log();
