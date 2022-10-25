import { formatJSONResponse, handleError } from "@libs/api-gateway";
import DynamoDB from "aws-sdk/clients/dynamodb";
import type { PutItemInput, PutItemOutput } from "aws-sdk/clients/dynamodb";
import ApiGatewayManagementApi from "aws-sdk/clients/apigatewaymanagementapi";

const ddb = new DynamoDB.DocumentClient();

const sendMessage = async (event) => {
  console.log("sendMessage has been called");
  // get current connections
  let connections;
  try {
    connections = await ddb
      .scan({ TableName: process.env.DB_TABLE_NAME })
      .promise();
  } catch (err) {
    return handleError(err);
  }

  const callbackAPI = new ApiGatewayManagementApi({
    apiVersion: "2018-11-29",
    endpoint:
      event.requestContext.domainName + "/" + event.requestContext.stage,
  });

  const message = JSON.parse(event.body).message;
  console.log(`Received message: ${message}`);

  // send message to all clients
  const sendMessages = connections.Items.map(async ({ connectionId }) => {
    if (connectionId !== event.requestContext.connectionId) {
      try {
        await callbackAPI
          .postToConnection({ ConnectionId: connectionId, Data: message })
          .promise();
      } catch (e) {
        console.log(e);
      }
    }
  });

  try {
    await Promise.all(sendMessages);
  } catch (err) {
    return handleError(err);
  }

  return { statusCode: 200 };
};

export const main = sendMessage;
