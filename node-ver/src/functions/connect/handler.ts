import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse, handleError } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import DynamoDB from "aws-sdk/clients/dynamodb";
import type { PutItemInput, PutItemOutput } from "aws-sdk/clients/dynamodb";

const connect: ValidatedEventAPIGatewayProxyEvent<void> = async (event) => {
  console.log("connect handler called");

  const ddb = new DynamoDB.DocumentClient();

  const putParams: PutItemInput = {
    TableName: process.env.DB_TABLE_NAME,
    Item: {
      connectionId: event.requestContext.connectionId as any,
    },
  };

  let result: PutItemOutput;
  try {
    result = await ddb.put(putParams).promise();
  } catch (err) {
    handleError(err);
  }

  return formatJSONResponse({});
};

export const main = middyfy(connect);
