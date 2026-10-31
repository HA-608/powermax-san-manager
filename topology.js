/**
 * Interactive SAN Fibre Channel Fabric Topology Visualizer
 */

class SanTopologyMap {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.nodes = [];
    this.links = [];
    this.selectedNode = null;
    this.hoveredNode = null;
    this.animOffset = 0;
    
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());
    
    this.initGraphData();
    this.bindEvents();
    this.startAnimation();
  }

  resizeCanvas() {
    const parent = this.canvas.parentElement;
    if (parent) {
      this.width = parent.clientWidth;
      this.height = parent.clientHeight || 580;
      this.canvas.width = this.width * window.devicePixelRatio;
      this.canvas.height = this.height * window.devicePixelRatio;
      this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
  }

  initGraphData() {
    this.nodes = [];
    this.links = [];
    const w = this.width;
    const h = this.height;

    // Column 1: Hosts (Left)
    const hostX = 120;
    const hosts = [
      { id: "h1", name: "esxi-node-01", type: "HOST", sub: "ESXi 8.0 (34.2K IOPS)", x: hostX, y: h * 0.2, color: "#38bdf8", status: "OPTIMAL", details: { wwn: "21:00:00:24:ff:8e:10:01", os: "VMware ESXi 8.0u2", hba: "Emulex LPe36002 64Gb", pathPolicy: "VMW_PSP_RR" } },
      { id: "h2", name: "oracle-rac-node1", type: "HOST", sub: "RHEL 9.3 (48.9K IOPS)", x: hostX, y: h * 0.4, color: "#38bdf8", status: "OPTIMAL", details: { wwn: "21:00:00:24:ff:9a:40:11", os: "RHEL 9.3 Enterprise", hba: "QLogic QLE2772 32Gb", pathPolicy: "Dell PowerPath 7.4" } },
      { id: "h3", name: "sap-hana-db01", type: "HOST", sub: "SLES 15 (52.1K IOPS)", x: hostX, y: h * 0.6, color: "#38bdf8", status: "OPTIMAL", details: { wwn: "nqn.2014-08.dell:nvme:sap01", os: "SLES 15 SP5 for SAP", hba: "Mellanox 100Gb NVMe-oF", pathPolicy: "NVMe-Native Multipath" } },
      { id: "h4", name: "sql-cluster-01", type: "HOST", sub: "Win 2022 (21.4K IOPS)", x: hostX, y: h * 0.8, color: "#38bdf8", status: "OPTIMAL", details: { wwn: "21:00:00:24:ff:7c:30:05", os: "Windows Server 2022", hba: "Emulex LPe35002 32Gb", pathPolicy: "MPIO Round Robin" } }
    ];

    // Column 2: SAN Switches (Fabric A / B)
    const switchX = w * 0.38;
    const switches = [
      { id: "s1", name: "Brocade X7-4 (Fabric A)", type: "SWITCH", sub: "64Gb FC - Port 14: OK", x: switchX, y: h * 0.25, color: "#a855f7", status: "OPTIMAL", details: { domainId: 10, speed: "64 Gbps FC", rxPower: "-3.2 dBm", txPower: "-2.8 dBm", crcErrors: 0 } },
      { id: "s2", name: "Brocade X7-4 (Fabric B)", type: "SWITCH", sub: "64Gb FC - Port 14: OK", x: switchX, y: h * 0.45, color: "#a855f7", status: "OPTIMAL", details: { domainId: 11, speed: "64 Gbps FC", rxPower: "-3.4 dBm", txPower: "-2.9 dBm", crcErrors: 0 } },
      { id: "s3", name: "Cisco MDS 9718", type: "SWITCH", sub: "32Gb FC - Port 08: WARN", x: switchX, y: h * 0.72, color: "#f59e0b", status: "WARNING", details: { domainId: 20, speed: "32 Gbps FC", rxPower: "-12.4 dBm (Low)", txPower: "-3.1 dBm", crcErrors: 14 } }
    ];

    // Column 3: PowerMax Directors / Ports
    const dirX = w * 0.65;
    const directors = [
      { id: "d1", name: "FA-1e:0 (ORB-1D)", type: "DIRECTOR", sub: "Engine 1 / FA Port", x: dirX, y: h * 0.2, color: "#00f2fe", status: "OPTIMAL", details: { engine: 1, type: "Fibre Channel 32/64G", cpuLoad: "34%", activeLuns: 48, speed: "64 Gb/s" } },
      { id: "d2", name: "FA-2e:0 (ORB-2D)", type: "DIRECTOR", sub: "Engine 1 / FA Port", x: dirX, y: h * 0.4, color: "#00f2fe", status: "OPTIMAL", details: { engine: 1, type: "Fibre Channel 32/64G", cpuLoad: "36%", activeLuns: 48, speed: "64 Gb/s" } },
      { id: "d3", name: "SE-1:0 (ORB-5D)", type: "DIRECTOR", sub: "Engine 3 / NVMe-oF", x: dirX, y: h * 0.6, color: "#00f2fe", status: "OPTIMAL", details: { engine: 3, type: "NVMe-oF RoCEv2", cpuLoad: "28%", activeLuns: 24, speed: "100 Gb/s" } },
      { id: "d4", name: "FA-3e:0 (ORB-3D)", type: "DIRECTOR", sub: "Engine 2 / FA Port", x: dirX, y: h * 0.8, color: "#f59e0b", status: "WARNING", details: { engine: 2, type: "Fibre Channel 32/64G", cpuLoad: "41%", activeLuns: 32, speed: "32 Gb/s (Warn Rx)" } }
    ];

    // Column 4: Storage Groups
    const sgX = w - 130;
    const storageGroups = [
      { id: "sg1", name: "SG_PRD_Oracle_RAC", type: "STORAGE_GROUP", sub: "Diamond SLA (0.38ms)", x: sgX, y: h * 0.2, color: "#10b981", status: "OPTIMAL", details: { volumes: 16, capacity: "12.4 TB", dataReduction: "4.8:1", sloTarget: "0.5 ms" } },
      { id: "sg2", name: "SG_PRD_SAP_HANA", type: "STORAGE_GROUP", sub: "Diamond SLA (0.41ms)", x: sgX, y: h * 0.4, color: "#10b981", status: "OPTIMAL", details: { volumes: 24, capacity: "32.0 TB", dataReduction: "3.9:1", sloTarget: "0.5 ms" } },
      { id: "sg3", name: "SG_PRD_VMware_VSAN", type: "STORAGE_GROUP", sub: "Platinum SLA (0.72ms)", x: sgX, y: h * 0.65, color: "#10b981", status: "OPTIMAL", details: { volumes: 32, capacity: "85.0 TB", dataReduction: "4.5:1", sloTarget: "1.0 ms" } },
      { id: "sg4", name: "SG_PRD_SQL_Server", type: "STORAGE_GROUP", sub: "Platinum SLA (0.81ms)", x: sgX, y: h * 0.85, color: "#10b981", status: "OPTIMAL", details: { volumes: 12, capacity: "18.5 TB", dataReduction: "4.1:1", sloTarget: "1.0 ms" } }
    ];

    this.nodes = [...hosts, ...switches, ...directors, ...storageGroups];

    // Define Topology Connections
    this.links = [
      // Hosts -> Switches
      { source: "h1", target: "s1", status: "ACTIVE" },
      { source: "h1", target: "s2", status: "ACTIVE" },
      { source: "h2", target: "s1", status: "ACTIVE" },
      { source: "h2", target: "s2", status: "ACTIVE" },
      { source: "h3", target: "s1", status: "ACTIVE" },
      { source: "h3", target: "s2", status: "ACTIVE" },
      { source: "h4", target: "s3", status: "WARNING" },

      // Switches -> Directors
      { source: "s1", target: "d1", status: "ACTIVE" },
      { source: "s1", target: "d2", status: "ACTIVE" },
      { source: "s2", target: "d1", status: "ACTIVE" },
      { source: "s2", target: "d2", status: "ACTIVE" },
      { source: "s2", target: "d3", status: "ACTIVE" },
      { source: "s3", target: "d4", status: "WARNING" },

      // Directors -> Storage Groups
      { source: "d1", target: "sg1", status: "ACTIVE" },
      { source: "d1", target: "sg3", status: "ACTIVE" },
      { source: "d2", target: "sg1", status: "ACTIVE" },
      { source: "d2", target: "sg3", status: "ACTIVE" },
      { source: "d3", target: "sg2", status: "ACTIVE" },
      { source: "d4", target: "sg4", status: "WARNING" }
    ];
  }

  bindEvents() {
    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      let found = null;
      for (const node of this.nodes) {
        const dx = mouseX - node.x;
        const dy = mouseY - node.y;
        if (Math.sqrt(dx * dx + dy * dy) < 26) {
          found = node;
          break;
        }
      }

      this.hoveredNode = found;
      this.canvas.style.cursor = found ? "pointer" : "default";
    });

    this.canvas.addEventListener("click", (e) => {
      if (this.hoveredNode) {
        this.selectedNode = this.hoveredNode;
        this.updateInspectorPane(this.selectedNode);
      } else {
        this.selectedNode = null;
        this.updateInspectorPane(null);
      }
    });
  }

  updateInspectorPane(node) {
    const pane = document.getElementById("topology-inspector");
    if (!pane) return;

    if (!node) {
      pane.innerHTML = `
        <h4><i class="lucide-info"></i> Node Inspector</h4>
        <p style="font-size:12px; color:var(--text-muted);">Click on any Host HBA, SAN Switch, Director FA Port, or Storage Group node to view link diagnostics.</p>
      `;
      return;
    }

    let detailsHtml = "";
    if (node.details) {
      for (const [key, val] of Object.entries(node.details)) {
        detailsHtml += `
          <div class="inspector-row">
            <span class="label">${key.toUpperCase()}</span>
            <span class="val">${val}</span>
          </div>
        `;
      }
    }

    pane.innerHTML = `
      <h4><i class="lucide-layers"></i> ${node.name}</h4>
      <div style="margin-bottom:10px;">
        <span class="badge-status ${node.status.toLowerCase()}">${node.status}</span>
        <span style="font-size:11px; color:var(--text-muted); margin-left:8px;">${node.type}</span>
      </div>
      ${detailsHtml}
      <div style="margin-top:12px; font-size:11px; color:var(--dell-cyan);">
        Active Multipath Connectivity: Healthy
      </div>
    `;
  }

  startAnimation() {
    const render = () => {
      this.animOffset = (this.animOffset + 0.8) % 30;
      this.draw();
      requestAnimationFrame(render);
    };
    render();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw Column Header Titles
    this.ctx.font = "bold 12px Inter, sans-serif";
    this.ctx.fillStyle = "#64748b";
    this.ctx.textAlign = "center";
    this.ctx.fillText("HOST SYSTEMS & HBAs", 120, 30);
    this.ctx.fillText("SAN FC SWITCH FABRIC", this.width * 0.38, 30);
    this.ctx.fillText("POWERMAX DIRECTORS / FA PORTS", this.width * 0.65, 30);
    this.ctx.fillText("STORAGE GROUPS & LUNS", this.width - 130, 30);

    // Draw Links
    for (const link of this.links) {
      const srcNode = this.nodes.find((n) => n.id === link.source);
      const tgtNode = this.nodes.find((n) => n.id === link.target);
      if (!srcNode || !tgtNode) continue;

      const isConnectedToSelected = this.selectedNode && (this.selectedNode.id === srcNode.id || this.selectedNode.id === tgtNode.id);
      const isHovered = this.hoveredNode && (this.hoveredNode.id === srcNode.id || this.hoveredNode.id === tgtNode.id);

      this.ctx.beginPath();
      const cp1x = srcNode.x + (tgtNode.x - srcNode.x) * 0.5;
      const cp1y = srcNode.y;
      const cp2x = srcNode.x + (tgtNode.x - srcNode.x) * 0.5;
      const cp2y = tgtNode.y;

      this.ctx.moveTo(srcNode.x, srcNode.y);
      this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, tgtNode.x, tgtNode.y);

      if (isConnectedToSelected || isHovered) {
        this.ctx.strokeStyle = "#00f2fe";
        this.ctx.lineWidth = 3;
      } else if (link.status === "WARNING") {
        this.ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
        this.ctx.lineWidth = 1.5;
      } else {
        this.ctx.strokeStyle = "rgba(59, 130, 246, 0.25)";
        this.ctx.lineWidth = 1.5;
      }
      this.ctx.stroke();

      // Animated packet dash
      this.ctx.save();
      this.ctx.setLineDash([6, 12]);
      this.ctx.lineDashOffset = -this.animOffset;
      this.ctx.strokeStyle = isConnectedToSelected ? "#ffffff" : "rgba(0, 242, 254, 0.6)";
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      this.ctx.restore();
    }

    // Draw Nodes
    for (const node of this.nodes) {
      const isSelected = this.selectedNode && this.selectedNode.id === node.id;
      const isHovered = this.hoveredNode && this.hoveredNode.id === node.id;

      // Glow effect for selected
      if (isSelected || isHovered) {
        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, 28, 0, Math.PI * 2);
        this.ctx.fillStyle = "rgba(0, 242, 254, 0.2)";
        this.ctx.fill();
      }

      // Outer Circle
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, 20, 0, Math.PI * 2);
      this.ctx.fillStyle = node.color;
      this.ctx.fill();
      this.ctx.lineWidth = isSelected ? 3 : 1.5;
      this.ctx.strokeStyle = isSelected ? "#ffffff" : "rgba(255,255,255,0.3)";
      this.ctx.stroke();

      // Node Label
      this.ctx.font = "bold 12px Inter, sans-serif";
      this.ctx.fillStyle = "#f8fafc";
      this.ctx.textAlign = "center";
      this.ctx.fillText(node.name, node.x, node.y + 36);

      this.ctx.font = "10px Inter, sans-serif";
      this.ctx.fillStyle = "#94a3b8";
      this.ctx.fillText(node.sub, node.x, node.y + 50);
    }
  }
}
