FROM golang:1.23-alpine3.20

WORKDIR /app

COPY . .

# Download and install the dependencies
RUN go get -d -v ./...

# BUILD the go app
RUN go build -o api .

EXPOSE 8000

CMD ["./api"]