# 🚀 Production Deployment Guide

Hướng dẫn deploy ứng dụng lên production.

## 📋 Prerequisites

- Docker & Docker Compose đã được cài đặt
- Domain name (nếu cần)
- SSL certificate (nếu dùng HTTPS)

## 🔧 Setup Production

### 1. Tạo file environment variables

```bash
cp .env.production.example .env.production
```

Chỉnh sửa `.env.production` với các giá trị production của bạn:

```env
MONGO_PASSWORD=your-secure-password
JWT_SECRET=your-super-secret-jwt-key
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_TOUR_URL=https://yourdomain.com
```

### 2. Build và chạy với Docker Compose

```bash
# Build và start tất cả services
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# Xem logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down
```

## 🎯 Deployment Options

### Option 1: Serve Tour từ Nginx (Recommended)

**Ưu điểm:**
- ✅ Đơn giản, không cần thêm service
- ✅ Performance tốt (nginx serve static files)
- ✅ Tour accessible qua cùng domain: `https://yourdomain.com/360/beginner/`

**Cách hoạt động:**
- Tour files được copy vào nginx container
- Nginx serve từ `/360/` path
- Không cần port riêng cho tour

**URLs:**
- Frontend: `http://localhost:2222`
- Tour Beginner: `http://localhost:2222/360/beginner/`
- Tour Museum: `http://localhost:2222/360/museum/`

### Option 2: Tour Server riêng (Separate Port)

Nếu muốn tour chạy trên port riêng (giống dev mode):

1. Uncomment `tour-server` service trong `docker-compose.prod.yml`
2. Tạo `Dockerfile.tour` (đã có sẵn)
3. Update `REACT_APP_TOUR_URL` trong `.env.production`

**URLs:**
- Frontend: `http://localhost:2222`
- Tour Server: `http://localhost:5503`
- Tour Beginner: `http://localhost:5503/beginner/`

## 🌐 Nginx Reverse Proxy (Optional)

Nếu muốn dùng domain và HTTPS, setup nginx reverse proxy:

```nginx
# /etc/nginx/sites-available/yourdomain.com
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Frontend
    location / {
        proxy_pass http://localhost:2222;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # API Backend
    location /api/ {
        proxy_pass http://localhost:1111;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    # WebSocket
    location /socket.io/ {
        proxy_pass http://localhost:1111;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## 📝 Production Checklist

- [ ] Đổi tất cả default passwords
- [ ] Set `JWT_SECRET` mạnh và bảo mật
- [ ] Update `REACT_APP_API_URL` với production API URL
- [ ] Enable HTTPS (nếu có domain)
- [ ] Setup backup cho MongoDB
- [ ] Configure firewall (chỉ mở ports cần thiết)
- [ ] Setup monitoring và logging
- [ ] Test tất cả tours hoạt động đúng
- [ ] Verify CORS settings cho production domain

## 🔍 Health Checks

```bash
# Backend health
curl http://localhost:1111/api/health

# Frontend
curl http://localhost:2222

# Tour
curl http://localhost:2222/360/beginner/index.html
```

## 🐛 Troubleshooting

### Tour không load được

1. Kiểm tra tour files có được copy vào container:
   ```bash
   docker exec react-frontend-prod ls -la /usr/share/nginx/html/360/
   ```

2. Kiểm tra nginx logs:
   ```bash
   docker logs react-frontend-prod
   ```

3. Kiểm tra nginx config:
   ```bash
   docker exec react-frontend-prod nginx -t
   ```

### MongoDB connection issues

1. Kiểm tra MongoDB đang chạy:
   ```bash
   docker ps | grep mongodb
   ```

2. Kiểm tra connection string trong `.env.production`

### Port conflicts

Nếu ports đã được sử dụng, đổi trong `.env.production`:
```env
BACKEND_PORT=1111
FRONTEND_PORT=2222
MONGO_PORT=20711
```

## 📊 Monitoring

### View logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
```

### Resource usage
```bash
docker stats
```

## 🔄 Updates & Maintenance

### Update application
```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build
```

### Backup MongoDB
```bash
docker exec mongodb-prod mongodump --out /data/backup
docker cp mongodb-prod:/data/backup ./backup-$(date +%Y%m%d)
```

### Restore MongoDB
```bash
docker cp ./backup-YYYYMMDD mongodb-prod:/data/backup
docker exec mongodb-prod mongorestore /data/backup
```

