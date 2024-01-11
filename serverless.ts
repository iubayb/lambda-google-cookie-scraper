import type { AWS } from '@serverless/typescript';

import retrieveCookies from '@functions/retrieveCookies';
import scrapeGoogleSearch from '@functions/scrapeGoogleSearch';

const serverlessConfiguration: AWS = {
  service: 'lemn',
  frameworkVersion: '3',
  plugins: [
    'serverless-esbuild',
    'serverless-offline',
  ],
  provider: {
    name: 'aws',
    region: 'eu-central-1',
    runtime: 'nodejs20.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      COOKIES_TABLE: 'CookiesTable',
      SEARCH_RESULTS_TABLE: 'SearchResultsTable',
    },
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: [
              'dynamodb:PutItem',
              'dynamodb:GetItem',
              'dynamodb:DeleteItem',
              'dynamodb:UpdateItem',
              'dynamodb:Scan',
              'dynamodb:Query',
              'dynamodb:DescribeTable',
            ],
            Resource: [
              {
                'Fn::GetAtt': ['CookiesTable', 'Arn'],
              },
            ],
          },
        ],
      },
    },
  },
  functions: { retrieveCookies, scrapeGoogleSearch },
  package: {
    individually: true,
  },
  resources: {
    Resources: {
      CookiesTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: 'CookiesTable',
          AttributeDefinitions: [
            {
              AttributeName: 'username',
              AttributeType: 'S'
            }
          ],
          TimeToLiveSpecification: {
            AttributeName: 'expiry',
            Enabled: true
          },
          KeySchema: [
            {
              AttributeName: 'username',
              KeyType: 'HASH'
            }
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          }
        },
      },
      SearchResultsTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: 'SearchResultsTable',
          AttributeDefinitions: [
            {
              AttributeName: 'id',
              AttributeType: 'S'
            }
          ],
          KeySchema: [
            {
              AttributeName: 'id',
              KeyType: 'HASH'
            }
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          }
        },
      },
    },
  },
  custom: {
    esbuild: {
      bundle: true,
      minify: true,
      sourcemap: true,
      target: 'node20',
      define: { 'require.resolve': undefined },
      platform: 'node',
    },
  },
};

module.exports = serverlessConfiguration;
