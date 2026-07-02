# Deploy to Google Cloud Run — Agent Hub

Deploys the full Next.js app (marketplace + AI chat + discovery pipeline) as a
container on Cloud Run. The API key stays server-side in Secret Manager.

- **Project ID:** `agent-hub-501104`
- **Project number:** `962218194776`
- **Service:** `voucher-agent`
- **Region:** `asia-southeast1` (change if you prefer)

The Dockerfile builds a Next.js **standalone** server (validated locally: `/api/chat`
runs and the SDK is bundled). Cloud Build builds it from source — no local Docker needed.

## One-time setup

```bash
gcloud auth login
gcloud config set project agent-hub-501104

gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com

# Secrets (paste your key; choose an operator passphrase)
printf %s "YOUR_ANTHROPIC_API_KEY" | gcloud secrets create anthropic-api-key --data-file=-
printf %s "YOUR_OPERATOR_PASSPHRASE" | gcloud secrets create operator-passphrase --data-file=-

# Let the Cloud Run runtime service account read the secrets
PN=962218194776
for S in anthropic-api-key operator-passphrase; do
  gcloud secrets add-iam-policy-binding "$S" \
    --member="serviceAccount:${PN}-compute@developer.gserviceaccount.com" \
    --role=roles/secretmanager.secretAccessor
done
```

## Deploy (run from the repo root)

```bash
gcloud run deploy voucher-agent \
  --source . \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-secrets=ANTHROPIC_API_KEY=anthropic-api-key:latest,OPERATOR_PASSPHRASE=operator-passphrase:latest
```

The command prints a `https://voucher-agent-...-as.a.run.app` URL. That's the live app.

## Redeploy after changes

Just re-run the `gcloud run deploy` command — Cloud Build rebuilds and rolls out a new revision.

## Rotate the API key

```bash
printf %s "NEW_KEY" | gcloud secrets versions add anthropic-api-key --data-file=-
gcloud run services update voucher-agent --region asia-southeast1 \
  --set-secrets=ANTHROPIC_API_KEY=anthropic-api-key:latest
```

## Notes

- The Dockerfile sets `STANDALONE_BUILD=1` so `next build` emits `.next/standalone`.
- `/operator` is protected by `OPERATOR_PASSPHRASE`. Omit that secret to leave it open (dev only).
- To restrict access, drop `--allow-unauthenticated` and use IAM invoker bindings.
