#!/usr/bin/env bash
#
# Redeploy the built site to the park-trace VM.
#
#   npm run build && bash scripts/deploy.sh
#
# Only ever touches the park-trace instance. Nothing else in the project is
# read or modified.
set -euo pipefail
# The host-key prompt is answered with a finite input rather than `yes`:
# an endless writer dies of SIGPIPE when gcloud stops reading, and pipefail
# would then fail the whole deploy with 141 after it had actually worked.

PROJECT=nestiq-ai-pipeline
ZONE=asia-south1-a
VM=park-trace
DOMAIN=parktrace.duckdns.org
KEY="$HOME/.ssh/google_compute_engine"

if [ ! -d dist ]; then
  echo "dist/ not found. Run 'npm run build' first." >&2
  exit 1
fi

echo "==> packing dist/"
tar -czf /tmp/parktrace-dist.tgz -C dist .

echo "==> uploading to $VM"
{ echo y; echo y; echo y; } | gcloud compute scp /tmp/parktrace-dist.tgz "$VM:/tmp/parktrace-dist.tgz" \
  --project="$PROJECT" --zone="$ZONE" --quiet --ssh-key-file="$KEY"

echo "==> swapping web root"
{ echo y; echo y; echo y; } | gcloud compute ssh "$VM" --project="$PROJECT" --zone="$ZONE" --quiet \
  --ssh-key-file="$KEY" --command='
set -e
sudo rm -rf /var/www/parktrace.new
sudo mkdir -p /var/www/parktrace.new
sudo tar -xzf /tmp/parktrace-dist.tgz -C /var/www/parktrace.new
sudo chown -R www-data:www-data /var/www/parktrace.new
# Swap rather than overwrite in place, so a request never sees a half-written root.
sudo rm -rf /var/www/parktrace.old
sudo mv /var/www/parktrace /var/www/parktrace.old
sudo mv /var/www/parktrace.new /var/www/parktrace
sudo rm -rf /var/www/parktrace.old
sudo nginx -t && sudo systemctl reload nginx
'

echo "==> verifying"
code=$(curl -s -o /dev/null -w '%{http_code}' "https://$DOMAIN/")
echo "https://$DOMAIN/ -> $code"
[ "$code" = "200" ] || { echo "FAILED: expected 200" >&2; exit 1; }
echo "done"
