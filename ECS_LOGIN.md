---
name: ecs-login
description: SSH 登录阿里云香港 ECS（47.239.149.16）并执行远程命令
category: devops
---

# ECS 登录操作指南

## 服务器信息

| 项目 | 值 |
|------|-----|
| IP | 47.239.149.16 |
| 用户名 | root |
| 端口 | 22（默认） |

## 登录方式

由于需要密码登录，使用 `expect` 处理 SSH 认证。

### 基础模板

```bash
expect -c '
set timeout 20
spawn ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null root@47.239.149.16 "要执行的命令"
expect "password:"
send "你的密码\r"
expect eof
'
```

### 执行单条命令

```bash
expect -c '
set timeout 20
spawn ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null root@47.239.149.16 "ls -la /root/"
expect "password:"
send "你的密码\r"
expect eof
'
```

### 执行多条命令（用 && 连接）

```bash
expect -c '
set timeout 20
spawn ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null root@47.239.149.16 "echo === 容器状态 === && docker ps --format \"table {{.Names}}\t{{.Ports}}\t{{.Status}}\" && echo && echo === 磁盘 === && df -h /"
expect "password:"
send "你的密码\r"
expect eof
'
```

## ECS 上部署的服务

### Docker 容器（全部运行中）

| 容器 | 端口 | 描述 |
|------|------|------|
| `docker-framene-server-node-api-1` | 3000 | 后端 API（Express + PostgreSQL） |
| `framene-web` | 5173 | Web 前端（React/Vite） |
| `framene-flutter-app` | 8080 | Flutter App（Python HTTP 静态服务） |
| `nginx-admin-app-1` | 80/443/81 | Nginx Proxy Manager |

### 目录结构

```
/root/
├── docker-framene-server/      # 后端 API
│   └── framene-server/
│       ├── index.js            # 主入口
│       ├── .env                # 配置文件
│       └── scripts/            # 工具脚本
├── docker-frame_app/           # Web 前端
│   └── frame_app/
│       └── src/                # React 源码
├── docker-flutter/             # Flutter App
│   └── flutter_oss_example/
│       └── lib/                # Flutter 源码
├── nginx-admin/                # Nginx Proxy Manager
│   └── data/nginx/
│       ├── proxy_host/         # 反向代理配置
│       └── custom/             # 自定义路由配置
└── framene/                    # 原始源码备份
```

### NPM 反向代理配置

| 域名 | 目标端口 | SSL |
|------|---------|-----|
| `app.framene.com` | 8080 (Flutter) | ✅ Let's Encrypt |
| `web.framene.com` | 5173 (Web) | ❌ HTTP only |

### 常用操作

**重启后端容器（更新 .env 后）**
```bash
cd /root/docker-framene-server && docker compose down && docker compose up -d
```

**查看容器日志**
```bash
docker logs docker-framene-server-node-api-1 --tail 30
```

**重载 Nginx**
```bash
docker exec nginx-admin-app-1 nginx -s reload
```

**查看所有容器状态**
```bash
docker ps --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}"
```

## 注意事项

- SSH 首次连接自动跳过 host key 检查（`StrictHostKeyChecking=no`）
- Docker 内网 IP 为 `172.18.60.222`
- .env 文件修改后需重启后端容器才能生效
- 数据库是北京 RDS PostgreSQL: `pgm-2ze89c73w569e2xc7o.pg.rds.aliyuncs.com`
- OSS 存储: `framene-photos`（北京区域）
