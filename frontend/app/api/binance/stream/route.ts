import { NextRequest } from 'next/server';
import WebSocketLib from 'ws';

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get('symbol');
  
  if (!symbol) {
    return new Response('Symbol parameter is required', { status: 400 });
  }

  // Use Server-Sent Events to stream data
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let intervalId: NodeJS.Timeout | null = null;
      let ws: WebSocketLib | null = null;
      
      try {
        // Connect to Binance WebSocket
        ws = new WebSocketLib(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@aggTrade`);
        
        ws.on('open', () => {
          console.log(`Binance WebSocket connected for ${symbol}`);
        });
        
        ws.on('message', (data: any) => {
          try {
            const message = JSON.parse(data.toString());
            // Send data as Server-Sent Event
            const sseData = `data: ${JSON.stringify(message)}\n\n`;
            controller.enqueue(encoder.encode(sseData));
          } catch (err) {
            console.error('Error processing WebSocket message:', err);
          }
        });
        
        ws.on('error', (err: any) => {
          console.error('WebSocket error:', err);
          controller.error(err);
        });
        
        ws.on('close', () => {
          console.log('WebSocket closed');
          if (intervalId) clearInterval(intervalId);
          controller.close();
        });
        
        // Keep connection alive with ping
        intervalId = setInterval(() => {
          if (ws && ws.readyState === WebSocketLib.OPEN) {
            ws.ping();
          }
        }, 30000);
        
        // Handle client disconnect
        request.signal.addEventListener('abort', () => {
          if (ws) {
            ws.close();
          }
          if (intervalId) {
            clearInterval(intervalId);
          }
          controller.close();
        });
        
      } catch (err) {
        console.error('Error setting up WebSocket:', err);
        controller.error(err);
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable Nginx buffering
    },
  });
}