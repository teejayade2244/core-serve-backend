pipeline {
    agent any 
    tools {
        nodejs "Nodejs-22-6-0"
    }
    options {
       disableConcurrentBuilds abortPrevious: true
    }

    environment {
        AWS_REGION = credentials('AWS-REGION')
        ECR_REPO_NAME = 'core-serve-backend-app'
        BRANCH_NAME_CLEAN = sh(script: "echo ${BRANCH_NAME} | tr '/' '-'", returnStdout: true).trim()
        AWS_ACCOUNT_ID = credentials('AWS-account-id')
        IMAGE_TAG = "${ECR_REPO_NAME}:${BRANCH_NAME_CLEAN}-${BUILD_NUMBER}"
        TAG = "${BRANCH_NAME_CLEAN}-${BUILD_NUMBER}"
        DOCKER_IMAGE_NAME = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${IMAGE_TAG}"
        GITHUB_TOKEN = credentials('Github account token')
        EC2_HOST = credentials('AWS-EC2-HOST')
        PORT = credentials('port-number')
    }
    
    stages {
        // Clean the workspace before starting the pipeline
        stage('clean workspace') {
            steps {
                script {
                    echo "Cleaning workspace.."
                    deleteDir()
                }
            }
        }

        // Checkout the code from GitHub
        stage('checkout') {
            steps {
               checkout scmGit(branches: [[name: '*/main']], extensions: [], userRemoteConfigs: [[url: 'https://github.com/teejayade2244/core-serve-backend.git']])
            }
        }

        // Dependencies installation
        stage("Install node-js dependencies") {
            steps {
                script {
                    if (env.BRANCH_NAME.contains("PR-")) {
                        echo "This is a PR branch... Cleaning workspace before yarn install"
                        sh 'rm -rf node_modules yarn.lock' // Clean the workspace first
                    }
                }
                 sh "yarn install --no-audit"
            }
        }

        // dependencies scanning
        stage("Dependency Check scanning") {
            parallel {
                stage("OWASP Dependency Check") { 
                    steps {
                        sh 'mkdir -p OWASP-security-reports'
                        // Run OWASP Dependency Check scan with specific arguments
                        withCredentials([string(credentialsId: 'NVD-API-KEY', variable: 'NVD_API_KEY')]) {
                                dependencyCheck additionalArguments: '''
                                    --scan "." \
                                    --out "OWASP-security-reports" \
                                    --disableYarnAudit \
                                    --format \'ALL\' \
                                    --prettyPrint \
                                    --nvdApiKey '${NVD_API_KEY}' \
                                ''', odcInstallation: 'OWAPS-Depend-check'
                         }
                        // Publish the Dependency Check report and fail the build if critical issues are found
                        dependencyCheckPublisher failedTotalCritical: 2, pattern: 'OWASP-security-reports/dependency-check-report.xml', stopBuild: true
                    }
                }
            }
        }

        // unit testing
        // stage("Unit Testing stage") {
        //     steps {
        //         // Run unit tests with yarn
        //         sh 'mkdir -p test-results'
        //         sh "yarn test __tests__/metrics.test.js --verbose"
        //     } 
        // }

        // static testing and analysis with SonarQube
        stage("Static Testing and Analysis with SonarQube") {
            environment {
                    SONAR_SCANNER_HOME = tool 'sonarqube-scanner-6.1.0.477'
                }
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    withSonarQubeEnv('sonarqube-server') {
                        // Run SonarQube scanner with specific parameters
                        sh '''
                            ${SONAR_SCANNER_HOME}/bin/sonar-scanner \
                            -Dsonar.projectKey=Serve-core-backend \
                            -Dsonar.sources=. \
                        '''
                    }
                }
                // Wait for SonarQube quality gate and fail the pipeline if it's not OK
                waitForQualityGate abortPipeline: true
            }
        }

        // login to ECR
        stage("Image Build and Tag") {
            steps {
                script {
                    sh 'aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com'
                    sh 'docker build -t ${IMAGE_TAG} .'
                    sh 'docker tag ${IMAGE_TAG} ${DOCKER_IMAGE_NAME}'
                }       
            }
        }

        // scan the image for vulnerabilities before pushing to resgistry
        stage("Trivy Vulnerability scan") {
            steps {
                sh 'mkdir -p Trivy-Image-Reports'
                sh '''
                    trivy image ${DOCKER_IMAGE_NAME} \
                    --severity LOW,MEDIUM \
                    --exit-code 0 \
                    --quiet \
                    --format json -o Trivy-Image-Reports/trivy-image-MEDIUM-results.json 

                    trivy image ${DOCKER_IMAGE_NAME} \
                    --severity CRITICAL \
                    --exit-code 1 \
                    --quiet \
                    --format json -o Trivy-Image-Reports/trivy-image-CRITICAL-results.json 
                '''
            }
            post {
                always {
                    // Convert the json reports to HTML and XML formats
                    sh '''
                        trivy convert \
                            --format template --template "@/usr/local/share/trivy/templates/html.tpl" \
                            --output Trivy-Image-Reports/trivy-image-MEDIUM-results.html Trivy-Image-Reports/trivy-image-MEDIUM-results.json  
                    
                        trivy convert \
                            --format template --template "@/usr/local/share/trivy/templates/html.tpl" \
                            --output Trivy-Image-Reports/trivy-image-CRITICAL-results.html Trivy-Image-Reports/trivy-image-CRITICAL-results.json

                        trivy convert \
                            --format template --template "@/usr/local/share/trivy/templates/junit.tpl" \
                            --output Trivy-Image-Reports/trivy-image-MEDIUM-results.xml Trivy-Image-Reports/trivy-image-MEDIUM-results.json  

                        trivy convert \
                            --format template --template "@/usr/local/share/trivy/templates/junit.tpl" \
                            --output Trivy-Image-Reports/trivy-image-CRITICAL-results.xml Trivy-Image-Reports/trivy-image-CRITICAL-results.json    
                    '''
                }
            }
        }

        // Push image to AWS ECR
        stage("Push to AWS-ECR") {
            steps {
               script {
                    sh 'aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com'
                    sh "echo ${DOCKER_IMAGE_NAME}"
                    sh 'docker push ${DOCKER_IMAGE_NAME}' 
                }
            }
        }
        
        // Update the image tag in the Kubernetes deployment file GitOps repository
        stage('K8S Update Image Tag') {
            when {
                branch 'PR*'
            }
            steps {
                script {
                    // Clone the GitOps repository
                    sh '''
                        git clone -b main https://github.com/teejayade2244/GitOps-Terraform-Iac-and-Kubernetes-manifests-Core-Serve-App.git
                    '''

                    // Navigate to the Kubernetes directory
                    dir("GitOps-Terraform-Iac-and-Kubernetes-manifests-Core-Serve-App/Helm/core-serve-backend/values") {
                        sh '''
                            ls -la
                            git checkout -b feature-$TAG
                            
                            # Update only the tag in staging.yaml
                            sed -i "s/tag:.*\$/tag: ${TAG}/" staging.yaml
                            
                            # Verify the changes
                            cat staging.yaml
                        '''

                        // Commit and push the changes to the feature branch
                        withCredentials([string(credentialsId: 'Github account token', variable: 'GITHUB_TOKEN')]) {
                            sh '''
                                git config --global user.email "temitope224468@gmail.com"
                                git remote set-url origin https://${GITHUB_TOKEN}@github.com/teejayade2244/GitOps-Terraform-Iac-and-Kubernetes-manifests-Core-Serve-App.git
                                git add staging.yaml
                                git commit -m "Updated image tag to ${TAG} in staging environment"
                                git push -u origin feature-$TAG
                            '''
                        }
                    }
                }
            }
        }

        // Create a Pull Request in GitOps repository
        stage('GitHub - Raise PR') {
            when {
                branch 'PR*'  // Runs when a feature branch is pushed
            }
            steps {
                script {
                    try {
                    // Attempt to create a PR
                    sh '''
                        curl -X POST https://api.github.com/repos/teejayade2244/GitOps-Terraform-Iac-and-Kubernetes-manifests-Core-Serve-App/pulls \
                        -H "Authorization: Bearer ${GITHUB_TOKEN}" \
                        -H "Accept: application/vnd.github.v3+json" \
                        -H "Content-Type: application/json" \
                        -d '{
                            "title": "Updated Docker Image to '"${IMAGE_TAG}"'",
                            "body": "Updated Docker Image in staging manifest",
                            "head": "feature-'"${TAG}"'",
                            "base": "main",
                            "assignees": ["teejayade2244"]
                        }'
                    '''
                    } catch (Exception e) {
                        // Handle the error
                        echo "Failed to create PR: ${e}"
                        // Optionally, fail the pipeline or take other actions
                        currentBuild.result = 'FAILURE'
                    }
                }
            }
        }

        // Upload build reports to AWS S3
        stage('Upload Build reports to AWS s3') {
            when {
                branch 'PR*'  
            }
            steps {
               sh '''
                 mkdir -p reports-${TAG}
                 cp -r  Trivy-Image-Reports reports-${TAG}
                 ls -ltr reports-${TAG}
               '''
               s3Upload(file:"reports-${TAG}", bucket:'jenkins-build-reports-core-serve-backend', path:"Jenkins-${TAG}-reports/")
               
               
               script {
                  // Clean up the reports directory after upload
                  sh 'rm -rf reports-${TAG}'
               }
            }
        }

        // Run DAST scan using OWASP ZAP on main branch
        stage('DSAT') {
            when {
                branch 'main'  // Runs when a feature branch is pushed
            }
            steps {
                script {
                    sh 'mkdir -p ZAP-reports && chmod 777 ZAP-reports'
                    try {
                    // Run ZAP full scan with proper volume mounting
                        sh '''
                            docker run --rm \
                                -v $(pwd)/ZAP-reports:/zap/wrk/:rw \
                                -e ZAP_JVM_OPTIONS="-Xmx4g" \
                                ghcr.io/zaproxy/zaproxy:stable \
                                zap-full-scan.py \
                                -t http://k8s-staging-coreserv-0b883551de-1001476474.eu-west-2.elb.amazonaws.com/api \
                                -g gen.conf \
                                -I \
                                -r DAST-report.html \
                                -J DAST-report.json \
                                -x DAST-report.xml \
                                --hook=/zap/auth_hook.py \
                                -d
                        '''
                    } catch (Exception e) {
                        echo "DAST Scan failed: ${e.getMessage()}"  
                        // Continue pipeline but mark build as unstable
                        currentBuild.result = 'FAILED'
                    }
                       archiveArtifacts artifacts: 'ZAP-reports/DAST-report.*', allowEmptyArchive: true
                       sh 'cp -r  ZAP-reports reports-${TAG}'
                       s3Upload(file:"reports-${TAG}", bucket:'jenkins-build-reports-core-serve-backend', path:"Jenkins-${TAG}-reports/")
                }
            }
        }
        
        // Update the image tag in the Kubernetes deployment file for production
        stage('K8S Update Image Tag In prod.yaml') {
            when {
                branch 'main'
            }
            steps {
                script {
                    // Clone the GitOps repository
                    sh '''
                        git clone -b main https://github.com/teejayade2244/GitOps-Terraform-Iac-and-Kubernetes-manifests-Core-Serve-App.git
                    '''

                    // Navigate to the Kubernetes directory
                    dir("GitOps-Terraform-Iac-and-Kubernetes-manifests-Core-Serve-App/Helm/core-serve-backend/values") {
                        sh '''
                            ls -la
                            # Directly update the tag in prod.yaml on the main branch
                            sed -i "s/tag:.*\$/tag: ${TAG}/" prod.yaml
                            
                            # Verify the changes
                            cat prod.yaml
                        '''

                        // Commit and push the changes directly to the main branch
                        withCredentials([string(credentialsId: 'Github account token', variable: 'GITHUB_TOKEN')]) {
                            sh '''
                                git config --global user.email "temitope224468@gmail.com"
                                git remote set-url origin https://${GITHUB_TOKEN}@github.com/teejayade2244/GitOps-Terraform-Iac-and-Kubernetes-manifests-Core-Serve-App.git
                                git add prod.yaml
                                git commit -m "Updated image tag to ${TAG} in prod environment"
                                git push origin main
                            '''
                        }
                    }
                }
            }
        }

        // Deploy to production using ArgoCD
        stage('Production') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo "Production deployment initiated. ArgoCD will sync changes from the GitOps repository's main branch."
                }
            }
        }
    }
       
    // post actions.
        post {
          always {
              script {
                 if (fileExists("GitOps-Terraform-Iac-and-Kubernetes-manifests-Core-Serve-App")) {
                    sh 'rm -rf GitOps-Terraform-Iac-and-Kubernetes-manifests-Core-Serve-App'
                 }
              }
         
              // Publish JUnit test results, even if they are empty
              junit allowEmptyResults: true, testResults: '**/test-results/junit.xml, **/dependency-check-junit.xml, **/trivy-image-CRITICAL-results.xml, **/trivy-image-MEDIUM-results.xml'   
              
              // Publish the Dependency Check HTML report
              publishHTML([
                  allowMissing: true, 
                  alwaysLinkToLastBuild: true, 
                  keepAll: true, 
                  reportDir: './OWASP-security-reports', 
                  reportFiles: 'dependency-check-report.html', 
                  reportName: 'Dependency check HTML Report', 
                  reportTitles: '', 
                  useWrapperFileDirectly: true
              ])

              // Publish Trivy HTML reports with correct filenames
              publishHTML([
                  allowMissing: true, 
                  alwaysLinkToLastBuild: true, 
                  keepAll: true, 
                  reportDir: './Trivy-Image-Reports', 
                  reportFiles: 'trivy-image-CRITICAL-results.html', 
                  reportName: 'Trivy Scan Critical Vulnerabilities', 
                  reportTitles: '', 
                  useWrapperFileDirectly: true
              ])

              publishHTML([
                  allowMissing: true, 
                  alwaysLinkToLastBuild: true, 
                  keepAll: true, 
                  reportDir: './Trivy-Image-Reports', 
                  reportFiles: 'trivy-image-MEDIUM-results.html', 
                  reportName: 'Trivy Scan Medium Vulnerabilities', 
                  reportTitles: '', 
                  useWrapperFileDirectly: true
              ])

              publishHTML([
                  allowMissing: true, 
                  alwaysLinkToLastBuild: true, 
                  keepAll: true, 
                  reportDir: './ZAP-reports', 
                  reportFiles: 'DAST-report.html ', 
                  reportName: 'DAST Vulnerabilities', 
                  reportTitles: '', 
                  useWrapperFileDirectly: true
              ])
          }
       }
}
