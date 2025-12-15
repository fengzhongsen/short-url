<p align="center">
  <a href="https://short.ifelse.site/">
    <img src="public/favicon.svg" alt="Logo" width="100" height="100">
  </a>

  <h1 align="center">极简短链</h1>
  <p align="center">
    将长链接转为短链接的小工具，完全开源、免费、支持注册登录，可私有化部署，短链接可永久有效。
  </p>
  <p align="center">
    <img src="https://img.shields.io/github/contributors/fengzhongsen/short-url.svg?style=for-the-badge" alt="Contributors">
    <img src="https://img.shields.io/github/forks/fengzhongsen/short-url.svg?style=for-the-badge" alt="Forks">
    <img src="https://img.shields.io/github/stars/fengzhongsen/short-url.svg?style=for-the-badge" alt="Stargazers">
    <img src="https://img.shields.io/github/issues/fengzhongsen/short-url.svg?style=for-the-badge" alt="Issues">
    <img src="https://img.shields.io/github/license/fengzhongsen/short-url.svg?style=for-the-badge" alt="MIT License">
    <img src="https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555" alt="LinkedIn">
  </p>
  <p align="center">
    <a href="https://short.ifelse.site">体验地址</a>
    ·
    <a href="https://github.com/fengzhongsen/short-url/issues">报告Bug</a>
    ·
    <a href="https://github.com/fengzhongsen/short-url/issues">提出新特性</a>
  </p>
</p>

## 申明

该项目起初 Fork 自 [onee-io/short-url](https://github.com/onee-io/short-url) ，在工程方面进行了全面重构，UI 基于 Antd6 重写，同时增加了注册/登录/登出等能力，短链生成算法也采用了业界最佳实践，后续计划增加 MCP 服务，已无法再合入原项目，故而新建仓库。

## 效果演示

<img src="docs/main.png" />
<details>
<summary>登录注册页面展示</summary>
<strong>登录</strong>
<img src="docs/login.png" />
<strong>注册</strong>
<img src="docs/register.png" />
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
