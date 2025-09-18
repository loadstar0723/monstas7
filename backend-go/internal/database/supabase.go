package database

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

// SupabaseClient handles all Supabase operations
type SupabaseClient struct {
	URL        string
	AnonKey    string
	HTTPClient *http.Client
}

// SupabasePrediction for Supabase storage
type SupabasePrediction struct {
	Symbol     string  `json:"symbol"`
	Model      string  `json:"ai_model"`
	Prediction float64 `json:"prediction"`
	Confidence float64 `json:"confidence"`
	Direction  string  `json:"direction"`
	Timeframe  string  `json:"timeframe"`
	Signal     string  `json:"signal"`
}

// SupabaseMarketData for Supabase storage
type SupabaseMarketData struct {
	Symbol    string    `json:"symbol"`
	Price     float64   `json:"price"`
	Volume    float64   `json:"volume"`
	High      float64   `json:"high"`
	Low       float64   `json:"low"`
	Open      float64   `json:"open"`
	Close     float64   `json:"close"`
	Timestamp time.Time `json:"timestamp"`
}

var supabaseClient *SupabaseClient
var DB interface{} // Placeholder for compatibility

// GetDB returns nil as we're using Supabase instead
func GetDB() interface{} {
	return nil
}

// InitSupabase initializes Supabase connection
func InitSupabase() (*SupabaseClient, error) {
	url := os.Getenv("NEXT_PUBLIC_SUPABASE_URL")
	key := os.Getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

	// Use hardcoded values if env vars not set (for development)
	if url == "" {
		url = "https://ikpjbgxeufdynkgoxgdy.supabase.co"
	}
	if key == "" {
		key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrcGpiZ3hldWZkeW5rZ294Z2R5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNTg2NDMsImV4cCI6MjA3MzczNDY0M30.O--J-28C-yGiQUa53tSoOQ7kYURpDsfhDQQ_UOi5YHk"
	}

	supabaseClient = &SupabaseClient{
		URL:     url,
		AnonKey: key,
		HTTPClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}

	return supabaseClient, nil
}

// GetSupabaseClient returns the singleton Supabase client
func GetSupabaseClient() *SupabaseClient {
	if supabaseClient == nil {
		InitSupabase()
	}
	return supabaseClient
}

// makeRequest makes HTTP request to Supabase
func (c *SupabaseClient) makeRequest(method, endpoint string, body interface{}) ([]byte, error) {
	url := fmt.Sprintf("%s/rest/v1/%s", c.URL, endpoint)

	var reqBody io.Reader
	if body != nil {
		jsonBody, err := json.Marshal(body)
		if err != nil {
			return nil, err
		}
		reqBody = bytes.NewBuffer(jsonBody)
	}

	req, err := http.NewRequest(method, url, reqBody)
	if err != nil {
		return nil, err
	}

	// Set headers
	req.Header.Set("apikey", c.AnonKey)
	req.Header.Set("Authorization", "Bearer "+c.AnonKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Prefer", "return=representation")

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("supabase error %d: %s", resp.StatusCode, string(respBody))
	}

	return respBody, nil
}

// SavePrediction saves AI prediction to Supabase
func (c *SupabaseClient) SavePrediction(pred *SupabasePrediction) error {
	predMap := map[string]interface{}{
		"symbol":     pred.Symbol,
		"ai_model":   pred.Model,
		"prediction": pred.Prediction,
		"confidence": pred.Confidence,
		"direction":  pred.Direction,
		"timeframe":  pred.Timeframe,
		"signal":     pred.Signal,
	}

	_, err := c.makeRequest("POST", "trading_signals", predMap)
	return err
}

// GetLatestPrediction gets the latest prediction from Supabase
func (c *SupabaseClient) GetLatestPrediction(symbol, model string) (*SupabasePrediction, error) {
	endpoint := fmt.Sprintf("trading_signals?symbol=eq.%s&ai_model=eq.%s&order=created_at.desc&limit=1", symbol, model)

	resp, err := c.makeRequest("GET", endpoint, nil)
	if err != nil {
		return nil, err
	}

	var predictions []map[string]interface{}
	if err := json.Unmarshal(resp, &predictions); err != nil {
		return nil, err
	}

	if len(predictions) == 0 {
		return nil, fmt.Errorf("no predictions found")
	}

	// Convert to SupabasePrediction struct
	pred := &SupabasePrediction{
		Symbol:     predictions[0]["symbol"].(string),
		Model:      predictions[0]["ai_model"].(string),
		Prediction: predictions[0]["prediction"].(float64),
		Confidence: predictions[0]["confidence"].(float64),
		Direction:  predictions[0]["direction"].(string),
		Signal:     predictions[0]["signal"].(string),
	}

	return pred, nil
}

// SaveMarketData saves market data to Supabase
func (c *SupabaseClient) SaveMarketData(data *SupabaseMarketData) error {
	dataMap := map[string]interface{}{
		"symbol":    data.Symbol,
		"price":     data.Price,
		"volume":    data.Volume,
		"high":      data.High,
		"low":       data.Low,
		"open":      data.Open,
		"close":     data.Close,
		"timestamp": data.Timestamp,
	}

	// First try to save to our custom table if it exists
	_, err := c.makeRequest("POST", "market_data", dataMap)
	if err != nil {
		// If table doesn't exist, we can still continue without DB
		fmt.Printf("Warning: Could not save market data: %v\n", err)
	}
	return nil
}

// GetUserProfile gets user profile from Supabase
func (c *SupabaseClient) GetUserProfile(userID string) (map[string]interface{}, error) {
	endpoint := fmt.Sprintf("profiles?id=eq.%s", userID)

	resp, err := c.makeRequest("GET", endpoint, nil)
	if err != nil {
		return nil, err
	}

	var profiles []map[string]interface{}
	if err := json.Unmarshal(resp, &profiles); err != nil {
		return nil, err
	}

	if len(profiles) == 0 {
		return nil, fmt.Errorf("profile not found")
	}

	return profiles[0], nil
}

// SaveTradingSignal saves a trading signal to Supabase
func (c *SupabaseClient) SaveTradingSignal(signal map[string]interface{}) error {
	_, err := c.makeRequest("POST", "trading_signals", signal)
	return err
}

// GetPortfolio gets user portfolio from Supabase
func (c *SupabaseClient) GetPortfolio(userID string) (map[string]interface{}, error) {
	endpoint := fmt.Sprintf("portfolios?user_id=eq.%s", userID)

	resp, err := c.makeRequest("GET", endpoint, nil)
	if err != nil {
		return nil, err
	}

	var portfolios []map[string]interface{}
	if err := json.Unmarshal(resp, &portfolios); err != nil {
		return nil, err
	}

	if len(portfolios) == 0 {
		return nil, fmt.Errorf("portfolio not found")
	}

	return portfolios[0], nil
}