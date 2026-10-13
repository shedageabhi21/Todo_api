# Todo API

A small Express REST API used as the application for a DevSecOps platform project
(Jenkins, SonarQube, Trivy, ECR, EKS, ArgoCD, Prometheus/Grafana on AWS).

Infrastructure and deployment code lives in the companion repo: **devsecops-platform**.

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/todos` | List todos |
| GET | `/todos/:id` | Get one todo |
| POST | `/todos` | Create (`{"title": "..."}`) |
| PUT | `/todos/:id` | Update `title` / `done` |
| DELETE | `/todos/:id` | Delete |
| GET | `/health` | Liveness probe |
| GET | `/ready` | Readiness probe |
| GET | `/metrics` | Prometheus metrics |

## Run locally

```bash
npm ci
npm start            # http://localhost:3000
npm test             # Jest with coverage
npm run lint
```

## Run with Docker

```bash
docker build -t todo-api .
docker run --rm -p 3000:3000 todo-api
```

## Known limitation

Todos are stored in memory, so data is lost on restart and the app should run as a
single replica. A PostgreSQL backend is a planned improvement.

## CI

The `Jenkinsfile` runs: lint, npm audit, OWASP Dependency-Check, unit tests,
SonarQube analysis with a quality gate, Docker build, and a Trivy image scan.
Pushing to ECR and updating the Helm image tag (GitOps) are enabled with the
`PUSH_IMAGE` parameter once the AWS side is ready.