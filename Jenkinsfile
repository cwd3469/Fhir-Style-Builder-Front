pipeline {
    agent any

    stages {
        stage('Clone') {
            steps {
                git branch: 'main',
                    url: 'git@github.com:cwd3469/Fhir-Style-Builder-Front.git'
            }
        }

        stage('Prepare') {
            steps {
                // Next.js .env 주입
                withCredentials([file(credentialsId: 'fhir-env-file-front-product', variable: 'ENV_FILE')]) {
                    sh 'cp $ENV_FILE $WORKSPACE/.env'
                }
            }
        }

        stage('Deploy') {
            steps {
                sh 'docker-compose down'
                sh 'docker-compose up -d --build'
            }
        }
    }

    post {
        success {
            echo '프론트 배포 성공'
        }
        failure {
            echo '프론트 배포 실패'
        }
    }
}
