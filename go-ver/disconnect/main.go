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
	"github.com/aws/aws-sdk-go/service/dynamodb"
)

// Response is of type APIGatewayProxyResponse since we're leveraging the
// AWS Lambda Proxy Request functionality (default behavior)
//
// https://serverless.com/framework/docs/providers/aws/events/apigateway/#lambda-proxy-integration
type Response events.APIGatewayProxyResponse

// Handler is our lambda handler invoked by the `lambda.Start` function call
func Handler(ctx context.Context, req *events.APIGatewayWebsocketProxyRequest) (Response, error) {
	log.Println("Disconnect handler called")

	session := session.Must(session.NewSession(&aws.Config{}))

	svc := dynamodb.New(session, &aws.Config{})
	connectionId := req.RequestContext.ConnectionID
	param := &dynamodb.DeleteItemInput{
		TableName: aws.String(os.Getenv("DB_TABLE_NAME")),
		Key: map[string]*dynamodb.AttributeValue{
			"connectionId": {
				S: aws.String(connectionId),
			},
		},
		ReturnValues: aws.String("ALL_OLD"),
	}
	result, err := svc.DeleteItem(param)
	if (err != nil) {
		return Response{StatusCode: 500}, err
	}
	jsonData, err := json.Marshal(result)
	log.Println(string(jsonData))
	
	return Response{StatusCode: 200}, nil
}

func main() {
	lambda.Start(Handler)
}
