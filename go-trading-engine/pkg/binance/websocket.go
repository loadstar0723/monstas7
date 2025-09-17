package binance

import (
    "encoding/json"
    "fmt"
    "log"
    "strings"
    "time"

    "github.com/gorilla/websocket"
)

// BinanceWSClient Binance WebSocket 클라이언트
type BinanceWSClient struct {
    conn          *websocket.Conn
    symbols       []string
    dataChannel   chan *KlineData
    reconnectChan chan bool
}

// KlineData K선 데이터 구조체
type KlineData struct {
    Symbol    string    `json:"s"`
    OpenTime  int64     `json:"t"`
    Open      string    `json:"o"`
    High      string    `json:"h"`
    Low       string    `json:"l"`
    Close     string    `json:"c"`
    Volume    string    `json:"v"`
    CloseTime int64     `json:"T"`
    Trades    int       `json:"n"`
}

// NewBinanceWSClient 새로운 Binance WebSocket 클라이언트 생성
func NewBinanceWSClient(symbols []string) *BinanceWSClient {
    return &BinanceWSClient{
        symbols:       symbols,
        dataChannel:   make(chan *KlineData, 1000),
        reconnectChan: make(chan bool, 1),
    }
}

// Connect WebSocket 연결
func (b *BinanceWSClient) Connect() error {
    // 심볼 스트림 생성
    streams := make([]string, 0)
    for _, symbol := range b.symbols {
        streams = append(streams, fmt.Sprintf("%s@kline_1m", strings.ToLower(symbol)))
        streams = append(streams, fmt.Sprintf("%s@trade", strings.ToLower(symbol)))
        streams = append(streams, fmt.Sprintf("%s@depth", strings.ToLower(symbol)))
    }

    streamStr := strings.Join(streams, "/")
    wsURL := fmt.Sprintf("wss://stream.binance.com:9443/stream?streams=%s", streamStr)

    conn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
    if err != nil {
        return fmt.Errorf("WebSocket 연결 실패: %v", err)
    }

    b.conn = conn
    log.Printf("✅ Binance WebSocket 연결 성공: %d 심볼", len(b.symbols))

    // 핑퐁 처리
    go b.handlePingPong()

    return nil
}

// Subscribe 데이터 수신 시작
func (b *BinanceWSClient) Subscribe() {
    go func() {
        for {
            select {
            case <-b.reconnectChan:
                log.Println("🔄 WebSocket 재연결 시도...")
                if err := b.Connect(); err != nil {
                    log.Printf("❌ 재연결 실패: %v", err)
                    time.Sleep(5 * time.Second)
                    b.reconnectChan <- true
                }
            default:
                if b.conn == nil {
                    b.reconnectChan <- true
                    time.Sleep(1 * time.Second)
                    continue
                }

                _, message, err := b.conn.ReadMessage()
                if err != nil {
                    log.Printf("❌ 메시지 읽기 실패: %v", err)
                    b.conn = nil
                    b.reconnectChan <- true
                    continue
                }

                // 메시지 파싱
                var data map[string]interface{}
                if err := json.Unmarshal(message, &data); err != nil {
                    log.Printf("❌ JSON 파싱 실패: %v", err)
                    continue
                }

                // 스트림 타입 확인
                if stream, ok := data["stream"].(string); ok {
                    b.processStreamData(stream, data["data"])
                }
            }
        }
    }()
}

// processStreamData 스트림 데이터 처리
func (b *BinanceWSClient) processStreamData(stream string, data interface{}) {
    if strings.Contains(stream, "@kline") {
        // K선 데이터 처리
        klineMap := data.(map[string]interface{})
        if k, ok := klineMap["k"].(map[string]interface{}); ok {
            kline := &KlineData{
                Symbol:    k["s"].(string),
                OpenTime:  int64(k["t"].(float64)),
                Open:      k["o"].(string),
                High:      k["h"].(string),
                Low:       k["l"].(string),
                Close:     k["c"].(string),
                Volume:    k["v"].(string),
                CloseTime: int64(k["T"].(float64)),
                Trades:    int(k["n"].(float64)),
            }

            select {
            case b.dataChannel <- kline:
            default:
                // 채널이 가득 찬 경우 가장 오래된 데이터 제거
                <-b.dataChannel
                b.dataChannel <- kline
            }
        }
    } else if strings.Contains(stream, "@trade") {
        // 거래 데이터 처리
        // TODO: 거래 데이터 구조체 및 처리 로직
    } else if strings.Contains(stream, "@depth") {
        // 오더북 데이터 처리
        // TODO: 오더북 데이터 구조체 및 처리 로직
    }
}

// handlePingPong 핑퐁 처리
func (b *BinanceWSClient) handlePingPong() {
    ticker := time.NewTicker(30 * time.Second)
    defer ticker.Stop()

    for range ticker.C {
        if b.conn != nil {
            if err := b.conn.WriteMessage(websocket.PingMessage, []byte{}); err != nil {
                log.Printf("❌ Ping 전송 실패: %v", err)
                b.conn = nil
                b.reconnectChan <- true
            }
        }
    }
}

// GetDataChannel 데이터 채널 반환
func (b *BinanceWSClient) GetDataChannel() <-chan *KlineData {
    return b.dataChannel
}

// Close 연결 종료
func (b *BinanceWSClient) Close() error {
    if b.conn != nil {
        return b.conn.Close()
    }
    return nil
}