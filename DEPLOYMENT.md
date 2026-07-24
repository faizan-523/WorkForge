# WorkForge — Production Deployment Guide

This guide outlines deployment options for WorkForge: Vercel (Managed Serverless) and Docker + PostgreSQL (Self-Hosted Containerized).

---

## Option 1: Vercel Deployment (Recommended for Next.js App Router)

1. **Push Codebase to GitHub / GitLab**.
2. **Import Repository in Vercel**:
   - Framework Preset: `Next.js`
   - Build Command: `npx prisma generate && next build`
3. **Configure Environment Variables in Vercel**:
   ```env
   DATABASE_URL="postgresql://user:password@ep-host.pooler.supabase.com:5432/postgres?sslmode=require"
   NEXTAUTH_SECRET="your-32-character-production-secret"
   NEXTAUTH_URL="https://yourdomain.com"
   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   ```
4. **Deploy & Database Migration**:
   - Run `npx prisma db push` or `npx prisma migrate deploy` against your production PostgreSQL instance (e.g. Supabase, Neon, AWS RDS).

---

## Option 2: Self-Hosted Docker + PostgreSQL Deployment

### Prerequisites
- Docker Engine 24+ & Docker Compose v2+
- Domain name with A/AAAA records pointed to your server IP.

### 1. Environment Configuration
Create a production `.env` file on your server:
```env
NEXTAUTH_SECRET="super-secret-random-key-32-chars-minimum"
NEXTAUTH_URL="https://workforge.yourdomain.com"
CLOUDINARY_CLOUD_NAME="your_cloud"
CLOUDINARY_API_KEY="123456789"
CLOUDINARY_API_SECRET="secret"
```

### 2. Build & Launch Containers
```bash
docker compose up -d --build
```

### 3. Run Database Migrations Inside Container
```bash
docker compose exec web npx prisma db push
```

### 4. Reverse Proxy Setup (Nginx + Certbot SSL)
```nginx
server {
    server_name workforge.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Production Security Checkpoints
- `NEXTAUTH_SECRET`: Generate using `openssl rand -base64 32`.
- `HTTPS / SSL`: Enforce HTTPS via Let's Encrypt / Cloudflare.
- `Database Connection Pooling`: Use Supabase PgBouncer / Prisma Accelerate for high-concurrency connection management.
