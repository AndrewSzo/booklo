# Docker Deployment Guide

This guide explains how to build and run the Booklo application using Docker.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 3.8+
- Node.js 22+ (for local development)

## Quick Start

### Using Docker Compose (Recommended)

1. **Clone the repository and navigate to the project directory:**
```bash
cd booklo
```

2. **Create environment variables:**
Create a `.env.local` file with your configuration:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENROUTER_API_KEY=your_openrouter_api_key
```

3. **Build and run the application:**
```bash
docker-compose up --build
```

The application will be available at `http://localhost:8080`

### Using Docker Commands

1. **Build the Docker image:**
```bash
docker build -t booklo:latest .
```

2. **Run the container:**
```bash
docker run -d \
  --name booklo-app \
  -p 8080:8080 \
  --env-file .env.local \
  booklo:latest
```

## Production Deployment

### For DigitalOcean Deployment

1. **Build with proper tagging:**
```bash
docker build -t your-registry/booklo:$(git rev-parse --short HEAD) .
docker tag your-registry/booklo:$(git rev-parse --short HEAD) your-registry/booklo:latest
```

2. **Push to registry:**
```bash
docker push your-registry/booklo:$(git rev-parse --short HEAD)
docker push your-registry/booklo:latest
```

3. **Deploy on DigitalOcean:**
```bash
docker run -d \
  --name booklo-production \
  -p 8080:8080 \
  --restart unless-stopped \
  --env NODE_ENV=production \
  --env NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL \
  --env NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY \
  --env SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY \
  --env OPENROUTER_API_KEY=$OPENROUTER_API_KEY \
  your-registry/booklo:latest
```

## Health Monitoring

The application includes a health check endpoint at `/api/health` that returns:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12345
}
```

Docker health checks run every 30 seconds and will restart the container if it becomes unhealthy.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Application environment (production/development) | Yes |
| `PORT` | Port number (default: 8080) | No |
| `HOSTNAME` | Host address (default: 0.0.0.0) | No |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `OPENROUTER_API_KEY` | OpenRouter API key | Yes |

## Resource Requirements

- **Minimum:** 512MB RAM, 0.5 CPU cores
- **Recommended:** 1GB RAM, 1 CPU core
- **Storage:** ~100MB for the container image

## Troubleshooting

### Container fails to start
- Check environment variables are properly set
- Verify port 8080 is not already in use
- Check Docker logs: `docker logs booklo-app`

### Health check failures
- Ensure the `/api/health` endpoint is accessible
- Check application logs for errors
- Verify Supabase connection is working

### Build failures
- Ensure Node.js dependencies are compatible
- Check network connectivity during build
- Verify sufficient disk space

## Security Considerations

- Container runs as non-root user (nextjs:nodejs)
- No secrets are stored in the Docker image
- Health checks use internal network only
- Resource limits prevent resource exhaustion

## GitHub Actions Integration

The application is configured to work with GitHub Actions for CI/CD. The Docker configuration supports:
- Automated builds on push
- Image tagging with commit SHA
- Push to container registry
- Deployment to DigitalOcean

Example GitHub Actions workflow snippet:
```yaml
- name: Build Docker image
  run: |
    docker build -t ${{ secrets.REGISTRY_URL }}/booklo:${{ github.sha }} .
    docker tag ${{ secrets.REGISTRY_URL }}/booklo:${{ github.sha }} ${{ secrets.REGISTRY_URL }}/booklo:latest
``` 