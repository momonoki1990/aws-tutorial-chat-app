import type { AWS } from "@serverless/typescript";

import connect from "@functions/connect";
import disconnect from "@functions/disconnect";
import defaultHandler from "@functions/default-handler";
import hello from "@functions/hello";

const serverlessConfiguration: AWS = {
  service: "chat-app-node",
  frameworkVersion: "3",
  plugins: ["serverless-esbuild"],
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
      DB_TABLE_NAME: "${env:DB_TABLE_PREFIX}-${env:APP_STAGE}",
    },
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: [
              "dynamodb:Get*",
              "dynamodb:Query",
              "dynamodb:Scan",
              "dynamodb:Delete*",
              "dynamodb:Update*",
              "dynamodb:PutItem",
            ],
            Resource: [{ "Fn::GetAtt": ["connectionsTable", "Arn"] }],
          },
        ],
      },
    },
  },
  resources: {
    Resources: {
      // Table for recording connectionId
      connectionsTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: "${env:DB_TABLE_PREFIX}-${env:APP_STAGE}",
          KeySchema: [
            {
              AttributeName: "connectionId",
              KeyType: "HASH",
            },
          ],
          AttributeDefinitions: [
            { AttributeName: "connectionId", AttributeType: "S" },
          ],
          // NOTE: for on demand capacity, not provisioned
          BillingMode: "PAY_PER_REQUEST",
        },
        UpdateReplacePolicy: "Delete",
        DeletionPolicy: "Delete",
      },
    },
  },
  // import the function via paths
  functions: { connect, disconnect, defaultHandler, hello },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node14",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
  },
  useDotenv: true,
};

module.exports = serverlessConfiguration;
