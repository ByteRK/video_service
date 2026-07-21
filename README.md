# 视频管理服务

一个简洁的本地视频管理后台。管理员可分片上传、断点续传和管理视频，访客通过公开地址直接播放。系统不转码；浏览器不支持源文件编码时，播放页会显示兼容性提示。

## 技术结构

```text
apps/
  api/                 NestJS API
    prisma/            数据模型、初始化与超级管理员种子
    src/auth/          登录与权限
    src/users/         管理员账号
    src/uploads/       分片和断点续传
    src/videos/        视频管理与 Range 播放
    src/audit/         审计记录
  web/                 Vue 3 管理端与公开播放页
    src/components/    通用组件
    src/layouts/       后台布局
    src/stores/        登录状态
    src/views/         页面
deploy/nginx.conf      反向代理配置
docker-compose.yml     容器部署
data/                  数据库、视频和临时分片（不会提交）
```

## 本地运行

需要 Node.js 20+ 和 Yarn 1.22。项目默认使用 Yarn，国内镜像已在 `.yarnrc` 中配置。

```bash
corepack enable
yarn install
cp .env.example .env
yarn db:generate
yarn db:bootstrap
yarn db:seed
yarn dev
```

Windows PowerShell 使用：

```powershell
corepack enable
yarn install
Copy-Item .env.example .env
yarn db:generate
yarn db:bootstrap
yarn db:seed
yarn dev
```

打开 `http://localhost:5173`。开发环境初始账号来自 `.env`：

- 用户名：`admin`
- 密码：`ChangeMe123!`

首次部署前必须修改 `JWT_SECRET` 和 `SUPER_ADMIN_PASSWORD`。超级管理员只会在数据库中不存在超级管理员时创建，之后修改环境变量不会覆盖现有账号。

## Docker 部署

Linux 或装有 Docker Desktop 的 Windows 均可运行：

```bash
cp .env.example .env
# 修改 .env 中的密码、密钥、域名
docker compose up -d --build
```

默认访问 `http://服务器地址`，持久化内容位于宿主机 `./data`。容器启动时会幂等初始化数据库结构和超级管理员。

生产环境建议在 Nginx 或云负载均衡前配置 HTTPS，并将：

- `APP_ORIGIN`、`PUBLIC_BASE_URL` 设置为实际 HTTPS 域名。
- `JWT_SECRET` 设置为至少 32 位随机字符串。
- `SUPER_ADMIN_PASSWORD` 设置为强密码。
- `HTTP_PORT` 设置为需要暴露的端口。

## 配置

| 变量 | 默认值 | 用途 |
| --- | --- | --- |
| `PORT` | `3000` | API 端口 |
| `APP_ORIGIN` | `http://localhost:5173` | 允许访问 API 的前端来源，多个值用逗号分隔 |
| `DATABASE_URL` | SQLite 本地文件 | 数据库地址 |
| `STORAGE_DIR` | `data/videos` | 视频存储目录 |
| `UPLOAD_TEMP_DIR` | `data/tmp` | 临时分片目录 |
| `UPLOAD_WARNING_BYTES` | `20971520` | 上传提醒阈值（20 MB） |
| `UPLOAD_CHUNK_BYTES` | `5242880` | 分片大小（5 MB） |
| `UPLOAD_SESSION_HOURS` | `24` | 未完成分片保留时间 |
| `LOGIN_RATE_LIMIT` | `10` | 15 分钟内单 IP 登录尝试次数 |

上传大小没有业务层上限。若调整分片超过 8 MB，需要同步增大 `deploy/nginx.conf` 中的 `client_max_body_size`。

非 Docker 开发环境修改根目录 `.env` 中的 `PORT` 后，NestJS 监听端口和 Vite `/api` 代理会同步变更，无需再修改前端配置。

## 播放兼容性

服务端保留原文件且不转码。是否能播放取决于客户端对文件封装、视频编码和音频编码的支持。MP4（H.264 + AAC）兼容范围通常最好。公开视频接口支持 HTTP Range，可拖动进度并按需加载。

## 数据维护

- 备份：停止写入后备份整个 `data` 目录，包括 SQLite 数据库和 `videos` 文件夹。
- 恢复：将备份恢复到相同目录并重新启动服务。
- 停用视频只改变状态并保留文件；删除视频会永久删除数据库记录和本地文件。
- 视频列表分别显示播放页浏览量和实际播放量；同一次页面打开只在首次开始播放时累计一次播放量。
- 超过 `UPLOAD_SESSION_HOURS` 的未完成分片会在 API 启动时清理。

## 常用命令

```bash
yarn dev             # 前后端开发服务
yarn build           # 生产构建
yarn test            # 后端测试
yarn db:generate     # 生成 Prisma Client
yarn db:bootstrap    # 幂等初始化 SQLite 表
yarn db:seed         # 初始化超级管理员
```
