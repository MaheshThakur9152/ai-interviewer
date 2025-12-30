# AI Interviewer Docker Setup

This setup dockerizes the frontend and backend, and uses nginx as a reverse proxy with SSL.

## Prerequisites
- Docker and Docker Compose installed.
- Domains cosinv.com and api.cosinv.com pointing to your server.

## Setup SSL with Certbot

1. Start the services without SSL:
   ```bash
   docker-compose up -d nginx
   ```

2. Run Certbot to get certificates:
   ```bash
   docker run --rm -v $(pwd)/ssl:/etc/letsencrypt -v $(pwd)/webroot:/var/www/html certbot/certbot certonly --webroot --webroot-path=/var/www/html --email amolyadav6125@gmail.com --agree-tos --no-eff-email -d cosinv.com -d api.cosinv.com
   ```

3. The certificates will be available at ./ssl/live/cosinv.com/ and ./ssl/live/api.cosinv.com/

4. Restart nginx:
   ```bash
   docker-compose restart nginx
   ```

## Run the Application

```bash
docker-compose up -d
```

Frontend will be at https://cosinv.com
Backend API at https://api.cosinv.com