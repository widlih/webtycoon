#!/usr/bin/env bash
set -euo pipefail
cd "$(cd "$(dirname "$0")/.." && pwd)/frontend"
pnpm install --frozen-lockfile
pnpm build
npx convex deploy --yes
tar czf - -C build . | ssh root@109.172.31.255 'tar xzf - -C /srv/webtycoon/build && find /srv/webtycoon/build/_app/immutable -type f -mtime +7 -delete'
