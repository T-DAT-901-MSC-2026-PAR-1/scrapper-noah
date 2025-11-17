export class MetricsCollector {
  private messageCount: number = 0;
  private dataVolume: number = 0;
  private totalMessages: number = 0;
  private totalDataVolume: number = 0;
  private startTime: Date = new Date();
  private intervalId?: NodeJS.Timeout;

  start(): void {
    this.intervalId = setInterval(() => {
      this.logMetrics();
      this.reset();
    }, 1000);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  recordMessage(dataSize: number): void {
    this.messageCount++;
    this.dataVolume += dataSize;
    this.totalMessages++;
    this.totalDataVolume += dataSize;
  }

  private logMetrics(): void {
    const timestamp = new Date().toISOString();
    const messagesPerSec = this.messageCount;
    const mbPerSec = (this.dataVolume / (1024 * 1024)).toFixed(2);
    const uptime = Math.floor((Date.now() - this.startTime.getTime()) / 1000);
    const totalMB = (this.totalDataVolume / (1024 * 1024)).toFixed(3);

    console.log(`[${timestamp}] Messages/s: ${messagesPerSec} | MB/s: ${mbPerSec} | Total: ${this.totalMessages} msgs (${totalMB} MB) | Uptime: ${uptime}s`);
  }

  private reset(): void {
    this.messageCount = 0;
    this.dataVolume = 0;
  }
}
