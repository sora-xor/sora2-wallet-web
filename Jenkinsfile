@Library('jenkins-library' ) _

def pipeline = new org.js.LibPipeline(
    steps: this,
    sonarProjectName: 'sora2-wallet-web',
    sonarProjectKey: 'jp.co.soramitsu:sora2-wallet-web',
    buildDockerImage: 'build-tools/node:14-ubuntu-cypress',
    secretScannerExclusion: '.*env.json')
pipeline.runPipeline()
