import { handleError } from "@libs/api-gateway";
import ApiGatewayManagementApi from "aws-sdk/clients/apigatewaymanagementapi";

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

  // Get connection info
  try {
    connectionInfo = await callbackAPI
      .getConnection({ ConnectionId: event.requestContext.connectionId })
      .promise();
  } catch (e) {
    console.log(e);
  }

  connectionInfo.connectionID = connectionId;

  // Send connection info to client
  try {
    await callbackAPI
      .postToConnection({
        ConnectionId: event.requestContext.connectionId,
        Data:
          "Use the sendmessage route to send a message. Your info:" +
          JSON.stringify(connectionInfo),
      })
      .promise();
  } catch (e) {
    handleError(e);
  }

  return {
    statusCode: 200,
  };
};

export const main = defaultHandler;
