package database

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/sirupsen/logrus"
)

type RedisClient struct {
	client *redis.Client
	ctx    context.Context
}

var redisClient *RedisClient

// InitRedis initializes Redis connection
func InitRedis() *RedisClient {
	redisHost := os.Getenv("REDIS_HOST")
	if redisHost == "" {
		redisHost = "localhost"
	}

	redisPort := os.Getenv("REDIS_PORT")
	if redisPort == "" {
		redisPort = "6379"
	}

	redisPassword := os.Getenv("REDIS_PASSWORD")
	redisDB := 0 // Default DB

	client := redis.NewClient(&redis.Options{
		Addr:         fmt.Sprintf("%s:%s", redisHost, redisPort),
		Password:     redisPassword,
		DB:           redisDB,
		PoolSize:     100,
		MinIdleConns: 10,
		MaxRetries:   3,
		DialTimeout:  5 * time.Second,
		ReadTimeout:  3 * time.Second,
		WriteTimeout: 3 * time.Second,
	})

	ctx := context.Background()

	// Test connection
	if err := client.Ping(ctx).Err(); err != nil {
		logrus.Warnf("Failed to connect to Redis: %v. Cache will be disabled.", err)
		return nil
	}

	redisClient = &RedisClient{
		client: client,
		ctx:    ctx,
	}

	logrus.Info("Redis connection established successfully")
	return redisClient
}

// GetRedis returns the Redis client instance
func GetRedis() *RedisClient {
	return redisClient
}

// Close closes the Redis connection
func (r *RedisClient) Close() error {
	if r.client != nil {
		return r.client.Close()
	}
	return nil
}

// Set stores a value in Redis with expiration
func (r *RedisClient) Set(key string, value interface{}, expiration time.Duration) error {
	if r.client == nil {
		return fmt.Errorf("redis client is not initialized")
	}

	data, err := json.Marshal(value)
	if err != nil {
		return fmt.Errorf("failed to marshal value: %w", err)
	}

	return r.client.Set(r.ctx, key, data, expiration).Err()
}

// Get retrieves a value from Redis
func (r *RedisClient) Get(key string, dest interface{}) error {
	if r.client == nil {
		return fmt.Errorf("redis client is not initialized")
	}

	data, err := r.client.Get(r.ctx, key).Result()
	if err != nil {
		if err == redis.Nil {
			return fmt.Errorf("key not found")
		}
		return fmt.Errorf("failed to get value: %w", err)
	}

	return json.Unmarshal([]byte(data), dest)
}

// Delete removes a key from Redis
func (r *RedisClient) Delete(key string) error {
	if r.client == nil {
		return fmt.Errorf("redis client is not initialized")
	}

	return r.client.Del(r.ctx, key).Err()
}

// Exists checks if a key exists in Redis
func (r *RedisClient) Exists(key string) (bool, error) {
	if r.client == nil {
		return false, fmt.Errorf("redis client is not initialized")
	}

	result, err := r.client.Exists(r.ctx, key).Result()
	if err != nil {
		return false, err
	}

	return result > 0, nil
}

// SetWithLock sets a value with a distributed lock
func (r *RedisClient) SetWithLock(key string, value interface{}, expiration time.Duration) error {
	if r.client == nil {
		return fmt.Errorf("redis client is not initialized")
	}

	lockKey := fmt.Sprintf("lock:%s", key)
	lockValue := fmt.Sprintf("%d", time.Now().UnixNano())

	// Try to acquire lock
	ok, err := r.client.SetNX(r.ctx, lockKey, lockValue, 10*time.Second).Result()
	if err != nil {
		return fmt.Errorf("failed to acquire lock: %w", err)
	}

	if !ok {
		return fmt.Errorf("failed to acquire lock: key is locked")
	}

	// Release lock on exit
	defer r.client.Del(r.ctx, lockKey)

	// Set the actual value
	return r.Set(key, value, expiration)
}

// Publish publishes a message to a channel
func (r *RedisClient) Publish(channel string, message interface{}) error {
	if r.client == nil {
		return fmt.Errorf("redis client is not initialized")
	}

	data, err := json.Marshal(message)
	if err != nil {
		return fmt.Errorf("failed to marshal message: %w", err)
	}

	return r.client.Publish(r.ctx, channel, data).Err()
}

// Subscribe subscribes to a channel
func (r *RedisClient) Subscribe(channel string, handler func(string)) error {
	if r.client == nil {
		return fmt.Errorf("redis client is not initialized")
	}

	pubsub := r.client.Subscribe(r.ctx, channel)
	defer pubsub.Close()

	ch := pubsub.Channel()
	for msg := range ch {
		handler(msg.Payload)
	}

	return nil
}

// CacheMarketData caches market data
func (r *RedisClient) CacheMarketData(symbol string, data interface{}) error {
	key := fmt.Sprintf("market:%s", symbol)
	return r.Set(key, data, 5*time.Second) // Cache for 5 seconds
}

// GetMarketData retrieves cached market data
func (r *RedisClient) GetMarketData(symbol string, dest interface{}) error {
	key := fmt.Sprintf("market:%s", symbol)
	return r.Get(key, dest)
}

// CachePrediction caches AI prediction
func (r *RedisClient) CachePrediction(model, symbol string, prediction interface{}) error {
	key := fmt.Sprintf("prediction:%s:%s", model, symbol)
	return r.Set(key, prediction, 30*time.Second) // Cache for 30 seconds
}

// GetPrediction retrieves cached AI prediction
func (r *RedisClient) GetPrediction(model, symbol string, dest interface{}) error {
	key := fmt.Sprintf("prediction:%s:%s", model, symbol)
	return r.Get(key, dest)
}