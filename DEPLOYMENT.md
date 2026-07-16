# NyxBeacon - Build & Deployment Configuration

## Overview
This file contains platform-specific setup and build configurations for the NyxBeacon Hospital Bed Board System.

## Docker Build
```bash
docker build -t nyxbeacon:latest .
docker run -p 3000:3000 -p 5173:5173 --env-file .env nyxbeacon:latest
```

## Environment Configuration

### Database
- **PostgreSQL 14+** required
- Local development: `postgresql://postgres:postgres@localhost:5432/nyxbeacon`
- Azure Database for PostgreSQL: Use Azure portal connection string

### Development Environment
```bash
# Copy example env
cp .env.example .env

# Edit with your settings
DATABASE_URL="postgresql://user:pass@host:5432/nyxbeacon"
PORT=3000
NODE_ENV="development"
```

## Deployment Targets

### Local Development
1. Install PostgreSQL
2. Create database: `createdb nyxbeacon`
3. Run: `yarn install && yarn db:push && yarn dev`

### Docker Compose (Multi-container)
```bash
docker-compose up -d
```

### Azure Deployment
```bash
# Create resources
az group create --name nyxbeacon-rg --location eastus

# Deploy with Bicep
az deployment group create \
  --resource-group nyxbeacon-rg \
  --template-file deploy/main.bicep

# Setup database
yarn db:push

# Deploy app
az appservice deployment source config-zip \
  -g nyxbeacon-rg \
  -n nyxbeacon \
  --src dist.zip
```

### Azure Container Apps
```bash
# Build and push image
az acr build -r nyxbeacon-acr -t nyxbeacon:latest .

# Deploy to Container Apps
az containerapp create \
  --name nyxbeacon \
  --resource-group nyxbeacon-rg \
  --image nyxbeacon-acr.azurecr.io/nyxbeacon:latest \
  --environment nyxbeacon-env
```

## Performance Tuning

### Backend Optimization
- Enable connection pooling: `PGBOUNCER_ENABLED=true`
- Set worker count: `WORKER_THREADS=4`
- Enable compression: `ENABLE_COMPRESSION=true`

### Frontend Optimization
- Build optimization: `vite build --mode production`
- Enable gzip: Configure in reverse proxy
- CDN for static assets: Recommended for production

## Monitoring & Logging

### Application Insights
```bash
# Enable telemetry
ENABLE_APPLICATION_INSIGHTS=true
APPINSIGHTS_INSTRUMENTATION_KEY="your-key"
```

### Logging Levels
- Development: `LOG_LEVEL=debug`
- Production: `LOG_LEVEL=info`

## Security Checklist
- [ ] Change JWT_SECRET in production
- [ ] Enable HTTPS
- [ ] Setup CORS properly for frontend domain
- [ ] Enable database encryption at rest
- [ ] Setup VPN for database access
- [ ] Configure firewall rules
- [ ] Enable audit logging
- [ ] Setup backup strategy
