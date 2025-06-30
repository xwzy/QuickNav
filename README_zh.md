# 个人生产力仪表板

一个全面的现代化个人生产力仪表板，使用 Go 和 React 构建。这个增强版本将原始的 QuickNav 书签管理器转变为功能齐全的生产力中心，具有小部件、任务管理、笔记记录和系统监控功能。

[English README](README.md)

## 🌟 功能特性

### 📊 **仪表板概览**
- **拖拽小部件**: 可自定义的小部件布局，支持调整大小和重新定位
- **实时系统监控**: CPU、内存和磁盘使用情况跟踪
- **天气信息**: 当前天气状况和预报
- **数字时钟**: 可自定义的时间显示，支持多种格式
- **快速访问面板**: 快速访问常用书签

### 🔖 **增强书签管理**
- **智能组织**: 基于分类的组织，支持自定义颜色和图标
- **高级搜索**: 跨名称、URL 和标签搜索
- **使用分析**: 访问次数跟踪和使用统计
- **健康监控**: 自动网站可用性检查
- **标签系统**: 灵活的标签用于更好的组织
- **导入/导出**: 备份和恢复您的书签

### 📝 **笔记系统**
- **富文本笔记**: 功能齐全的笔记创建和编辑
- **基于标签的组织**: 使用自定义标签对笔记进行分类
- **快速搜索**: 即时搜索所有笔记内容
- **最近活动**: 跟踪最近修改的笔记
- **导出选项**: 以各种格式导出笔记

### ✅ **任务管理**
- **优先级系统**: 高、中、低优先级任务
- **截止日期跟踪**: 设置和监控任务截止日期
- **进度分析**: 可视化任务完成统计
- **逾期提醒**: 突出显示逾期任务
- **过滤选项**: 查看所有、待完成或已完成的任务
- **快速操作**: 快速任务创建和状态更新

### ⚙️ **高级设置**
- **主题自定义**: 支持亮色和暗色模式
- **布局选项**: 网格和列表视图布局
- **数据管理**: 导出/导入功能
- **安全工具**: 内置密码生成器
- **系统信息**: 实时系统状态监控

### 🛠️ **开发者功能**
- **REST API**: 所有操作的综合 API
- **实时更新**: 实时数据同步
- **性能监控**: 内置系统资源跟踪
- **响应式设计**: 移动设备优先的响应式界面
- **现代化架构**: 清晰的关注点分离

## 🚀 安装

### 快速开始

