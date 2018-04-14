try { 
    timeout(time: 30, unit: 'MINUTES') { 
        node('nodejs') { 
            stage('Construction (test)') { 
                openshiftBuild(buildConfig: 'bot-test', showBuildLogs: 'true'); 
                openshiftBuild(buildConfig: 'api-test', showBuildLogs: 'true'); 
                openshiftBuild(buildConfig: 'www-test', showBuildLogs: 'true'); 
            }; 
            stage('Construction (prod)') { 
                openshiftBuild(buildConfig: 'bot-prod', showBuildLogs: 'true'); 
                openshiftBuild(buildConfig: 'api-prod', showBuildLogs: 'true'); 
                openshiftBuild(buildConfig: 'www-prod', showBuildLogs: 'true');
            };
            stage('Deploiement (test)') { 
                openshiftDeploy(deploymentConfig: 'bot-test'); 
                openshiftDeploy(deploymentConfig: 'api-test'); 
                openshiftDeploy(deploymentConfig: 'www-test'); 
            }; 
            stage('Approbation'){ 
                input 'Valider le test et lancer le déploiement en production ?'; 
            };
            stage('Deploiement (prod)') { 
                openshiftDeploy(deploymentConfig: 'bot-prod'); 
                openshiftDeploy(deploymentConfig: 'api-prod'); 
                openshiftDeploy(deploymentConfig: 'www-prod');
            }; 
        } 
    } 
} 
catch (err) { 
    echo "in catch block"; 
    echo "Caught: ${err}"; 
    currentBuild.result = 'FAILURE';  
    throw err; 
}
