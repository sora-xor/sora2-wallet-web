@Library('jenkins-library' ) _

def pipeline = new org.js.LibPipeline(
    steps: this,
    buildDockerImage: 'build-tools/node:14-ubuntu-cypress')
pipeline.runPipeline()
