import { MetricsCollector } from './managers/metrics';
import { WebSocketManager } from './managers/websocket';
import { KafkaProducerManager } from './managers/kafka';

const metrics = new MetricsCollector();
const kafka = new KafkaProducerManager();
const wsManager = new WebSocketManager(metrics, kafka);

async function shutdown(): Promise<void> {
  console.log(`\n[${new Date().toISOString()}] Shutting down gracefully...`);

  metrics.stop();
  wsManager.disconnect();
  await kafka.disconnect();

  setTimeout(() => {
    console.log(`[${new Date().toISOString()}] Shutdown complete`);
    process.exit(0);
  }, 1000);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

async function start(): Promise<void> {
  console.log(`[${new Date().toISOString()}] Starting CryptoCompare WebSocket scrapper`);

  try {
    await kafka.connect();
    console.log(`[${new Date().toISOString()}] Kafka connected successfully`);
  } catch (error) {
    console.warn(`[${new Date().toISOString()}] Warning: Failed to connect to Kafka. Continuing without Kafka...`);
    console.warn(`[${new Date().toISOString()}] Kafka error:`, error instanceof Error ? error.message : error);
  }

  metrics.start();
  wsManager.connect();
}

start();
