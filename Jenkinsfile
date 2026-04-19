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
                }
            }
        }
    }
}
