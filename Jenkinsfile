@Library('jenkins-library' ) _

def pipeline = new org.js.LibPipeline(
    steps: this,
    buildDockerImage: 'build-tools/node:14-ubuntu')
pipeline.runPipeline()
// https://docs.cypress.io/guides/continuous-integration/introduction#Dependencies