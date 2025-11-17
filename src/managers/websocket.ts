import WebSocket from 'ws';
import { MetricsCollector } from './metrics';
import { KafkaProducerManager } from './kafka';

const WS_URL = 'wss://streamer.cryptocompare.com/v2?format=streamer';

const getSubscriptions = () => {
  const encoded = process.env.ENCODED_SUBSCRIPTIONS;
  if (!encoded) {
    throw new Error('ENCODED_SUBSCRIPTIONS non trouvée dans .env');
  }
  return JSON.parse(Buffer.from(encoded, 'base64').toString('utf8'));
};

const SUBSCRIPTIONS = getSubscriptions();

export class WebSocketManager {
  private ws?: WebSocket;
  private metrics: MetricsCollector;
  private kafka: KafkaProducerManager;
  private reconnectTimeout?: NodeJS.Timeout;
  private shouldReconnect: boolean = true;

  constructor(metrics: MetricsCollector, kafka: KafkaProducerManager) {
    this.metrics = metrics;
    this.kafka = kafka;
  }

  connect(): void {
    console.log(`[${new Date().toISOString()}] Connecting to ${WS_URL}`);

    this.ws = new WebSocket(WS_URL);

    this.ws.on('open', () => {
      console.log(`[${new Date().toISOString()}] Connected successfully`);
      this.subscribe();
    });

    this.ws.on('message', (data: Buffer) => {
      this.metrics.recordMessage(data.length);
      this.kafka.sendMessage(data);
    });

    this.ws.on('error', (error: Error) => {
      console.error(`[${new Date().toISOString()}] WebSocket error:`, error.message);
    });

    this.ws.on('close', () => {
      console.log(`[${new Date().toISOString()}] Connection closed`);
      if (this.shouldReconnect) {
        this.reconnect();
      }
    });
  }

  private subscribe(): void {
    const message = JSON.stringify({
      action: 'SubAdd',
      subs: SUBSCRIPTIONS
    });

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(message);
      console.log(`[${new Date().toISOString()}] Subscribed to ${SUBSCRIPTIONS.length} pairs`);
    }
  }

  private reconnect(): void {
    console.log(`[${new Date().toISOString()}] Reconnecting in 5 seconds...`);
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, 5000);
  }

  disconnect(): void {
    this.shouldReconnect = false;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    if (this.ws) {
      this.ws.close();
    }
  }
}
