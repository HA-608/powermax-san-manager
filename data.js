/**
 * Dell EMC PowerMax SAN Infrastructure Management & Telemetry Engine - Data Model
 */

const POWERMAX_DATA = {


  capacity: {
    usableTB: 512.0,
    allocatedTB: 348.5,
    freeTB: 163.5,
    effectiveTB: 1498.55, // Allocated * Data Reduction Ratio
    subscribedTB: 612.4, // Thin provisioning over-subscription
    dataReductionRatio: 4.3, // 4.3:1
    dedupeSavingsPct: 58.2,
    compressionSavingsPct: 34.6,
    overallSavingsPct: 76.7,
    thinSubscriptionPct: 119.6, // 119.6% subscribed
    growthRateTBMonth: 12.4,
    daysRemainingUntilFull: 395
  },

  liveMetrics: {
    iops: 142850,
    readIops: 98400,
    writeIops: 44450,
    throughputMBs: 4820,
    readMBs: 3410,
    writeMBs: 1410,
    latencyMs: 0.42,
    readLatencyMs: 0.35,
    writeLatencyMs: 0.58,
    cacheHitRatioPct: 99.4,
    writePendingPct: 18.2,
    directorCpuUtilPct: 38.5,
    frontEndPortBandwidthPct: 44.2,
    backEndPortBandwidthPct: 31.8
  },

  storageGroups: [
    {
      name: "SG_PRD_Oracle_RAC",
      serviceLevel: "Diamond",
      sloTargetMs: 0.5,
      actualLatencyMs: 0.38,
      volumesCount: 16,
      allocatedGB: 12400,
      usedGB: 9850,
      dataReduction: true,
      compressionRatio: "4.8:1",
      maskingViewsCount: 2,
      complianceStatus: "COMPLIANT",
      host: "HOST_ORACLE_CLUSTER",
      workloadType: "OLTP"
    },
    {
      name: "SG_PRD_SAP_HANA",
      serviceLevel: "Diamond",
      sloTargetMs: 0.5,
      actualLatencyMs: 0.41,
      volumesCount: 24,
      allocatedGB: 32000,
      usedGB: 26400,
      dataReduction: true,
      compressionRatio: "3.9:1",
      maskingViewsCount: 2,
      complianceStatus: "COMPLIANT",
      host: "HOST_SAP_DB01",
      workloadType: "In-Memory DB"
    },
    {
      name: "SG_PRD_VMware_VSAN_Datastores",
      serviceLevel: "Platinum",
      sloTargetMs: 1.0,
      actualLatencyMs: 0.72,
      volumesCount: 32,
      allocatedGB: 85000,
      usedGB: 68900,
      dataReduction: true,
      compressionRatio: "4.5:1",
      maskingViewsCount: 4,
      complianceStatus: "COMPLIANT",
      host: "HOST_VMWARE_CLUSTER_01",
      workloadType: "Virtualization"
    },
    {
      name: "SG_PRD_SQL_Server",
      serviceLevel: "Platinum",
      sloTargetMs: 1.0,
      actualLatencyMs: 0.81,
      volumesCount: 12,
      allocatedGB: 18500,
      usedGB: 14200,
      dataReduction: true,
      compressionRatio: "4.1:1",
      maskingViewsCount: 1,
      complianceStatus: "COMPLIANT",
      host: "HOST_SQL_AG01",
      workloadType: "OLTP"
    },
    {
      name: "SG_DEV_K8s_Persistent_Storage",
      serviceLevel: "Gold",
      sloTargetMs: 3.0,
      actualLatencyMs: 1.45,
      volumesCount: 64,
      allocatedGB: 45000,
      usedGB: 28900,
      dataReduction: true,
      compressionRatio: "5.2:1",
      maskingViewsCount: 2,
      complianceStatus: "COMPLIANT",
      host: "HOST_K8S_WORKERS",
      workloadType: "Containers"
    },
    {
      name: "SG_ARCHIVE_Backups_Veeam",
      serviceLevel: "Bronze",
      sloTargetMs: 10.0,
      actualLatencyMs: 4.80,
      volumesCount: 8,
      allocatedGB: 120000,
      usedGB: 98000,
      dataReduction: true,
      compressionRatio: "6.1:1",
      maskingViewsCount: 1,
      complianceStatus: "COMPLIANT",
      host: "HOST_VEEAM_PROXIES",
      workloadType: "Sequential Backup"
    }
  ],

  maskingViews: [
    {
      name: "MV_PRD_Oracle_RAC_FC",
      hostGroup: "HG_Oracle_RAC_Nodes",
      portGroup: "PG_FA_Engine1_Engine2_FC",
      storageGroup: "SG_PRD_Oracle_RAC",
      status: "ACTIVE",
      createdDate: "2024-11-12",
      pathsCount: 16
    },
    {
      name: "MV_PRD_SAP_HANA_NVMe",
      hostGroup: "HG_SAP_HANA_Hosts",
      portGroup: "PG_SE_NVMe_oF_Direct",
      storageGroup: "SG_PRD_SAP_HANA",
      status: "ACTIVE",
      createdDate: "2025-02-18",
      pathsCount: 8
    },
    {
      name: "MV_PRD_VMware_Cluster_01",
      hostGroup: "HG_ESXi_Cluster_01",
      portGroup: "PG_FA_Engine1_Engine2_FC",
      storageGroup: "SG_PRD_VMware_VSAN_Datastores",
      status: "ACTIVE",
      createdDate: "2024-08-05",
      pathsCount: 32
    },
    {
      name: "MV_PRD_SQL_Server_AG",
      hostGroup: "HG_SQL_Nodes",
      portGroup: "PG_FA_Engine3_Engine4_FC",
      storageGroup: "SG_PRD_SQL_Server",
      status: "ACTIVE",
      createdDate: "2025-01-20",
      pathsCount: 8
    }
  ],

  directors: [
    { id: "ORB-1D", engine: 1, type: "FA (Fibre Channel)", status: "ONLINE", cpuUtilPct: 34, portsCount: 8, activePaths: 64, throughputMBs: 1420 },
    { id: "ORB-2D", engine: 1, type: "FA (Fibre Channel)", status: "ONLINE", cpuUtilPct: 36, portsCount: 8, activePaths: 64, throughputMBs: 1390 },
    { id: "ORB-3D", engine: 2, type: "FA (Fibre Channel)", status: "ONLINE", cpuUtilPct: 41, portsCount: 8, activePaths: 64, throughputMBs: 1650 },
    { id: "ORB-4D", engine: 2, type: "FA (Fibre Channel)", status: "ONLINE", cpuUtilPct: 39, portsCount: 8, activePaths: 64, throughputMBs: 1580 },
    { id: "ORB-5D", engine: 3, type: "SE (NVMe-oF RoCEv2)", status: "ONLINE", cpuUtilPct: 28, portsCount: 4, activePaths: 32, throughputMBs: 2100 },
    { id: "ORB-6D", engine: 3, type: "SE (NVMe-oF RoCEv2)", status: "ONLINE", cpuUtilPct: 31, portsCount: 4, activePaths: 32, throughputMBs: 2050 },
    { id: "ORB-7D", engine: 4, type: "DA (Disk Adapter)", status: "ONLINE", cpuUtilPct: 45, portsCount: 16, activePaths: 96, throughputMBs: 3800 },
    { id: "ORB-8D", engine: 4, type: "DA (Disk Adapter)", status: "ONLINE", cpuUtilPct: 44, portsCount: 16, activePaths: 96, throughputMBs: 3750 }
  ],

  sanFabric: {
    switches: [
      { id: "SW_BROCADE_64G_A", model: "Brocade X7-4 Director (Fabric A)", status: "HEALTHY", portsOnline: 62, totalPorts: 64, speed: "64 Gb/s FC", domainId: 10 },
      { id: "SW_BROCADE_64G_B", model: "Brocade X7-4 Director (Fabric B)", status: "HEALTHY", portsOnline: 60, totalPorts: 64, speed: "64 Gb/s FC", domainId: 11 },
      { id: "SW_CISCO_MDS_A", model: "Cisco MDS 9718 (Fabric A)", status: "HEALTHY", portsOnline: 48, totalPorts: 48, speed: "32 Gb/s FC", domainId: 20 },
      { id: "SW_CISCO_MDS_B", model: "Cisco MDS 9718 (Fabric B)", status: "HEALTHY", portsOnline: 48, totalPorts: 48, speed: "32 Gb/s FC", domainId: 21 }
    ],
    hosts: [
      { name: "esxi-node-01.corp.local", wwns: ["21:00:00:24:ff:8e:10:01", "21:00:00:24:ff:8e:10:02"], os: "VMware ESXi 8.0u2", hba: "Emulex LPe36002 64Gb Dual-Port", iops: 34200, status: "OPTIMAL" },
      { name: "oracle-rac-node1.corp.local", wwns: ["21:00:00:24:ff:9a:40:11", "21:00:00:24:ff:9a:40:12"], os: "RHEL 9.3 Enterprise", hba: "QLogic QLE2772 32Gb Dual-Port", iops: 48900, status: "OPTIMAL" },
      { name: "sap-hana-db01.corp.local", wwns: ["nqn.2014-08.com.dell:nvme:nvm-subsystem-sap01"], os: "SLES 15 SP5 for SAP", hba: "Mellanox ConnectX-6 100Gb NVMe-oF", iops: 52100, status: "OPTIMAL" },
      { name: "sql-cluster-01.corp.local", wwns: ["21:00:00:24:ff:7c:30:05", "21:00:00:24:ff:7c:30:06"], os: "Windows Server 2022", hba: "Emulex LPe35002 32Gb Dual-Port", iops: 21400, status: "OPTIMAL" }
    ]
  },

  replication: {
    srdfPairs: [
      {
        pairName: "SRDF_PRD_Oracle_DR",
        mode: "SRDF/Metro (Active-Active)",
        localSG: "SG_PRD_Oracle_RAC",
        remoteArraySN: "000197900888",
        remoteLocation: "Data Center US-West-2",
        state: "ActiveActive",
        linkStatus: "IN_SYNC",
        rpoSeconds: 0,
        rtoMinutes: 0,
        linkBandwidthMBs: 420,
        latencyMs: 1.8
      },
      {
        pairName: "SRDF_PRD_SAP_Async",
        mode: "SRDF/A (Asynchronous)",
        localSG: "SG_PRD_SAP_HANA",
        remoteArraySN: "000197900888",
        remoteLocation: "Data Center US-West-2",
        state: "Consistent",
        linkStatus: "IN_SYNC",
        rpoSeconds: 15,
        rtoMinutes: 2,
        linkBandwidthMBs: 680,
        latencyMs: 8.5
      },
      {
        pairName: "SRDF_VMware_Sync",
        mode: "SRDF/S (Synchronous)",
        localSG: "SG_PRD_VMware_VSAN_Datastores",
        remoteArraySN: "000197900555",
        remoteLocation: "Data Center US-Central-1",
        state: "Synchronized",
        linkStatus: "IN_SYNC",
        rpoSeconds: 0,
        rtoMinutes: 1,
        linkBandwidthMBs: 890,
        latencyMs: 2.2
      }
    ],
    snapVx: [
      {
        snapshotName: "SnapVX_Oracle_Hourly_0800",
        storageGroup: "SG_PRD_Oracle_RAC",
        generation: 12,
        createdTime: "2026-07-26 08:00:00",
        expirationTime: "2026-07-27 08:00:00",
        deltaCapacityGB: 42.5,
        linkedTargets: 2,
        state: "ESTABLISHED"
      },
      {
        snapshotName: "SnapVX_SAP_PreUpdate_Check",
        storageGroup: "SG_PRD_SAP_HANA",
        generation: 4,
        createdTime: "2026-07-25 22:30:00",
        expirationTime: "2026-08-01 22:30:00",
        deltaCapacityGB: 118.2,
        linkedTargets: 1,
        state: "ESTABLISHED"
      },
      {
        snapshotName: "SnapVX_VMware_Daily_Gold",
        storageGroup: "SG_PRD_VMware_VSAN_Datastores",
        generation: 30,
        createdTime: "2026-07-26 00:00:00",
        expirationTime: "2026-08-26 00:00:00",
        deltaCapacityGB: 340.0,
        linkedTargets: 4,
        state: "ESTABLISHED"
      }
    ]
  },

  alerts: [
    {
      id: "ALT-9042",
      severity: "WARNING",
      timestamp: "2026-07-26 10:45:12",
      component: "Director ORB-3D (FA-2e:0)",
      message: "Port FA-2e:0 light level lower threshold advisory (-12.4 dBm). SFP optical transceiver check recommended.",
      remediation: "Inspect fiber patch cable LC connector on Fabric A switch port 14. Clean optical connector or replace SFP+ module.",
      acknowledged: false
    },
    {
      id: "ALT-9038",
      severity: "INFO",
      timestamp: "2026-07-26 09:15:00",
      component: "SnapVX Engine",
      message: "Automated snapshot policy 'Hourly_Gold_Protection' successfully created 16 snapshots across 4 Storage Groups.",
      remediation: "No action required.",
      acknowledged: true
    },
    {
      id: "ALT-9021",
      severity: "WARNING",
      timestamp: "2026-07-25 18:30:44",
      component: "NVMe Drive Bay DAE-02 Slot 14",
      message: "NVMe Flash SSD Wear Life reached 89% threshold. Estimated replacement needed in 120 days.",
      remediation: "Pre-order replacement U.2 15.36TB Enterprise NVMe SSD (Part # 005053291). Schedule non-disruptive hot-swap maintenance.",
      acknowledged: false
    },
    {
      id: "ALT-8994",
      severity: "CRITICAL",
      timestamp: "2026-07-24 14:02:10",
      component: "SRDF Link Group 4",
      message: "SRDF/A link buffer usage spiked to 88% due to WAN latency jitter (14.2ms). RPO temporarily drifted by 22s.",
      remediation: "WAN link auto-recovered. Verify QoS throttling on WAN router port interface ge-0/0/2.",
      acknowledged: true
    }
  ],

  apiEndpoints: [
    {
      method: "GET",
      endpoint: "/univmax/restapi/101/sloprovisioning/symmetrix/000197900123/storagegroup",
      description: "List all Storage Groups and assigned SLO service levels",
      sampleResponse: {
        "storageGroupId": ["SG_PRD_Oracle_RAC", "SG_PRD_SAP_HANA", "SG_PRD_VMware_VSAN_Datastores", "SG_PRD_SQL_Server"],
        "success": true,
        "executionTimeMs": 18
      }
    },
    {
      method: "POST",
      endpoint: "/univmax/restapi/101/sloprovisioning/symmetrix/000197900123/maskingview",
      description: "Create a new Masking View (Host Group + Port Group + Storage Group)",
      sampleResponse: {
        "maskingViewId": "MV_PRD_NEW_SERVICE",
        "hostGroupId": "HG_PROD_HOSTS",
        "portGroupId": "PG_FA_ENGINE1",
        "storageGroupId": "SG_PRD_NEW_APP",
        "status": "CREATED_SUCCESS"
      }
    },
    {
      method: "GET",
      endpoint: "/univmax/restapi/101/performance/Array/metrics",
      description: "Query real-time array IOPS, latency, and throughput time series telemetry",
      sampleResponse: {
        "symmetrixId": "000197900123",
        "metrics": {
          "IOPS": 142850,
          "MBs": 4820,
          "PercentCacheHits": 99.4,
          "ResponseTimeMs": 0.42
        }
      }
    },
    {
      method: "POST",
      endpoint: "/univmax/restapi/101/replication/symmetrix/000197900123/snapshot",
      description: "Trigger a SnapVX instant zero-space snapshot for a target Storage Group",
      sampleResponse: {
        "snapshotName": "SnapVX_Manual_OnDemand",
        "createdTimestamp": 1785068400,
        "status": "ESTABLISHED"
      }
    }
  ]
};

