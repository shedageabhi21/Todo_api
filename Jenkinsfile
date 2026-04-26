pipeline {
    agent any
    tools {
        nodejs 'Node-24'
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
                echo "Running the applicatino for 60 sec"
                sh "npm start &"
                sleep 60
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
