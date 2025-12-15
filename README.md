# 极简短链 (Short URL)

将长链接转为短链接的小工具，完全开源、免费、支持注册登录，可私有化部署，短链接可永久有效。起初通过Fork [onee-io/short-url](https://github.com/onee-io/short-url) 进行开发，但是由于定位不同进行了全面重构，已无法再合入原项目，故而新建仓库。
> * UI方面基于Antd6进行了全面重构
> * 功能方面增加了注册/登录/登出等能力
> * 后续计划增加MCP服务
> * 建立了新的品牌（Logo+主题）

体验地址 👉 [极简短链 —— 简单易用的短链接生成工具，链接永久有效！](https://short.ifelse.site)

申明：该站不承诺提供稳定服务，仅为每位体验者10个短链体验额度

## 效果演示

<img src="docs/main.png" width="400" />
<details>
<summary>登录注册页面展示</summary>
<img src="docs/register.png" width="400" />
<img src="docs/login.png" width="400" />
</details>

## 环境依赖

- NodeJS 16+
- Redis 5+

## 环境变量

将 `.env.example` 文件重命名为 `.env`，并按你的 Redis 实际情况填写好配置信息，说明如下：

| 配置            | 默认值    | 说明                          |
| -------------- | --------- | ----------------------------- |
| PORT           | 3001      |  服务端口 |
| REDIS_HOST     | 127.0.0.1 | Redis 服务 IP 地址，支持 IPv6 |
| REDIS_PORT     | 6379      | Redis 服务端口                |
| REDIS_USERNAME |           | 用户名，没有留空即可          |
| REDIS_PASSWORD |           | 密码，没有留空即可            |
| JWT_SECRET     | 'short-url-jwt-secret'| JWT 密钥 |
| JWT_EXPIRES_IN | '2h' | JWT 过期时间 |
| ENCRYPT_KEY    | 'short-url-encrypt-key'| 密码加密密钥 |
| USER_URL_LIMIT | 10        | 用户生成短链接数量限制 |

## 调试

```bash
# 安装依赖
npm install

# 启动后端服务，占用端口 3001
npm run dev

# 启动前端服务，占用端口 3000
npm start
```

## 部署

### 方式一：前后端分离部署

```bash
# 安装依赖
npm install

# 启动后端服务，占用端口 3001
npm run server

# 启动前端服务，占用端口 3000
npm start
```

### 方式二：通过 express 代理静态资源部署（推荐）

```bash
# 安装依赖
npm install

# 将前端编译为静态文件（生成的 build 目录不要删除）
npm npm run build

# 启动服务
npm run server

# 访问 http://localhost:3001
```

### 方式三：通过 Docker 部署（推荐）

```bash
# 构建镜像并并启动
docker compose up -d

# 访问 http://localhost:3001
```
