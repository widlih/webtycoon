#!/usr/bin/env bash
set -euo pipefail
cd /srv/webtycoon/infra
mkdir -p /srv/webtycoon/backups
docker compose exec -T postgres pg_dump -U convex -d webtycoon | gzip -9 > "/srv/webtycoon/backups/webtycoon-$(date +%F).sql.gz"
find /srv/webtycoon/backups -name 'webtycoon-*.sql.gz' -mtime +7 -delete
