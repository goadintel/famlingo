#!/bin/bash
# upload-resources.sh
# Uploads sanitized resources to the DigitalOcean server.
# Run sanitize-resources.sh first to create the ./resources/ directory.
#
# Usage: ./upload-resources.sh

set -euo pipefail

SSH_KEY="$HOME/.ssh/famlingo-digitalocean"
REMOTE="root@134.209.102.164"
REMOTE_PATH="/var/www/famlingo-resources/"
LOCAL_PATH="/home/cmantra/famlingo/resources/"

if [ ! -d "$LOCAL_PATH" ]; then
  echo "ERROR: ./resources/ directory not found."
  echo "Run ./sanitize-resources.sh first."
  exit 1
fi

echo "=== Upload Resources to Server ==="
echo "Local:  $LOCAL_PATH"
echo "Remote: $REMOTE:$REMOTE_PATH"
echo ""

LOCAL_SIZE=$(du -sh "$LOCAL_PATH" | cut -f1)
echo "Total size to upload: $LOCAL_SIZE"
echo ""

read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Aborted."
  exit 0
fi

# Create remote directory structure
echo "Creating remote directories..."
ssh -i "$SSH_KEY" "$REMOTE" "mkdir -p $REMOTE_PATH"

# rsync with progress
echo "Uploading resources (this may take a while)..."
rsync -avz --progress \
  -e "ssh -i $SSH_KEY" \
  "$LOCAL_PATH" \
  "$REMOTE:$REMOTE_PATH"

echo ""
echo "=== Upload Complete ==="
echo ""
echo "Verify on server:"
echo "  ssh -i $SSH_KEY $REMOTE \"du -sh $REMOTE_PATH*\""
echo ""
echo "Next steps:"
echo "  1. Add nginx location block for /resources/ (see below)"
echo "  2. Restart nginx: ssh -i $SSH_KEY $REMOTE 'nginx -t && systemctl reload nginx'"
echo "  3. Test: curl -I https://famlingo-api.com/resources/courses/level-1/audio/ "
echo ""
echo "=== Nginx Config Addition ==="
echo "Add this inside the server block in /etc/nginx/sites-enabled/famlingo:"
echo ""
cat << 'NGINX'
    # Static learning resources
    location /resources/ {
        alias /var/www/famlingo-resources/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        add_header Accept-Ranges bytes;
        types {
            audio/mpeg mp3;
            application/pdf pdf;
        }
    }
NGINX
