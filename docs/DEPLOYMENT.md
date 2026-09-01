# Deployment

Live at **https://parktrace.duckdns.org**

## Infrastructure

Everything lives in the GCP project `nestiq-ai-pipeline`. Only the resources
below were created; no pre-existing VM was touched.

| Resource | Name | Detail |
|---|---|---|
| VM | `park-trace` | `e2-micro`, Debian 12, zone `asia-south1-a` |
| Static IP | `park-trace-ip` | `34.47.200.56` (reserved, so it survives a reboot) |
| Firewall | `park-trace-allow-web` | `tcp:80,443`, scoped to the tag `park-trace-web` |
| Web server | nginx | serves `/var/www/parktrace` |
| TLS | Let's Encrypt | `parktrace.duckdns.org`, auto-renewed by `certbot.timer` |

The firewall rule is tag-scoped, so it applies only to instances carrying
`park-trace-web`. No other instance in the project has that tag.

## DNS

DuckDNS `parktrace` must point at **34.47.200.56**. The IP is reserved, so it
does not change across stop/start or reboot. It only changes if the address is
explicitly released.

## Staying up

- Not preemptible, `provisioningModel: STANDARD`
- `automaticRestart: true`, `onHostMaintenance: MIGRATE` (live-migrates during
  host maintenance rather than going down)
- `deletionProtection: true` - the VM cannot be deleted until that flag is
  cleared, which is deliberate
- nginx is `enabled` at boot and has a systemd drop-in setting
  `Restart=on-failure`, so it comes back by itself if it crashes
- `unattended-upgrades` enabled for security patches
- `certbot.timer` enabled; the certificate renews without intervention

## Redeploying

```bash
npm run build && bash scripts/deploy.sh
```

The script uploads the build, swaps the web root atomically rather than writing
over it in place, reloads nginx and verifies the site returns 200. It only ever
addresses the `park-trace` instance.

## Cache policy

Set deliberately in the nginx config, and it matters for a PWA:

- `/assets/*` - immutable, cached a year. Vite content-hashes these filenames.
- `sw.js`, `registerSW.js`, `index.html` - `no-store`. If these were cached, a
  browser that had already installed the PWA could never see a new deploy.
- `manifest.webmanifest` - served as `application/manifest+json`, `no-cache`.

## Notes

- The service worker requires a secure context. Over plain HTTP the browser
  disables it outright, so the offline shell only works on the HTTPS domain,
  not on the bare IP.
- `e2-micro` is sufficient because nginx only serves static files; the app is
  built locally and uploaded. Resize with
  `gcloud compute instances set-machine-type park-trace --machine-type=e2-small
  --project=nestiq-ai-pipeline --zone=asia-south1-a` (requires a stop/start).
