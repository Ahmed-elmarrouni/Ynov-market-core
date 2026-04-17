# Start from the official Jenkins LTS image
FROM jenkins/jenkins:lts

# Switch to root to install system packages
USER root

# Install the Docker CLI
RUN apt-get update && \
    apt-get install -y docker.io && \
    rm -rf /var/lib/apt/lists/*

