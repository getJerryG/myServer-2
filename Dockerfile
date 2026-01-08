# 使用官方的Node.js基础镜像，这里以Node.js 18版本为例
FROM node:23-slim

# 设置容器内的工作目录
WORKDIR /app

# 先复制package.json和package-lock.json
COPY package*.json /app/

# 安装项目依赖
RUN npm install

# 复制项目其他文件
COPY . /app

# 安装项目的依赖
RUN npm install

# 暴露应用运行的端口，这里假设应用运行在3000端口
EXPOSE 3000

# 定义容器启动时要执行的命令，这里启动Node.js应用
CMD ["node", "dist/bundle.js"]
