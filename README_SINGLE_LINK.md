# Run frontend + backend under one URL

This repository has been adjusted so the backend serves the built frontend assets. There are two main ways to run both frontend and backend under a single URL (for local testing and for deployment):

1) Local (no Docker)

- From the repository root run:

```powershell
# install deps (only needed once)
npm run install-all

# build frontend
npm run build-frontend

# start backend which will serve the built frontend at http://localhost:5000
npm run start-backend
```

Then open: http://localhost:5000 — the backend will serve the frontend from `frontend/dist` and API routes under `/api/*`.

2) Docker (recommended for a single container deployed)

- Build image:

```powershell
docker build -t aeo-tracker:latest .
```

- Run container:

```powershell
docker run -p 5000:5000 --env MONGODB_URI="your-mongo-uri" aeo-tracker:latest
```

Open: http://localhost:5000

Notes
- The backend will attempt to connect to MongoDB only if `MONGODB_URI` is set. If it is not set, the server will continue running in a DB-less mode.
- In production make sure to set `MONGODB_URI`, `JWT_SECRET`, and other required environment variables via your container orchestrator or host environment.
