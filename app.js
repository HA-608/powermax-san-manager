/**
 * Main Application Logic & View Controller for Dell EMC PowerMax SAN Manager
 */

let topologyInstance = null;
let charts = {};

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

function initApp() {
  bindNavigation();
  initCharts();
  renderCurrentTab();
  startLiveTelemetryLoop();
  bindModalEvents();
}

function bindNavigation() {
  const tabs = document.querySelectorAll(".nav-tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      const targetTab = tab.getAttribute("data-tab");
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      appState.currentTab = targetTab;
      renderCurrentTab();
    });
  });
}

function initCharts() {
  charts.iops = new TelemetryChartEngine("chart-iops", "iops");
  charts.throughput = new TelemetryChartEngine("chart-throughput", "throughput");
  charts.latency = new TelemetryChartEngine("chart-latency", "latency");
  charts.cpu = new TelemetryChartEngine("chart-cpu", "cpu");
}

function renderCurrentTab() {
  const container = document.getElementById("tab-view-container");
  if (!container) return;

  switch (appState.currentTab) {
    case "dashboard":
      container.innerHTML = renderDashboardView();
      break;
    case "performance":
      container.innerHTML = renderPerformanceView();
      setTimeout(() => initCharts(), 50);
      break;
    case "topology":
      container.innerHTML = renderTopologyView();
      setTimeout(() => {
        topologyInstance = new SanTopologyMap("topologyCanvas");
      }, 50);
      break;
    case "storage":
      container.innerHTML = renderStorageView();
      break;
    case "hardware":
      container.innerHTML = renderHardwareView();
      break;
    case "replication":
      container.innerHTML = renderReplicationView();
      break;
    case "alerts":
      container.innerHTML = renderAlertsView();
      break;
    case "api":
      container.innerHTML = renderApiView();
      break;
    default:
      container.innerHTML = renderDashboardView();
  }

  if (window.lucide) {
    lucide.createIcons();
  }
}

/* ==========================================================================
   VIEW RENDERERS
   ========================================================================== */

