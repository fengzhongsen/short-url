FROM node:16-alpine

WORKDIR /app

# 复制根 package.json
COPY package.json .

# 复制各个包的 package.json (为了利用 Docker 缓存)
COPY packages/short-client/package.json packages/short-client/
COPY packages/short-server/package.json packages/short-server/
COPY packages/short-mcp-server/package.json packages/short-mcp-server/

# 设置 npm 淘宝/阿里云镜像源
RUN npm config set registry https://registry.npmmirror.com/

# 安装所有依赖
RUN npm install

# 复制所有源代码
COPY . .

# 构建前端
RUN npm run build:client

EXPOSE 3001

# 启动后端服务
CMD ["npm", "run", "start:server"]