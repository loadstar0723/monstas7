package database

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// User represents a user in the system
type User struct {
	ID        uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Email     string    `gorm:"uniqueIndex;not null"`
	Username  string    `gorm:"uniqueIndex;not null"`
	Password  string    `gorm:"not null"`
	ApiKey    string    `gorm:"uniqueIndex"`
	ApiSecret string
	Role      string `gorm:"default:'user'"`
	Active    bool   `gorm:"default:true"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
}

// Trade represents a trade transaction
type Trade struct {
	ID           uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	UserID       uuid.UUID `gorm:"type:uuid;not null"`
	Symbol       string    `gorm:"not null;index"`
	Side         string    `gorm:"not null"` // BUY or SELL
	Price        float64   `gorm:"not null"`
	Quantity     float64   `gorm:"not null"`
	Total        float64   `gorm:"not null"`
	Fee          float64
	FeeAsset     string
	Status       string `gorm:"not null;default:'PENDING'"` // PENDING, FILLED, CANCELLED
	Type         string `gorm:"not null"`                   // MARKET, LIMIT
	TimeInForce  string // GTC, IOC, FOK
	StopPrice    float64
	IcebergQty   float64
	ExecutedQty  float64
	CummulativeQuoteQty float64
	TransactTime time.Time
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

// Order represents a trading order
type Order struct {
	ID          uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	UserID      uuid.UUID `gorm:"type:uuid;not null"`
	Symbol      string    `gorm:"not null;index"`
	Side        string    `gorm:"not null"`
	Type        string    `gorm:"not null"`
	Quantity    float64   `gorm:"not null"`
	Price       float64
	Status      string    `gorm:"not null;default:'NEW'"`
	TimeInForce string
	StopPrice   float64
	IcebergQty  float64
	Time        time.Time
	UpdateTime  time.Time
	IsWorking   bool
	OrigQty     float64
	ExecutedQty float64
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

// Position represents a trading position
type Position struct {
	ID              uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	UserID          uuid.UUID `gorm:"type:uuid;not null"`
	Symbol          string    `gorm:"not null;index"`
	Side            string    `gorm:"not null"` // LONG or SHORT
	EntryPrice      float64   `gorm:"not null"`
	Quantity        float64   `gorm:"not null"`
	CurrentPrice    float64
	UnrealizedPnL   float64
	RealizedPnL     float64
	Leverage        int
	MarginType      string // ISOLATED or CROSS
	IsolatedMargin  float64
	MarkPrice       float64
	LiquidationPrice float64
	MarginRatio     float64
	MaintMargin     float64
	PositionAmt     float64
	MaxNotional     float64
	CreatedAt       time.Time
	UpdatedAt       time.Time
	ClosedAt        *time.Time
}

// MarketData represents market data
type MarketData struct {
	ID        uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Symbol    string    `gorm:"not null;index"`
	Open      float64
	High      float64
	Low       float64
	Close     float64
	Volume    float64
	Timestamp time.Time `gorm:"index"`
	Interval  string    `gorm:"index"` // 1m, 5m, 15m, 1h, 4h, 1d
	CreatedAt time.Time
}

// Strategy represents a trading strategy
type Strategy struct {
	ID          uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	UserID      uuid.UUID `gorm:"type:uuid;not null"`
	Name        string    `gorm:"not null"`
	Description string
	Type        string `gorm:"not null"` // MOMENTUM, MEAN_REVERSION, ARBITRAGE, etc.
	Parameters  string `gorm:"type:jsonb"`
	Active      bool   `gorm:"default:false"`
	Performance string `gorm:"type:jsonb"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

// Backtest represents a backtest result
type Backtest struct {
	ID            uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	UserID        uuid.UUID `gorm:"type:uuid;not null"`
	StrategyID    uuid.UUID `gorm:"type:uuid;not null"`
	StartDate     time.Time `gorm:"not null"`
	EndDate       time.Time `gorm:"not null"`
	InitialCapital float64  `gorm:"not null"`
	FinalCapital   float64
	TotalReturn    float64
	SharpeRatio    float64
	MaxDrawdown    float64
	WinRate        float64
	TotalTrades    int
	WinningTrades  int
	LosingTrades   int
	Results        string `gorm:"type:jsonb"`
	CreatedAt      time.Time
}

// Portfolio represents a portfolio
type Portfolio struct {
	ID            uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	UserID        uuid.UUID `gorm:"type:uuid;not null"`
	Name          string    `gorm:"not null"`
	Description   string
	TotalValue    float64
	Cash          float64
	Positions     string `gorm:"type:jsonb"`
	Performance   string `gorm:"type:jsonb"`
	RiskMetrics   string `gorm:"type:jsonb"`
	LastRebalance time.Time
	CreatedAt     time.Time
	UpdatedAt     time.Time
}

// Alert represents a price or condition alert
type Alert struct {
	ID          uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	UserID      uuid.UUID `gorm:"type:uuid;not null"`
	Symbol      string    `gorm:"not null;index"`
	Type        string    `gorm:"not null"` // PRICE, VOLUME, INDICATOR
	Condition   string    `gorm:"not null"` // ABOVE, BELOW, CROSS
	Value       float64   `gorm:"not null"`
	Message     string
	Active      bool `gorm:"default:true"`
	Triggered   bool `gorm:"default:false"`
	TriggeredAt *time.Time
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

// AIModel represents an AI model configuration
type AIModel struct {
	ID          uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Name        string    `gorm:"not null;uniqueIndex"`
	Type        string    `gorm:"not null"` // NEURAL, LIGHTGBM, RANDOMFOREST, etc.
	Version     string    `gorm:"not null"`
	Parameters  string    `gorm:"type:jsonb"`
	Weights     []byte    // Binary model weights
	Performance string    `gorm:"type:jsonb"`
	Active      bool      `gorm:"default:false"`
	TrainedAt   time.Time
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

// Prediction represents an AI model prediction
type Prediction struct {
	ID         uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	ModelID    uuid.UUID `gorm:"type:uuid;not null"`
	UserID     uuid.UUID `gorm:"type:uuid"`
	Symbol     string    `gorm:"not null;index"`
	Type       string    `gorm:"not null"` // PRICE, DIRECTION, SIGNAL
	Value      float64
	Confidence float64
	Metadata   string `gorm:"type:jsonb"`
	CreatedAt  time.Time
}