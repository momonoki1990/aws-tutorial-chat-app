.PHONY: build clean deploy gomodgen

build: gomodgen
	export GO111MODULE=on
	# env GOARCH=amd64 GOOS=linux go build -ldflags="-s -w" -o bin/hello hello/main.go
	# env GOARCH=amd64 GOOS=linux go build -ldflags="-s -w" -o bin/world world/main.go
	env GOARCH=amd64 GOOS=linux go build -ldflags="-s -w" -o bin/default default/main.go
	env GOARCH=amd64 GOOS=linux go build -ldflags="-s -w" -o bin/connect connect/main.go
	env GOARCH=amd64 GOOS=linux go build -ldflags="-s -w" -o bin/disconnect disconnect/main.go
	env GOARCH=amd64 GOOS=linux go build -ldflags="-s -w" -o bin/send_message send_message/main.go

clean:
	rm -rf ./bin ./vendor go.sum

deploy: clean build
	sls deploy --verbose

gomodgen:
	chmod u+x gomod.sh
	./gomod.sh
