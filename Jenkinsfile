pipeline {
    agent any

    environment {
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
                        docker { image 'golang:1.26-alpine' }
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
                docker { 
                    image 'securego/gosec:latest' 
                    args '--entrypoint=""'
                }
            }
            steps {
                dir('BE') {
                    sh 'gosec -fmt=json -out=gosec-results.json ./... || true'
                }
            }
        }
        stage('Build Container Images') {
            steps {
                script {
                    sh "docker build -t ${IMAGE_BACKEND}:${VERSION} ./BE"
                    sh "docker build -t ${IMAGE_FRONTEND}:${VERSION} ./FE"
                }
            }
        }

        stage('Vulnerability Scan (Trivy)') {
            agent {
                docker { 
                    image 'aquasec/trivy:latest'
                    args  '-v /var/run/docker.sock:/var/run/docker.sock --entrypoint=""'
                }
            }
            steps {
                sh "trivy image --severity CRITICAL --exit-code 0 ${IMAGE_BACKEND}:${VERSION}"
                sh "trivy image --severity CRITICAL --exit-code 0 ${IMAGE_FRONTEND}:${VERSION}"
            }
        }

        stage('Publish to Registry') {
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
        success {
            echo "Pipeline completed successfully! Ready for presentation."
        }
        failure {
            echo "Pipeline failed! Check the logs."
        }
    }
}