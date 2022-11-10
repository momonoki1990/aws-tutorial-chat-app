package main

import (
	"context"
	"encoding/json"
	"log"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/apigatewaymanagementapi"
	"github.com/aws/aws-sdk-go/service/dynamodb"
)

// Response is of type APIGatewayProxyResponse since we're leveraging the
// AWS Lambda Proxy Request functionality (default behavior)
//
// https://serverless.com/framework/docs/providers/aws/events/apigateway/#lambda-proxy-integration
type Response events.APIGatewayProxyResponse

type Body struct {
	Action  string `json:"action"`
	Message string `json:"message"`
}

// Handler is our lambda handler invoked by the `lambda.Start` function call
func Handler(ctx context.Context, req *events.APIGatewayWebsocketProxyRequest) (Response, error) {
	log.Println("SendMessage handler called")

	session := session.Must(session.NewSession(&aws.Config{}))

	// Get connection ids from DynamoDB
	ddb := dynamodb.New(session, &aws.Config{})
	connectionID := req.RequestContext.ConnectionID
	param := &dynamodb.ScanInput{
		TableName: aws.String(os.Getenv("DB_TABLE_NAME")),
	}
	result, err := ddb.Scan(param)
	if err != nil {
		return Response{StatusCode: 500}, err
	}

	var connectionIDs []string
	for _, v := range result.Items {
		id := v["connectionId"].S
		connectionIDs = append(connectionIDs, *id)
	}

	// Send message to all clients 
	var body Body
	if err := json.Unmarshal([]byte(req.Body), &body); err != nil {
		return Response{StatusCode: 500}, err
	}
	
	managementAPI := apigatewaymanagementapi.New(session, &aws.Config{
		Endpoint: aws.String(req.RequestContext.DomainName + "/" + req.RequestContext.Stage),
	})

	for _, id := range connectionIDs {
		if id == connectionID {
			continue
		}
		if _, err := managementAPI.PostToConnection(&apigatewaymanagementapi.PostToConnectionInput{ConnectionId: &id, Data: []byte(body.Message)}); err != nil {
			return Response{StatusCode: 500}, err
		}
	}

	return Response{StatusCode: 200}, nil
}

func main() {
	lambda.Start(Handler)
}
