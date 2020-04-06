require('dotenv').config()

const _ = require('lodash')
const { exec } = require('child_process')
const { performance } = require('perf_hooks')

const build = () => {
  const command = 'docker build -t aws-lambda-nodejs10.x-test . && docker run --rm -v \"$PWD\":/var/task aws-lambda-nodejs10.x-test:latest'
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (err) {
        reject(err)
      }
      resolve(stdout)
    })
  })
}

const get = () => {
  const command = `aws lambda get-function --function-name ${process.env.FUNCTION_NAME}`
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (err) {
        reject(err)
      }
      resolve(stdout)
    })
  })
}

const create = () => {
  const options = {
    'function-name': process.env.FUNCTION_NAME,
    'zip-file': 'fileb://deploy_package.zip',
    'handler': 'src/index.handler',
    'runtime': 'nodejs10.x',
    'timeout': 60,
    'memory-size': 1024,
    'role': process.env.AWS_ROLE_ARN,
  }
  const optionsStr = _.map(options, (v, k) => `--${k} ${v}`).join(' ')
  const command = `aws lambda create-function ${optionsStr}`
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (err) {
        reject(err)
      }
      resolve(stdout)
    })
  })
}

const update = () => {
  const options = {
    'function-name': process.env.FUNCTION_NAME,
    'zip-file': 'fileb://deploy_package.zip',
  }
  const optionsStr = _.map(options, (v, k) => `--${k} ${v}`).join(' ')
  const command = `aws lambda update-function-code ${optionsStr}`
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (err) {
        reject(err)
      }
      resolve(stdout)
    })
  })
}

const main = async () => {
  console.log('run')
  const beginTime = performance.now()

  console.log('build started...')
  await build()
  console.log('build finished')

  console.log('deploy started...')
  
  let alreadyExistsFunction = true
  try {
    await get()
  } catch (err) {
    alreadyExistsFunction = false
  }
  
  if (alreadyExistsFunction) {
    await update()
    console.log('function updated')
  } else {
    await create()
    console.log('function created')
  }
  
  console.log('deploy finished')

  const endTime = performance.now()
  console.log(`done: ${Math.round(endTime - beginTime) / 1000}s`)
}

main()
