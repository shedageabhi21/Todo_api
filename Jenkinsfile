pipeline {
    agent any

    tools {
        nodejs 'Node-24'
    }

    options {
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }

    parameters {
        booleanParam(name: 'PUSH_IMAGE', defaultValue: false,
            description: 'Push the image to ECR and update the GitOps repo (enable once AWS is ready)')
        booleanParam(name: 'UPDATE_GITOPS', defaultValue: false,
            description: 'Commit the new image tag to the platform repo (needs helm/app/values.yaml and the deploy key)')
    }

    environment {
        IMAGE_NAME   = 'todo-api'
        AWS_REGION   = 'ap-south-1'
        ECR_REGISTRY = '216016752342.dkr.ecr.ap-south-1.amazonaws.com/'
        PLATFORM_REPO = 'git@github.com:shedageabhi21/devsecops-platform.git'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.IMAGE_TAG = sh(script: 'git rev-parse --short=8 HEAD', returnStdout: true).trim()
                }
                echo "Building ${IMAGE_NAME}:${IMAGE_TAG}"
            }
        }

        stage('Install dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Dependency audit') {
            steps {
                sh 'npm audit --audit-level=high'
            }
        }

        /* stage('OWASP Dependency-Check') {
            steps {
                withCredentials([string(credentialsId: 'OWASP_Depcheck', variable: 'OWASP_KEY')]) {
                    dependencyCheck additionalArguments: '--scan ./ --format HTML --format XML --nvdApiKey $OWASP_KEY',
                                    odcInstallation: 'OWASP_depcheck'
                    dependencyCheckPublisher pattern: 'dependency-check-report.xml',
                                             stopBuild: true, unstableTotalCritical: 1
                }
            }
        } */

        stage('Unit tests') {
            steps {
                sh 'npm test'
            }
        }

        stage('SonarQube analysis') {
            steps {
                // 'sonarqube' = server name and 'SonarScanner' = tool name in Manage Jenkins
                withSonarQubeEnv('Sonar-server') {
                    sh "/opt/sonar-scanner/bin/sonar-scanner"
                }
            }
        }

        stage('Quality gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Docker build') {
            steps {
                sh 'docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .'
            }
        }

        stage('Trivy image scan') {
            steps {
                // Fails the build on fixable HIGH/CRITICAL vulnerabilities
                sh '''
                    trivy image --exit-code 1 --severity HIGH,CRITICAL --ignore-unfixed \
                        ${IMAGE_NAME}:${IMAGE_TAG}
                '''
            }
        }

        stage('Push to ECR') {
            when { expression { params.PUSH_IMAGE } }
            steps {
                // Uses the Jenkins EC2 instance IAM role, so no AWS keys are stored
                sh '''
                    aws ecr get-login-password --region ${AWS_REGION} | \
                        docker login --username AWS --password-stdin ${ECR_REGISTRY}
                    docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${ECR_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}
                    docker push ${ECR_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}
                '''
            }
        }

        stage('Update GitOps repo') {
            when { expression { params.UPDATE_GITOPS } }
            steps {
                withCredentials([usernamePassword(credentialsId: 'Github_auth_token',
                                                  usernameVariable: 'GIT_USER',
                                                  passwordVariable: 'GIT_TOKEN')]) {
                    sh '''
                        # Credential helper reads the env vars, so the token never lands in a URL or .git/config
                        export GIT_TERMINAL_PROMPT=0
                        export GIT_CONFIG_COUNT=1
                        export GIT_CONFIG_KEY_0=credential.helper
                        export GIT_CONFIG_VALUE_0='!f() { echo "username=${GIT_USER}"; echo "password=${GIT_TOKEN}"; }; f'

                        rm -rf platform && git clone ${PLATFORM_REPO} platform
                        cd platform
                        sed -i "s|^  tag:.*|  tag: \\"${IMAGE_TAG}\\"|" helm/app/values.yaml
                        git config user.name "jenkins-bot"
                        git config user.email "jenkins-bot@users.noreply.github.com"
                        git add helm/app/values.yaml
                        git commit -m "ci: deploy ${IMAGE_NAME}:${IMAGE_TAG}" || echo "No change to commit"
                        git push origin main
                    '''
                }
            }
        }
    }

    post {
        always {
            junit allowEmptyResults: true, testResults: 'test-results/junit.xml'
            publishHTML([allowMissing: true, alwaysLinkToLastBuild: false, keepAll: false,
                reportDir: './', reportFiles: 'dependency-check-report.html',
                reportName: 'Dependency Check Report'])
            publishHTML([allowMissing: true, alwaysLinkToLastBuild: false, keepAll: false,
                reportDir: 'coverage/lcov-report', reportFiles: 'index.html',
                reportName: 'Code Coverage Report'])
            sh 'docker rmi ${IMAGE_NAME}:${IMAGE_TAG} || true'
        }
    }
}
