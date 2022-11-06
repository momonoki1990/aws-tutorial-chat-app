package main

import (
	"context"
	"encoding/json"
	"log"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/apigatewaymanagementapi"
)

// Response is of type APIGatewayProxyResponse since we're leveraging the
// AWS Lambda Proxy Request functionality (default behavior)
//
// https://serverless.com/framework/docs/providers/aws/events/apigateway/#lambda-proxy-integration
type Response events.APIGatewayProxyResponse

// Handler is our lambda handler invoked by the `lambda.Start` function call
func Handler(ctx context.Context, req *events.APIGatewayWebsocketProxyRequest) (Response, error) {
	log.Println("Defualt handler called")

	session := session.Must(session.NewSession(&aws.Config{}))

	svc := apigatewaymanagementapi.New(session, &aws.Config{
		Endpoint: aws.String(req.RequestContext.DomainName + "/" + req.RequestContext.Stage),
	})
	connectionId := req.RequestContext.ConnectionID
	connectionInput := &apigatewaymanagementapi.GetConnectionInput{
		ConnectionId: &connectionId,
	}
	connection, err := svc.GetConnection(connectionInput)
	if err != nil {
		return Response{StatusCode: 500}, err
	}

	jsonData, err := json.Marshal(connection)
	if err != nil {
		return Response{StatusCode: 500}, err
	}

	_, err = svc.PostToConnection(&apigatewaymanagementapi.PostToConnectionInput{ConnectionId: &connectionId, Data: append([]byte("Use the sendmessage route to send a message. Your info:"), jsonData...)})
	if err != nil {
		return Response{StatusCode: 500}, err
	}

	return Response{StatusCode: 200}, nil
}

func main() {
	lambda.Start(Handler)
}
