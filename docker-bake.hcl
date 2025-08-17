// docker-bake.hcl
// Multi-service build configuration for Depot + docker buildx bake
// Usage examples:
//   depot build -f docker-bake.hcl --target api-gateway
//   depot build -f docker-bake.hcl --target all --push
//   depot build -f docker-bake.hcl --target frontend --set *.platform=linux/amd64,linux/arm64

variable "REPO" { // Base image repo, override with: --set REPO=ghcr.io/you/zimnews
  default = "zimnews"
}

variable "VERSION" { // App version / tag suffix override: --set VERSION=1.0.0
  default = "latest"
}

// Common labels (can be expanded)
variable "LABEL_VENDOR" { default = "zimnews" }

// Helper function for full image tag
function "image" {
  params = ["name"]
  result = format("%s/%s:%s", REPO, name, VERSION)
}

// Default platforms (override per target with --set target.platform=...)
variable "PLATFORMS" { default = "linux/amd64" }

// Individual service targets

target "api-gateway" {
  context    = "services/api-gateway"
  dockerfile = "Dockerfile"
  tags       = [image("api-gateway")]
  platforms  = [PLATFORMS]
  labels = {
    "org.opencontainers.image.source" = "zimnews"
  }
}

target "user-service" {
  context    = "services/user-service"
  dockerfile = "Dockerfile"
  tags       = [image("user-service")]
  platforms  = [PLATFORMS]
}

target "article-service" {
  context    = "services/article-service"
  dockerfile = "Dockerfile"
  tags       = [image("article-service")]
  platforms  = [PLATFORMS]
}

// Note: ingestion-service Dockerfile currently expects root context paths (COPY services/ingestion-service/...) so keep context as root
// If you refactor that Dockerfile to use local relative paths, change context to services/ingestion-service and dockerfile to Dockerfile.

target "ingestion-service" {
  context    = "."
  dockerfile = "services/ingestion-service/Dockerfile"
  tags       = [image("ingestion-service")]
  platforms  = [PLATFORMS]
}

target "frontend" {
  context    = "frontend"
  dockerfile = "Dockerfile"
  tags       = [image("frontend")]
  platforms  = [PLATFORMS]
}

// Group to build everything

target "all" {
  inherits = ["api-gateway", "user-service", "article-service", "ingestion-service", "frontend"]
}
