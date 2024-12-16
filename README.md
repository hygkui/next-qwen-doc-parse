# 基于大模型的中文文本校正

基于大模型 Qwen 72B Instruct 的中文文本校对系统，用于文档解析和分析。

## 功能特性

- 用户认证（支持默认用户）
- 文档上传和管理
- 使用 Qwen API 进行文档解析，且支持手动校对
- 文档修正历史记录
- 知识库管理

## 环境要求

- Node.js 18+ 和 npm
- PostgreSQL 数据库
- Qwen API 密钥

## 环境变量

在根目录创建 `.env.local` 文件，包含以下变量：

```env
DATABASE_URL=你的postgres连接字符串
JWT_SECRET=你的jwt密钥
QWEN_API_KEY=你的qwen_api密钥
```

## 安装步骤

1. 安装依赖：
```bash
npm install
```

2. 运行数据库迁移：
```bash
npm run db:migrate
```

3. 启动开发服务器：
```bash
npm run dev
```

## 项目结构

- `/app` - Next.js 14 应用目录，包含路由处理器和页面
- `/components` - 可复用的 React 组件
- `/utils` - 实用函数和辅助工具
- `/db` - 数据库架构和迁移文件
- `/lib` - 共享库和配置

## API 路由

### 文档相关
- `POST /api/documents` - 上传并解析新文档
- `GET /api/documents` - 列出所有文档
- `GET /api/documents/[id]` - 获取文档详情
- `PATCH /api/documents/[id]` - 更新文档或添加修正

### 认证相关
- `POST /api/auth/signup` - 创建新用户账户
- `POST /api/auth/login` - 登录现有账户
- `POST /api/auth/logout` - 登出当前用户
- `GET /api/auth/session` - 获取当前会话信息

## 文档处理流程

1. 文档上传时：
   - 将内容发送至 Qwen API 进行解析
   - 存储原始内容和解析后的内容
   - 跟踪文档状态（待处理 → 处理中 → 已处理）

2. 文档修正：
   - 用户可以对解析后的内容进行修正
   - 所有修正都会存入历史记录
   - 保留原始解析内容

3. 文档下载：
   - 生成包含修正历史记录的文档
   - 可以下载原始文档和修正后的文档


