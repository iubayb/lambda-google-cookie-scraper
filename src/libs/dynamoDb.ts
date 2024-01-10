
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

const dynamoDbClient = new DynamoDBClient({
  region: process.env.AWS_REGION as string,
});

export default DynamoDBDocument.from(dynamoDbClient);