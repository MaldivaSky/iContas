Credentials for publishing Docker images

- For Docker Hub publish: set GitHub Secrets `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` (token is your Docker Hub password or access token).
- For GitHub Container Registry (GHCR): workflows will use `GITHUB_TOKEN` automatically; ensure repository permissions allow writing packages.

How to add secrets:
1. Go to GitHub repo → Settings → Secrets and variables → Actions → New repository secret
2. Add `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` if you want Docker Hub push.

Notes:
- If `DOCKERHUB_USERNAME` is present, CI will push to Docker Hub. Otherwise CI pushes to GHCR (ghcr.io).
- You can customize tags and registries in the workflow files.
