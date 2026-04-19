pipeline{
    agent any
    stages{
        stage("cheking the node version"){
            steps{
                
                sh 'node --version'
                sh 'npm --version'
                sh 'ip r'
                sh 'ls -lh'
                echo "checking the node version"
            }
            
        }
    }
    
}
