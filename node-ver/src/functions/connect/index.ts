import { handlerPath } from "@libs/handler-resolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: "get",
        path: "connect",
      },
    },
  ],
  environment: {
    DB_TABLE_NAME: "${env:DB_TABLE_PREFIX}-${env:APP_STAGE}",
  },
};
