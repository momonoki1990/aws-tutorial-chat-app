import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse, handleError } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import DynamoDB from "aws-sdk/clients/dynamodb";
import type {
  DeleteItemInput,
  DeleteItemOutput,
} from "aws-sdk/clients/dynamodb";

const disconnect: ValidatedEventAPIGatewayProxyEvent<void> = async (event) => {
  console.log("disconnect handler called");

  const ddb = new DynamoDB.DocumentClient();

  const deleteParams: DeleteItemInput = {
    TableName: process.env.DB_TABLE_NAME,
    Key: {
      connectionId: event.requestContext.connectionId as any,
    },
    ReturnValues: "ALL_OLD",
  };

  let result: DeleteItemOutput;
  try {
    result = await ddb.delete(deleteParams).promise();
  } catch (err) {
    return handleError(err);
  }

  console.log(result);

  return formatJSONResponse({});
};

export const main = middyfy(disconnect);
