exports.handler = async (event, context) => {
  console.log('updated!')
  console.log(JSON.stringify(event))

  context.succeed({
    statusCode: 200,
    body: { success: true }
  })
}
