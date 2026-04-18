# Ynov Market Core

[![GitLab CI](https://gitlab.com/your-group/your-project/badges/main/pipeline.svg)](https://gitlab.com/your-group/your-project/-/pipelines)  
[![Terraform](https://img.shields.io/badge/terraform-%235835CC?logo=terraform&logoColor=white)](https://www.terraform.io)  
[![Kubernetes](https://img.shields.io/badge/kubernetes-%23326CE5?logo=kubernetes&logoColor=white)](https://kubernetes.io)

## Executive Summary

- **Project:** DevOps Capstone 2026
- **Institution:** Maroc Ynov Campus
- **Author:** Ahmed El Marrouni
- **Scenario:** Campus Market

This repository houses the infrastructure and continuous delivery system for a cloud-native platform. **The primary objective of this repository is not software feature development.** It serves as a comprehensive demonstration of enterprise DevOps practices, including Continuous Integration (GitLab CI), Infrastructure as Code (Terraform), container orchestration (Kubernetes), and GitOps delivery (ArgoCD).

### Attribution

The underlying application architecture is a modernized fork of the RealWorld Conduit project.

- Original Copyright (c) 2020 [GoThinkster](https://github.com/GoThinkster) and [wangzitian0](https://github.com/wangzitian0).
- Source code retains original MIT License notices.

---

## Architectural Layout

```text
.
├── .gitlab-ci.yml                 # 5-stage automated CI pipeline
├── CONTRIBUTING.md                # Trunk-Based Development & SemVer standards
├── docker-compose.yml             # Local development environment
├── BE/                            # Go/Gin Backend (PostgreSQL + SQLite fallback)
├── FE/                            # React 18 / Vite Frontend
├── infrastructure/                # Terraform Infrastructure as Code
│   ├── modules/aks/               # AKS Resource Definitions (RBAC, Managed Identity)
│   └── environments/dev/          # Azure Remote State & Environment Instantiation
└── k8s/dev/                       # Kubernetes Manifests & ArgoCD Application CRDs
```

---

## Development & Deployment Timeline

This section tracks the chronological modernization and deployment of the platform.

### [2026-04-14] Phase 0: Application Modernization & Monorepo Consolidation

- **Frontend Overhaul:** Deprecated legacy Create-React-App build system. Migrated to Vite with React 18, resolving severe `http_parser` node module incompatibilities.
- **Backend Refactoring:** Updated `common/database.go` to dynamically utilize `gorm.io/driver/postgres` via environment variables (`POSTGRES_USER`, `POSTGRES_HOST`), retaining SQLite fallback for local development.
- **Consolidation:** Stripped disparate `.git` histories from `FE/` and `BE/` and established a clean monorepo architecture.

### [2026-04-15] Phase 1: CI/CD Pipeline & DevSecOps Strategy

- **Branching Strategy:** Enforced Trunk-Based Development documented in `CONTRIBUTING.md`.
- **Pipeline Implementation:** Engineered a 5-stage GitLab CI pipeline (`.gitlab-ci.yml`).
  - _Validate:_ ESLint (Frontend) & Golangci-lint (Backend).
  - _Test:_ Go coverage profiling and Vite build validation.
  - _Build:_ Docker-in-Docker (DinD) image compilation via `.tar` artifacts.
  - _Security (Shift-Left):_ Integrated `gosec` (SAST) and `Trivy` (Container Scanning). Pipeline strictly configured to fail on `CRITICAL` vulnerabilities.
  - _Publish:_ Automated push to remote container registry.

### [2026-04-16] Phase 2: Infrastructure as Code (Terraform)

- **Modularity:** Abstracted Azure Kubernetes Service (AKS) into a reusable Terraform module (`infrastructure/modules/aks`).
- **State Management:** Implemented remote state locking utilizing Azure Storage Accounts (`backend "azurerm"`).
- **Security:** Enforced Kubernetes Role-Based Access Control (`role_based_access_control_enabled = true`) and System-Assigned Managed Identities.

### [2026-04-16] Phase 3: Kubernetes Orchestration & GitOps

- **Stateful Architecture:** Authored PVCs and Secrets for a highly available PostgreSQL deployment, replacing the ephemeral SQLite database.
- **Stateless Deployments:** Engineered Deployments and ClusterIP Services for the Go API and React Frontend, including Liveness/Readiness probes (`/api/ping/`).
- **Continuous Delivery:** Configured the baseline ArgoCD `Application` CRD mapping the repository to the `campus-market-dev` namespace with automated self-healing.

---

## License

This project is licensed under the MIT License - see the `LICENSE.md` file for details.

```

```