function renderDashboardView() {
  const cap = POWERMAX_DATA.capacity;
  const metrics = appState.liveTelemetry;
  const info = POWERMAX_DATA.arrayInfo;

  return `
    <!-- Top System Summary Header Banner -->
    <div class="card" style="margin-bottom:24px; background: linear-gradient(135deg, rgba(13,20,36,0.9), rgba(0,118,206,0.15));">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
        <div>
          <div style="display:flex; align-items:center; gap:12px; margin-bottom:6px;">
            <h2 style="font-size:22px; font-weight:800; color:#fff;">${info.model} <span style="font-size:14px; font-weight:500; color:var(--dell-cyan);">[SN: ${info.serialNumber}]</span></h2>
            <span class="badge-status optimal">${info.status}</span>
          </div>
          <p style="font-size:13px; color:var(--text-muted);">
            Microcode: <strong>${info.microcode}</strong> | Unisphere: <strong>${info.unisphereVersion}</strong> | Location: <strong>${info.location}</strong> | IP: <strong>${info.ipAddress}</strong>
          </p>
        </div>
        <div style="display:flex; gap:12px;">
          <button class="btn btn-primary" onclick="openProvisionModal()"><i class="lucide-plus"></i> Provision Storage Group</button>
          <button class="btn btn-secondary" onclick="triggerWorkloadSimulation('OLTP_SPIKE')"><i class="lucide-zap"></i> Simulate Stress</button>
        </div>
      </div>
    </div>

    <!-- Executive KPI Metrics Grid -->
    <div class="grid-4" style="margin-bottom:24px;">
      <div class="card kpi-card">
        <span class="kpi-label">ARRAY AGGREGATE IOPS</span>
        <div class="kpi-value" id="kpi-iops-val">${metrics.iops.toLocaleString()}</div>
        <div class="kpi-sub positive"><i class="lucide-arrow-up-right"></i> Read: ${(metrics.readIops/1000).toFixed(1)}K | Write: ${(metrics.writeIops/1000).toFixed(1)}K</div>
      </div>

      <div class="card kpi-card purple">
        <span class="kpi-label">FE THROUGHPUT</span>
        <div class="kpi-value" id="kpi-throughput-val">${(metrics.throughputMBs / 1000).toFixed(2)} GB/s</div>
        <div class="kpi-sub"><i class="lucide-activity"></i> ${metrics.throughputMBs.toLocaleString()} MB/s Read/Write</div>
      </div>

      <div class="card kpi-card emerald">
        <span class="kpi-label">RESPONSE TIME (LATENCY)</span>
        <div class="kpi-value" id="kpi-latency-val">${metrics.latencyMs} ms</div>
        <div class="kpi-sub positive"><i class="lucide-check-circle"></i> Sub-millisecond SLA Compliant</div>
      </div>

      <div class="card kpi-card amber">
        <span class="kpi-label">DATA REDUCTION SAVINGS</span>
        <div class="kpi-value">${cap.dataReductionRatio}:1</div>
        <div class="kpi-sub positive"><i class="lucide-shield-check"></i> ${cap.overallSavingsPct}% Dedupe & Inline Compression</div>
      </div>
    </div>

    <!-- Capacity Telemetry & Storage Group Performance Breakdown -->
    <div class="grid-2" style="margin-bottom:24px;">
      <!-- Capacity Breakdown Card -->
      <div class="card">
        <div class="card-header">
          <span class="card-title"><i class="lucide-database" style="color:var(--dell-cyan);"></i> Usable & Effective Capacity Telemetry</span>
          <span style="font-size:12px; color:var(--text-muted);">Usable Total: <strong>${cap.usableTB} TB</strong></span>
        </div>

        <div style="margin-bottom:16px;">
          <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:6px;">
            <span>Allocated Physical: <strong>${cap.allocatedTB} TB (${((cap.allocatedTB/cap.usableTB)*100).toFixed(1)}%)</strong></span>
            <span>Free Usable: <strong>${cap.freeTB} TB</strong></span>
          </div>
          <div class="progress-container" style="height:12px;">
            <div class="progress-bar" style="width: ${((cap.allocatedTB/cap.usableTB)*100)}%;"></div>
          </div>
        </div>

        <div class="grid-2" style="background:rgba(255,255,255,0.02); padding:12px; border-radius:8px; gap:12px;">
          <div>
            <span style="font-size:11px; color:var(--text-muted); display:block;">EFFECTIVE CAPACITY</span>
            <strong style="font-size:18px; color:var(--accent-emerald);">${cap.effectiveTB} TB</strong>
            <span style="font-size:11px; color:var(--text-dim); display:block;">(With ${cap.dataReductionRatio}:1 Data Reduction)</span>
          </div>
          <div>
            <span style="font-size:11px; color:var(--text-muted); display:block;">THIN SUBSCRIPTION</span>
            <strong style="font-size:18px; color:var(--dell-cyan);">${cap.subscribedTB} TB (${cap.thinSubscriptionPct}%)</strong>
            <span style="font-size:11px; color:var(--text-dim); display:block;">Est. ${cap.daysRemainingUntilFull} days remaining</span>
          </div>
        </div>
      </div>

      <!-- Quick Active Storage Groups Health -->
      <div class="card">
        <div class="card-header">
          <span class="card-title"><i class="lucide-layers" style="color:var(--accent-purple);"></i> Top Active Storage Groups</span>
          <button class="btn btn-secondary" style="font-size:11px; padding:4px 8px;" onclick="appState.currentTab='storage'; renderCurrentTab();">View All</button>
        </div>

        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Storage Group</th>
                <th>SLA Level</th>
                <th>Latency</th>
                <th>Capacity</th>
              </tr>
            </thead>
            <tbody>
              ${POWERMAX_DATA.storageGroups.slice(0, 4).map(sg => `
                <tr>
                  <td><strong>${sg.name}</strong></td>
                  <td><span class="badge-slo">${sg.serviceLevel} (${sg.sloTargetMs}ms)</span></td>
                  <td style="color:${sg.actualLatencyMs <= sg.sloTargetMs ? '#34d399' : '#fbbf24'}; font-weight:600;">
                    ${sg.actualLatencyMs} ms
                  </td>
                  <td>${(sg.allocatedGB/1024).toFixed(1)} TB</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Active Alarms Banner -->
    <div class="card" style="border-left: 4px solid var(--accent-amber);">
      <div class="card-header">
        <span class="card-title"><i class="lucide-alert-triangle" style="color:var(--accent-amber);"></i> Unisphere Array System Advisory Alarms</span>
        <button class="btn btn-secondary" style="font-size:11px; padding:4px 8px;" onclick="appState.currentTab='alerts'; renderCurrentTab();">Alert Center (${POWERMAX_DATA.alerts.length})</button>
      </div>

      <div style="display:flex; flex-direction:column; gap:10px;">
        ${POWERMAX_DATA.alerts.slice(0, 2).map(alt => `
          <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); padding:10px 14px; border-radius:6px; font-size:12px;">
            <div style="display:flex; align-items:center; gap:12px;">
              <span class="badge-status ${alt.severity.toLowerCase()}">${alt.severity}</span>
              <div>
                <strong>${alt.component}</strong>: ${alt.message}
              </div>
            </div>
            <span style="font-size:11px; color:var(--text-muted);">${alt.timestamp}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderPerformanceView() {
  return `
    <!-- Performance Studio Control Toolbar -->
    <div class="toolbar">
      <div class="toolbar-group">
        <span class="toolbar-label"><i class="lucide-sliders"></i> Workload Scenario Simulator:</span>
        <button class="btn btn-secondary" onclick="triggerWorkloadSimulation('NORMAL')">Normal Baseline</button>
        <button class="btn btn-secondary" onclick="triggerWorkloadSimulation('OLTP_SPIKE')">OLTP Peak Spike</button>
        <button class="btn btn-secondary" onclick="triggerWorkloadSimulation('BACKUP_STORM')">Backup Stream Storm</button>
        <button class="btn btn-secondary" onclick="triggerWorkloadSimulation('PATH_FAILOVER')">Path Failover Event</button>
      </div>

      <div class="toolbar-group">
        <span class="toolbar-label">Time Window:</span>
        <select class="select-input" onchange="appState.timeWindow=this.value; renderCurrentTab();">
          <option value="1M_LIVE" selected>Live Telemetry (Real-time)</option>
          <option value="1H">Past 1 Hour</option>
          <option value="24H">Past 24 Hours</option>
          <option value="7D">Past 7 Days</option>
        </select>
      </div>
    </div>

    <!-- Real-Time Telemetry Canvas Charts Grid -->
    <div class="grid-2" style="margin-bottom:20px;">
      <div class="card" style="height:280px;">
        <canvas id="chart-iops"></canvas>
      </div>

      <div class="card" style="height:280px;">
        <canvas id="chart-throughput"></canvas>
      </div>
    </div>

    <div class="grid-2">
      <div class="card" style="height:280px;">
        <canvas id="chart-latency"></canvas>
      </div>

      <div class="card" style="height:280px;">
        <canvas id="chart-cpu"></canvas>
      </div>
    </div>
  `;
}

function renderTopologyView() {
  return `
    <div class="toolbar">
      <div class="toolbar-group">
        <span class="toolbar-label"><i class="lucide-network"></i> Interactive SAN Fibre Channel Fabric Map</span>
      </div>
      <div style="font-size:12px; color:var(--text-muted);">
        Hover or click nodes to inspect HBA WWNs, FC Switch Port RX/TX levels (dBm), and PowerMax Directors
      </div>
    </div>

    <div id="topology-canvas-container">
      <canvas id="topologyCanvas"></canvas>
      <div id="topology-inspector" class="topology-inspector">
        <h4><i class="lucide-info"></i> Node Inspector</h4>
        <p style="font-size:12px; color:var(--text-muted);">Click on any Host HBA, SAN Switch, Director FA Port, or Storage Group node to view link diagnostics.</p>
      </div>
    </div>
  `;
}

function renderStorageView() {
  return `
    <div class="toolbar">
      <div class="toolbar-group">
        <span class="toolbar-label"><i class="lucide-layers"></i> Storage Groups & Masking Views Manager</span>
      </div>
      <button class="btn btn-primary" onclick="openProvisionModal()"><i class="lucide-plus"></i> Create Masking View & Storage Group</button>
    </div>

    <div class="card" style="margin-bottom:24px;">
      <div class="card-header">
        <span class="card-title">Provisioned Storage Groups (${POWERMAX_DATA.storageGroups.length})</span>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Storage Group Name</th>
              <th>Host / Application</th>
              <th>SLO Service Level</th>
              <th>Latency (Target vs Actual)</th>
              <th>Allocated Capacity</th>
              <th>Data Reduction</th>
              <th>Masking Views</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${POWERMAX_DATA.storageGroups.map(sg => `
              <tr>
                <td><strong>${sg.name}</strong></td>
                <td>${sg.host}</td>
                <td><span class="badge-slo">${sg.serviceLevel}</span></td>
                <td>
                  <span style="color:${sg.actualLatencyMs <= sg.sloTargetMs ? '#34d399' : '#fbbf24'}; font-weight:700;">
                    ${sg.actualLatencyMs} ms
                  </span> / ${sg.sloTargetMs} ms
                </td>
                <td>${(sg.allocatedGB/1024).toFixed(1)} TB (${sg.volumesCount} LUNs)</td>
                <td><span style="color:var(--accent-emerald); font-weight:600;">${sg.compressionRatio}</span></td>
                <td>${sg.maskingViewsCount} Active View(s)</td>
                <td>
                  <button class="btn btn-secondary" style="font-size:11px; padding:4px 8px;" onclick="triggerSnapVX('${sg.name}')"><i class="lucide-camera"></i> SnapVX</button>
                  <button class="btn btn-secondary" style="font-size:11px; padding:4px 8px;" onclick="expandStorageGroup('${sg.name}')"><i class="lucide-maximize-2"></i> Expand</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <span class="card-title">Active Masking Views (Host + Port Group + Storage Group)</span>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Masking View Name</th>
              <th>Host Group (WWNs)</th>
              <th>Port Group</th>
              <th>Target Storage Group</th>
              <th>Active Paths</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${POWERMAX_DATA.maskingViews.map(mv => `
              <tr>
                <td><strong>${mv.name}</strong></td>
                <td>${mv.hostGroup}</td>
                <td>${mv.portGroup}</td>
                <td><span style="color:var(--dell-cyan);">${mv.storageGroup}</span></td>
                <td>${mv.pathsCount} FC Paths</td>
                <td><span class="badge-status optimal">${mv.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderHardwareView() {
  return `
    <div class="card" style="margin-bottom:24px;">
      <div class="card-header">
        <span class="card-title"><i class="lucide-cpu" style="color:var(--dell-cyan);"></i> PowerMax Directors Emulation Engine Status</span>
      </div>

      <div class="grid-4">
        ${POWERMAX_DATA.directors.map(dir => `
          <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); padding:14px; border-radius:8px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
              <strong>${dir.id}</strong>
              <span class="badge-status optimal">${dir.status}</span>
            </div>
            <div style="font-size:12px; color:var(--text-muted); margin-bottom:8px;">
              Engine ${dir.engine} | ${dir.type}
            </div>
            <div style="font-size:12px; margin-bottom:4px; display:flex; justify-content:space-between;">
              <span>CPU Core Utilization</span>
              <strong style="color:var(--dell-cyan);">${dir.cpuUtilPct}%</strong>
            </div>
            <div class="progress-container">
              <div class="progress-bar" style="width:${dir.cpuUtilPct}%;"></div>
            </div>
            <div style="font-size:11px; color:var(--text-dim); margin-top:8px;">
              Ports: ${dir.portsCount} | Active Paths: ${dir.activePaths} | Throughput: ${dir.throughputMBs} MB/s
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <span class="card-title"><i class="lucide-hard-drive" style="color:var(--accent-emerald);"></i> Physical NVMe Flash Drive Bay Matrix (DAE Enclosure 1)</span>
        <span style="font-size:12px; color:var(--text-muted);">96 x U.2 Dual-Port Enterprise NVMe SSDs</span>
      </div>

      <div class="chassis-box">
        <div class="chassis-header">
          <span>FRONT DISK ARRAY ENCLOSURE (DAE-01) - 24 BAYS</span>
          <span style="color:var(--accent-emerald);">HEALTH: OPTIMAL</span>
        </div>

        <div class="drive-bay-grid">
          ${Array.from({ length: 24 }).map((_, i) => {
            const slotNum = (i + 1).toString().padStart(2, '0');
            const isWarn = i === 13;
            const wear = isWarn ? 89 : 98 - (i % 4);
            return `
              <div class="drive-slot ${isWarn ? 'warning' : 'healthy'}" onclick="showDriveDetails(${i+1}, ${wear})">
                <span class="drive-num">S${slotNum}</span>
                <span class="wear-indicator">${wear}% Life</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderReplicationView() {
  return `
    <div class="card" style="margin-bottom:24px;">
      <div class="card-header">
        <span class="card-title"><i class="lucide-refresh-cw" style="color:var(--dell-cyan);"></i> SRDF (Symmetrix Remote Data Facility) Active Replication Pairs</span>
        <button class="btn btn-secondary" style="font-size:11px;" onclick="simulateFailover()"><i class="lucide-shield-alert"></i> Simulate DR Failover</button>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Pair Name</th>
              <th>Replication Mode</th>
              <th>Local Storage Group</th>
              <th>Remote Target Array</th>
              <th>State</th>
              <th>RPO Drift</th>
              <th>WAN Bandwidth</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${POWERMAX_DATA.replication.srdfPairs.map(srdf => `
              <tr>
                <td><strong>${srdf.pairName}</strong></td>
                <td><span class="badge-slo">${srdf.mode}</span></td>
                <td>${srdf.localSG}</td>
                <td>${srdf.remoteLocation} (${srdf.remoteArraySN})</td>
                <td><span class="badge-status optimal">${srdf.state}</span></td>
                <td><strong style="color:var(--accent-emerald);">${srdf.rpoSeconds}s</strong> RPO</td>
                <td>${srdf.linkBandwidthMBs} MB/s (${srdf.latencyMs}ms WAN)</td>
                <td>
                  <button class="btn btn-secondary" style="font-size:11px; padding:4px 8px;" onclick="alert('SRDF Link Sync Verified OK')">Verify Link</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <span class="card-title"><i class="lucide-camera" style="color:var(--accent-purple);"></i> TimeFinder SnapVX Instant Snapshots</span>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Snapshot Name</th>
              <th>Storage Group</th>
              <th>Generation</th>
              <th>Created Time</th>
              <th>Delta Space</th>
              <th>State</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${POWERMAX_DATA.replication.snapVx.map(snap => `
              <tr>
                <td><strong>${snap.snapshotName}</strong></td>
                <td>${snap.storageGroup}</td>
                <td>Gen ${snap.generation}</td>
                <td>${snap.createdTime}</td>
                <td>${snap.deltaCapacityGB} GB</td>
                <td><span class="badge-status optimal">${snap.state}</span></td>
                <td>
                  <button class="btn btn-secondary" style="font-size:11px; padding:4px 8px;" onclick="alert('SnapVX Restore Initiated for ${snap.snapshotName}')">Restore / Clone</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderAlertsView() {
  return `
    <div class="card">
      <div class="card-header">
        <span class="card-title"><i class="lucide-alert-octagon" style="color:var(--accent-amber);"></i> Unisphere Array Diagnostic Event Log</span>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Alert ID</th>
              <th>Severity</th>
              <th>Timestamp</th>
              <th>Component</th>
              <th>Event Message & Recommended Remediation</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${POWERMAX_DATA.alerts.map(alt => `
              <tr>
                <td><strong>${alt.id}</strong></td>
                <td><span class="badge-status ${alt.severity.toLowerCase()}">${alt.severity}</span></td>
                <td style="white-space:nowrap;">${alt.timestamp}</td>
                <td><strong>${alt.component}</strong></td>
                <td>
                  <div>${alt.message}</div>
                  <div style="font-size:11px; color:var(--dell-cyan); margin-top:4px;">
                    <i class="lucide-wrench"></i> <strong>Remediation:</strong> ${alt.remediation}
                  </div>
                </td>
                <td>
                  ${alt.acknowledged 
                    ? '<span style="color:var(--text-muted); font-size:11px;">Acknowledged</span>'
                    : `<button class="btn btn-secondary" style="font-size:11px; padding:4px 8px;" onclick="ackAlert('${alt.id}')">Acknowledge</button>`
                  }
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderApiView() {
  const selectedEp = POWERMAX_DATA.apiEndpoints[0];
  return `
    <div class="card" style="margin-bottom:24px;">
      <div class="card-header">
        <span class="card-title"><i class="lucide-code" style="color:var(--dell-cyan);"></i> PowerMax Unisphere REST API Explorer</span>
      </div>

      <p style="font-size:13px; color:var(--text-muted); margin-bottom:16px;">
        Test and simulate raw JSON REST requests against Dell EMC Unisphere REST endpoints (API v101).
      </p>

      <div class="toolbar" style="margin-bottom:16px;">
        <select class="select-input" style="width:100%;" onchange="selectApiEndpoint(this.value)">
          ${POWERMAX_DATA.apiEndpoints.map((ep, idx) => `
            <option value="${idx}">${ep.method} ${ep.endpoint} - ${ep.description}</option>
          `).join('')}
        </select>
      </div>

      <div id="api-output-container">
        <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:6px;">
          <span style="color:var(--text-muted);">HTTP 200 OK (Execution Time: 18ms)</span>
          <button class="btn btn-secondary" style="font-size:11px; padding:2px 8px;" onclick="copyApiCurl()">Copy cURL Request</button>
        </div>
        <pre class="code-block" id="json-preview">${JSON.stringify(selectedEp.sampleResponse, null, 2)}</pre>
      </div>
    </div>
  `;
}

/* ==========================================================================
   INTERACTIVE ACTIONS & MODALS
   ========================================================================== */

function openProvisionModal() {
  const modal = document.getElementById("provisionModal");
  if (modal) modal.classList.add("active");
}

function closeProvisionModal() {
  const modal = document.getElementById("provisionModal");
  if (modal) modal.classList.remove("active");
}

function openAuthModal() {
  const modal = document.getElementById("authModal");
  if (modal) modal.classList.add("active");
}

function closeAuthModal() {
  const modal = document.getElementById("authModal");
  if (modal) modal.classList.remove("active");
}

function bindModalEvents() {
  const form = document.getElementById("provisionForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("sgNameInput").value;
      const slo = document.getElementById("sloSelect").value;
      const size = parseInt(document.getElementById("sizeInput").value) * 1024;
      const host = document.getElementById("hostSelect").value;

      POWERMAX_DATA.storageGroups.unshift({
        name: name,
        serviceLevel: slo,
        sloTargetMs: slo === "Diamond" ? 0.5 : slo === "Platinum" ? 1.0 : 3.0,
        actualLatencyMs: 0.35,
        volumesCount: 8,
        allocatedGB: size,
        usedGB: Math.round(size * 0.4),
        dataReduction: true,
        compressionRatio: "4.2:1",
        maskingViewsCount: 1,
        complianceStatus: "COMPLIANT",
        host: host,
        workloadType: "Enterprise App"
      });

      closeProvisionModal();
      alert(`Storage Group "${name}" and Masking View created successfully!`);
      if (appState.currentTab === "storage" || appState.currentTab === "dashboard") {
        renderCurrentTab();
      }
    });
  }

  const authForm = document.getElementById("authForm");
  if (authForm) {
    authForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const ep = document.getElementById("authEndpointInput").value;
      const sn = document.getElementById("authSnInput").value;
      const user = document.getElementById("authUserInput").value;
      
      POWERMAX_DATA.arrayInfo.serialNumber = sn;
      POWERMAX_DATA.arrayInfo.ipAddress = ep.replace('https://', '').split(':')[0];

      const snDisplay = document.getElementById("header-sn-display");
      if (snDisplay) snDisplay.textContent = sn;

      closeAuthModal();
      alert(`Successfully connected to Unisphere (${ep}) for Array SN: ${sn} as User '${user}'!`);
      renderCurrentTab();
    });
  }
}

function triggerWorkloadSimulation(mode) {
  appState.workloadMode = mode;
  alert(`Workload Scenario Triggered: ${mode}`);
}

function triggerSnapVX(sgName) {
  const newSnap = {
    snapshotName: `SnapVX_${sgName}_Manual_${Date.now().toString().slice(-4)}`,
    storageGroup: sgName,
    generation: 1,
    createdTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
    expirationTime: "2026-08-01 00:00:00",
    deltaCapacityGB: 12.4,
    linkedTargets: 1,
    state: "ESTABLISHED"
  };
  POWERMAX_DATA.replication.snapVx.unshift(newSnap);
  alert(`Instant SnapVX Snapshot generated for ${sgName}!`);
  if (appState.currentTab === "replication") renderCurrentTab();
}

function expandStorageGroup(sgName) {
  const sg = POWERMAX_DATA.storageGroups.find(s => s.name === sgName);
  if (sg) {
    sg.allocatedGB += 5120;
    sg.volumesCount += 4;
    alert(`Storage Group "${sgName}" expanded by +5 TB (Now ${(sg.allocatedGB/1024).toFixed(1)} TB across ${sg.volumesCount} volumes).`);
    renderCurrentTab();
  }
}

function showDriveDetails(slot, wear) {
  alert(`NVMe Drive Slot S${slot.toString().padStart(2, '0')}\nType: U.2 15.36TB NVMe SSD\nWear Life Remaining: ${wear}%\nStatus: HEALTHY`);
}

function ackAlert(id) {
  const alt = POWERMAX_DATA.alerts.find(a => a.id === id);
  if (alt) {
    alt.acknowledged = true;
    renderCurrentTab();
  }
}

function simulateFailover() {
  alert("SRDF/Metro Active-Active Path Swap Initiated. Remote Array 000197900888 promoted to Primary Master. Zero RPO / Zero RTO achieved!");
}

function selectApiEndpoint(idx) {
  const ep = POWERMAX_DATA.apiEndpoints[idx];
  const container = document.getElementById("json-preview");
  if (container) {
    container.textContent = JSON.stringify(ep.sampleResponse, null, 2);
  }
}

function copyApiCurl() {
  alert("cURL snippet copied to clipboard:\ncurl -X GET 'https://192.168.100.45:8443/univmax/restapi/101/sloprovisioning/symmetrix/000197900123/storagegroup' -H 'Authorization: Basic YWRtaW46c2VjcmV0'");
}

/* ==========================================================================
   LIVE REAL-TIME TELEMETRY ENGINE
   ========================================================================== */

function startLiveTelemetryLoop() {
  setInterval(() => {
    // Generate realistic jitter based on current workload mode
    let multiplier = 1.0;
    if (appState.workloadMode === "OLTP_SPIKE") multiplier = 2.4;
    else if (appState.workloadMode === "BACKUP_STORM") multiplier = 3.1;
    else if (appState.workloadMode === "PATH_FAILOVER") multiplier = 1.6;

    const jitter = (Math.random() - 0.48) * 0.06;
    const baseIops = 142850 * multiplier;
    
    appState.liveTelemetry.iops = Math.round(baseIops * (1 + jitter));
    appState.liveTelemetry.readIops = Math.round(appState.liveTelemetry.iops * 0.68);
    appState.liveTelemetry.writeIops = Math.round(appState.liveTelemetry.iops * 0.32);
    appState.liveTelemetry.throughputMBs = Math.round(4820 * multiplier * (1 + jitter));
    appState.liveTelemetry.latencyMs = parseFloat((0.42 * (multiplier > 1.5 ? 1.4 : 1.0) * (1 + jitter * 0.4)).toFixed(2));
    appState.liveTelemetry.directorCpuUtilPct = Math.min(98, Math.round(38.5 * multiplier * (1 + jitter * 0.2)));

    // Push to telemetry history
    const nowStr = new Date().toTimeString().split(" ")[0];
    const h = appState.history;
    h.timestamps.shift();
    h.timestamps.push(nowStr);

    h.iops.shift();
    h.iops.push(appState.liveTelemetry.iops);
    h.readIops.shift();
    h.readIops.push(appState.liveTelemetry.readIops);
    h.writeIops.shift();
    h.writeIops.push(appState.liveTelemetry.writeIops);

    h.throughputMBs.shift();
    h.throughputMBs.push(appState.liveTelemetry.throughputMBs);

    h.latencyMs.shift();
    h.latencyMs.push(appState.liveTelemetry.latencyMs);

    h.cpuUtil.shift();
    h.cpuUtil.push(appState.liveTelemetry.directorCpuUtilPct);

    // Update KPI UI elements live if on Dashboard
    const iopsEl = document.getElementById("kpi-iops-val");
    if (iopsEl) iopsEl.textContent = appState.liveTelemetry.iops.toLocaleString();

    const tpEl = document.getElementById("kpi-throughput-val");
    if (tpEl) tpEl.textContent = (appState.liveTelemetry.throughputMBs / 1000).toFixed(2) + " GB/s";

    const latEl = document.getElementById("kpi-latency-val");
    if (latEl) latEl.textContent = appState.liveTelemetry.latencyMs + " ms";

    // Update Charts if on Performance view
    if (appState.currentTab === "performance") {
      if (charts.iops) charts.iops.render(h);
      if (charts.throughput) charts.throughput.render(h);
      if (charts.latency) charts.latency.render(h);
      if (charts.cpu) charts.cpu.render(h);
    }
  }, 2000);
}
