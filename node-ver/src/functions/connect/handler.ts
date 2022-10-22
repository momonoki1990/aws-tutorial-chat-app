import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse, handleError } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import DynamoDB from "aws-sdk/clients/dynamodb";

const connect: ValidatedEventAPIGatewayProxyEvent<void> = async (event) => {
  const ddb = new DynamoDB.DocumentClient();
  const putParams = {
    TableName: process.env.DB_TABLE_NAME,
    Item: {
      connectionId: String(Math.random() * 99999),
    },
  };
  const result = await ddb
    .put(putParams)
    .promise()
    .catch((err) => {
      return handleError(err);
    });

  console.log({ result });

  const scanParams = {
    TableName: process.env.DB_TABLE_NAME,
  };

  const data = await ddb
    .scan(scanParams)
    .promise()
    .catch((err) => {
      return handleError(err);
    });

  return formatJSONResponse({
    message: `Hello connect, welcome to the exciting Serverless world!`,
    data,
  });
};

export const main = middyfy(connect);
