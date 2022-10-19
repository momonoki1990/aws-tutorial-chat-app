import type { AWS } from "@serverless/typescript";

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
    },
  },
  resources: {
    Resources: {
      // Table for recording connectionId
      connectionsTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          KeySchema: [
            {
              AttributeName: "connectionId",
              KeyType: "HASH",
            },
          ],
          AttributeDefinitions: [
            { AttributeName: "connectionId", AttributeType: "S" },
          ],
          // for on demand capacity, not provisioned
          BillingMode: "PAY_PER_REQUEST",
        },
        UpdateReplacePolicy: "Delete",
        DeletionPolicy: "Delete",
      },
    },
  },
  // import the function via paths
  functions: { hello },
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
};

module.exports = serverlessConfiguration;
