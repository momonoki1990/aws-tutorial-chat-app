import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse, handleError } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import ApiGatewayManagementApi from "aws-sdk/clients/apigatewaymanagementapi";

// const defaultHandler: ValidatedEventAPIGatewayProxyEvent = async (event) => {
const defaultHandler = async (event) => {
  console.log("defaultHandler has been called");

  let connectionInfo;
  let connectionId = event.requestContext.connectionId;

  // ApiGatewayManagementApi instace for getting connection info and sending message to client
  const callbackAPI = new ApiGatewayManagementApi({
    apiVersion: "2018-11-29",
    endpoint:
      event.requestContext.domainName + "/" + event.requestContext.stage,
  });

  try {
    connectionInfo = await callbackAPI
      .getConnection({ ConnectionId: event.requestContext.connectionId })
      .promise();
  } catch (e) {
    console.log(e);
  }

  connectionInfo.connectionID = connectionId;

  await callbackAPI
    .postToConnection({
      ConnectionId: event.requestContext.connectionId,
      Data:
        "Use the sendmessage route to send a message. Your info:" +
        JSON.stringify(connectionInfo),
    })
    .promise();

  return {
    statusCode: 200,
  };
};

// export const main = middyfy(defaultHandler);
export const main = defaultHandler;
