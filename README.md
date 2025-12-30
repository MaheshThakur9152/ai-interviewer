# AI Interviewer Docker Setup

This setup dockerizes the frontend and backend, and uses nginx as a reverse proxy with SSL.

## Prerequisites
- Docker and Docker Compose installed.
- Domains cosinv.com and api.cosinv.com pointing to your server.

## Initial Setup (HTTP)

1. Start the services:
   ```bash
   docker compose up -d --build
   ```

2. Check that cosinv.com serves the frontend and api.cosinv.com proxies to backend.

## SSL Setup

1. Obtain SSL certificates:
   ```bash
   docker run --rm -v $(pwd)/ssl:/etc/letsencrypt -v $(pwd)/webroot:/var/www/html certbot/certbot certonly --webroot --webroot-path=/var/www/html --email amolyadav6125@gmail.com --agree-tos --no-eff-email -d cosinv.com -d api.cosinv.com
   ```

2. Uncomment the SSL server blocks in nginx/nginx.conf.

3. Change VITE_API_URL to https://api.cosinv.com in docker-compose.yml.

4. Update ports to include 443 in docker-compose.yml.

5. Restart:
   ```bash
   docker compose up -d --build
   ```

Frontend will be at https://cosinv.com
Backend API at https://api.cosinv.com