/**
 * Canvas Telemetry Charting Engine for Dell EMC PowerMax SAN
 */

class TelemetryChartEngine {
  constructor(canvasId, type = "iops") {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.type = type;
    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    if (!this.canvas || !this.canvas.parentElement) return;
    const parent = this.canvas.parentElement;
    this.width = parent.clientWidth;
    this.height = parent.clientHeight || 240;
    this.canvas.width = this.width * window.devicePixelRatio;
    this.canvas.height = this.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  render(historyData) {
    if (!this.canvas || !this.ctx) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    const padding = { top: 30, right: 20, bottom: 35, left: 55 };
    const chartW = this.width - padding.left - padding.right;
    const chartH = this.height - padding.top - padding.bottom;

    const timestamps = historyData.timestamps || [];
    let values = [];
    let values2 = [];
    let title = "";
    let unit = "";
    let color1 = "#00f2fe";
    let color2 = "#3b82f6";

    if (this.type === "iops") {
      values = historyData.readIops || [];
      values2 = historyData.writeIops || [];
      title = "IOPS Breakdown (Read vs Write)";
      unit = "IOPS";
    } else if (this.type === "throughput") {
      values = historyData.throughputMBs || [];
      title = "Throughput (MB/s)";
      unit = "MB/s";
      color1 = "#10b981";
    } else if (this.type === "latency") {
      values = historyData.latencyMs || [];
      title = "Front-End Response Time (ms)";
      unit = "ms";
      color1 = "#f59e0b";
    } else if (this.type === "cpu") {
      values = historyData.cpuUtil || [];
      title = "Director Emulation Core Load (%)";
      unit = "%";
      color1 = "#8b5cf6";
    }

    if (values.length === 0) return;

    // Calculate Y scale
    let maxVal = Math.max(...values, ...(values2.length ? values2 : [0]));
    if (this.type === "iops") maxVal = Math.max(maxVal, 160000);
    else if (this.type === "throughput") maxVal = Math.max(maxVal, 6000);
    else if (this.type === "latency") maxVal = Math.max(maxVal, 1.5);
    else if (this.type === "cpu") maxVal = 100;

    // Draw Grid Lines & Y-Axis Labels
    this.ctx.font = "10px JetBrains Mono, monospace";
    this.ctx.fillStyle = "#64748b";
    this.ctx.textAlign = "right";

    const steps = 4;
    for (let i = 0; i <= steps; i++) {
      const y = padding.top + (chartH / steps) * i;
      const val = Math.round(maxVal - (maxVal / steps) * i);
      this.ctx.fillText(val.toLocaleString(), padding.left - 8, y + 4);

      this.ctx.beginPath();
      this.ctx.moveTo(padding.left, y);
      this.ctx.lineTo(this.width - padding.right, y);
      this.ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }

    // Draw X-Axis Timestamps
    const stepX = chartW / (values.length - 1 || 1);
    this.ctx.textAlign = "center";
    for (let i = 0; i < timestamps.length; i += 6) {
      const x = padding.left + i * stepX;
      this.ctx.fillText(timestamps[i] || "", x, this.height - 10);
    }

    // Draw Primary Line & Area Gradient
    const drawLine = (dataPoints, strokeColor, fillColor) => {
      this.ctx.beginPath();
      for (let i = 0; i < dataPoints.length; i++) {
        const x = padding.left + i * stepX;
        const y = padding.top + chartH - (dataPoints[i] / maxVal) * chartH;
        if (i === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      }
      this.ctx.strokeStyle = strokeColor;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      if (fillColor) {
        const lastX = padding.left + (dataPoints.length - 1) * stepX;
        this.ctx.lineTo(lastX, padding.top + chartH);
        this.ctx.lineTo(padding.left, padding.top + chartH);
        this.ctx.fillStyle = fillColor;
        this.ctx.fill();
      }
    };

    // Area Gradient 1
    const grad1 = this.ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    grad1.addColorStop(0, color1 + "40");
    grad1.addColorStop(1, color1 + "00");

    drawLine(values, color1, grad1);

    if (values2.length > 0) {
      const grad2 = this.ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
      grad2.addColorStop(0, color2 + "30");
      grad2.addColorStop(1, color2 + "00");
      drawLine(values2, color2, grad2);
    }

    // Chart Legend / Title Header
    this.ctx.font = "bold 12px Inter, sans-serif";
    this.ctx.fillStyle = "#f8fafc";
    this.ctx.textAlign = "left";
    this.ctx.fillText(`${title} [${unit}]`, padding.left, 18);
  }
}
