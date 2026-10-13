pipeline {
    agent any
    tools {
        nodejs 'Node-24'
    }
    environment {
        JENKINS_NODE_COOKIE = 'dontKillMe'   // ✅ applies to entire pipeline
    }
    stages{
        stage("Checkout code"){
            steps{
                
            
                echo "Cheking out the code from the git repository"
                checkout scm
            }
            
        }
        stage("Install dependencies"){
            steps{
                echo "Installing dependencies"
                sh "npm install"
            }
        }
        stage("Lint tests"){
            steps{
                echo "Running the tests"
                sh "npm run lint"
            }
        }
        stage("Audit tests"){
            steps{
                echo "Run the security audit tests"
                sh "npm audit --audit-level=high"
            }
            
        }
        stage("OWASP Dependency Check"){
            steps{
                withCredentials([string(credentialsId: 'OWASP_Depcheck', variable: 'OWASP_KEY')]){
                    echo "Running OWASP Dependency Check"
                    dependencyCheck additionalArguments: '--scan ./ --format HTML --format XML --nvdApiKey $OWASP_KEY', odcInstallation: 'OWASP_depcheck'

                    dependencyCheckPublisher pattern: 'dependency-check-report.xml', stopBuild: true, unstableTotalCritical: 1

                    
                }
            }
        }
        stage("Unit tests"){
            steps{
                echo "Running the unit tests"
                sh "npm test"
                

            }
        }
        stage ("Check the application running for testing"){
            steps{
                input message: "Do you want to run the application for testing?", ok: "Run"
                echo "Checking the application is running with old code and kill it and re-run."
                script{
                    def portInUse = sh(script: 'lsof -t -i:3000', returnStatus: true)

                    if (portInUse == 0) {
                        // Port is in use — kill the old app
                        def oldPid = sh(script: 'lsof -t -i:3000', returnStdout: true).trim()
                        echo "Application is already running with PID: ${oldPid}"
                        sh 'kill -9 $(sudo lsof -t -i:3000)'
                        echo "Old application killed! PID was: ${oldPid}"
                        sleep 2
                    } else {
                        echo "No application running on port 3000"
                    }
                    echo "Starting application with new code..."
                    sh '''
                        nohup npm start > app.log 2>&1 &
                        APP_PID=$!
                        echo "Application started with PID: $APP_PID"
                        sleep 3
                        curl -f http://10.96.208.88:3000/ && echo "✅ App is running!"
                    '''
                }    
                
            }
        }
        
            
        
    }
    post{
        always{
            publishHTML([allowMissing: false, alwaysLinkToLastBuild: false, icon: '', keepAll: false, reportDir: './', reportFiles: 'dependency-check-report.html', reportName: 'dependency_check_HTML Report', reportTitles: '', useWrapperFileDirectly: true])

            junit allowEmptyResults: true, testResults: 'test-results/junit.xml'

            publishHTML([allowMissing: false, alwaysLinkToLastBuild: false, icon: '', keepAll: false, reportDir: 'coverage/lcov-report', reportFiles: 'index.html', reportName: 'Code_coverage_HTML Report', reportTitles: '', useWrapperFileDirectly: true])
        }
    }
}
