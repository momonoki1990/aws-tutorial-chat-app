# Chat App (using node)

This is serverless chat application enhanced by aws tutorial, using go

## Created by

This repository including serverless module locally by doing the following:

- npm init --yes
- npm install serverless locally
- create serverless project by sls create ($ npx sls create --template aws-go-dep --name chat-app-go --path ./)
- write node_modules to .gitignore

## Deploy

```
# Deploy
$

# Remove resources
$
```

## Environment Variables

```
$ vim .env
DB_TABLE_PREFIX={DynamoDB table name, finally the stage name will be added after this. e.g. ChatConnections -> ChatConnections-dev}
```

## Connect and send message

```
$ npm i -g wscat
$ wscat -c {lambda endpoint, e.g. wss://{api gateway id}}.execute-api.ap-northeast-1.amazonaws.com/{app stage}}
Connected (press CTRL+C to quit)
>
< Use the sendmessage route to send a message.
Your info:{"ConnectedAt":"2022-10-26T19:57:25.104Z","Identity":{"SourceIp":"xxx.xx.xxx.xxx","UserAgent":null},"LastActiveAt":"2022-10-26T19:57:26.361Z","connectionID":"aoOd1caFNjMCKVQ="}
> {"action": "sendmessage", "message": "Hello all"}
> %
$
```
