pipeline {
    agent any

    environment {
        // Change these to your actual registry details
        REGISTRY = "index.docker.io/v1/"
        DOCKER_CREDS_ID = "docker-hub-credentials"
        IMAGE_BACKEND = "aelmarrouni/conduit-backend"
        IMAGE_FRONTEND = "aelmarrouni/conduit-frontend"
        VERSION = "${env.BUILD_ID}"
    }

    stages {
        stage('Validate & Test') {
            parallel {
                stage('Backend CI') {
                    agent {
                        docker { image 'golang:1.22-alpine' }
                    }
                    steps {
                        sh 'apk add --no-cache gcc musl-dev'
                        dir('BE') {
                            sh 'go test -v ./... -coverprofile=coverage.out'
                            sh 'go tool cover -func=coverage.out'
                        }
                    }
                }

                stage('Frontend CI') {
                    agent {
                        docker { image 'node:20-alpine' }
                    }
                    steps {
                        dir('FE') {
                            sh 'npm ci'
                            sh 'npm run build'
                        }
                    }
                }
            }
        }

        stage('Security (SAST)') {
            agent {
                docker { image 'securego/gosec:v2.18.2' }
            }
            steps {
                dir('BE') {
                    // We allow this to fail without stopping the pipeline for now
                    sh 'gosec -fmt=json -out=gosec-results.json ./... || true'
                }
            }
        }

        stage('Build Container Images') {
            steps {
                script {
                    // Build using host docker daemon
                    sh "docker build -t ${IMAGE_BACKEND}:${VERSION} ./BE"
                    sh "docker build -t ${IMAGE_FRONTEND}:${VERSION} ./FE"
                }
            }
        }

        stage('Vulnerability Scan (Trivy)') {
            agent {
                docker { 
                    image 'aquasec/trivy:latest'
                    args  '-v /var/run/docker.sock:/var/run/docker.sock'
                }
            }
            steps {
                // Exit code 1 if CRITICAL vulnerabilities are found
                sh "trivy image --severity CRITICAL --exit-code 1 ${IMAGE_BACKEND}:${VERSION}"
                sh "trivy image --severity CRITICAL --exit-code 1 ${IMAGE_FRONTEND}:${VERSION}"
            }
        }

        stage('Publish to Registry') {
            when {
                branch 'main' // Only push images built from main branch
            }
            steps {
                script {
                    docker.withRegistry('', DOCKER_CREDS_ID) {
                        sh "docker tag ${IMAGE_BACKEND}:${VERSION} ${IMAGE_BACKEND}:latest"
                        sh "docker push ${IMAGE_BACKEND}:${VERSION}"
                        sh "docker push ${IMAGE_BACKEND}:latest"

                        sh "docker tag ${IMAGE_FRONTEND}:${VERSION} ${IMAGE_FRONTEND}:latest"
                        sh "docker push ${IMAGE_FRONTEND}:${VERSION}"
                        sh "docker push ${IMAGE_FRONTEND}:latest"
                    }
                }
            }
        }
    }

    post {
        always {
            // Clean up workspace to save disk space
            cleanWs()
        }
        failure {
            echo "Pipeline failed! Check the logs to see if it was a Test failure or a Security violation."
        }
    }
}