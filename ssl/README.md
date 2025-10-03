# SSL Certificates

This directory should contain your SSL certificates for HTTPS deployment.

## Required files:
- `fullchain.pem` - Full certificate chain
- `privkey.pem` - Private key

## How to get certificates:

### Option 1: Let's Encrypt (Free, Recommended)
```bash
# Install certbot
sudo apt-get install certbot

# Get certificate
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./ssl/
```

### Option 2: Self-signed (Development only)
```bash
# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/privkey.pem \
  -out ssl/fullchain.pem \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
```

### Option 3: Use existing certificates
Simply copy your certificate files to this directory:
- Certificate chain → `fullchain.pem`
- Private key → `privkey.pem`

## Security Notes:
- **Never commit private keys to git!**
- This directory is gitignored by default
- Set proper permissions: `chmod 600 privkey.pem`
- Renew certificates before expiration

## For development without HTTPS:
If you don't need HTTPS for local development, you can:
1. Comment out the nginx service in `docker-compose.yml`
2. Access the app directly via http://localhost:3000