1. **下载最新版本** 从 [Releases](https://github.com/xwzy/QuickNav/releases) 页面
2. **解压** 下载的文件到您的首选位置
3. **运行可执行文件**:
   - **Windows**: 双击 `ProductivityDashboard.exe`
   - **macOS/Linux**: 在终端中运行 `./ProductivityDashboard`
4. **打开浏览器** 并导航到 `http://localhost:80`

### 从源码构建

```bash
# 克隆仓库
git clone https://github.com/xwzy/QuickNav.git
cd QuickNav

# 安装 Go 依赖
go mod download

# 构建 React 前端
cd quick-nav-react
npm install
npm run build

# 构建 Go 后端
cd ..
go build -o ProductivityDashboard

# 运行应用程序
./ProductivityDashboard
```

## 🖥️ 使用方法

### 首次启动
1. 应用程序会自动创建 `dashboard.db` 文件
2. 填充示例数据用于演示
3. 访问仪表板地址 `http://localhost:80`

### 仪表板导航
- **仪表板**: 基于小部件的主要概览
- **书签**: 管理和组织您的书签
- **笔记**: 创建和管理个人笔记
- **任务**: 跟踪您的待办事项和项目
- **设置**: 自定义外观和行为

### 小部件管理
- **拖拽**: 通过拖拽重新排列小部件
- **调整大小**: 拖拽小部件角落来调整大小
- **自动保存**: 所有布局更改都会自动保存

### 键盘快捷键
- `Ctrl + N`: 创建新笔记
- `Ctrl + T`: 创建新任务
- `Ctrl + B`: 创建新书签
- `Ctrl + /`: 聚焦搜索

## 🏗️ 架构

### 后端 (Go)
- **Web 服务器**: 使用 Gin 框架进行 HTTP 路由
- **数据库**: SQLite 用于数据持久化
- **API 设计**: RESTful API 与 JSON 响应
- **系统监控**: 实时资源监控
- **安全性**: 内置密码生成和验证

### 前端 (React)
- **UI 框架**: Material-UI 与自定义主题
- **状态管理**: React hooks 和 context
- **布局引擎**: React Grid Layout 用于小部件
- **响应式设计**: 移动设备优先方法
- **实时更新**: 自动数据同步

## 🔌 API 端点

### 书签
- `GET /api/sites` - 获取所有书签
- `POST /api/sites` - 创建新书签
- `PUT /api/sites` - 更新现有书签
- `DELETE /api/sites?id={id}` - 删除书签

### 分类
- `GET /api/categories` - 获取所有分类
- `POST /api/categories` - 创建新分类
- `PUT /api/categories` - 更新分类
- `DELETE /api/categories?id={id}` - 删除分类
- `PUT /api/categories/order` - 更新分类顺序

### 笔记
- `GET /api/notes` - 获取所有笔记
- `POST /api/notes` - 创建新笔记
- `PUT /api/notes` - 更新现有笔记
- `DELETE /api/notes?id={id}` - 删除笔记

### 任务
- `GET /api/tasks` - 获取所有任务
- `POST /api/tasks` - 创建新任务
- `PUT /api/tasks` - 更新现有任务
- `DELETE /api/tasks?id={id}` - 删除任务

### 系统和工具
- `GET /api/system` - 系统资源信息
- `GET /api/weather` - 天气数据
- `GET /api/settings` - 应用程序设置
- `PUT /api/settings` - 更新设置
- `GET /api/password?length={n}` - 生成安全密码

## 🔒 安全性

- **本地存储**: 所有数据本地存储在 SQLite 中
- **无外部依赖**: 完全自包含的应用程序
- **密码生成**: 密码学安全的密码生成
- **健康监控**: 网站可用性检查
- **数据导出**: 安全的备份和恢复功能

## 🌐 浏览器支持

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 贡献

我们欢迎贡献！请查看我们的 [贡献指南](CONTRIBUTING.md) 了解详情。

### 开发环境设置
```bash
# 后端开发
go run .

# 前端开发
cd quick-nav-react
npm start
```

### 生产构建
```bash
# 构建前端
cd quick-nav-react
npm run build

# 构建带有嵌入前端的后端
cd ..
go build -o ProductivityDashboard
```

## 📝 许可证

此项目根据 MIT 许可证授权 - 请参阅 [LICENSE](LICENSE) 文件了解详情。

## 🚀 路线图

### 版本 2.1.0 (计划中)
- [ ] 真实天气 API 集成
- [ ] 日历集成
- [ ] 移动应用伴侣
- [ ] 云同步
- [ ] 浏览器扩展
- [ ] 高级分析

### 版本 2.2.0 (未来)
- [ ] 协作功能
- [ ] 插件系统
- [ ] 高级主题
- [ ] 备份加密
- [ ] 性能优化

## 🙏 致谢

- **Go 社区**: 提供优秀的生态系统和库
- **React 社区**: 提供强大的前端框架
- **Material-UI**: 提供美观的组件库
- **SQLite**: 提供可靠的嵌入式数据库
- **贡献者**: 所有为这个项目做出贡献的人

## 📞 支持

- **问题**: [GitHub Issues](https://github.com/xwzy/QuickNav/issues)
- **讨论**: [GitHub Discussions](https://github.com/xwzy/QuickNav/discussions)
- **文档**: [Wiki](https://github.com/xwzy/QuickNav/wiki)

---

**为生产力爱好者用 ❤️ 制作**
