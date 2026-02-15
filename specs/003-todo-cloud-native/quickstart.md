# Quickstart: Todo Cloud-Native Deployment

**Feature**: `003-todo-cloud-native`
**Date**: 2026-02-15

## Prerequisites

Before starting, ensure the following tools are installed:

| Tool | Version | Verification |
|------|---------|-------------|
| Docker | 24+ | `docker --version` |
| Minikube | 1.32+ | `minikube version` |
| Helm | 3.x | `helm version` |
| kubectl | 1.28+ | `kubectl version --client` |
| Hadolint | 2.12+ | `hadolint --version` |
| Trivy | 0.50+ | `trivy --version` |

**Optional** (AI DevOps):
- kubectl-ai: `kubectl ai --version`
- Kagent: installed via Helm
- Gordon: `docker gordon --help` (Docker Desktop plugin)

## Step 1: Start Minikube

```bash
# Start Minikube with sufficient resources
minikube start --cpus=2 --memory=4096

# Enable ingress addon
minikube addons enable ingress

# Verify cluster is running
kubectl cluster-info
```

## Step 2: Build Docker Images

```bash
# Build backend image
docker build -f docker/backend/Dockerfile -t todo-backend:latest ./backend

# Build frontend image
docker build -f docker/frontend/Dockerfile -t todo-frontend:latest ./frontend
```

## Step 3: Lint and Scan (Quality Gate)

```bash
# Lint Dockerfiles
hadolint docker/backend/Dockerfile
hadolint docker/frontend/Dockerfile

# Scan images for vulnerabilities
trivy image --severity CRITICAL,HIGH todo-backend:latest
trivy image --severity CRITICAL,HIGH todo-frontend:latest
```

Both commands must produce zero findings before proceeding.

## Step 4: Load Images into Minikube

```bash
minikube image load todo-backend:latest
minikube image load todo-frontend:latest
```

## Step 5: Create Kubernetes Secrets

```bash
kubectl create secret generic todo-secrets \
  --from-literal=DATABASE_URL="your-neon-database-url" \
  --from-literal=BETTER_AUTH_SECRET="your-auth-secret-minimum-32-chars" \
  --from-literal=OPENAI_API_KEY="sk-your-openai-api-key"
```

Replace the placeholder values with your actual credentials.

## Step 6: Deploy with Helm

```bash
# Deploy backend
helm install todo-backend charts/todo-backend \
  -f charts/values/minikube.yaml

# Deploy frontend
helm install todo-frontend charts/todo-frontend \
  -f charts/values/minikube.yaml
```

## Step 7: Configure Local DNS

```bash
# Get Minikube IP
MINIKUBE_IP=$(minikube ip)

# Add to /etc/hosts (requires sudo)
echo "$MINIKUBE_IP todo.local" | sudo tee -a /etc/hosts
```

## Step 8: Verify Deployment

```bash
# Check pods are running
kubectl get pods

# Check services
kubectl get svc

# Check ingress
kubectl get ingress

# Test health endpoint
curl http://todo.local/health
# Expected: {"status":"healthy"}

# Test Phase II endpoint (requires auth)
curl http://todo.local/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Step 9: Verify Probes

```bash
# Check pod health status
kubectl describe pod -l app=todo-backend | grep -A 5 "Conditions"

# Watch for any restarts (should be 0)
kubectl get pods --watch
```

## Common Operations

### Upgrade after code changes

```bash
# Rebuild images
docker build -f docker/backend/Dockerfile -t todo-backend:latest ./backend
docker build -f docker/frontend/Dockerfile -t todo-frontend:latest ./frontend

# Reload into Minikube
minikube image load todo-backend:latest
minikube image load todo-frontend:latest

# Upgrade Helm releases (restart pods to pick up new images)
helm upgrade todo-backend charts/todo-backend -f charts/values/minikube.yaml
helm upgrade todo-frontend charts/todo-frontend -f charts/values/minikube.yaml
```

### Tear down

```bash
helm uninstall todo-backend
helm uninstall todo-frontend
kubectl delete secret todo-secrets
minikube stop
```

### View logs

```bash
kubectl logs -l app=todo-backend --tail=100 -f
kubectl logs -l app=todo-frontend --tail=100 -f
```

### AI DevOps (optional)

```bash
# kubectl-ai examples
kubectl ai "show me all pods and their status"
kubectl ai "describe the todo-backend deployment"
kubectl ai "why is the backend pod not ready?"

# Kagent (if installed)
# Follow Kagent documentation for cluster queries
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Pod stuck in `Pending` | Check resources: `kubectl describe pod <name>` |
| Image pull error | Ensure `imagePullPolicy: Never` and images are loaded: `minikube image ls` |
| Ingress not working | Verify addon: `minikube addons list \| grep ingress` |
| Secret not found | Create secret first: `kubectl get secrets` |
| DB connection refused | Verify Neon URL is accessible from Minikube: `kubectl exec <pod> -- curl -s https://your-neon-host.neon.tech` |
| Frontend shows blank page | Check CORS_ORIGINS in ConfigMap matches ingress host |

## Time Estimates

| Step | Duration |
|------|----------|
| Minikube start | ~1 min |
| Docker builds (first time) | ~3-5 min |
| Docker builds (cached) | ~30 sec |
| Image load into Minikube | ~1 min |
| Helm install (both charts) | ~1 min |
| DNS + verification | ~2 min |
| **Total (first time)** | **~10-15 min** |
| **Total (subsequent)** | **~3-5 min** |
