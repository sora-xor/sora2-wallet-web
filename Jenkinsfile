@Library('jenkins-library') _

def pipeline = new org.js.LibPipeline(
    steps: this,
    sonarProjectName: 'sora2-wallet-web',
    sonarProjectKey: 'sora2:sora2-wallet-web',
    buildDockerImage: 'build-tools/node:16-ubuntu',
    secretScannerExclusion: '.*env.json',
    sonarSrcPath: 'src',
    sonarTestsPath: 'tests',
    dojoProductType: 'sora'
)

pipeline.runPipeline()
