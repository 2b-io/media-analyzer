import AWS from 'aws-sdk'

AWS.config.update({
  region: 'us-west-2',
  endpoint: 'http://localhost:8000',
  accessKeyId: 'xxx',
  secretAccessKey: 'yyy'
})

const dynamodb = new AWS.DynamoDB()

const client = new AWS.DynamoDB.DocumentClient()

const describeTable = async (params) => {
  try {
    return await dynamodb.describeTable(params).promise()
  } catch (e) {
    return null
  }
}

const toUniqueString = obj => {

}

const movieSchema = {
  TableName: 'Movies',
  KeySchema: [
    { AttributeName: 'Year', KeyType: 'HASH' },
    { AttributeName: 'Title', KeyType: 'RANGE' }
  ],
  AttributeDefinitions: [
    { AttributeName: 'Year', AttributeType: 'N' },
    { AttributeName: 'Title', AttributeType: 'S' }
  ]
}

const execute = async (schema) => {
  try {
    // const info = await describeTable({
    //   TableName: schema.TableName
    // })

    // if (info) {
    //   // delete table
    //   console.log('delete table...')

    //   await dynamodb.deleteTable({
    //     TableName: schema.TableName
    //   }).promise()

    //   console.log('delete table... done')
    // }

    // console.log('create table...')

    // await dynamodb.createTable({
    //   ...schema,
    //   ProvisionedThroughput: {
    //     ReadCapacityUnits: 10,
    //     WriteCapacityUnits: 10
    //   }
    // }).promise()

    // console.log('create table... done')

    console.log('put item...')

    const item = await client.put({
      TableName: schema.TableName,
      Item: {
        Year: 2001,
        Title: 'The Matrix',
        Characters: [ 'Neo', 'Agent Smith', 'Morpheus' ]
      }
    }).promise()

    console.log('put item... done', item)

    console.log('query items...')

    const query = await client.query({
      TableName: schema.TableName,
      KeyConditionExpression: '#yr = :yyyy',
      ExpressionAttributeNames: {
        '#yr': 'Year'
      },
      ExpressionAttributeValues: {
        ':yyyy': 1999
      }
    }).promise()

    console.log('query items... done', query)

    console.log('scan items...')

    const scan = await client.scan({
      TableName: schema.TableName,
      FilterExpression: '#yr >= :this_year',
      ExpressionAttributeNames: {
        '#yr': 'Year'
      },
      ExpressionAttributeValues: {
        ':this_year': 1998
      }
    }).promise()

    console.log('scan items... done', scan.Items)

    const matrix = scan.Items[0]

    console.log(matrix)

  } catch (error) {
    console.log(error)
  }
}

execute(movieSchema)
