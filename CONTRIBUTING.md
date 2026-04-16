# Contributing Guidelines and Git Strategy

Welcome to the **Conduit RealWorld** modernization project. As part of our DevOps transformation and shift toward Kubernetes/GitOps paradigms, we employ a strict Git workflow.

## Version Control Strategy: Trunk-Based Development 🌲

To reduce merge conflicts and ensure continuous integration, this repository utilizes **Trunk-Based Development**.

### Core Principles
1. **The `main` branch is the single source of truth.** It is considered always deployable.
2. **Short-lived Feature Branches.** Developers check out short-lived feature branches, make localized changes, and merge them back into `main` as quickly as possible (ideally multiple times a day).
3. **No Long-Lived Branches.** We do not maintain long-running branches like `development` or `staging`. Continuous integration ensures that what merges into `main` is validated and secure.
4. **Merge/Pull Requests.** All commits to `main` must pass through a strict Pull/Merge Request requiring:
   - Green CI Pipeline validation.
   - Code review.

## Release Strategy: Semantic Versioning (SemVer) 🏷️

Instead of manually deploying to production, we use a fully automated release strategy driven by **Semantic Versioning**.

### How Deployments Work
1. **Continuous Deployment to Staging (Optional).** Every merged commit to `main` securely builds container images and pushes them tagged with the commit SHA. This provides a constant feed of validated images.
2. **Production Releases via Git Tags.** When the application is ready for a production release, a SemVer tag (e.g., `v1.0.0`, `v1.2.3`) is applied to the specific commit on the `main` branch.
3. **GitOps Trigger.** The CI pipeline detects the semantic tag, associates it with the built container image in the Container Registry, and publishes the image with the tag. 
4. **ArgoCD Sync.** In future infrastructure phases, ArgoCD monitors our GitOps repository. By updating the Kubernetes manifests to use the newly published semantic version (e.g. `image: registry.../backend:v1.0.0`), ArgoCD automatically synchronizes and deploys the new version securely to the Kubernetes cluster.

### Versioning Rules
- **MAJOR (`v1.x.x`)**: Incompatible API changes or major architectural overhauls.
- **MINOR (`vx.1.x`)**: Adding new functionality in a backward-compatible manner.
- **PATCH (`vx.x.1`)**: Backward-compatible bug fixes.
