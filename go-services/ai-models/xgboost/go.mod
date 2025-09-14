module ai-models/xgboost

go 1.21

require (
	ai-models/common v0.0.0
	github.com/gorilla/mux v1.8.1
	gonum.org/v1/gonum v0.14.0
)

require (
	github.com/cespare/xxhash/v2 v2.1.2 // indirect
	github.com/dgryski/go-rendezvous v0.0.0-20200823014737-9f7001d12a5f // indirect
	github.com/go-redis/redis/v8 v8.11.5 // indirect
	github.com/gorilla/websocket v1.5.1 // indirect
	golang.org/x/net v0.17.0 // indirect
)

replace ai-models/common => ../common