// Global state container
let appState = {
  currentTab: "dashboard", // dashboard, performance, topology, storage, hardware, replication, alerts, api
  workloadMode: "NORMAL", // NORMAL, OLTP_SPIKE, BACKUP_STORM, PATH_FAILOVER, HEAVY_DEDUPE
  liveTelemetry: JSON.parse(JSON.stringify(POWERMAX_DATA.liveMetrics)),
  history: {
    timestamps: [],
    iops: [],
    readIops: [],
    writeIops: [],
    throughputMBs: [],
    latencyMs: [],
    cpuUtil: []
  },
  filteredStorageGroup: "ALL",
  timeWindow: "1M_LIVE"
};

// Initialize 30 points of historical metrics
(function initMetricsHistory() {
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 3000);
    const timeStr = t.toTimeString().split(" ")[0];
    appState.history.timestamps.push(timeStr);
    
    // Add realistic jitter around base metrics
    const jitter = (Math.random() - 0.5) * 0.08;
    const baseIops = POWERMAX_DATA.liveMetrics.iops;
    appState.history.iops.push(Math.round(baseIops * (1 + jitter)));
    appState.history.readIops.push(Math.round(baseIops * 0.68 * (1 + jitter)));
    appState.history.writeIops.push(Math.round(baseIops * 0.32 * (1 + jitter)));
    appState.history.throughputMBs.push(Math.round(POWERMAX_DATA.liveMetrics.throughputMBs * (1 + jitter)));
    appState.history.latencyMs.push(parseFloat((POWERMAX_DATA.liveMetrics.latencyMs * (1 + jitter * 0.5)).toFixed(2)));
    appState.history.cpuUtil.push(Math.round(POWERMAX_DATA.liveMetrics.directorCpuUtilPct * (1 + jitter * 0.3)));
  }
})();
