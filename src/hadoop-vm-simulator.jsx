import { useState, useRef, useEffect, useCallback } from "react";

// ─── Initial FS Factory ──────────────────────────────────────────
function createInitialState() {
  const localFS = {
    "/": { type: "dir", children: ["opt", "tmp", "home", "datos", "etc", "var", "usr", "bin", "sbin"] },
    "/opt": { type: "dir", children: ["hadoop"] },
    "/opt/hadoop": { type: "dir", children: ["sbin", "etc", "share", "logs", "bin", "hive"] },
    "/opt/hadoop/hive": { type: "dir", children: ["bbdd", "conf", "lib"] },
    "/opt/hadoop/hive/bbdd": { type: "dir", children: ["derby.log", "metastore_db"], files: { "derby.log": "----------------------------------------------------------------\nUsing Derby version 10.14.2.0\njava.vendor=Ubuntu\nos.name=Linux" } },
    "/opt/hadoop/hive/conf": { type: "dir", children: ["hive-site.xml"], files: { "hive-site.xml": "<configuration>\n  <property>\n    <name>javax.jdo.option.ConnectionURL</name>\n    <value>jdbc:derby:;databaseName=/opt/hadoop/hive/bbdd/metastore_db;create=true</value>\n  </property>\n  <property>\n    <name>hive.server2.thrift.port</name>\n    <value>10000</value>\n  </property>\n  <property>\n    <name>hive.server2.webui.port</name>\n    <value>10002</value>\n  </property>\n</configuration>" } },
    "/opt/hadoop/hive/lib": { type: "dir", children: ["hive-exec.jar", "hive-metastore.jar", "hive-jdbc.jar"] },
    "/opt/hadoop/sbin": { type: "dir", children: ["start-dfs.sh", "stop-dfs.sh", "start-yarn.sh", "stop-yarn.sh"], files: { "start-dfs.sh": "#!/bin/bash\n# Start HDFS daemons", "stop-dfs.sh": "#!/bin/bash\n# Stop HDFS", "start-yarn.sh": "#!/bin/bash\n# Start YARN", "stop-yarn.sh": "#!/bin/bash\n# Stop YARN" } },
    "/opt/hadoop/bin": { type: "dir", children: ["hadoop", "hdfs", "yarn", "mapred"] },
    "/opt/hadoop/etc": { type: "dir", children: ["hadoop"] },
    "/opt/hadoop/etc/hadoop": { type: "dir", children: ["core-site.xml", "hdfs-site.xml", "yarn-site.xml", "mapred-site.xml", "workers"], files: { "core-site.xml": "<configuration>\n  <property>\n    <n>fs.defaultFS</n>\n    <value>hdfs://hadoop-VirtualBox:9000</value>\n  </property>\n</configuration>", "hdfs-site.xml": "<configuration>\n  <property>\n    <n>dfs.replication</n><value>2</value>\n  </property>\n  <property>\n    <n>dfs.namenode.name.dir</n><value>file:///datos/namenode</value>\n  </property>\n  <property>\n    <n>dfs.datanode.data.dir</n><value>file:///datos/datanode</value>\n  </property>\n</configuration>", "yarn-site.xml": "<configuration>\n  <property>\n    <n>yarn.nodemanager.resource.memory-mb</n><value>4096</value>\n  </property>\n  <property>\n    <n>yarn.resourcemanager.hostname</n><value>hadoop-VirtualBox</value>\n  </property>\n</configuration>", "mapred-site.xml": "<configuration>\n  <property>\n    <n>mapreduce.framework.name</n><value>yarn</value>\n  </property>\n</configuration>", "workers": "hadoop-VirtualBox\nnodo2\nnodo3" } },
    "/opt/hadoop/share": { type: "dir", children: ["hadoop"] },
    "/opt/hadoop/share/hadoop": { type: "dir", children: ["mapreduce"] },
    "/opt/hadoop/share/hadoop/mapreduce": { type: "dir", children: ["hadoop-mapreduce-examples-3.4.1.jar", "hadoop-mapreduce-client-jobclient-3.4.1-tests.jar"], files: {} },
    "/opt/hadoop/logs": { type: "dir", children: ["hadoop-hadoop-nodemanager-hadoop-VirtualBox.log", "hadoop-hadoop-resourcemanager-hadoop-VirtualBox.log"], files: { "hadoop-hadoop-nodemanager-hadoop-VirtualBox.log": genNMLog(), "hadoop-hadoop-resourcemanager-hadoop-VirtualBox.log": genRMLog() } },
    "/tmp": { type: "dir", children: [], files: {} },
    "/home": { type: "dir", children: ["hadoop"] },
    "/home/hadoop": { type: "dir", children: ["Descargas", "Documentos", "Escritorio"], files: {} },
    "/home/hadoop/Descargas": { type: "dir", children: [], files: {} },
    "/home/hadoop/Documentos": { type: "dir", children: [], files: {} },
    "/home/hadoop/Escritorio": { type: "dir", children: [], files: {} },
    "/datos": { type: "dir", children: ["namenode", "datanode"] },
    "/datos/namenode": { type: "dir", children: ["current"] },
    "/datos/namenode/current": { type: "dir", children: ["VERSION", "fsimage_0000000000000000042", "fsimage_0000000000000000042.md5", "edits_inprogress_0000000000000000043"], files: { "VERSION": "#\n#Mon Jan 01 08:00:00 COT 2026\nnamespaceID=1234567890\nclusterID=CID-a1b2c3d4-e5f6-7890\ncTime=0\nstorageType=NAME_NODE\nblockpoolID=BP-1234567890-127.0.0.1-1700000000000\nlayoutVersion=-66", "fsimage_0000000000000000042": "[binary fsimage data]", "fsimage_0000000000000000042.md5": "a3f2b8c91d4e5f6a7b8c9d0e1f2a3b4c", "edits_inprogress_0000000000000000043": "[binary edits data]" } },
    "/datos/datanode": { type: "dir", children: ["current"] },
    "/datos/datanode/current": { type: "dir", children: ["VERSION", "BP-1234567890-127.0.0.1-1700000000000"], files: { "VERSION": "#\n#Mon Jan 01 08:00:00 COT 2026\nstorageID=DS-abc12345-def6-7890-ghij-klmnopqrstuv\nclusterID=CID-a1b2c3d4-e5f6-7890\ncTime=0\nstorageType=DATA_NODE\nlayoutVersion=-57" } },
    "/datos/datanode/current/BP-1234567890-127.0.0.1-1700000000000": { type: "dir", children: ["current", "tmp"] },
    "/datos/datanode/current/BP-1234567890-127.0.0.1-1700000000000/current": { type: "dir", children: ["VERSION", "finalized", "rbw"], files: { "VERSION": "#\n#Mon Jan 01 08:00:00 COT 2026\nnamespaceid=1234567890\ncTime=0\nblockpoolID=BP-1234567890-127.0.0.1-1700000000000\nlayoutVersion=-57" } },
    "/datos/datanode/current/BP-1234567890-127.0.0.1-1700000000000/current/finalized": { type: "dir", children: ["subdir0"] },
    "/datos/datanode/current/BP-1234567890-127.0.0.1-1700000000000/current/finalized/subdir0": { type: "dir", children: ["subdir0"] },
    "/datos/datanode/current/BP-1234567890-127.0.0.1-1700000000000/current/finalized/subdir0/subdir0": { type: "dir", children: [], files: {} },
    "/datos/datanode/current/BP-1234567890-127.0.0.1-1700000000000/current/rbw": { type: "dir", children: [] },
    "/datos/datanode/current/BP-1234567890-127.0.0.1-1700000000000/tmp": { type: "dir", children: [] },
    "/etc": { type: "dir", children: ["hosts", "hostname"], files: { hosts: "127.0.0.1   localhost\n127.0.1.1   hadoop-VirtualBox\n192.168.56.10 hadoop-VirtualBox\n192.168.56.11 nodo2\n192.168.56.12 nodo3", hostname: "hadoop-VirtualBox" } },
    "/var": { type: "dir", children: ["log"] }, "/var/log": { type: "dir", children: ["syslog"] },
    "/usr": { type: "dir", children: ["bin", "lib"] }, "/usr/bin": { type: "dir", children: [] }, "/usr/lib": { type: "dir", children: [] },
    "/bin": { type: "dir", children: [] }, "/sbin": { type: "dir", children: [] },
  };
  const hdfsFS = { "/": { type: "dir", children: [], owner: "hadoop", group: "supergroup", perms: "drwxr-xr-x" } };
  return { localFS, hdfsFS };
}
function genNMLog() { const l = []; for (let i = 1; i <= 30; i++) { const d = String(i).padStart(2, "0"); l.push(`2026-02-${d} 08:00:01,234 INFO org.apache.hadoop.yarn.server.nodemanager.NodeManager: transitioned from INITED to STARTED`, `2026-02-${d} 08:00:02,567 INFO org.apache.hadoop.yarn.server.nodemanager.containermanager.ContainerManagerImpl: Starting resource-monitoring for container_1700000000000_000${i}_01_000001`, `2026-02-${d} 08:05:15,890 INFO org.apache.hadoop.yarn.server.nodemanager.containermanager.container.ContainerImpl: Container container_1700000000000_000${i}_01_000001 succeeded`); if (i % 7 === 0) l.push(`2026-02-${d} 08:06:00,111 WARN org.apache.hadoop.yarn.server.nodemanager.containermanager.container.ContainerImpl: Container container_1700000000000_000${i}_01_000002 failed`); l.push(`2026-02-${d} 08:00:01,500 INFO org.apache.hadoop.yarn.server.nodemanager.NodeStatusUpdaterImpl: transitioned from STARTED to RUNNING`); } return l.join("\n"); }
function genRMLog() { const l = []; for (let i = 1; i <= 25; i++) { const d = String(i).padStart(2, "0"); l.push(`2026-02-${d} 08:00:00,100 INFO org.apache.hadoop.yarn.server.resourcemanager.ResourceManager: State change from NEW to SUBMITTED for application_1700000000000_000${i}`, `2026-02-${d} 08:00:01,200 INFO org.apache.hadoop.yarn.server.resourcemanager.ResourceManager: State change from SUBMITTED to ACCEPTED for application_1700000000000_000${i}`, `2026-02-${d} 08:00:05,300 INFO org.apache.hadoop.yarn.server.resourcemanager.scheduler.capacity.CapacityScheduler: Assigned container container_1700000000000_000${i}_01_000001 of capacity <memory:1024, vCores:1>`, `2026-02-${d} 08:01:00,400 INFO org.apache.hadoop.yarn.server.resourcemanager.rmnode.RMNodeImpl: NodeManager from node hadoop-VirtualBox:45454 registered with capability: <memory:4096, vCores:4>`); if (i % 10 === 0) l.push(`2026-02-${d} 09:00:00,500 WARN org.apache.hadoop.yarn.server.resourcemanager.rmnode.RMNodeImpl: Node hadoop-VirtualBox:45454 has shutdown gracefully`); } return l.join("\n"); }
function genBenchmark(mode, nrFiles, fileSize) { const rate = mode === "write" ? (45 + Math.random() * 30).toFixed(2) : (80 + Math.random() * 40).toFixed(2); return `26/03/03 10:00:00 INFO fs.TestDFSIO: ----- TestDFSIO ----- : ${mode}\n26/03/03 10:00:00 INFO fs.TestDFSIO:             Date & time: Tue Mar 03 10:00:00 COT 2026\n26/03/03 10:00:00 INFO fs.TestDFSIO:         Number of files: ${nrFiles}\n26/03/03 10:00:00 INFO fs.TestDFSIO:  Total MBytes processed: ${nrFiles * fileSize}\n26/03/03 10:00:00 INFO fs.TestDFSIO:       Throughput mb/sec: ${rate}\n26/03/03 10:00:00 INFO fs.TestDFSIO:  Average IO rate mb/sec: ${(parseFloat(rate) / nrFiles).toFixed(2)}\n26/03/03 10:00:00 INFO fs.TestDFSIO:   IO rate std deviation: ${(Math.random() * 5).toFixed(2)}\n26/03/03 10:00:00 INFO fs.TestDFSIO:      Test exec time sec: ${(10 + Math.random() * 20).toFixed(1)}`; }
function parseTokens(cmd) { const t = []; let c = ""; let q = false; let qc = ""; for (const ch of cmd) { if (q) { if (ch === qc) q = false; else c += ch; } else if (ch === "'" || ch === '"') { q = true; qc = ch; } else if (ch === " " || ch === "\t") { if (c) { t.push(c); c = ""; } } else c += ch; } if (c) t.push(c); return t; }

const STORAGE_KEY = "hadoop-vm-state";
const SLAVE_NODES = { nodo2: { ip: "192.168.56.11", hostname: "nodo2" }, nodo3: { ip: "192.168.56.12", hostname: "nodo3" } };

// ══════════════════════════════════════════════════════════════════
// WEB UI STYLES (reusable)
// ══════════════════════════════════════════════════════════════════
const WS = {
  hdr: { background: "#f8f8f8", borderBottom: "3px solid #e47a2c", padding: "8px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "Verdana, Geneva, sans-serif" },
  nav: { display: "flex", gap: 0, background: "#e8e8e8", borderBottom: "1px solid #ccc", fontFamily: "Verdana, Geneva, sans-serif", fontSize: 12 },
  navBtn: (active) => ({ padding: "7px 14px", background: active ? "#fff" : "transparent", color: active ? "#333" : "#666", border: "none", borderBottom: active ? "2px solid #e47a2c" : "2px solid transparent", cursor: "pointer", fontSize: 12, fontFamily: "Verdana, Geneva, sans-serif", fontWeight: active ? 600 : 400 }),
  card: { background: "#fff", border: "1px solid #ddd", borderRadius: 4, padding: "10px 14px", flex: 1, minWidth: 140 },
  cardTitle: { fontSize: 10, color: "#888", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  cardVal: { fontSize: 20, fontWeight: 700, color: "#333" },
  tbl: { width: "100%", borderCollapse: "collapse", fontSize: 12 },
  th: { background: "#f0f0f0", border: "1px solid #ddd", padding: "6px 10px", textAlign: "left", fontWeight: 600, fontSize: 11, color: "#555" },
  td: { border: "1px solid #eee", padding: "5px 10px", fontSize: 12 },
  section: { margin: "12px 0" },
  sTitle: { fontSize: 14, fontWeight: 600, color: "#333", borderBottom: "1px solid #ddd", paddingBottom: 4, marginBottom: 8 },
  bar: (pct, color) => ({ width: "100%", height: 18, background: "#eee", borderRadius: 3, overflow: "hidden", position: "relative", display: "flex", alignItems: "center" }),
  barFill: (pct, color) => ({ width: `${Math.min(pct, 100)}%`, height: "100%", background: color || "#4a90d9", borderRadius: 3, transition: "width 0.3s" }),
};

// ══════════════════════════════════════════════════════════════════
// HDFS WEB UI COMPONENT (:9870)
// ══════════════════════════════════════════════════════════════════
function HdfsWebUI({ services, hdfsFS, safeMode, hdfsSnapEnabled, fsimageCounter }) {
  const [subTab, setSubTab] = useState("overview");
  const [browsePath, setBrowsePath] = useState("/");
  const isUp = services.namenode;
  const files = hdfsFS ? Object.keys(hdfsFS).filter(k => hdfsFS[k].type === "file") : [];
  const dirs = hdfsFS ? Object.keys(hdfsFS).filter(k => hdfsFS[k].type === "dir") : [];
  const totalSize = files.reduce((s, k) => s + (hdfsFS[k].size || 0), 0);
  const totalCap = 107374182400;
  const usedBytes = totalSize * 2; // replication=2
  const usedPct = Math.max(0.1, (usedBytes / totalCap) * 100);
  const snap = [...hdfsSnapEnabled];

  const datanodes = [
    { host: "hadoop-VirtualBox", ip: "192.168.56.10", port: 9866, cap: "50.00 GB", capB: 53687091200, used: Math.round(usedBytes * 0.5), state: "In Service" },
    { host: "nodo2", ip: "192.168.56.11", port: 9866, cap: "25.00 GB", capB: 26843545600, used: Math.round(usedBytes * 0.25), state: "In Service" },
    { host: "nodo3", ip: "192.168.56.12", port: 9866, cap: "25.00 GB", capB: 26843545600, used: Math.round(usedBytes * 0.25), state: "In Service" },
  ];

  const browseNode = hdfsFS?.[browsePath];
  const browseItems = browseNode ? (browseNode.children || []) : [];

  if (!isUp) return <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", fontFamily: "Verdana, sans-serif" }}><div style={{ textAlign: "center", color: "#c00" }}><div style={{ fontSize: 48, marginBottom: 12 }}>⚠</div><div style={{ fontSize: 16, fontWeight: 600 }}>NameNode no está activo</div><div style={{ fontSize: 13, color: "#888", marginTop: 6 }}>Inicia HDFS: <code>./start-dfs.sh</code></div></div></div>;

  const fmtB = (b) => { if (b >= 1073741824) return (b / 1073741824).toFixed(2) + " GB"; if (b >= 1048576) return (b / 1048576).toFixed(2) + " MB"; if (b >= 1024) return (b / 1024).toFixed(1) + " KB"; return b + " B"; };

  return (
    <div style={{ flex: 1, overflow: "auto", background: "#fafafa", fontFamily: "Verdana, Geneva, sans-serif", fontSize: 13, color: "#333" }}>
      {/* HDFS Header */}
      <div style={WS.hdr}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#e47a2c" }}>🐘 Hadoop</span>
          <span style={{ fontSize: 13, color: "#666" }}>NameNode — hadoop-VirtualBox:9870</span>
        </div>
        <span style={{ fontSize: 11, color: "#999" }}>Version 3.4.1, r2024-01</span>
      </div>
      {/* Sub-navigation */}
      <div style={WS.nav}>
        {[["overview", "Overview"], ["datanodes", "Datanodes"], ["browse", "Browse Directory"], ["journal", "Startup / Journal"]].map(([id, l]) => (
          <button key={id} onClick={() => setSubTab(id)} style={WS.navBtn(subTab === id)}>{l}</button>
        ))}
      </div>
      <div style={{ padding: "12px 18px" }}>
        {/* ── OVERVIEW ── */}
        {subTab === "overview" && <>
          <div style={WS.section}>
            <div style={WS.sTitle}>Summary</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 20px", fontSize: 12.5, lineHeight: 1.9 }}>
              <div><b>Security:</b> OFF</div><div><b>Safe Mode:</b> <span style={{ color: safeMode ? "#c00" : "#090" }}>{safeMode ? "ON" : "OFF"}</span></div>
              <div><b>Started:</b> Tue Mar 03 08:00:00 COT 2026</div><div><b>Version:</b> 3.4.1</div>
              <div><b>Cluster ID:</b> CID-a1b2c3d4-e5f6-7890</div><div><b>Block Pool ID:</b> BP-1234567890-127.0.0.1-1700000000000</div>
            </div>
          </div>
          {/* Capacity */}
          <div style={WS.section}>
            <div style={WS.sTitle}>Cluster Capacity</div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {[["Configured Capacity", fmtB(totalCap), "#4a90d9"], ["DFS Used", fmtB(usedBytes), "#e47a2c"], ["DFS Remaining", fmtB(totalCap - usedBytes), "#5cb85c"], ["Block Pool Used", fmtB(usedBytes), "#d9534f"]].map(([t, v, c]) => (
                <div key={t} style={WS.card}><div style={WS.cardTitle}>{t}</div><div style={{ ...WS.cardVal, color: c, fontSize: 16 }}>{v}</div></div>
              ))}
            </div>
            <div style={{ marginTop: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}><span>DFS Used: {usedPct.toFixed(2)}%</span><span>{fmtB(usedBytes)} / {fmtB(totalCap)}</span></div>
              <div style={WS.bar(usedPct)}><div style={WS.barFill(usedPct, "#4a90d9")} /><span style={{ position: "absolute", width: "100%", textAlign: "center", fontSize: 10, color: "#555", fontWeight: 600 }}>{usedPct.toFixed(1)}%</span></div>
            </div>
          </div>
          {/* Counts */}
          <div style={WS.section}>
            <div style={WS.sTitle}>Files & Blocks</div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <div style={WS.card}><div style={WS.cardTitle}>Files</div><div style={WS.cardVal}>{files.length}</div></div>
              <div style={WS.card}><div style={WS.cardTitle}>Directories</div><div style={WS.cardVal}>{dirs.length}</div></div>
              <div style={WS.card}><div style={WS.cardTitle}>Blocks</div><div style={WS.cardVal}>{files.length}</div><div style={{ fontSize: 10, color: "#888" }}>Replication: 2</div></div>
              <div style={WS.card}><div style={WS.cardTitle}>Live Datanodes</div><div style={{ ...WS.cardVal, color: "#090" }}>3</div></div>
              <div style={WS.card}><div style={WS.cardTitle}>Dead Datanodes</div><div style={{ ...WS.cardVal, color: "#c00" }}>0</div></div>
              <div style={WS.card}><div style={WS.cardTitle}>Snapshottable Dirs</div><div style={WS.cardVal}>{snap.length}</div></div>
            </div>
          </div>
          {/* NameNode Storage */}
          <div style={WS.section}>
            <div style={WS.sTitle}>NameNode Storage</div>
            <table style={WS.tbl}><thead><tr><th style={WS.th}>Storage Directory</th><th style={WS.th}>Type</th><th style={WS.th}>State</th></tr></thead>
              <tbody>
                <tr><td style={WS.td}>/datos/namenode</td><td style={WS.td}>IMAGE_AND_EDITS</td><td style={{ ...WS.td, color: "#090" }}>Active</td></tr>
              </tbody>
            </table>
          </div>
        </>}

        {/* ── DATANODES ── */}
        {subTab === "datanodes" && <>
          <div style={WS.section}>
            <div style={WS.sTitle}>Datanode Information — {datanodes.length} nodes in service</div>
            <table style={WS.tbl}>
              <thead><tr>{["Node", "Hostname", "IP:Port", "Admin State", "Capacity", "Used", "Used%", "Remaining", "Blocks", "Last Contact"].map(h => <th key={h} style={WS.th}>{h}</th>)}</tr></thead>
              <tbody>
                {datanodes.map((dn, i) => {
                  const uPct = ((dn.used / dn.capB) * 100);
                  return (
                    <tr key={i} style={{ background: i % 2 ? "#fafafa" : "#fff" }}>
                      <td style={{ ...WS.td, fontWeight: 600 }}><span style={{ color: "#4a90d9" }}>{dn.host}</span></td>
                      <td style={WS.td}>{dn.host}</td>
                      <td style={WS.td}>{dn.ip}:{dn.port}</td>
                      <td style={{ ...WS.td, color: "#090" }}>{dn.state}</td>
                      <td style={WS.td}>{dn.cap}</td>
                      <td style={WS.td}>{fmtB(dn.used)}</td>
                      <td style={WS.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 60, height: 12, background: "#eee", borderRadius: 2, overflow: "hidden" }}><div style={{ width: `${uPct}%`, height: "100%", background: uPct > 80 ? "#d9534f" : "#4a90d9", borderRadius: 2 }} /></div>
                          <span style={{ fontSize: 11 }}>{uPct.toFixed(2)}%</span>
                        </div>
                      </td>
                      <td style={WS.td}>{fmtB(dn.capB - dn.used)}</td>
                      <td style={WS.td}>{Math.ceil(files.length / 3)}</td>
                      <td style={{ ...WS.td, fontSize: 11 }}>Tue Mar 03 10:00:{String(i * 5).padStart(2, "0")} COT 2026</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Volume Failures */}
          <div style={WS.section}>
            <div style={WS.sTitle}>Volume Failures</div>
            <div style={{ fontSize: 12, color: "#090", padding: 8, background: "#f0fff0", border: "1px solid #cfc", borderRadius: 4 }}>No volume failures detected across any datanodes.</div>
          </div>
        </>}

        {/* ── BROWSE DIRECTORY ── */}
        {subTab === "browse" && <>
          <div style={WS.section}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Browse:</span>
              <span style={{ fontSize: 12, color: "#4a90d9", fontFamily: "monospace" }}>{browsePath}</span>
              {browsePath !== "/" && <button onClick={() => { const p = browsePath.substring(0, browsePath.lastIndexOf("/")) || "/"; setBrowsePath(p); }} style={{ fontSize: 11, background: "#eee", border: "1px solid #ccc", borderRadius: 3, padding: "2px 8px", cursor: "pointer" }}>⬆ Parent</button>}
            </div>
            <table style={WS.tbl}>
              <thead><tr>{["Name", "Type", "Size", "Owner", "Group", "Permissions", "Replication"].map(h => <th key={h} style={WS.th}>{h}</th>)}</tr></thead>
              <tbody>
                {browseItems.length === 0 && <tr><td colSpan={7} style={{ ...WS.td, textAlign: "center", color: "#888" }}>Empty directory</td></tr>}
                {browseItems.map((item, i) => {
                  const fp = browsePath === "/" ? `/${item}` : `${browsePath}/${item}`;
                  const node = hdfsFS[fp];
                  const isDir = node?.type === "dir";
                  return (
                    <tr key={i} style={{ background: i % 2 ? "#fafafa" : "#fff" }}>
                      <td style={WS.td}>{isDir ? <span onClick={() => setBrowsePath(fp)} style={{ color: "#4a90d9", cursor: "pointer", textDecoration: "underline" }}>📁 {item}</span> : <span>📄 {item}</span>}</td>
                      <td style={WS.td}>{isDir ? "Directory" : "File"}</td>
                      <td style={WS.td}>{isDir ? "-" : fmtB(node?.size || 0)}</td>
                      <td style={WS.td}>{node?.owner || "hadoop"}</td>
                      <td style={WS.td}>{node?.group || "supergroup"}</td>
                      <td style={{ ...WS.td, fontFamily: "monospace", fontSize: 11 }}>{isDir ? "drwxr-xr-x" : "-rw-r--r--"}</td>
                      <td style={WS.td}>{isDir ? "-" : "2"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>}

        {/* ── JOURNAL / STARTUP ── */}
        {subTab === "journal" && <>
          <div style={WS.section}>
            <div style={WS.sTitle}>NameNode Journal Status</div>
            <table style={WS.tbl}>
              <thead><tr>{["Journal Manager", "State", "Unsynced Transactions"].map(h => <th key={h} style={WS.th}>{h}</th>)}</tr></thead>
              <tbody>
                <tr><td style={WS.td}>FileJournalManager(root=/datos/namenode)</td><td style={{ ...WS.td, color: "#090" }}>Active</td><td style={WS.td}>0</td></tr>
              </tbody>
            </table>
          </div>
          <div style={WS.section}>
            <div style={WS.sTitle}>Namespace Checkpoint</div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <div style={WS.card}><div style={WS.cardTitle}>Latest Checkpoint</div><div style={{ fontSize: 13, fontWeight: 600 }}>fsimage_{String(fsimageCounter).padStart(19, "0")}</div></div>
              <div style={WS.card}><div style={WS.cardTitle}>Transaction ID</div><div style={{ fontSize: 13, fontWeight: 600 }}>{fsimageCounter}</div></div>
              <div style={WS.card}><div style={WS.cardTitle}>Checkpoint Time</div><div style={{ fontSize: 12 }}>Tue Mar 03 10:00:00 COT 2026</div></div>
            </div>
          </div>
          <div style={WS.section}>
            <div style={WS.sTitle}>Startup Progress</div>
            {["Loading fsimage", "Loading edits", "Saving checkpoint", "Safe mode"].map((phase, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ width: 160, fontSize: 12 }}>{phase}</span>
                <div style={{ flex: 1, height: 16, background: "#eee", borderRadius: 3, overflow: "hidden" }}><div style={{ width: "100%", height: "100%", background: "#5cb85c", borderRadius: 3 }} /></div>
                <span style={{ fontSize: 11, color: "#090", fontWeight: 600, width: 50 }}>100%</span>
              </div>
            ))}
          </div>
        </>}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// YARN WEB UI COMPONENT (:8088)
// ══════════════════════════════════════════════════════════════════
// ── Info Modal ──────────────────────────────────────────────────
function InfoModal({ title, children, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 6, padding: "24px 28px", maxWidth: 540, width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,0.18)", fontFamily: "Verdana, Geneva, sans-serif", fontSize: 13, color: "#333", maxHeight: "80vh", overflow: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, borderBottom: "2px solid #0b7285", paddingBottom: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#0b7285" }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#888", lineHeight: 1 }}>×</button>
        </div>
        <div style={{ lineHeight: 1.75, fontSize: 12.5 }}>{children}</div>
      </div>
    </div>
  );
}
function InfoBtn({ title, children }) {
  const [open, setOpen] = useState(false);
  return <>
    <button onClick={() => setOpen(true)} title="¿Qué es esto?" style={{ background: "#e8f4f8", border: "1px solid #0b7285", borderRadius: "50%", width: 17, height: 17, fontSize: 10, cursor: "pointer", color: "#0b7285", fontWeight: 700, lineHeight: "15px", padding: 0, marginLeft: 6, flexShrink: 0 }}>?</button>
    {open && <InfoModal title={title} onClose={() => setOpen(false)}>{children}</InfoModal>}
  </>;
}

// ── YARN Web UI ──────────────────────────────────────────────────
function YarnWebUI({ services, yarnApps }) {
  const [section, setSection] = useState("about");
  const [appFilter, setAppFilter] = useState("ALL");
  const isUp = services.resourcemanager;

  const apps = yarnApps || [];
  const finished = apps.filter(a => a.state === "FINISHED").length;
  const running = apps.filter(a => a.state === "RUNNING").length;
  const killed = apps.filter(a => a.state === "KILLED").length;
  const totalContainers = finished * 2 + running * 3;
  const memUsed = running > 0 ? 3200 + running * 1024 : 1024;
  const memTotal = 12288;
  const vcUsed = running > 0 ? 1 + running * 2 : 1;
  const vcTotal = 8;

  const nodes = [
    { host: "hadoop-VirtualBox", port: 45454, http: 8042, state: "RUNNING", rack: "/default-rack", mem: 4096, memUsed: running > 0 ? 3200 : 512, vc: 4, vcUsed: running > 0 ? 2 : 1, containers: running > 0 ? Math.ceil(running * 0.5) : 0, lastHealth: "Tue Mar 03 10:00:00 COT 2026", version: "3.4.1" },
    { host: "nodo2", port: 45454, http: 8042, state: "RUNNING", rack: "/default-rack", mem: 4096, memUsed: running > 0 ? 1500 : 256, vc: 2, vcUsed: running > 0 ? 1 : 0, containers: running > 0 ? Math.ceil(running * 0.3) : 0, lastHealth: "Tue Mar 03 10:00:02 COT 2026", version: "3.4.1" },
    { host: "nodo3", port: 45454, http: 8042, state: "RUNNING", rack: "/default-rack", mem: 4096, memUsed: running > 0 ? 1500 : 256, vc: 2, vcUsed: running > 0 ? 1 : 0, containers: running > 0 ? Math.ceil(running * 0.2) : 0, lastHealth: "Tue Mar 03 10:00:04 COT 2026", version: "3.4.1" },
  ];

  const filteredApps = appFilter === "ALL" ? apps : apps.filter(a => a.state === appFilter);

  const SideLink = ({ id, label }) => (
    <div onClick={() => setSection(id)} style={{ padding: "3px 8px 3px 16px", cursor: "pointer", color: section === id ? "#0b7285" : "#4a90d9", textDecoration: "underline", fontSize: 12, fontWeight: section === id ? 700 : 400 }}>{label}</div>
  );
  const SideGroup = ({ label, children }) => (
    <div style={{ marginBottom: 6 }}>
      <div style={{ padding: "4px 8px", fontWeight: 700, fontSize: 12, color: "#333", cursor: "pointer", userSelect: "none" }}>▾ {label}</div>
      {children}
    </div>
  );

  const DonutChart = ({ pct, color, label, sub }) => (
    <div style={{ textAlign: "center" }}>
      <div style={{ position: "relative", width: 100, height: 100, margin: "0 auto 6px" }}>
        <svg viewBox="0 0 36 36" style={{ width: 100, height: 100, transform: "rotate(-90deg)" }}>
          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e8e8e8" strokeWidth="4" />
          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={color} strokeWidth="4" strokeDasharray={`${Math.min(pct, 100)}, 100`} strokeLinecap="round" />
        </svg>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#333" }}>{pct.toFixed(0)}%</div>
          <div style={{ fontSize: 9, color: "#999" }}>{sub}</div>
        </div>
      </div>
      <div style={{ fontSize: 11, color: "#555" }}>{label}</div>
    </div>
  );

  if (!isUp) return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5", fontFamily: "Verdana, sans-serif" }}>
      <div style={{ textAlign: "center", color: "#c00" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>⚠</div>
        <div style={{ fontSize: 16, fontWeight: 600 }}>ResourceManager no está activo</div>
        <div style={{ fontSize: 13, color: "#888", marginTop: 6 }}>Inicia YARN: <code>./start-yarn.sh</code></div>
      </div>
    </div>
  );

  return (
    <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", background: "#f5f5f5", fontFamily: "Verdana, Geneva, sans-serif", fontSize: 13, color: "#333" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "3px solid #0b7285", padding: "7px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22, fontWeight: 900, color: "#e47a2c", letterSpacing: -1 }}>hadoop</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#333" }}>ResourceManager</span>
          <span style={{ fontSize: 11, color: "#999", marginLeft: 4 }}>hadoop-VirtualBox:8088</span>
        </div>
        <span style={{ fontSize: 11, color: "#aaa" }}>Hadoop 3.4.1 · CapacityScheduler</span>
      </div>

      <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>
        {/* Sidebar */}
        <div style={{ width: 160, background: "#fff", borderRight: "1px solid #ddd", flexShrink: 0, overflowY: "auto", paddingTop: 10, fontSize: 12 }}>
          <SideGroup label="Cluster">
            <SideLink id="about" label="About" />
            <SideLink id="nodes" label="Nodes" />
            <SideLink id="nodelabels" label="Node Labels" />
            <div style={{ padding: "3px 8px 3px 12px", fontSize: 11, color: "#888", fontWeight: 600, marginTop: 4 }}>Applications</div>
            {["ALL", "NEW", "SUBMITTED", "ACCEPTED", "RUNNING", "FINISHED", "FAILED", "KILLED"].map(s => (
              <div key={s} onClick={() => { setSection("apps"); setAppFilter(s === "ALL" ? "ALL" : s); }} style={{ padding: "2px 8px 2px 22px", cursor: "pointer", color: "#4a90d9", textDecoration: "underline", fontSize: 11 }}>{s}</div>
            ))}
            <SideLink id="scheduler" label="Scheduler" />
          </SideGroup>
          <SideGroup label="Tools">
            <SideLink id="tools" label="Configuration" />
          </SideGroup>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflow: "auto", padding: "14px 20px" }}>

          {/* ── ABOUT ── */}
          {section === "about" && <>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
              <span style={WS.sTitle}>Cluster Metrics</span>
              <InfoBtn title="Cluster Metrics — YARN">
                <p><b>Apps Submitted:</b> total de aplicaciones MapReduce/YARN enviadas al clúster desde que arrancó el ResourceManager.</p>
                <p><b>Apps Running:</b> aplicaciones actualmente en ejecución. Cada una ocupa contenedores (memoria + VCores).</p>
                <p><b>Apps Completed:</b> aplicaciones que terminaron con éxito (FinalStatus = SUCCEEDED).</p>
                <p><b>Containers Running:</b> número de contenedores activos. Un job MapReduce usa al menos 1 contenedor ApplicationMaster + N mappers + M reducers.</p>
                <p><b>Memory Used/Total:</b> MB de RAM del clúster asignados a contenedores vs. capacidad total configurable en yarn-site.xml (<code>yarn.nodemanager.resource.memory-mb</code>).</p>
                <p><b>VCores Used/Total:</b> núcleos virtuales asignados. Configurado en <code>yarn.nodemanager.resource.cpu-vcores</code>.</p>
              </InfoBtn>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
              {[["Apps Submitted", apps.length, "#4a90d9"], ["Apps Running", running, "#f0ad4e"], ["Apps Completed", finished, "#5cb85c"], ["Apps Killed", killed, "#d9534f"], ["Containers Running", totalContainers, "#5bc0de"], ["Memory Used", `${(memUsed/1024).toFixed(1)} GB`, "#e47a2c"], ["Memory Total", `${(memTotal/1024).toFixed(0)} GB`, "#555"], ["VCores Used", vcUsed, "#9b59b6"], ["VCores Total", vcTotal, "#555"]].map(([t, v, c]) => (
                <div key={t} style={{ ...WS.card, minWidth: 110 }}><div style={WS.cardTitle}>{t}</div><div style={{ ...WS.cardVal, color: c, fontSize: 17 }}>{v}</div></div>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
              <span style={WS.sTitle}>Cluster Nodes Metrics</span>
              <InfoBtn title="Cluster Nodes Metrics">
                <p><b>Active Nodes:</b> NodeManagers que están respondiendo heartbeats al ResourceManager. Si un nodo deja de enviar heartbeats por más de 10 minutos, pasa a estado LOST.</p>
                <p><b>Decommissioning/Decommissioned:</b> nodos que están siendo retirados del clúster de forma controlada. Se esperan a que terminen sus contenedores antes de apagarse.</p>
                <p><b>Lost Nodes:</b> nodos que no han enviado heartbeat y se consideran caídos. Los contenedores que tenían se marcan como fallidos.</p>
                <p><b>Unhealthy Nodes:</b> nodos que reportan problemas (poco espacio en disco, etc.) y no reciben nuevos contenedores.</p>
              </InfoBtn>
            </div>
            <table style={{ ...WS.tbl, marginBottom: 16 }}>
              <thead><tr>{["Active Nodes", "Decommissioning Nodes", "Decommissioned Nodes", "Lost Nodes", "Unhealthy Nodes", "Rebooted Nodes", "Shutdown Nodes"].map(h => <th key={h} style={WS.th}>{h}</th>)}</tr></thead>
              <tbody><tr>{[3, 0, 0, 0, 0, 0, 0].map((v, i) => <td key={i} style={{ ...WS.td, color: i === 0 ? "#090" : v > 0 ? "#c00" : "#333", fontWeight: i === 0 || v > 0 ? 700 : 400 }}>{v}</td>)}</tr></tbody>
            </table>

            <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
              <span style={WS.sTitle}>Scheduler Metrics</span>
              <InfoBtn title="Scheduler Metrics — CapacityScheduler">
                <p><b>Scheduler Type:</b> YARN soporta tres schedulers: FIFO (simple cola), Capacity Scheduler (colas con capacidad garantizada, el más usado en producción) y Fair Scheduler (reparte recursos equitativamente).</p>
                <p><b>Minimum Allocation:</b> la cantidad mínima de recursos que YARN asigna a un contenedor. Si una app pide menos, igual recibe el mínimo.</p>
                <p><b>Maximum Allocation:</b> el máximo por contenedor. Configurado en <code>yarn.scheduler.maximum-allocation-mb</code> y <code>yarn.scheduler.maximum-allocation-vcores</code>.</p>
                <p><b>Maximum Cluster Application Priority:</b> prioridad máxima que puede tener una aplicación. Las de mayor prioridad reciben recursos primero.</p>
              </InfoBtn>
            </div>
            <table style={{ ...WS.tbl, marginBottom: 16 }}>
              <thead><tr>{["Scheduler Type", "Scheduling Resource Type", "Minimum Allocation", "Maximum Allocation", "Maximum Cluster Application Priority"].map(h => <th key={h} style={WS.th}>{h}</th>)}</tr></thead>
              <tbody><tr>
                <td style={WS.td}>Capacity Scheduler</td>
                <td style={WS.td}>[memory-mb (unit=Mi), vcores]</td>
                <td style={WS.td}>&lt;memory:1024, vCores:1&gt;</td>
                <td style={WS.td}>&lt;memory:4096, vCores:4&gt;</td>
                <td style={WS.td}>0</td>
              </tr></tbody>
            </table>

            <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 4, padding: "10px 14px", fontSize: 12, lineHeight: 2 }}>
              <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "0 10px" }}>
                <b>Cluster ID:</b><span>1700000000000</span>
                <b>ResourceManager state:</b><span style={{ color: "#090" }}>STARTED</span>
                <b>ResourceManager HA state:</b><span>active</span>
                <b>ResourceManager RMStateStore:</b><span>org.apache.hadoop.yarn.server.resourcemanager.recovery.NullRMStateStore</span>
                <b>ResourceManager started on:</b><span>Tue Mar 03 08:00:00 COT 2026</span>
                <b>ResourceManager version:</b><span>3.4.1</span>
                <b>Hadoop version:</b><span>3.4.1</span>
              </div>
            </div>
          </>}

          {/* ── NODES ── */}
          {section === "nodes" && <>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
              <span style={WS.sTitle}>Nodes of the cluster</span>
              <InfoBtn title="NodeManagers">
                <p>Cada <b>NodeManager</b> es un agente que corre en cada nodo del clúster. Su responsabilidad es:</p>
                <ul style={{ paddingLeft: 18 }}>
                  <li>Lanzar y monitorear <b>contenedores</b> (procesos con recursos asignados)</li>
                  <li>Reportar recursos disponibles y estado de salud al ResourceManager cada pocos segundos (<b>heartbeat</b>)</li>
                  <li>Gestionar logs de los contenedores</li>
                </ul>
                <p><b>HTTP Address:</b> puerto 8042 donde corre la UI web del NodeManager individual.</p>
                <p><b>Last health-report:</b> timestamp del último heartbeat recibido. Si supera 10 min sin heartbeat, el nodo se considera LOST.</p>
                <p><b>Containers:</b> número de contenedores activos actualmente en ese nodo. Cada contenedor es un proceso Java con memoria y VCores asignados.</p>
              </InfoBtn>
            </div>
            <table style={WS.tbl}>
              <thead><tr>{["Node Address", "Node HTTP Address", "Rack", "Node State", "Containers", "Mem Used", "Mem Avail", "VCores Used", "VCores Avail", "Version", "Last health-report"].map(h => <th key={h} style={WS.th}>{h}</th>)}</tr></thead>
              <tbody>
                {nodes.map((n, i) => (
                  <tr key={i} style={{ background: i % 2 ? "#fafafa" : "#fff" }}>
                    <td style={{ ...WS.td, color: "#4a90d9", fontWeight: 600 }}>{n.host}:{n.port}</td>
                    <td style={{ ...WS.td, color: "#4a90d9" }}>{n.host}:{n.http}</td>
                    <td style={WS.td}>{n.rack}</td>
                    <td style={{ ...WS.td, color: "#090", fontWeight: 600 }}>{n.state}</td>
                    <td style={WS.td}>{n.containers}</td>
                    <td style={WS.td}>{n.memUsed} MB</td>
                    <td style={WS.td}>{n.mem - n.memUsed} MB</td>
                    <td style={WS.td}>{n.vcUsed}</td>
                    <td style={WS.td}>{n.vc - n.vcUsed}</td>
                    <td style={{ ...WS.td, fontSize: 11 }}>{n.version}</td>
                    <td style={{ ...WS.td, fontSize: 11 }}>{n.lastHealth}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}><span style={WS.sTitle}>Resource usage per node</span><InfoBtn title="Uso de recursos por nodo"><p>Visualización del consumo de <b>memoria</b> y <b>VCores</b> en cada NodeManager del clúster. La barra verde indica el porcentaje utilizado respecto al total configurado en <code>yarn.nodemanager.resource.memory-mb</code> y <code>yarn.nodemanager.resource.cpu-vcores</code>.</p></InfoBtn></div>
              {nodes.map((n, i) => (
                <div key={i} style={{ marginBottom: 10, padding: "10px 14px", background: "#fff", border: "1px solid #ddd", borderRadius: 4 }}>
                  <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 13 }}>{n.host} <span style={{ fontSize: 11, color: "#090", fontWeight: 400 }}>● RUNNING</span></div>
                  <div style={{ display: "flex", gap: 24 }}>
                    {[["Memory", n.memUsed, n.mem, "MB", "#0b7285"], ["VCores", n.vcUsed, n.vc, "cores", "#9b59b6"]].map(([lbl, used, total, unit, color]) => (
                      <div key={lbl} style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}><span>{lbl}</span><span style={{ color: "#666" }}>{used} / {total} {unit}</span></div>
                        <div style={{ height: 14, background: "#eee", borderRadius: 3, overflow: "hidden" }}><div style={{ height: "100%", width: `${(used/total)*100}%`, background: color, borderRadius: 3 }} /></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>}

          {/* ── NODE LABELS ── */}
          {section === "nodelabels" && <>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
              <span style={WS.sTitle}>Node Labels</span>
              <InfoBtn title="Node Labels">
                <p>Los <b>Node Labels</b> permiten etiquetar nodos del clúster para que ciertas aplicaciones o colas puedan solicitar nodos con características específicas (ej. nodos con GPU, nodos de alta memoria).</p>
                <p>En este clúster no hay etiquetas configuradas (configuración estándar). En producción se definen en <code>yarn.node-labels.enabled=true</code> y se asignan con:</p>
                <code style={{ background: "#f5f5f5", padding: "4px 8px", display: "block", marginTop: 6, borderRadius: 3 }}>yarn rmadmin -addToClusterNodeLabels "label1,label2"</code>
              </InfoBtn>
            </div>
            <div style={{ background: "#fff5cc", border: "1px solid #e6d87a", borderRadius: 4, padding: 12, fontSize: 12, color: "#7a6a00" }}>
              Node Labels are not enabled on this cluster. To enable, set <code>yarn.node-labels.enabled=true</code> in yarn-site.xml.
            </div>
          </>}

          {/* ── APPLICATIONS ── */}
          {section === "apps" && <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={WS.sTitle}>Applications — {filteredApps.length} entries</span>
                <InfoBtn title="Applications YARN">
                  <p>Lista de todas las aplicaciones enviadas al clúster YARN. Cada aplicación tiene un <b>Application ID</b> único del tipo <code>application_&lt;timestamp&gt;_&lt;secuencia&gt;</code>.</p>
                  <p><b>Estados posibles:</b></p>
                  <ul style={{ paddingLeft: 18 }}>
                    <li><b>NEW/SUBMITTED/ACCEPTED:</b> la aplicación está en cola esperando recursos</li>
                    <li><b>RUNNING:</b> el ApplicationMaster está activo y ejecutando tareas</li>
                    <li><b>FINISHED:</b> completó. FinalStatus puede ser SUCCEEDED, FAILED o KILLED</li>
                  </ul>
                  <p><b>ApplicationMaster (AM):</b> proceso especial que negocia recursos con el ResourceManager y coordina los contenedores del job.</p>
                  <p><b>Progress:</b> porcentaje de completitud reportado por el AM.</p>
                </InfoBtn>
              </div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {["ALL", "RUNNING", "FINISHED", "KILLED", "FAILED"].map(f => (
                  <button key={f} onClick={() => setAppFilter(f)} style={{ padding: "3px 10px", fontSize: 11, background: appFilter === f ? "#0b7285" : "#eee", color: appFilter === f ? "#fff" : "#555", border: "1px solid #ccc", borderRadius: 3, cursor: "pointer" }}>{f}</button>
                ))}
              </div>
            </div>
            <table style={WS.tbl}>
              <thead><tr>{["ID", "User", "Name", "Application Type", "Queue", "Application Priority", "StartTime", "FinishTime", "State", "FinalStatus", "Running Containers", "Allocated CPU VCores", "Allocated Memory MB", "Progress", "Tracking UI"].map(h => <th key={h} style={{ ...WS.th, fontSize: 10 }}>{h}</th>)}</tr></thead>
              <tbody>
                {filteredApps.length === 0 && <tr><td colSpan={15} style={{ ...WS.td, textAlign: "center", color: "#888", padding: 20 }}>No data available in table</td></tr>}
                {filteredApps.map((app, i) => {
                  const aid = `application_1700000000000_${String(app.id).padStart(4, "0")}`;
                  const stColor = app.state === "FINISHED" ? "#090" : app.state === "RUNNING" ? "#f0ad4e" : app.state === "KILLED" ? "#c00" : "#4a90d9";
                  const pct = app.state === "FINISHED" ? 100 : app.state === "RUNNING" ? 45 : 0;
                  return (
                    <tr key={i} style={{ background: i % 2 ? "#fafafa" : "#fff" }}>
                      <td style={{ ...WS.td, fontFamily: "monospace", fontSize: 10, color: "#4a90d9" }}>{aid}</td>
                      <td style={WS.td}>hadoop</td>
                      <td style={{ ...WS.td, fontWeight: 600 }}>{app.name}</td>
                      <td style={WS.td}>MAPREDUCE</td>
                      <td style={WS.td}>default</td>
                      <td style={{ ...WS.td, textAlign: "center" }}>0</td>
                      <td style={{ ...WS.td, fontSize: 10 }}>Tue Mar 03 10:{String(app.id).padStart(2,"0")}:00 COT 2026</td>
                      <td style={{ ...WS.td, fontSize: 10 }}>{app.state === "FINISHED" ? `Tue Mar 03 10:${String(app.id + 2).padStart(2,"0")}:35 COT 2026` : "N/A"}</td>
                      <td style={{ ...WS.td, color: stColor, fontWeight: 600 }}>{app.state}</td>
                      <td style={WS.td}>{app.state === "FINISHED" ? "SUCCEEDED" : app.state === "KILLED" ? "KILLED" : "UNDEFINED"}</td>
                      <td style={{ ...WS.td, textAlign: "center" }}>{app.state === "RUNNING" ? 3 : 0}</td>
                      <td style={{ ...WS.td, textAlign: "center" }}>{app.state === "RUNNING" ? 2 : 0}</td>
                      <td style={{ ...WS.td, textAlign: "center" }}>{app.state === "RUNNING" ? 2048 : 0}</td>
                      <td style={WS.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <div style={{ width: 50, height: 10, background: "#eee", borderRadius: 2, overflow: "hidden" }}><div style={{ width: `${pct}%`, height: "100%", background: pct === 100 ? "#5cb85c" : "#f0ad4e" }} /></div>
                          <span style={{ fontSize: 10 }}>{pct}%</span>
                        </div>
                      </td>
                      <td style={{ ...WS.td, color: "#4a90d9", fontSize: 11 }}>{app.state === "FINISHED" ? "History" : "ApplicationMaster"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ fontSize: 11, color: "#888", marginTop: 6 }}>Showing {filteredApps.length} to {filteredApps.length} of {filteredApps.length} entries</div>
          </>}

          {/* ── SCHEDULER ── */}
          {section === "scheduler" && <>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
              <span style={WS.sTitle}>Application Queues</span>
              <InfoBtn title="CapacityScheduler — Colas">
                <p>El <b>CapacityScheduler</b> organiza los recursos del clúster en colas jerárquicas. Cada cola tiene una capacidad garantizada y una capacidad máxima.</p>
                <p><b>Queue root.default:</b> cola predeterminada. Todas las apps van aquí si no especifican otra cola con <code>-Dmapreduce.job.queuename=nombre</code>.</p>
                <p><b>Capacity (100%):</b> esta cola puede usar hasta el 100% de los recursos del clúster cuando están disponibles.</p>
                <p><b>Used Capacity:</b> porcentaje de recursos de la cola actualmente asignados a contenedores activos.</p>
                <p><b>Absolute Used Capacity:</b> porcentaje respecto al total del clúster (no relativo a la cola).</p>
                <p><b>Max Applications:</b> número máximo de apps concurrentes en la cola (default: 10000).</p>
                <p><b>AM Resource Limit:</b> porcentaje máximo de recursos de la cola que puede usar el conjunto de ApplicationMasters (evita que los AMs monopolicen el clúster).</p>
              </InfoBtn>
            </div>
            {/* Legend */}
            <div style={{ display: "flex", gap: 16, marginBottom: 12, flexWrap: "wrap", background: "#fff", border: "1px solid #ddd", borderRadius: 4, padding: "8px 14px", fontSize: 11 }}>
              {[["#5cb85c", "Capacity"], ["#0b7285", "Used (normal)"], ["#e47a2c", "Used (over capacity)"], ["#9b59b6", "Max Capacity"], ["#f0ad4e", "Users Requesting Resources"]].map(([c, l]) => (
                <span key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 14, height: 14, background: c, borderRadius: 2, display: "inline-block" }} />{l}</span>
              ))}
            </div>
            {/* root queue visual */}
            <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 4, padding: 14, marginBottom: 14 }}>
              <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 13 }}>▾ Queue: root <span style={{ fontSize: 11, color: "#888", fontWeight: 400 }}>— {((memUsed/memTotal)*100).toFixed(1)}% used</span></div>
              <div style={{ height: 18, background: "#e8e8e8", borderRadius: 3, overflow: "hidden", marginBottom: 6, position: "relative" }}>
                <div style={{ width: `${(memUsed/memTotal)*100}%`, height: "100%", background: "#0b7285" }} />
                <span style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", fontSize: 10, fontWeight: 700, color: "#333" }}>{((memUsed/memTotal)*100).toFixed(1)}% used</span>
              </div>
              <div style={{ fontWeight: 600, marginBottom: 8, marginLeft: 16, fontSize: 12 }}>▾ Queue: default <span style={{ fontSize: 11, color: "#888", fontWeight: 400 }}>— {((memUsed/memTotal)*100).toFixed(1)}% used</span></div>
              <div style={{ height: 14, background: "#e8e8e8", borderRadius: 3, overflow: "hidden", marginLeft: 16 }}>
                <div style={{ width: `${(memUsed/memTotal)*100}%`, height: "100%", background: "#0b7285" }} />
              </div>
            </div>
            {/* Queue table */}
            <table style={WS.tbl}>
              <thead><tr>{["Queue Name", "State", "Used Capacity", "Abs. Used Capacity", "Abs. Configured Capacity", "Abs. Max Capacity", "Used Resources", "Num Active Applications", "Num Pending Applications", "Min Resources", "Max Resources", "Reserved Resources", "Num Containers"].map(h => <th key={h} style={{ ...WS.th, fontSize: 10 }}>{h}</th>)}</tr></thead>
              <tbody>
                <tr style={{ background: "#fafafa" }}>
                  <td style={{ ...WS.td, fontWeight: 600, color: "#0b7285" }}>root</td>
                  <td style={{ ...WS.td, color: "#090" }}>RUNNING</td>
                  <td style={WS.td}>{((memUsed/memTotal)*100).toFixed(2)}%</td>
                  <td style={WS.td}>{((memUsed/memTotal)*100).toFixed(2)}%</td>
                  <td style={WS.td}>100.00%</td>
                  <td style={WS.td}>100.00%</td>
                  <td style={WS.td}>&lt;memory:{memUsed}, vCores:{vcUsed}&gt;</td>
                  <td style={{ ...WS.td, textAlign: "center" }}>{running}</td>
                  <td style={{ ...WS.td, textAlign: "center" }}>0</td>
                  <td style={WS.td}>&lt;memory:0, vCores:0&gt;</td>
                  <td style={WS.td}>&lt;memory:{memTotal}, vCores:{vcTotal}&gt;</td>
                  <td style={WS.td}>&lt;memory:0, vCores:0&gt;</td>
                  <td style={{ ...WS.td, textAlign: "center" }}>{totalContainers}</td>
                </tr>
                <tr>
                  <td style={{ ...WS.td, paddingLeft: 24, fontWeight: 600 }}>root.default</td>
                  <td style={{ ...WS.td, color: "#090" }}>RUNNING</td>
                  <td style={WS.td}>{((memUsed/memTotal)*100).toFixed(2)}%</td>
                  <td style={WS.td}>{((memUsed/memTotal)*100).toFixed(2)}%</td>
                  <td style={WS.td}>100.00%</td>
                  <td style={WS.td}>100.00%</td>
                  <td style={WS.td}>&lt;memory:{memUsed}, vCores:{vcUsed}&gt;</td>
                  <td style={{ ...WS.td, textAlign: "center" }}>{running}</td>
                  <td style={{ ...WS.td, textAlign: "center" }}>0</td>
                  <td style={WS.td}>&lt;memory:1024, vCores:1&gt;</td>
                  <td style={WS.td}>&lt;memory:{memTotal}, vCores:{vcTotal}&gt;</td>
                  <td style={WS.td}>&lt;memory:0, vCores:0&gt;</td>
                  <td style={{ ...WS.td, textAlign: "center" }}>{totalContainers}</td>
                </tr>
              </tbody>
            </table>
            <div style={{ marginTop: 20 }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}><span style={WS.sTitle}>Queue Resource Usage</span></div>
              <div style={{ display: "flex", gap: 30, justifyContent: "center", flexWrap: "wrap", background: "#fff", border: "1px solid #ddd", borderRadius: 4, padding: 20 }}>
                <DonutChart pct={(memUsed/memTotal)*100} color="#0b7285" label="Memory Used" sub={`${(memUsed/1024).toFixed(1)}/${(memTotal/1024).toFixed(0)} GB`} />
                <DonutChart pct={(vcUsed/vcTotal)*100} color="#9b59b6" label="VCores Used" sub={`${vcUsed}/${vcTotal} cores`} />
                <DonutChart pct={apps.length > 0 ? (running/Math.max(apps.length,1))*100 : 0} color="#f0ad4e" label="Apps Running" sub={`${running}/${apps.length} apps`} />
              </div>
            </div>
          </>}

          {/* ── TOOLS / CONFIG ── */}
          {section === "tools" && <>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
              <span style={WS.sTitle}>YARN Configuration</span>
              <InfoBtn title="Configuración YARN">
                <p>La configuración de YARN se define en <b>yarn-site.xml</b>. Los parámetros más importantes son:</p>
                <ul style={{ paddingLeft: 18 }}>
                  <li><code>yarn.resourcemanager.hostname</code>: hostname del ResourceManager</li>
                  <li><code>yarn.nodemanager.resource.memory-mb</code>: RAM asignable a contenedores por nodo</li>
                  <li><code>yarn.nodemanager.resource.cpu-vcores</code>: VCores por nodo</li>
                  <li><code>yarn.scheduler.minimum-allocation-mb</code>: mínimo por contenedor</li>
                  <li><code>yarn.scheduler.maximum-allocation-mb</code>: máximo por contenedor</li>
                </ul>
              </InfoBtn>
            </div>
            <table style={WS.tbl}>
              <thead><tr><th style={WS.th}>Property</th><th style={WS.th}>Value</th><th style={WS.th}>Source</th></tr></thead>
              <tbody>
                {[
                  ["yarn.resourcemanager.hostname", "hadoop-VirtualBox", "yarn-site.xml"],
                  ["yarn.nodemanager.resource.memory-mb", "4096", "yarn-site.xml"],
                  ["yarn.nodemanager.resource.cpu-vcores", "4", "yarn-site.xml"],
                  ["yarn.scheduler.minimum-allocation-mb", "1024", "yarn-site.xml"],
                  ["yarn.scheduler.maximum-allocation-mb", "4096", "yarn-site.xml"],
                  ["yarn.scheduler.minimum-allocation-vcores", "1", "yarn-site.xml"],
                  ["yarn.scheduler.maximum-allocation-vcores", "4", "yarn-site.xml"],
                  ["yarn.resourcemanager.scheduler.class", "org.apache.hadoop.yarn.server.resourcemanager.scheduler.capacity.CapacityScheduler", "yarn-site.xml"],
                  ["yarn.nodemanager.aux-services", "mapreduce_shuffle", "yarn-site.xml"],
                  ["mapreduce.framework.name", "yarn", "mapred-site.xml"],
                ].map(([k, v, s], i) => (
                  <tr key={i} style={{ background: i % 2 ? "#fafafa" : "#fff" }}>
                    <td style={{ ...WS.td, fontFamily: "monospace", fontSize: 11, fontWeight: 600, color: "#0b7285" }}>{k}</td>
                    <td style={{ ...WS.td, fontFamily: "monospace", fontSize: 11 }}>{v}</td>
                    <td style={{ ...WS.td, fontSize: 11, color: "#888" }}>{s}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>}

        </div>
      </div>
    </div>
  );
}

// ── Job History Server UI (:19888) ──────────────────────────────
function JobHistoryUI({ services, yarnApps }) {
  const [section, setSection] = useState("retired");
  const isUp = services.historyserver;
  const apps = (yarnApps || []).filter(a => a.state === "FINISHED");

  const SideLink = ({ id, label }) => (
    <div onClick={() => setSection(id)} style={{ padding: "3px 8px 3px 16px", cursor: "pointer", color: section === id ? "#c85000" : "#4a90d9", textDecoration: "underline", fontSize: 12, fontWeight: section === id ? 700 : 400 }}>{label}</div>
  );

  if (!isUp) return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5", fontFamily: "Verdana, sans-serif" }}>
      <div style={{ textAlign: "center", color: "#c00" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>⚠</div>
        <div style={{ fontSize: 16, fontWeight: 600 }}>JobHistoryServer no está activo</div>
        <div style={{ fontSize: 13, color: "#888", marginTop: 6 }}>Inícialo: <code>mapred historyserver</code></div>
      </div>
    </div>
  );

  return (
    <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", background: "#f5f5f5", fontFamily: "Verdana, Geneva, sans-serif", fontSize: 13, color: "#333" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "3px solid #c85000", padding: "7px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22, fontWeight: 900, color: "#e47a2c", letterSpacing: -1 }}>hadoop</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#333" }}>JobHistory</span>
          <span style={{ fontSize: 11, color: "#999", marginLeft: 4 }}>hadoop-VirtualBox:19888</span>
        </div>
        <span style={{ fontSize: 11, color: "#aaa" }}>Hadoop 3.4.1 · MapReduce History Server</span>
      </div>

      <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>
        {/* Sidebar */}
        <div style={{ width: 160, background: "#fff", borderRight: "1px solid #ddd", flexShrink: 0, paddingTop: 10 }}>
          <div style={{ padding: "4px 8px", fontWeight: 700, fontSize: 12, color: "#333" }}>▾ Application</div>
          <SideLink id="about" label="About" />
          <div style={{ padding: "4px 8px", fontWeight: 700, fontSize: 12, color: "#333", marginTop: 6 }}>▾ Tools</div>
          <SideLink id="config" label="Configuration" />
          <SideLink id="logs" label="Local logs" />
          <SideLink id="stacks" label="Server stacks" />
          <SideLink id="metrics" label="Server metrics" />
        </div>

        {/* Main */}
        <div style={{ flex: 1, overflow: "auto", padding: "14px 20px" }}>

          {(section === "retired" || section === "about") && <>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
              <span style={WS.sTitle}>Retired Jobs</span>
              <InfoBtn title="Retired Jobs — MapReduce History Server">
                <p>El <b>JobHistoryServer</b> almacena el historial de todos los jobs MapReduce que han terminado. Cuando YARN elimina la información de una app completada (por timeout), el historial permanece aquí.</p>
                <p>Se inicia con: <code>mapred historyserver</code></p>
                <p><b>Retired Jobs:</b> jobs que han completado y cuya información está disponible para consulta. Aquí puedes ver:</p>
                <ul style={{ paddingLeft: 18 }}>
                  <li>Tiempo de inicio y fin</li>
                  <li>Número de Maps y Reduces</li>
                  <li>Estado final (SUCCEEDED/FAILED/KILLED)</li>
                </ul>
                <p>Los logs de cada job se guardan en HDFS bajo <code>/tmp/hadoop-yarn/staging/history/done/</code></p>
              </InfoBtn>
            </div>
            <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ padding: "8px 14px", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                  <span>Show</span>
                  <select style={{ fontSize: 12, border: "1px solid #ccc", borderRadius: 3, padding: "1px 4px" }}><option>20</option><option>50</option></select>
                  <span>entries</span>
                </div>
                <div style={{ fontSize: 12 }}>Search: <input style={{ border: "1px solid #ccc", borderRadius: 3, padding: "2px 6px", fontSize: 12 }} readOnly /></div>
              </div>
              <table style={WS.tbl}>
                <thead><tr>{["Submit Time", "Start Time", "Finish Time", "Job ID", "Name", "User", "Queue", "State", "Maps Total", "Maps Completed", "Reduces Total", "Reduces Completed", "Elapsed Time"].map(h => <th key={h} style={{ ...WS.th, fontSize: 10 }}>{h}</th>)}</tr></thead>
                <tbody>
                  {apps.length === 0 && <tr><td colSpan={13} style={{ ...WS.td, textAlign: "center", color: "#888", padding: 20 }}>No data available in table</td></tr>}
                  {apps.map((app, i) => {
                    const jid = `job_1700000000000_${String(app.id).padStart(4, "0")}`;
                    const start = `Tue Mar 03 10:${String(app.id).padStart(2,"0")}:00 COT 2026`;
                    const fin = `Tue Mar 03 10:${String(app.id + 2).padStart(2,"0")}:35 COT 2026`;
                    return (
                      <tr key={i} style={{ background: i % 2 ? "#fafafa" : "#fff" }}>
                        <td style={{ ...WS.td, fontSize: 10 }}>{start}</td>
                        <td style={{ ...WS.td, fontSize: 10 }}>{start}</td>
                        <td style={{ ...WS.td, fontSize: 10 }}>{fin}</td>
                        <td style={{ ...WS.td, fontFamily: "monospace", fontSize: 10, color: "#4a90d9" }}>{jid}</td>
                        <td style={{ ...WS.td, fontWeight: 600 }}>{app.name}</td>
                        <td style={WS.td}>hadoop</td>
                        <td style={WS.td}>default</td>
                        <td style={{ ...WS.td, color: "#090", fontWeight: 600 }}>SUCCEEDED</td>
                        <td style={{ ...WS.td, textAlign: "center" }}>4</td>
                        <td style={{ ...WS.td, textAlign: "center", color: "#090" }}>4</td>
                        <td style={{ ...WS.td, textAlign: "center" }}>1</td>
                        <td style={{ ...WS.td, textAlign: "center", color: "#090" }}>1</td>
                        <td style={{ ...WS.td, fontSize: 10 }}>2m 35s</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div style={{ padding: "6px 14px", borderTop: "1px solid #eee", fontSize: 11, color: "#888", display: "flex", justifyContent: "space-between" }}>
                <span>Showing {apps.length === 0 ? "0 to 0 of 0" : `1 to ${apps.length} of ${apps.length}`} entries</span>
                <span style={{ color: "#aaa" }}>First Previous Next Last</span>
              </div>
            </div>
          </>}

          {section === "config" && <>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
              <span style={WS.sTitle}>Configuration</span>
              <InfoBtn title="MapReduce History Server — Configuración">
                <p>El JobHistoryServer usa los mismos archivos de configuración que el resto del clúster Hadoop. Los parámetros relevantes están en <b>mapred-site.xml</b> y <b>yarn-site.xml</b>.</p>
                <p>Parámetros clave:</p>
                <ul style={{ paddingLeft: 18 }}>
                  <li><code>mapreduce.jobhistory.address</code>: dirección RPC del servidor (default: 10020)</li>
                  <li><code>mapreduce.jobhistory.webapp.address</code>: dirección UI web (default: 19888)</li>
                  <li><code>mapreduce.jobhistory.done-dir</code>: directorio HDFS donde se mueven los logs de jobs completados</li>
                  <li><code>mapreduce.jobhistory.intermediate-done-dir</code>: directorio temporal mientras el job corre</li>
                </ul>
              </InfoBtn>
            </div>
            <table style={WS.tbl}>
              <thead><tr><th style={WS.th}>Property</th><th style={WS.th}>Value</th><th style={WS.th}>Source</th></tr></thead>
              <tbody>
                {[
                  ["mapreduce.jobhistory.address", "hadoop-VirtualBox:10020", "mapred-site.xml"],
                  ["mapreduce.jobhistory.webapp.address", "hadoop-VirtualBox:19888", "mapred-site.xml"],
                  ["mapreduce.jobhistory.done-dir", "/mr-history/done", "mapred-site.xml"],
                  ["mapreduce.jobhistory.intermediate-done-dir", "/mr-history/tmp", "mapred-site.xml"],
                  ["mapreduce.framework.name", "yarn", "mapred-site.xml"],
                  ["mapreduce.map.memory.mb", "1024", "mapred-site.xml"],
                  ["mapreduce.reduce.memory.mb", "2048", "mapred-site.xml"],
                  ["mapreduce.map.cpu.vcores", "1", "mapred-site.xml"],
                  ["yarn.app.mapreduce.am.resource.mb", "1024", "mapred-site.xml"],
                ].map(([k, v, s], i) => (
                  <tr key={i} style={{ background: i % 2 ? "#fafafa" : "#fff" }}>
                    <td style={{ ...WS.td, fontFamily: "monospace", fontSize: 11, fontWeight: 600, color: "#c85000" }}>{k}</td>
                    <td style={{ ...WS.td, fontFamily: "monospace", fontSize: 11 }}>{v}</td>
                    <td style={{ ...WS.td, fontSize: 11, color: "#888" }}>{s}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>}

          {section === "logs" && <>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}><span style={WS.sTitle}>Local logs</span><InfoBtn title="Local logs — JobHistoryServer"><p>Logs locales del proceso JobHistoryServer ubicados en el sistema de archivos local del nodo maestro. Útiles para diagnosticar problemas de inicio o configuración del servidor de historial.</p><p>En el simulador, los logs del NodeManager están en <code>/opt/hadoop/logs/</code>.</p></InfoBtn></div>
            <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 4, padding: 14 }}>
              <table style={WS.tbl}><thead><tr><th style={WS.th}>Log file</th><th style={WS.th}>Last modified</th><th style={WS.th}>Size</th></tr></thead>
                <tbody>
                  {["hadoop-hadoop-historyserver-hadoop-VirtualBox.log", "hadoop-hadoop-historyserver-hadoop-VirtualBox.out"].map((f, i) => (
                    <tr key={i} style={{ background: i % 2 ? "#fafafa" : "#fff" }}><td style={{ ...WS.td, color: "#4a90d9" }}>{f}</td><td style={WS.td}>Tue Mar 03 10:00:05 COT 2026</td><td style={WS.td}>{i === 0 ? "48.3 KB" : "1.2 KB"}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>}

          {section === "stacks" && <>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}><span style={WS.sTitle}>Server stacks</span><InfoBtn title="Server stacks"><p>Lista de todos los <b>hilos Java</b> activos en el proceso JobHistoryServer y su estado actual. Útil para diagnosticar deadlocks o problemas de rendimiento.</p><p>Los estados posibles son: RUNNABLE, WAITING, TIMED_WAITING, BLOCKED.</p></InfoBtn></div>
            <pre style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 4, padding: 14, fontSize: 11, fontFamily: "monospace", overflow: "auto", lineHeight: 1.5 }}>{`"main" #1 prio=5 os_prio=0 tid=0x00007f RUNNABLE
  at java.lang.Thread.sleep(Native Method)
  at org.apache.hadoop.mapreduce.v2.hs.JobHistoryServer.main

"IPC Server listener on 10020" #23 prio=5 RUNNABLE
  at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
  at org.apache.hadoop.ipc.Server$Listener.run

"WebApp" #45 prio=5 WAITING
  at java.lang.Object.wait(Object.java:502)
  at org.apache.hadoop.http.HttpServer2$SelectChannelConnectorWithSafeStartup`}</pre>
          </>}

          {section === "metrics" && <>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}><span style={WS.sTitle}>Server metrics (JMX)</span><InfoBtn title="JMX Metrics"><p><b>JMX (Java Management Extensions)</b> expone métricas internas del proceso Java en tiempo real. El JobHistoryServer publica métricas como uso de memoria JVM, threads activos, y contadores de jobs procesados.</p><p>Accesible en producción en: <code>http://hadoop-VirtualBox:19888/jmx</code></p></InfoBtn></div>
            <table style={WS.tbl}>
              <thead><tr><th style={WS.th}>Metric</th><th style={WS.th}>Value</th></tr></thead>
              <tbody>
                {[["HeapMemoryUsage.used", "128 MB"], ["HeapMemoryUsage.max", "512 MB"], ["NonHeapMemoryUsage.used", "64 MB"], ["ThreadCount", "42"], ["DaemonThreadCount", "38"], ["LoadedClassCount", "8234"], ["JobsSubmitted", apps.length], ["JobsCompleted", apps.length], ["JobsFailed", 0], ["JobsKilled", 0]].map(([k, v], i) => (
                  <tr key={i} style={{ background: i % 2 ? "#fafafa" : "#fff" }}>
                    <td style={{ ...WS.td, fontFamily: "monospace", fontSize: 11, fontWeight: 600 }}>{k}</td>
                    <td style={{ ...WS.td, fontFamily: "monospace", fontSize: 11 }}>{String(v)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// HIVESERVER2 WEB UI (:10002)
// ══════════════════════════════════════════════════════════════════
function HiveWebUI({ hiveServices, hiveDBs, currentHiveDB, hiveQueries }) {
  const [subTab, setSubTab] = useState("home");
  const isUp = hiveServices.hiveserver2;

  if (!isUp) return <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", fontFamily: "Verdana, sans-serif" }}><div style={{ textAlign: "center", color: "#c00" }}><div style={{ fontSize: 48, marginBottom: 12 }}>⚠</div><div style={{ fontSize: 16, fontWeight: 600 }}>HiveServer2 no está activo</div><div style={{ fontSize: 13, color: "#888", marginTop: 6 }}>Inicia Hive:<br/><code>cd /opt/hadoop/hive/bbdd</code><br/><code>hiveserver2</code><br/>Luego: <code>beeline</code></div></div></div>;

  const allTables = Object.entries(hiveDBs).flatMap(([db, d]) => Object.keys(d.tables).map(t => ({ db, table: t, cols: d.tables[t].columns.length, rows: d.tables[t].rows.length })));

  return (
    <div style={{ flex: 1, overflow: "auto", background: "#fafafa", fontFamily: "Verdana, Geneva, sans-serif", fontSize: 13, color: "#333" }}>
      <div style={{ background: "#f8f8f8", borderBottom: "3px solid #f5a623", padding: "8px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#f5a623" }}>🐝 Hive</span>
          <span style={{ fontSize: 13, color: "#666" }}>HiveServer2 — hadoop-VirtualBox:10002</span>
        </div>
        <span style={{ fontSize: 11, color: "#999" }}>Apache Hive 4.0.0 | Metastore: Derby</span>
      </div>
      <div style={{ display: "flex", gap: 0, background: "#e8e8e8", borderBottom: "1px solid #ccc", fontSize: 12 }}>
        {[["home", "Home"], ["sessions", "Active Sessions"], ["queries", "Open Queries"], ["config", "Hive Configuration"], ["databases", "Databases"]].map(([id, l]) => (
          <button key={id} onClick={() => setSubTab(id)} style={{ padding: "7px 14px", background: subTab === id ? "#fff" : "transparent", color: subTab === id ? "#333" : "#666", border: "none", borderBottom: subTab === id ? "2px solid #f5a623" : "2px solid transparent", cursor: "pointer", fontSize: 12, fontFamily: "Verdana, sans-serif", fontWeight: subTab === id ? 600 : 400 }}>{l}</button>
        ))}
      </div>
      <div style={{ padding: "12px 18px" }}>
        {subTab === "home" && <>
          <h2 style={{ fontSize: 18, margin: "0 0 16px" }}>HiveServer2</h2>
          <div style={{ margin: "16px 0" }}>
            <h3 style={{ fontSize: 15, margin: "0 0 10px", borderBottom: "1px solid #ddd", paddingBottom: 4 }}>Active Sessions</h3>
            <table style={WS.tbl}>
              <thead><tr>{["User Name", "IP Address", "Operation Count", "Active Time (s)", "Idle Time (s)"].map(h => <th key={h} style={WS.th}>{h}</th>)}</tr></thead>
              <tbody><tr><td style={WS.td}>hadoop</td><td style={WS.td}>192.168.56.10</td><td style={WS.td}>{hiveQueries.length}</td><td style={WS.td}>{Math.floor((Date.now() % 100000) / 100)}</td><td style={WS.td}>{Math.floor(Math.random() * 60)}</td></tr></tbody>
            </table>
            <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>Total number of sessions: 1</div>
          </div>
          <div style={{ margin: "16px 0" }}>
            <h3 style={{ fontSize: 15, margin: "0 0 10px", borderBottom: "1px solid #ddd", paddingBottom: 4 }}>Open Queries</h3>
            <table style={WS.tbl}>
              <thead><tr>{["User Name", "Query", "Execution Engine", "State", "Opened Timestamp", "Latency (s)"].map(h => <th key={h} style={WS.th}>{h}</th>)}</tr></thead>
              <tbody>{hiveQueries.length === 0 ? <tr><td colSpan={6} style={{ ...WS.td, textAlign: "center", color: "#888" }}>No open queries</td></tr> : hiveQueries.slice(-5).map((q, i) => <tr key={i}><td style={WS.td}>hadoop</td><td style={{ ...WS.td, fontSize: 11, fontFamily: "monospace", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.q.slice(0, 50)}</td><td style={WS.td}>mr</td><td style={{ ...WS.td, color: "#090" }}>{q.state}</td><td style={{ ...WS.td, fontSize: 11 }}>Tue Mar 03 10:{String(i * 5).padStart(2, "0")}:00</td><td style={WS.td}>{(Math.random() * 5).toFixed(1)}</td></tr>)}</tbody>
            </table>
            <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>Total number of queries: {hiveQueries.length}</div>
          </div>
        </>}
        {subTab === "sessions" && <>
          <h3 style={{ fontSize: 15, margin: "0 0 10px" }}>Session Details</h3>
          <div style={{ padding: 12, background: "#fff", border: "1px solid #ddd", borderRadius: 4 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 20px", fontSize: 12.5, lineHeight: 2 }}>
              <div><b>Session ID:</b> a0628847-8b04-46f5-903b-673c74a8986e</div>
              <div><b>User:</b> hadoop</div>
              <div><b>IP Address:</b> 192.168.56.10</div>
              <div><b>Current Database:</b> {currentHiveDB}</div>
              <div><b>Connection URL:</b> jdbc:hive2://hadoop-virtualbox:10000</div>
              <div><b>Driver:</b> Hive JDBC 4.0.0</div>
              <div><b>Queries Executed:</b> {hiveQueries.length}</div>
              <div><b>Transaction Isolation:</b> REPEATABLE_READ</div>
            </div>
          </div>
        </>}
        {subTab === "queries" && <>
          <h3 style={{ fontSize: 15, margin: "0 0 10px" }}>Query History</h3>
          <table style={WS.tbl}>
            <thead><tr>{["#", "Database", "Query", "State", "Time"].map(h => <th key={h} style={WS.th}>{h}</th>)}</tr></thead>
            <tbody>{hiveQueries.length === 0 ? <tr><td colSpan={5} style={{ ...WS.td, textAlign: "center", color: "#888" }}>No queries executed yet</td></tr> : hiveQueries.map((q, i) => <tr key={i} style={{ background: i % 2 ? "#fafafa" : "#fff" }}><td style={WS.td}>{i + 1}</td><td style={WS.td}>{q.db}</td><td style={{ ...WS.td, fontFamily: "monospace", fontSize: 11 }}>{q.q.slice(0, 80)}</td><td style={{ ...WS.td, color: "#090" }}>{q.state}</td><td style={{ ...WS.td, fontSize: 11 }}>{new Date(q.ts).toLocaleTimeString()}</td></tr>)}</tbody>
          </table>
        </>}
        {subTab === "config" && <>
          <h3 style={{ fontSize: 15, margin: "0 0 10px" }}>Hive Configuration</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 20px", fontSize: 12, lineHeight: 2, padding: 12, background: "#fff", border: "1px solid #ddd", borderRadius: 4 }}>
            <div><b>hive.server2.thrift.port:</b> 10000</div>
            <div><b>hive.server2.webui.port:</b> 10002</div>
            <div><b>hive.metastore.warehouse.dir:</b> /user/hive/warehouse</div>
            <div><b>javax.jdo.option.ConnectionURL:</b> jdbc:derby:metastore_db</div>
            <div><b>hive.execution.engine:</b> mr</div>
            <div><b>hive.server2.authentication:</b> NONE</div>
            <div><b>hive.support.concurrency:</b> false</div>
            <div><b>hive.compactor.initiator.on:</b> false</div>
            <div><b>mapreduce.framework.name:</b> yarn</div>
            <div><b>fs.defaultFS:</b> hdfs://hadoop-VirtualBox:9000</div>
          </div>
        </>}
        {subTab === "databases" && <>
          <h3 style={{ fontSize: 15, margin: "0 0 10px" }}>Databases & Tables</h3>
          {Object.entries(hiveDBs).map(([dbName, db]) => (
            <div key={dbName} style={{ marginBottom: 14, padding: 12, background: "#fff", border: "1px solid #ddd", borderRadius: 4 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#f5a623", marginBottom: 6 }}>📁 {dbName}{dbName === currentHiveDB && <span style={{ fontSize: 10, marginLeft: 8, background: "#e8f5e9", color: "#2e7d32", padding: "1px 6px", borderRadius: 3 }}>active</span>}</div>
              {Object.keys(db.tables).length === 0 ? <div style={{ fontSize: 12, color: "#888" }}>(sin tablas)</div> :
                <table style={WS.tbl}>
                  <thead><tr>{["Tabla", "Columnas", "Filas", "HDFS Path"].map(h => <th key={h} style={WS.th}>{h}</th>)}</tr></thead>
                  <tbody>{Object.entries(db.tables).map(([tName, t], i) => (
                    <tr key={i}><td style={{ ...WS.td, fontWeight: 600 }}>{tName}</td><td style={WS.td}>{t.columns.map(c => `${c.name} ${c.type}`).join(", ")}</td><td style={WS.td}>{t.rows.length}</td><td style={{ ...WS.td, fontSize: 11, fontFamily: "monospace" }}>/user/hive/warehouse/{dbName === "default" ? "" : dbName + ".db/"}{tName}</td></tr>
                  ))}</tbody>
                </table>
              }
            </div>
          ))}
        </>}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════
export default function HadoopVMSimulator() {
  const welcomeLines = [
    { type: "system", text: "Ubuntu 22.04.3 LTS — hadoop-VirtualBox" },
    { type: "system", text: "Simulador de entorno Hadoop/HDFS/YARN/MapReduce — Big Data 2026-I" },
    { type: "system", text: 'Escribe "help" para ver los comandos disponibles.\n' },
  ];
  const [services, setServices] = useState({ namenode: false, datanode: false, secondarynamenode: false, resourcemanager: false, nodemanager: false, historyserver: false });
  const [localFS, setLocalFS] = useState(null);
  const [hdfsFS, setHdfsFS] = useState(null);
  const [safeMode, setSafeMode] = useState(false);
  const [hdfsSnapEnabled, setHdfsSnapEnabled] = useState(new Set());
  const [hdfsSnapshots, setHdfsSnapshots] = useState({});
  const [yarnApps, setYarnApps] = useState([]);
  const [appCounter, setAppCounter] = useState(1);
  const [fsimageCounter, setFsimageCounter] = useState(42);
  const [permsMap, setPermsMap] = useState({});
  const [storageReady, setStorageReady] = useState(false);
  const [activeTab, setActiveTab] = useState("terminal");
  // ── Hive state ──
  const [hiveServices, setHiveServices] = useState({ hiveserver2: false });
  const [hiveDBs, setHiveDBs] = useState({ default: { tables: {} } });
  const [currentHiveDB, setCurrentHiveDB] = useState("default");
  const [hiveQueries, setHiveQueries] = useState([]);
  // ── Terminal tabs ──
  const [termTabs, setTermTabs] = useState([{ id: 1, name: "Terminal 1" }]);
  const [activeTermTab, setActiveTermTab] = useState(1);
  const [termTabState, setTermTabState] = useState({
    1: { lines: welcomeLines, cwd: "/home/hadoop", history: [], histIdx: -1, input: "", sshNode: null, sshCwd: "/home/hadoop", beelineMode: false, beelineConnected: false }
  });
  const nextTermTabId = useRef(2);
  const termRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const saveTimer = useRef(null);

  // ── Active tab state accessors ──
  const activeTabState = termTabState[activeTermTab] || termTabState[1];
  const lines = activeTabState.lines;
  const input = activeTabState.input;
  const cwd = activeTabState.cwd;
  const history = activeTabState.history;
  const histIdx = activeTabState.histIdx;
  const sshNode = activeTabState.sshNode;
  const sshCwd = activeTabState.sshCwd;
  const beelineMode = activeTabState.beelineMode;
  const beelineConnected = activeTabState.beelineConnected;

  const updateTab = (id, patch) => setTermTabState(prev => ({
    ...prev,
    [id]: { ...prev[id], ...patch }
  }));
  const setLines = (updater) => setTermTabState(prev => {
    const cur = prev[activeTermTab];
    return { ...prev, [activeTermTab]: { ...cur, lines: typeof updater === "function" ? updater(cur.lines) : updater } };
  });
  const setInput = (val) => updateTab(activeTermTab, { input: val });
  const setCwd = (val) => updateTab(activeTermTab, { cwd: val });
  const setHistory = (updater) => setTermTabState(prev => {
    const cur = prev[activeTermTab];
    return { ...prev, [activeTermTab]: { ...cur, history: typeof updater === "function" ? updater(cur.history) : updater } };
  });
  const setHistIdx = (val) => updateTab(activeTermTab, { histIdx: val });
  const setSshNode = (val) => updateTab(activeTermTab, { sshNode: val });
  const setSshCwd = (val) => updateTab(activeTermTab, { sshCwd: val });
  const setBeelineMode = (val) => updateTab(activeTermTab, { beelineMode: val });
  const setBeelineConnected = (val) => updateTab(activeTermTab, { beelineConnected: val });

  // ── Load from persistent storage ──
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s.localFS) {
          const lfs = s.localFS;
          const nnc = "/datos/namenode/current"; const dnc = "/datos/datanode/current";
          const nnVer = "#\n#Mon Jan 01 08:00:00 COT 2026\nnamespaceID=1234567890\nclusterID=CID-a1b2c3d4-e5f6-7890\ncTime=0\nstorageType=NAME_NODE\nblockpoolID=BP-1234567890-127.0.0.1-1700000000000\nlayoutVersion=-66";
          const dnVer = "#\n#Mon Jan 01 08:00:00 COT 2026\nstorageID=DS-abc12345-def6-7890-ghij-klmnopqrstuv\nclusterID=CID-a1b2c3d4-e5f6-7890\ncTime=0\nstorageType=DATA_NODE\nlayoutVersion=-57";
          if (lfs[nnc] && !lfs[nnc].files?.["VERSION"]) { lfs[nnc] = { ...lfs[nnc], children: ["VERSION", ...(lfs[nnc].children || [])], files: { ...lfs[nnc].files, "VERSION": nnVer } }; }
          if (lfs[dnc] && !lfs[dnc].files?.["VERSION"]) { lfs[dnc] = { ...lfs[dnc], children: ["VERSION", ...(lfs[dnc].children || [])], files: { ...lfs[dnc].files, "VERSION": dnVer } }; }
          const bp = "/datos/datanode/current/BP-1234567890-127.0.0.1-1700000000000";
          if (!lfs[bp]) {
            lfs[bp] = { type: "dir", children: ["current", "tmp"] };
            lfs[bp + "/current"] = { type: "dir", children: ["VERSION", "finalized", "rbw"], files: { "VERSION": "#\n#Mon Jan 01 08:00:00 COT 2026\nnamespaceid=1234567890\ncTime=0\nblockpoolID=BP-1234567890-127.0.0.1-1700000000000\nlayoutVersion=-57" } };
            lfs[bp + "/current/finalized"] = { type: "dir", children: ["subdir0"] };
            lfs[bp + "/current/finalized/subdir0"] = { type: "dir", children: ["subdir0"] };
            lfs[bp + "/current/finalized/subdir0/subdir0"] = { type: "dir", children: [], files: {} };
            lfs[bp + "/current/rbw"] = { type: "dir", children: [] };
            lfs[bp + "/tmp"] = { type: "dir", children: [] };
          } else {
            // Fix subdir0/subdir0 if missing
            const sd0 = bp + "/current/finalized/subdir0";
            if (lfs[sd0] && !lfs[sd0 + "/subdir0"]) {
              lfs[sd0] = { ...lfs[sd0], children: ["subdir0"] };
              lfs[sd0 + "/subdir0"] = { type: "dir", children: [], files: {} };
            }
          }
          setLocalFS(lfs);
        }
        if (s.hdfsFS) setHdfsFS(s.hdfsFS); if (s.cwd) setCwd(s.cwd);
        if (s.history) setHistory(s.history); if (s.services) setServices(s.services); if (s.safeMode) setSafeMode(s.safeMode);
        if (s.hdfsSnapEnabled) setHdfsSnapEnabled(new Set(s.hdfsSnapEnabled)); if (s.hdfsSnapshots) setHdfsSnapshots(s.hdfsSnapshots);
        if (s.yarnApps) setYarnApps(s.yarnApps); if (s.appCounter) setAppCounter(s.appCounter);
        if (s.fsimageCounter) setFsimageCounter(s.fsimageCounter); if (s.permsMap) setPermsMap(s.permsMap); if (s.lines) setLines(s.lines);
          if (s.hiveDBs) setHiveDBs(s.hiveDBs); if (s.currentHiveDB) setCurrentHiveDB(s.currentHiveDB); if (s.hiveQueries) setHiveQueries(s.hiveQueries);
        setStorageReady(true); return;
      }
    } catch {}
    const init = createInitialState(); setLocalFS(init.localFS); setHdfsFS(init.hdfsFS); setStorageReady(true);
  }, []);

  // ── Save (debounced) ──
  useEffect(() => {
    if (!storageReady || !localFS) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ localFS, hdfsFS, cwd, history: history.slice(0, 100), services, safeMode, hdfsSnapEnabled: [...hdfsSnapEnabled], hdfsSnapshots, yarnApps, appCounter, fsimageCounter, permsMap, lines: lines.slice(-200), hiveDBs, currentHiveDB, hiveQueries: hiveQueries.slice(-50) })); } catch {}
    }, 800);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [localFS, hdfsFS, cwd, history, services, safeMode, hdfsSnapEnabled, hdfsSnapshots, yarnApps, appCounter, fsimageCounter, permsMap, lines, storageReady, hiveDBs, currentHiveDB, hiveQueries]);

  useEffect(() => { if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight; }, [lines]);

  const focusInput = () => inputRef.current?.focus();
  const out = useCallback((text, type = "output") => ({ type, text }), []);

  const resolvePath = useCallback((p, base) => {
    if (!p) return base; let parts;
    if (p.startsWith("/")) parts = p.split("/").filter(Boolean);
    else if (p === "~" || p.startsWith("~/")) parts = ["home", "hadoop", ...p.slice(1).replace(/^\//, "").split("/").filter(Boolean)];
    else parts = [...base.split("/").filter(Boolean), ...p.split("/").filter(Boolean)];
    const res = []; for (const seg of parts) { if (seg === ".") continue; else if (seg === "..") res.pop(); else res.push(seg); } return "/" + res.join("/");
  }, []);

  const getLocalNode = useCallback((path) => {
    if (!localFS) return null; if (localFS[path]) return localFS[path];
    const par = path.substring(0, path.lastIndexOf("/")) || "/"; const nm = path.substring(path.lastIndexOf("/") + 1); const pn = localFS[par];
    if (pn?.files && nm in pn.files) return { type: "file", content: pn.files[nm] };
    if (pn?.children?.includes(nm)) { const fp = par === "/" ? `/${nm}` : `${par}/${nm}`; if (localFS[fp]) return localFS[fp]; return { type: "file", content: "" }; }
    return null;
  }, [localFS]);

  const ensureHdfsDir = useCallback((path, fs) => { if (fs[path]) return fs; const nf = { ...fs }; const pts = path.split("/").filter(Boolean); let cur = "/"; for (const p of pts) { const nx = cur === "/" ? `/${p}` : `${cur}/${p}`; if (!nf[nx]) { nf[nx] = { type: "dir", children: [], owner: "hadoop", group: "supergroup", perms: "drwxr-xr-x" }; if (nf[cur] && !nf[cur].children.includes(p)) nf[cur] = { ...nf[cur], children: [...nf[cur].children, p] }; } cur = nx; } return nf; }, []);
  const ensureLocalDir = useCallback((path, fs) => { if (fs[path]) return fs; const nf = { ...fs }; const pts = path.split("/").filter(Boolean); let cur = "/"; for (const p of pts) { const nx = cur === "/" ? `/${p}` : `${cur}/${p}`; if (!nf[nx]) { nf[nx] = { type: "dir", children: [], files: {} }; if (nf[cur] && !nf[cur].children.includes(p)) nf[cur] = { ...nf[cur], children: [...nf[cur].children, p] }; } cur = nx; } return nf; }, []);
  const getDirItems = useCallback((node) => { const s = new Set(node.children || []); if (node.files) Object.keys(node.files).forEach(f => s.add(f)); return [...s]; }, []);

  const formatLs = useCallback((resolved, flags) => {
    const node = localFS[resolved]; if (!node) return null; if (node.type !== "dir") return resolved;
    let items = getDirItems(node); if (!flags.includes("a")) items = items.filter(i => !i.startsWith(".")); items.sort((a, b) => a.localeCompare(b)); if (flags.includes("r")) items.reverse();
    if (items.length === 0 && !flags.includes("a")) return "";
    if (flags.includes("l") || flags.includes("h")) {
      const all = flags.includes("a") ? [".", "..", ...items] : items;
      return `total ${all.length * 4}\n${all.map(i => { if (i === "." || i === "..") return `drwxr-xr-x 2 hadoop hadoop   4096 Feb 28 10:00 ${i}`; const cp = resolved === "/" ? `/${i}` : `${resolved}/${i}`; const isDir = !!localFS[cp]; const rawSz = isDir ? 4096 : (node.files?.[i]?.length || 0); let sz; if (flags.includes("h")) { if (rawSz >= 1048576) sz = (rawSz / 1048576).toFixed(1) + "M"; else if (rawSz >= 1024) sz = (rawSz / 1024).toFixed(1) + "K"; else sz = String(rawSz); } else sz = String(rawSz).padStart(8); const pm = permsMap[cp] || (isDir ? "rwxr-xr-x" : "rw-r--r--"); return `${isDir ? "d" : "-"}${pm} 1 hadoop hadoop ${sz} Feb 28 10:00 ${i}`; }).join("\n")}`;
    }
    return items.join("  ");
  }, [localFS, getDirItems, permsMap]);

  // ── SSH SLAVE HANDLER ──
  const processSlaveCommand = useCallback((cmd) => {
    const trimmed = cmd.trim(); if (!trimmed) return []; const tokens = parseTokens(trimmed); const base = tokens[0]; const node = SLAVE_NODES[sshNode]; if (!node) return [];
    if (base === "exit" || base === "logout") { setSshNode(null); setSshCwd("/home/hadoop"); return [out(`logout\nConnection to ${sshNode} closed.`, "system")]; }
    if (base === "hostname") return [out(node.hostname)]; if (base === "whoami") return [out("hadoop")]; if (base === "pwd") return [out(sshCwd)];
    if (base === "cd") { const t = tokens[1] || "~"; if (t === "~" || t === "/home/hadoop") { setSshCwd("/home/hadoop"); return []; } if (t === "/") { setSshCwd("/"); return []; } if (t === "..") { setSshCwd(sshCwd.substring(0, sshCwd.lastIndexOf("/")) || "/"); return []; } setSshCwd(t.startsWith("/") ? t : (sshCwd === "/" ? `/${t}` : `${sshCwd}/${t}`)); return []; }
    if (base === "ls") { const flags = tokens.filter(t => t.startsWith("-")).join("").replace(/-/g, ""); const slaveDirs = { "/home/hadoop": ["Descargas", "Documentos", "Escritorio"], "/": ["opt", "tmp", "home", "datos", "etc", "var"], "/opt": ["hadoop"], "/opt/hadoop": ["sbin", "etc", "share", "logs", "bin"], "/datos": ["datanode"], "/datos/datanode": ["current"] }; const target = tokens.find((t, i) => i > 0 && !t.startsWith("-")); const dir = target ? (target.startsWith("/") ? target : (sshCwd === "/" ? `/${target}` : `${sshCwd}/${target}`)) : sshCwd; const items = slaveDirs[dir] || []; if (flags.includes("l")) return [out(`total ${items.length * 4}\n${items.map(i => `drwxr-xr-x 2 hadoop hadoop 4096 Feb 28 10:00 ${i}`).join("\n")}`)]; return items.length > 0 ? [out(items.join("  "))] : []; }
    if (base === "cat") { const t = tokens[1]; if (t === "/etc/hostname") return [out(node.hostname)]; if (t?.includes("hosts")) return [out("127.0.0.1   localhost\n192.168.56.10 hadoop-VirtualBox\n192.168.56.11 nodo2\n192.168.56.12 nodo3")]; if (t?.includes("workers")) return [out("hadoop-VirtualBox\nnodo2\nnodo3")]; return [out(`cat: ${t}: No existe`, "error")]; }
    if (base === "jps") { const p = []; if (services.datanode) p.push("2234 DataNode"); if (services.nodemanager) p.push("2237 NodeManager"); p.push(`${2240 + p.length} Jps`); if (tokens.includes("-l")) { const fqn = { DataNode: "org.apache.hadoop.hdfs.server.datanode.DataNode", NodeManager: "org.apache.hadoop.yarn.server.nodemanager.NodeManager", Jps: "sun.tools.jps.Jps" }; return [out(p.map(x => { const [pid, nm] = x.split(" "); return `${pid} ${fqn[nm] || nm}`; }).join("\n"))]; } return [out(p.join("\n"))]; }
    if (base === "uname") return [out(tokens.includes("-a") ? `Linux ${node.hostname} 5.15.0-91-generic #101-Ubuntu SMP x86_64 GNU/Linux` : "Linux")];
    if (base === "free") return [out("              total        used        free      shared  buff/cache   available\nMem:          4.0Gi       1.5Gi       1.2Gi       128Mi       1.3Gi       2.2Gi\nSwap:         2.0Gi          0B       2.0Gi")];
    if (base === "df") return [out("Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        50G   12G   35G  26% /\n/dev/sda2       100G   15G   80G  16% /datos")];
    if (base === "top") { const pr = []; if (services.datanode) pr.push("  2234 hadoop    20   0 1.1g 200m  24m S  1.5  5.0   0:32.45 java (DataNode)"); if (services.nodemanager) pr.push("  2237 hadoop    20   0 1.0g 180m  20m S  1.0  4.5   0:22.33 java (NodeManager)"); return [out(`top - 10:00:00 up 2 days\nTasks: ${80 + pr.length} total\nMiB Mem: 4096.0 total, 1200.0 free, 1500.0 used\n\n${pr.join("\n")}`)]; }
    if (base === "ps") { let pl = "  PID TTY          TIME CMD\n 2000 pts/0    00:00:00 bash"; if (services.datanode) pl += "\n 2234 ?        00:00:32 java -Dproc_datanode"; if (services.nodemanager) pl += "\n 2237 ?        00:00:22 java -Dproc_nodemanager"; return [out(pl)]; }
    if (base === "ifconfig" || base === "ip") return [out(`eth0: inet ${node.ip}  netmask 255.255.255.0`)];
    if (base === "help") return [out(`Comandos en ${node.hostname}: jps, hostname, whoami, pwd, cd, ls, cat, ps, top, free, df, uname, ifconfig, exit`, "help")];
    if (base === "clear") return [{ type: "clear" }];
    return [out(`bash: ${base}: comando no encontrado (estás en ${node.hostname}, escribe 'exit' para volver)`, "error")];
  }, [sshNode, sshCwd, services, out]);

  // ── MASTER COMMAND HANDLER ──
  const processCommand = useCallback((cmd) => {
    const trimmed = cmd.trim().replace(/\s*2>&1\s*$/, ""); if (!trimmed) return [];
    // Redirects
    const redir = trimmed.match(/^(.+?)\s*(>>|>)\s*(\S+)\s*$/);
    if (redir && !redir[3].startsWith("&")) {
      const leftCmd = redir[1].trim(); const isAppend = redir[2] === ">>"; const targetFile = redir[3];
      const lt = parseTokens(leftCmd); let outputText = "";
      if (lt[0] === "echo") { outputText = lt.slice(1).join(" ").replace(/['"]/g, ""); outputText = outputText.replace(/\$HADOOP_HOME/g, "/opt/hadoop").replace(/\$HOME/g, "/home/hadoop"); }
      else { const r = processCommand(leftCmd); outputText = r.filter(x => x.type !== "clear").map(x => x.text).join("\n"); }
      const resolved = resolvePath(targetFile, cwd); const parent = resolved.substring(0, resolved.lastIndexOf("/")) || "/"; const name = resolved.substring(resolved.lastIndexOf("/") + 1);
      let nf = { ...localFS }; if (!nf[parent]) nf = ensureLocalDir(parent, nf); const existing = nf[parent]?.files?.[name] || "";
      nf[parent] = { ...nf[parent], files: { ...(nf[parent].files || {}), [name]: isAppend ? (existing ? existing + "\n" + outputText : outputText) : outputText }, children: [...new Set([...(nf[parent].children || []), name])] };
      setLocalFS(nf); return [];
    }
    const pipes = trimmed.split("|").map(s => s.trim()); const mainCmd = pipes[0]; const tokens = parseTokens(mainCmd); const base = tokens[0];

    if (base === "help") return [out("╔══════════════════════════════════════════════════════════════════╗\n║            SIMULADOR HADOOP — COMANDOS DISPONIBLES              ║\n╠══════════════════════════════════════════════════════════════════╣\n║ LINUX: ls [-l,-a,-r,-la,-lh], cd, pwd, mkdir [-p], touch,      ║\n║   cp [-r], mv, rm [-r,-f], cat, head, tail, grep, chmod [-R],  ║\n║   wc [-l,-w,-c], ps, top, hostname, uname, free, df, echo      ║\n║                                                                 ║\n║ SCRIPTS: echo 'cmd' >> script.sh · chmod u+x · ./script.sh     ║\n║ SSH: ssh nodo2 · ssh nodo3 (esclavos)                           ║\n║                                                                 ║\n║ SERVICIOS: ./start-dfs.sh  ./stop-dfs.sh                       ║\n║   ./start-yarn.sh  ./stop-yarn.sh  jps [-l]                    ║\n║                                                                 ║\n║ HDFS: hdfs dfs -ls/-mkdir/-put/-get/-cat/-rm/-chmod/-cp         ║\n║   hdfs dfs -createSnapshot/-deleteSnapshot                      ║\n║   hdfs dfsadmin -report/-safemode/-saveNamespace                ║\n║   hdfs fsck / [-files -blocks]                                  ║\n║                                                                 ║\n║ YARN: yarn node -list · yarn application -list/-status/-kill    ║\n║ MAPREDUCE: hadoop jar <jar> grep/wordcount/TestDFSIO            ║\n║                                                                 ║\n║ WEB UIs: Usa las pestañas HDFS(:9870) y YARN(:8088) arriba     ║\n║                                                                 ║\n║ HIVE: hiveserver2 (inicia servidor) · beeline (cliente)         ║\n║   !connect jdbc:hive2://hadoop-virtualbox:10000                 ║\n║   show databases; · create database <db>; · use <db>;           ║\n║   create table <t> (col tipo); · insert into <t> values (...);  ║\n║   select * from <t>; · describe <t>; · !tables · !exit          ║\n║                                                                 ║\n║ PERSISTENCIA: Progreso guardado · 'reset' para reiniciar       ║\n║ Tab: autocompleta · ↑↓: historial                              ║\n╚══════════════════════════════════════════════════════════════════╝", "help")];
    if (base === "clear") return [{ type: "clear" }];
    if (base === "pwd") return [out(cwd)]; if (base === "whoami") return [out("hadoop")]; if (base === "hostname") return [out("hadoop-VirtualBox")];
    if (base === "uname") return [out(tokens.includes("-a") ? "Linux hadoop-VirtualBox 5.15.0-91-generic #101-Ubuntu SMP x86_64 x86_64 x86_64 GNU/Linux" : "Linux")];
    if (base === "lsb_release") return [out("Distributor ID: Ubuntu\nDescription:    Ubuntu 22.04.3 LTS\nRelease:        22.04\nCodename:       jammy")];
    if (base === "lscpu") return [out("Architecture:          x86_64\nCPU(s):                4\nModel name:            Intel(R) Core(TM) i7-10750H CPU @ 2.60GHz")];
    if (base === "free") return [out("              total        used        free      shared  buff/cache   available\nMem:          8.0Gi       3.2Gi       2.1Gi       256Mi       2.7Gi       4.3Gi\nSwap:         2.0Gi          0B       2.0Gi")];
    if (base === "df") return [out("Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        50G   18G   30G  38% /\n/dev/sda2       100G   25G   70G  27% /datos")];
    if (base === "ifconfig" || base === "ip") return [out("eth0: inet 192.168.56.10  netmask 255.255.255.0")];

    if (base === "reset") { try { localStorage.removeItem(STORAGE_KEY); } catch {} const init = createInitialState(); setLocalFS(init.localFS); setHdfsFS(init.hdfsFS); setCwd("/home/hadoop"); setServices({ namenode: false, datanode: false, secondarynamenode: false, resourcemanager: false, nodemanager: false, historyserver: false }); setSafeMode(false); setHdfsSnapEnabled(new Set()); setHdfsSnapshots({}); setYarnApps([]); setAppCounter(1); setFsimageCounter(42); setPermsMap({}); setHistory([]); setSshNode(null); setSshCwd("/home/hadoop"); setHiveServices({ hiveserver2: false }); setBeelineMode(false); setBeelineConnected(false); setHiveDBs({ default: { tables: {} } }); setCurrentHiveDB("default"); setHiveQueries([]); setLines(welcomeLines); return [out("✓ Estado reiniciado.", "success")]; }

    if (base === "echo") { const arg = tokens.slice(1).join(" ").replace(/['"]/g, ""); if (arg.includes("$(hadoop classpath)")) return [out("/opt/hadoop/etc/hadoop:/opt/hadoop/share/hadoop/common/lib/*:/opt/hadoop/share/hadoop/common/*:/opt/hadoop/share/hadoop/hdfs:/opt/hadoop/share/hadoop/hdfs/lib/*:/opt/hadoop/share/hadoop/hdfs/*:/opt/hadoop/share/hadoop/mapreduce/*:/opt/hadoop/share/hadoop/yarn/*:/opt/hadoop/share/hadoop/yarn/lib/*")]; if (arg.includes("$HADOOP_HOME")) return [out("/opt/hadoop")]; if (arg.includes("$HOME")) return [out("/home/hadoop")]; if (arg.includes("$JAVA_HOME")) return [out("/usr/lib/jvm/java-11-openjdk-amd64")]; return [out(arg)]; }
    if (base === "wc") { const target = tokens.find((t, i) => i > 0 && !t.startsWith("-")); if (!target) return [out("wc: falta operando", "error")]; const nd = getLocalNode(resolvePath(target, cwd)); if (!nd || nd.type !== "file") return [out(`wc: ${target}: No existe`, "error")]; const c = nd.content || ""; const lc = c.split("\n").length; const wc = c.split(/\s+/).filter(Boolean).length; if (tokens.includes("-l")) return [out(`  ${lc} ${target}`)]; if (tokens.includes("-w")) return [out(`  ${wc} ${target}`)]; if (tokens.includes("-c")) return [out(`  ${c.length} ${target}`)]; return [out(`  ${lc}  ${wc} ${c.length} ${target}`)]; }
    if (base === "top") { const p = []; if (services.namenode) p.push("  1234 hadoop    20   0 1.2g 256m S  2.0  3.2 java (NameNode)"); if (services.datanode) p.push("  1235 hadoop    20   0 1.1g 200m S  1.5  2.5 java (DataNode)"); if (services.resourcemanager) p.push("  1236 hadoop    20   0 1.3g 300m S  3.0  3.7 java (ResourceManager)"); if (services.nodemanager) p.push("  1237 hadoop    20   0 1.0g 180m S  1.0  2.2 java (NodeManager)"); return [out(`top - 10:00:00 up 2 days, load average: 0.15, 0.10, 0.05\nTasks: ${120 + p.length} total\nMiB Mem: 8192.0 total, 2150.0 free, 3280.0 used\n\n  PID USER      PR  NI    VIRT    RES S  %CPU  %MEM COMMAND\n${p.join("\n")}`)]; }
    if (base === "ps") { let pl = "  PID TTY          TIME CMD\n 1000 pts/0    00:00:00 bash"; if (services.namenode) pl += "\n 1234 ?        00:00:45 java -Dproc_namenode"; if (services.datanode) pl += "\n 1235 ?        00:00:32 java -Dproc_datanode"; if (services.secondarynamenode) pl += "\n 1238 ?        00:00:12 java -Dproc_secondarynamenode"; if (services.resourcemanager) pl += "\n 1236 ?        00:00:58 java -Dproc_resourcemanager"; if (services.nodemanager) pl += "\n 1237 ?        00:00:22 java -Dproc_nodemanager"; if (services.historyserver) pl += "\n 1239 ?        00:00:08 java -Dproc_historyserver"; return [out(pl)]; }
    if (base === "jps") { const p = []; if (services.namenode) p.push("1234 NameNode"); if (services.datanode) p.push("1235 DataNode"); if (services.secondarynamenode) p.push("1238 SecondaryNameNode"); if (services.resourcemanager) p.push("1236 ResourceManager"); if (services.nodemanager) p.push("1237 NodeManager"); if (services.historyserver) p.push("1239 JobHistoryServer"); if (hiveServices.hiveserver2) p.push("1250 HiveServer2"); p.push(`${1240 + p.length} Jps`); if (tokens.includes("-l")) { const fqn = { NameNode: "org.apache.hadoop.hdfs.server.namenode.NameNode", DataNode: "org.apache.hadoop.hdfs.server.datanode.DataNode", SecondaryNameNode: "org.apache.hadoop.hdfs.server.namenode.SecondaryNameNode", ResourceManager: "org.apache.hadoop.yarn.server.resourcemanager.ResourceManager", NodeManager: "org.apache.hadoop.yarn.server.nodemanager.NodeManager", JobHistoryServer: "org.apache.hadoop.mapreduce.v2.hs.JobHistoryServer", HiveServer2: "org.apache.hive.service.server.HiveServer2", Jps: "sun.tools.jps.Jps" }; return [out(p.map(x => { const [pid, nm] = x.split(" "); return `${pid} ${fqn[nm] || nm}`; }).join("\n"))]; } return [out(p.join("\n"))]; }
    if (base === "cd") { const t = tokens[1] || "~"; const r = resolvePath(t, cwd); const nd = getLocalNode(r); if (!nd && !localFS[r]) return [out(`bash: cd: ${t}: No existe`, "error")]; if (nd?.type === "file") return [out(`bash: cd: ${t}: No es un directorio`, "error")]; setCwd(r); return []; }

    // ── ls ──
    if (base === "ls") { const af = tokens.filter((t, i) => i > 0 && t.startsWith("-")).map(f => f.replace(/^-+/, "")).join(""); const targets = tokens.filter((t, i) => i > 0 && !t.startsWith("-")); if (targets.length === 0) { const r = formatLs(cwd, af); return r ? [out(r)] : []; } if (targets.length === 1) { const r = resolvePath(targets[0], cwd); const nd = getLocalNode(r); if (!nd && !localFS[r]) return [out(`ls: '${targets[0]}': No existe`, "error")]; if (nd?.type === "file") { if (af.includes("l")) return [out(`-rw-r--r-- 1 hadoop hadoop ${(nd.content || "").length} Feb 28 10:00 ${targets[0]}`)]; return [out(targets[0])]; } const res = formatLs(r, af); return res ? [out(res)] : []; } const results = []; for (let ti = 0; ti < targets.length; ti++) { const r = resolvePath(targets[ti], cwd); const nd = getLocalNode(r); if (!nd && !localFS[r]) { results.push(out(`ls: '${targets[ti]}': No existe`, "error")); continue; } if (nd?.type === "file") { results.push(out(targets[ti])); continue; } const body = formatLs(r, af) || ""; results.push(out((ti > 0 ? "\n" : "") + `${targets[ti]}:\n${body}`)); } return results; }
    if (base === "mkdir") { const dirs = tokens.filter((t, i) => i > 0 && !t.startsWith("-")); if (dirs.length === 0) return [out("mkdir: falta operando", "error")]; let nf = { ...localFS }; for (const d of dirs) { const r = resolvePath(d, cwd); if (!nf[r]) nf = ensureLocalDir(r, nf); } setLocalFS(nf); return []; }
    if (base === "touch") { const files = tokens.slice(1).filter(t => !t.startsWith("-")); let nf = { ...localFS }; for (const f of files) { const r = resolvePath(f, cwd); const par = r.substring(0, r.lastIndexOf("/")) || "/"; const nm = r.substring(r.lastIndexOf("/") + 1); if (!nf[par]) nf = ensureLocalDir(par, nf); if (nf[par]) nf[par] = { ...nf[par], files: { ...(nf[par].files || {}), [nm]: "" }, children: [...new Set([...(nf[par].children || []), nm])] }; } setLocalFS(nf); return []; }
    // ── cat ──
    if (base === "cat") { const targets = tokens.filter((t, i) => i > 0 && !t.startsWith("-")); if (targets.length === 0) return [out("cat: falta operando", "error")]; let c = ""; for (let fi = 0; fi < targets.length; fi++) { const nd = getLocalNode(resolvePath(targets[fi], cwd)); if (!nd) return [out(`cat: ${targets[fi]}: No existe`, "error")]; if (nd.type === "dir") return [out(`cat: ${targets[fi]}: Es un directorio`, "error")]; if (fi > 0) c += "\n"; c += nd.content || ""; } for (let pi = 1; pi < pipes.length; pi++) { const pt = pipes[pi].trim(); if (pt.startsWith("head")) { const n = parseInt(pt.match(/-n?\s*(\d+)/)?.[1] || pt.match(/-(\d+)/)?.[1]) || 10; c = c.split("\n").slice(0, n).join("\n"); } else if (pt.startsWith("tail")) { const n = parseInt(pt.match(/-n?\s*(\d+)/)?.[1] || pt.match(/-(\d+)/)?.[1]) || 10; c = c.split("\n").slice(-n).join("\n"); } else if (pt.startsWith("wc")) { const ls = c.split("\n").length; const ws = c.split(/\s+/).filter(Boolean).length; c = pt.includes("-l") ? `  ${ls}` : pt.includes("-w") ? `  ${ws}` : `  ${ls}  ${ws} ${c.length}`; } else if (pt.startsWith("grep")) { const gt = parseTokens(pt); const gf = gt.filter(t => t.startsWith("-")).map(t => t.replace(/^-+/, "")).join(""); const pat = gt.find((t, i) => i > 0 && !t.startsWith("-")) || ""; try { const re = new RegExp(pat, gf.includes("i") ? "gi" : "g"); let matched = c.split("\n").filter(l => re.test(l)); if (gf.includes("v")) matched = c.split("\n").filter(l => !new RegExp(pat, gf.includes("i") ? "gi" : "g").test(l)); if (gf.includes("c")) c = String(matched.length); else c = matched.join("\n"); } catch { c = `grep: regex inválida`; } } else if (pt.startsWith("sort")) { const lines = c.split("\n"); lines.sort(); if (pt.includes("-r")) lines.reverse(); c = lines.join("\n"); } else if (pt.startsWith("uniq")) { c = c.split("\n").filter((l, i, a) => i === 0 || l !== a[i - 1]).join("\n"); } } return [out(c)]; }
    if (base === "head") { const target = tokens.find((t, i) => i > 0 && !t.startsWith("-")); if (!target) return [out("head: falta operando", "error")]; let n = 10; const nf2 = tokens.find(t => /^-\d+$/.test(t)); const dn = tokens.indexOf("-n"); if (nf2) n = parseInt(nf2.slice(1)); else if (dn >= 0 && tokens[dn + 1]) n = parseInt(tokens[dn + 1]); const nd = getLocalNode(resolvePath(target, cwd)); if (!nd || nd.type !== "file") return [out(`head: ${target}: No existe`, "error")]; return [out((nd.content || "").split("\n").slice(0, n).join("\n"))]; }
    if (base === "tail") { const target = tokens.find((t, i) => i > 0 && !t.startsWith("-")); if (!target) return [out("tail: falta operando", "error")]; let n = 10; const nf2 = tokens.find(t => /^-\d+$/.test(t)); const dn = tokens.indexOf("-n"); if (nf2) n = parseInt(nf2.slice(1)); else if (dn >= 0 && tokens[dn + 1]) n = parseInt(tokens[dn + 1]); const nd = getLocalNode(resolvePath(target, cwd)); if (!nd || nd.type !== "file") return [out(`tail: ${target}: No existe`, "error")]; return [out((nd.content || "").split("\n").slice(-n).join("\n"))]; }
    if (base === "grep") { const gf = tokens.filter(t => t.startsWith("-")).map(t => t.replace(/^-+/, "")).join(""); const pos = tokens.filter((t, i) => i > 0 && !t.startsWith("-")); const pattern = pos[0]; const gT = pos.slice(1); if (!pattern || gT.length === 0) return [out("Usage: grep PATTERN FILE", "error")]; const results = []; for (const t of gT) { const nd = getLocalNode(resolvePath(t, cwd)); if (!nd || nd.type !== "file") { results.push(out(`grep: ${t}: No existe`, "error")); continue; } try { const re = new RegExp(pattern, gf.includes("i") ? "gi" : "g"); let m = (nd.content || "").split("\n").filter(l => re.test(l)); if (gf.includes("v")) m = (nd.content || "").split("\n").filter(l => !new RegExp(pattern, gf.includes("i") ? "gi" : "g").test(l)); if (gf.includes("c")) { results.push(out(`${gT.length > 1 ? t + ":" : ""}${m.length}`)); continue; } const pf = gT.length > 1 ? t + ":" : ""; results.push(out(m.length > 0 ? m.slice(0, 50).map(l => pf + l).join("\n") : `(sin coincidencias)`)); } catch { results.push(out(`grep: regex inválida`, "error")); } } return results; }
    // cp mv rm chmod
    if (base === "cp") { const cf = tokens.filter(t => t.startsWith("-")).map(t => t.replace(/^-+/, "")).join(""); const pos = tokens.filter((t, i) => i > 0 && !t.startsWith("-")); if (pos.length < 2) return [out("cp: faltan operandos", "error")]; const dst = pos[pos.length - 1]; const srcs = pos.slice(0, -1); let nf = { ...localFS }; const dstR = resolvePath(dst, cwd); const dstIsDir = !!nf[dstR]; for (const src of srcs) { const srcR = resolvePath(src, cwd); const srcN = getLocalNode(srcR); if (!srcN) return [out(`cp: '${src}': No existe`, "error")]; const srcName = srcR.substring(srcR.lastIndexOf("/") + 1); if (srcN.type === "file") { const tp = dstIsDir ? dstR : (dstR.substring(0, dstR.lastIndexOf("/")) || "/"); const tn = dstIsDir ? srcName : dstR.substring(dstR.lastIndexOf("/") + 1); if (!nf[tp]) nf = ensureLocalDir(tp, nf); nf[tp] = { ...nf[tp], files: { ...(nf[tp].files || {}), [tn]: srcN.content }, children: [...new Set([...(nf[tp].children || []), tn])] }; } else if (localFS[srcR]) { if (!cf.includes("r")) return [out(`cp: se omite directorio '${src}' (usa -r)`, "error")]; const tb = dstIsDir ? `${dstR}/${srcName}` : dstR; nf = ensureLocalDir(tb, nf); nf[tb] = { ...nf[tb], children: [...(localFS[srcR].children || [])], files: { ...(localFS[srcR].files || {}) } }; } } setLocalFS(nf); return []; }
    if (base === "mv") { const pos = tokens.filter((t, i) => i > 0 && !t.startsWith("-")); if (pos.length < 2) return [out("mv: faltan operandos", "error")]; const dst = pos[pos.length - 1]; const srcs = pos.slice(0, -1); let nf = { ...localFS }; const dstR = resolvePath(dst, cwd); const dstIsDir = !!nf[dstR]; for (const src of srcs) { const srcR = resolvePath(src, cwd); const srcPar = srcR.substring(0, srcR.lastIndexOf("/")) || "/"; const srcName = srcR.substring(srcR.lastIndexOf("/") + 1); const srcN = getLocalNode(srcR); if (!srcN) return [out(`mv: '${src}': No existe`, "error")]; const tp = dstIsDir ? dstR : (dstR.substring(0, dstR.lastIndexOf("/")) || "/"); const tn = dstIsDir ? srcName : dstR.substring(dstR.lastIndexOf("/") + 1); if (!nf[tp]) nf = ensureLocalDir(tp, nf); if (srcN.type === "file") { nf[tp] = { ...nf[tp], files: { ...(nf[tp].files || {}), [tn]: srcN.content }, children: [...new Set([...(nf[tp].children || []), tn])] }; if (nf[srcPar]?.files) { const { [srcName]: _, ...rest } = nf[srcPar].files; nf[srcPar] = { ...nf[srcPar], files: rest, children: (nf[srcPar].children || []).filter(c => c !== srcName) }; } } else if (localFS[srcR]) { const np = dstIsDir ? `${dstR}/${srcName}` : dstR; nf[np] = { ...nf[srcR] }; delete nf[srcR]; Object.keys(nf).forEach(k => { if (k.startsWith(srcR + "/")) { nf[np + k.substring(srcR.length)] = nf[k]; delete nf[k]; } }); if (nf[srcPar]) nf[srcPar] = { ...nf[srcPar], children: (nf[srcPar].children || []).filter(c => c !== srcName) }; } } setLocalFS(nf); return []; }
    if (base === "rm") { const rf = tokens.filter(t => t.startsWith("-")).map(t => t.replace(/^-+/, "")).join(""); const targets = tokens.filter((t, i) => i > 0 && !t.startsWith("-")); if (targets.length === 0) return [out("rm: falta operando", "error")]; let nf = { ...localFS }; for (const t of targets) { const r = resolvePath(t, cwd); const par = r.substring(0, r.lastIndexOf("/")) || "/"; const nm = r.substring(r.lastIndexOf("/") + 1); if (nf[r]?.type === "dir") { if (!rf.includes("r")) return [out(`rm: '${t}': Es un directorio (usa -r)`, "error")]; Object.keys(nf).forEach(k => { if (k === r || k.startsWith(r + "/")) delete nf[k]; }); if (nf[par]) nf[par] = { ...nf[par], children: (nf[par].children || []).filter(c => c !== nm) }; } else if (nf[par]?.files?.[nm] !== undefined) { const { [nm]: _, ...rest } = nf[par].files; nf[par] = { ...nf[par], files: rest, children: (nf[par].children || []).filter(c => c !== nm) }; } else if (!rf.includes("f")) return [out(`rm: '${t}': No existe`, "error")]; } setLocalFS(nf); return []; }
    if (base === "chmod") { const chF = tokens.filter(t => t.startsWith("-")).map(t => t.replace(/^-+/, "")).join(""); const pos = tokens.filter((t, i) => i > 0 && !t.startsWith("-")); if (pos.length < 2) return [out("chmod: falta operando", "error")]; const mode = pos[0]; const targets = pos.slice(1); const np = { ...permsMap }; const numToRwx = (n) => { const d = String(n).padStart(3, "0"); const m = { "0": "---", "1": "--x", "2": "-w-", "3": "-wx", "4": "r--", "5": "r-x", "6": "rw-", "7": "rwx" }; return (m[d[0]] || "---") + (m[d[1]] || "---") + (m[d[2]] || "---"); }; for (const t of targets) { const r = resolvePath(t, cwd); const paths = [r]; if (chF.includes("R") && localFS[r]) { Object.keys(localFS).forEach(k => { if (k.startsWith(r + "/")) paths.push(k); }); } for (const p of paths) { if (/^\d{3,4}$/.test(mode)) { np[p] = numToRwx(mode.length === 4 ? mode.slice(1) : mode); } else if (mode.includes("+x")) { const cur = np[p] || "rw-r--r--"; np[p] = cur.substring(0, 2) + "x" + cur.substring(3); } else if (mode.includes("-x")) { const cur = np[p] || "rwxr-xr-x"; np[p] = cur.replace(/x/g, "-"); } else np[p] = mode; } } setPermsMap(np); return []; }

    // ssh
    if (base === "ssh") { const target = (tokens[1] || "").replace("hadoop@", ""); if (target === "nodo2" || target === "nodo3") { if (!services.namenode) return [out(`ssh: connect to host ${target}: Connection refused`, "error")]; setSshNode(target); setSshCwd("/home/hadoop"); return [out(`Warning: Permanently added '${target}' (ECDSA) to known hosts.\nWelcome to Ubuntu 22.04.3 LTS (${target})\n`, "success")]; } if (target === "hadoop-VirtualBox" || target === "localhost") return [out("(Ya estás en hadoop-VirtualBox)", "warn")]; return [out(`ssh: Could not resolve hostname ${target}`, "error")]; }
    if (base === "scp") return [out("scp: archivo copiado al nodo remoto (simulado).", "success")];
    if (base === "md5sum") { const target = tokens.slice(1).join(" "); if (!target) return []; const mkH = () => Array.from({ length: 32 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join(""); if (target.includes("fsimage")) { const r = []; for (let i = 42; i <= fsimageCounter; i++) r.push(`${mkH()}  /datos/namenode/current/fsimage_${String(i).padStart(19, "0")}`); return [out(r.slice(-4).join("\n"))]; } return [out(`${mkH()}  ${target}`)]; }

    // Services
    if (trimmed === "./start-dfs.sh" || trimmed === "start-dfs.sh" || trimmed.endsWith("/start-dfs.sh")) { setServices(s => ({ ...s, namenode: true, datanode: true, secondarynamenode: true })); return [out("Starting namenodes on [hadoop-VirtualBox]\nnodo2: starting datanode\nnodo3: starting datanode\nStarting secondary namenodes [hadoop-VirtualBox]\n\n✓ HDFS iniciado. Web UI → pestaña HDFS(:9870)", "success")]; }
    if (trimmed === "./stop-dfs.sh" || trimmed === "stop-dfs.sh" || trimmed.endsWith("/stop-dfs.sh")) { setServices(s => ({ ...s, namenode: false, datanode: false, secondarynamenode: false })); return [out("Stopping namenodes\nStopping datanodes\n\n✓ HDFS detenido.", "warn")]; }
    if (trimmed === "./start-yarn.sh" || trimmed === "start-yarn.sh" || trimmed.endsWith("/start-yarn.sh")) { if (!services.namenode) return [out("WARN: HDFS no está activo.", "error")]; setServices(s => ({ ...s, resourcemanager: true, nodemanager: true })); return [out("Starting resourcemanager\nnodo2: starting nodemanager\nnodo3: starting nodemanager\n\n✓ YARN iniciado. Web UI → pestaña YARN(:8088)", "success")]; }
    if (trimmed === "./stop-yarn.sh" || trimmed === "stop-yarn.sh" || trimmed.endsWith("/stop-yarn.sh")) { setServices(s => ({ ...s, resourcemanager: false, nodemanager: false })); return [out("Stopping resourcemanager\nStopping nodemanagers\n\n✓ YARN detenido.", "warn")]; }
    if (base === "mapred" && tokens[1] === "historyserver") { if (!services.resourcemanager) return [out("Error: YARN no está activo.", "error")]; setServices(s => ({ ...s, historyserver: true })); return [out("✓ JobHistoryServer en http://hadoop-VirtualBox:19888", "success")]; }

    // HDFS
    if (base === "hdfs") {
      if (!services.namenode) return [out("✗ HDFS no iniciado. Ejecuta: ./start-dfs.sh", "error")];
      const sub = tokens[1];
      if (sub === "dfs") {
        const flag = tokens[2];
        if (flag === "-ls") { const t = tokens[3] || "/"; const n = hdfsFS[t]; if (!n) return [out(`ls: '${t}': No such file or directory`, "error")]; if (n.type === "dir") { const items = n.children || []; if (items.length === 0) return [out("Found 0 items")]; return [out(`Found ${items.length} items\n${items.map(i => { const cp = t === "/" ? `/${i}` : `${t}/${i}`; const cn = hdfsFS[cp]; if (cn?.type === "dir") return `drwxr-xr-x   - hadoop supergroup          0 2026-02-28 10:00 ${cp}`; return `-rw-r--r--   2 hadoop supergroup     ${String(cn?.size || 1024).padStart(8)} 2026-02-28 10:00 ${cp}`; }).join("\n")}`)]; } return [out(`-rw-r--r--   2 hadoop supergroup     ${n.size || 0} 2026-02-28 10:00 ${t}`)]; }
        if (flag === "-mkdir") { let nf = { ...hdfsFS }; for (const p of tokens.slice(3).filter(t => !t.startsWith("-"))) nf = ensureHdfsDir(p, nf); setHdfsFS(nf); return []; }
        if (flag === "-put") { const lp = tokens[3]; const hp = tokens[4]; if (!lp || !hp) return [out("Usage: hdfs dfs -put <localsrc> <dst>", "error")]; const rl = resolvePath(lp, cwd); const ln = getLocalNode(rl); if (!ln) return [out(`put: '${lp}': No such file or directory\n  (ruta resuelta: ${rl})`, "error")]; let nf = { ...hdfsFS }; const hpp = hp.replace(/\/$/, ""); if (!nf[hpp]) nf = ensureHdfsDir(hpp, nf); if (ln.type === "file") { const fn = rl.substring(rl.lastIndexOf("/") + 1); const fp = `${hpp}/${fn}`; nf[fp] = { type: "file", content: ln.content, size: (ln.content || "").length, owner: "hadoop", group: "supergroup" }; if (nf[hpp]) nf[hpp] = { ...nf[hpp], children: [...new Set([...(nf[hpp].children || []), fn])] }; } setHdfsFS(nf);
          // Create block files in datanode finalized/subdir0/subdir0
          const sd0 = "/datos/datanode/current/BP-1234567890-127.0.0.1-1700000000000/current/finalized/subdir0/subdir0";
          const blkId = Date.now();
          const blkName = `blk_${blkId}`; const metaName = `blk_${blkId}_1001.meta`;
          setLocalFS(prev => { const nlfs = { ...prev }; const dir = nlfs[sd0] || { type: "dir", children: [], files: {} }; nlfs[sd0] = { ...dir, children: [...new Set([...(dir.children || []), blkName, metaName])], files: { ...(dir.files || {}), [blkName]: ln.content || "", [metaName]: `\x00\x01\x02\x00\x00${blkId}` } }; return nlfs; });
          return []; }
        if (flag === "-get") { const hs = tokens[3]; const ld = tokens[4] || "."; const hn = hdfsFS[hs]; if (!hn) return [out(`get: '${hs}': No such file`, "error")]; const rd = resolvePath(ld, cwd); const fn = hs.substring(hs.lastIndexOf("/") + 1); let nf = { ...localFS }; const tp = nf[rd] ? rd : (rd.substring(0, rd.lastIndexOf("/")) || "/"); const tn = nf[rd] ? fn : rd.substring(rd.lastIndexOf("/") + 1); if (!nf[tp]) nf = ensureLocalDir(tp, nf); nf[tp] = { ...nf[tp], files: { ...(nf[tp].files || {}), [tn]: hn.content || "" }, children: [...new Set([...(nf[tp].children || []), tn])] }; setLocalFS(nf); return []; }
        if (flag === "-cat") { const t = tokens[3]; if (!t) return [out("cat: falta ruta", "error")]; const n = hdfsFS[t]; if (!n) return [out(`cat: '${t}': No such file`, "error")]; let c = n.content || ""; for (let pi = 1; pi < pipes.length; pi++) { const pt = pipes[pi].trim(); if (pt.startsWith("head")) { const num = parseInt(pt.match(/-n?\s*(\d+)/)?.[1] || pt.match(/-(\d+)/)?.[1]) || 10; c = c.split("\n").slice(0, num).join("\n"); } else if (pt.startsWith("tail")) { const num = parseInt(pt.match(/-n?\s*(\d+)/)?.[1] || pt.match(/-(\d+)/)?.[1]) || 10; c = c.split("\n").slice(-num).join("\n"); } } return [out(c)]; }
        if (flag === "-rm") { const rec = tokens.includes("-r"); const t = tokens.find((x, i) => i > 2 && !x.startsWith("-")); if (!t) return [out("rm: falta ruta", "error")]; let nf = { ...hdfsFS }; const par = t.substring(0, t.lastIndexOf("/")) || "/"; const nm = t.substring(t.lastIndexOf("/") + 1); if (rec) Object.keys(nf).forEach(k => { if (k === t || k.startsWith(t + "/")) delete nf[k]; }); else delete nf[t]; if (nf[par]) nf[par] = { ...nf[par], children: (nf[par].children || []).filter(c => c !== nm) }; setHdfsFS(nf); return [out(`Deleted ${t}`)]; }
        if (flag === "-chmod") return [];
        if (flag === "-cp") { const aa = tokens.slice(3).filter(t => !t.startsWith("-")); if (aa.length < 2) return [out("cp: faltan operandos", "error")]; const d = aa[aa.length - 1]; const ss = aa.slice(0, -1); let nf = { ...hdfsFS }; for (const s of ss) { if (s.includes("*")) { const dir = s.substring(0, s.lastIndexOf("/")); const dn2 = nf[dir]; if (dn2) for (const ch of (dn2.children || [])) { const sp = `${dir}/${ch}`; if (nf[sp]) { if (!nf[d]) nf = ensureHdfsDir(d, nf); nf[`${d}/${ch}`] = { ...nf[sp] }; nf[d] = { ...nf[d], children: [...new Set([...(nf[d].children || []), ch])] }; } } } else { const sn2 = nf[s]; if (sn2) { const nm = s.substring(s.lastIndexOf("/") + 1); if (!nf[d]) nf = ensureHdfsDir(d, nf); nf[`${d}/${nm}`] = { ...sn2 }; nf[d] = { ...nf[d], children: [...new Set([...(nf[d].children || []), nm])] }; } } } setHdfsFS(nf); return []; }
        if (flag === "-createSnapshot") { const dir = tokens[3]; const sn = tokens[4]; if (!dir || !sn) return [out("Usage: hdfs dfs -createSnapshot <dir> <name>", "error")]; if (!hdfsSnapEnabled.has(dir)) return [out(`${dir}: Not snapshottable. Use hdfs dfsadmin -allowSnapshot ${dir}`, "error")]; if (!hdfsFS[dir]) return [out(`createSnapshot: '${dir}': No such file`, "error")]; const ss = {}; Object.keys(hdfsFS).forEach(k => { if (k === dir || k.startsWith(dir + "/")) ss[k] = { ...hdfsFS[k] }; }); setHdfsSnapshots(prev => ({ ...prev, [`${dir}/${sn}`]: ss })); let nf = { ...hdfsFS }; const sd = `${dir}/.snapshot`; if (!nf[sd]) nf[sd] = { type: "dir", children: [sn], owner: "hadoop", group: "supergroup" }; else nf[sd] = { ...nf[sd], children: [...new Set([...(nf[sd].children || []), sn])] }; const sp = `${sd}/${sn}`; const on = nf[dir]; nf[sp] = { type: "dir", children: [...(on.children || [])], owner: "hadoop", group: "supergroup" }; for (const ch of (on.children || [])) { const src = `${dir}/${ch}`; if (nf[src]) nf[`${sp}/${ch}`] = { ...nf[src] }; } setHdfsFS(nf); return [out(`Created snapshot ${sd}/${sn}`, "success")]; }
        if (flag === "-deleteSnapshot") { const dir = tokens[3]; const sn = tokens[4]; setHdfsSnapshots(prev => { const n = { ...prev }; delete n[`${dir}/${sn}`]; return n; }); let nf = { ...hdfsFS }; const sd = `${dir}/.snapshot`; if (nf[sd]) nf[sd] = { ...nf[sd], children: (nf[sd].children || []).filter(c => c !== sn) }; delete nf[`${sd}/${sn}`]; setHdfsFS(nf); return [out(`Deleted snapshot ${sn}`, "success")]; }
        return [out(`hdfs dfs: Unknown command: ${flag}`, "error")];
      }
      if (sub === "dfsadmin") {
        const flag = tokens[2];
        if (flag === "-report") { const u = Object.keys(hdfsFS).filter(k => hdfsFS[k].type === "file").length; return [out(`Configured Capacity: 107374182400 (100.00 GB)\nDFS Used: ${(u * 1024).toLocaleString()}\nLive datanodes (3):\n\nName: 192.168.56.10:9866 (hadoop-VirtualBox)\nName: 192.168.56.11:9866 (nodo2)\nName: 192.168.56.12:9866 (nodo3)`)]; }
        if (flag === "-safemode") { const a = tokens[3]; if (a === "enter") { setSafeMode(true); return [out("Safe mode is ON", "warn")]; } if (a === "leave") { setSafeMode(false); return [out("Safe mode is OFF", "success")]; } if (a === "get") return [out(`Safe mode is ${safeMode ? "ON" : "OFF"}`)]; return [out("Usage: -safemode enter|leave|get", "error")]; }
        if (flag === "-saveNamespace") { if (!safeMode) return [out("saveNamespace: Safe mode should be ON", "error")]; const nc = fsimageCounter + 1; setFsimageCounter(nc); let nf = { ...localFS }; const fi = `fsimage_${String(nc).padStart(19, "0")}`; const md = fi + ".md5"; const ed = `edits_inprogress_${String(nc + 1).padStart(19, "0")}`; const mkH = () => Array.from({ length: 32 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join(""); nf["/datos/namenode/current"] = { ...nf["/datos/namenode/current"], children: [...(nf["/datos/namenode/current"]?.children || []), fi, md, ed], files: { ...(nf["/datos/namenode/current"]?.files || {}), [fi]: "[binary fsimage]", [md]: mkH(), [ed]: "[binary edits]" } }; setLocalFS(nf); return [out(`Save namespace successful. New fsimage: ${fi}`, "success")]; }
        if (flag === "-allowSnapshot") { const d = tokens[3]; if (!hdfsFS[d]) return [out(`'${d}': No such file`, "error")]; setHdfsSnapEnabled(prev => new Set([...prev, d])); return [out(`Allowing snapshot on ${d} succeeded`, "success")]; }
        if (flag === "-disallowSnapshot") { const d = tokens[3]; setHdfsSnapEnabled(prev => { const n = new Set(prev); n.delete(d); return n; }); return [out(`Disallowing snapshot on ${d}`, "success")]; }
        return [out(`hdfs dfsadmin: Unknown: ${flag}`, "error")];
      }
      if (sub === "fsck") { const t = tokens[2] || "/"; const det = tokens.includes("-files"); const fc = Object.keys(hdfsFS).filter(k => hdfsFS[k].type === "file").length; const dc = Object.keys(hdfsFS).filter(k => hdfsFS[k].type === "dir").length; let r = `FSCK started by hadoop for path ${t}`; if (det) Object.keys(hdfsFS).filter(k => hdfsFS[k].type === "file").forEach(k => { r += `\n${k} ${hdfsFS[k].size || 1024} bytes, replication=2, 1 block(s): OK`; }); r += `\n\nStatus: HEALTHY\n Total size: ${fc * 1024} B\n Total dirs: ${dc}\n Total files: ${fc}\n\nThe filesystem under path '${t}' is HEALTHY`; return [out(r)]; }
      return [out(`hdfs: Unknown command: ${sub}`, "error")];
    }

    // YARN
    if (base === "yarn") {
      if (!services.resourcemanager) return [out("✗ YARN no iniciado. Ejecuta: ./start-yarn.sh", "error")]; const sub = tokens[1];
      if (sub === "node") { let o = "Total Nodes:3\n  Node-Id\tNode-State\tNode-Http-Address\nhadoop-VirtualBox:45454\tRUNNING\thadoop-VirtualBox:8042\nnodo2:45454\t\tRUNNING\tnodo2:8042\nnodo3:45454\t\tRUNNING\tnodo3:8042"; if (tokens.includes("-showDetails") || tokens.includes("--showDetails")) o += "\n\n  hadoop-VirtualBox — Memory: 3200/4096 MB, VCores: 1/4\n  nodo2 — Memory: 1500/4096 MB, VCores: 0/2\n  nodo3 — Memory: 1500/4096 MB, VCores: 0/2"; return [out(o)]; }
      if (sub === "application") { const f = tokens[2]; if (f === "-list") { const active = yarnApps.filter(a => !["KILLED"].includes(a.state)); if (active.length === 0) return [out("Total number of applications: 0")]; return [out(`Total number of applications: ${active.length}\n${active.map(a => `application_1700000000000_${String(a.id).padStart(4, "0")}\t${a.name}\tMAPREDUCE\t${a.state}`).join("\n")}`)]; } if (f === "-status") { const aid = tokens[3]; const idn = parseInt(aid?.split("_").pop()); const app = yarnApps.find(a => a.id === idn); if (!app) return [out(`Application '${aid}' doesn't exist.`, "error")]; return [out(`Application-Id : ${aid}\nApplication-Name : ${app.name}\nState : ${app.state}\nFinal-State : ${app.state === "FINISHED" ? "SUCCEEDED" : "UNDEFINED"}\nProgress : ${app.state === "FINISHED" ? "100" : "0"}%`)]; } if (f === "-kill") { const aid = tokens[3]; const idn = parseInt(aid?.split("_").pop()); setYarnApps(prev => prev.map(a => a.id === idn ? { ...a, state: "KILLED" } : a)); return [out(`✓ Application ${aid} killed.`, "success")]; } return [out(`yarn application: Unknown: ${f}`, "error")]; }
      if (sub === "applicationattempt") { const aid = tokens[3]; if (!aid) return [out("Usage: yarn applicationattempt -list <App ID>", "error")]; return [out(`Total attempts: 1\nappattempt_${aid.replace("application_", "")}_000001\tRUNNING`)]; }
      if (sub === "container") { const atid = tokens[3]; if (!atid) return [out("Usage: yarn container -list <Attempt Id>", "error")]; const cid = atid.replace("appattempt_", ""); return [out(`Total containers: 2\ncontainer_${cid}_000001\tRUNNING\thadoop-VirtualBox:45454\ncontainer_${cid}_000002\tRUNNING\tnodo2:45454`)]; }
      return [out(`yarn: Unknown: ${sub}`, "error")];
    }

    // hadoop jar
    if (base === "hadoop" && (tokens[1] === "fs" || tokens[1] === "dfs")) {
      // hadoop fs / hadoop dfs → alias de hdfs dfs
      return processCommand("hdfs dfs " + tokens.slice(2).join(" "));
    }
    if (base === "hadoop" && tokens[1] === "jar") {
      if (!services.resourcemanager) return [out("Error: YARN no está activo.", "error")]; const jar = tokens[2] || ""; const jt = tokens[3] || "";
      if (jar.includes("tests.jar") || jt === "TestDFSIO") { const mode = tokens.includes("-write") ? "write" : "read"; const nrF = parseInt(tokens.find((t, i) => tokens[i - 1] === "-nrFiles") || "10"); const fS = parseInt(tokens.find((t, i) => tokens[i - 1] === "-fileSize") || "100"); const aid = appCounter; setAppCounter(c => c + 1); setYarnApps(prev => [...prev, { id: aid, name: `TestDFSIO-${mode}`, state: "FINISHED" }]); let nf = ensureHdfsDir("/benchmarks/TestDFSIO", { ...hdfsFS }); nf[`/benchmarks/TestDFSIO/io_${mode}`] = { type: "file", content: genBenchmark(mode, nrF, fS), size: 512, owner: "hadoop", group: "supergroup" }; if (!nf["/benchmarks"].children.includes("TestDFSIO")) nf["/benchmarks"] = { ...nf["/benchmarks"], children: [...nf["/benchmarks"].children, "TestDFSIO"] }; setHdfsFS(nf); return [out(`Job completed successfully.\n\n${genBenchmark(mode, nrF, fS)}`, "success")]; }
      if (jt === "grep") { const inp = tokens[4]; const outp = tokens[5]; const regex = tokens.slice(6).join(" ").replace(/^['"]|['"]$/g, ""); if (!inp || !outp) return [out("Usage: hadoop jar <jar> grep <in> <out> '<regex>'", "error")]; if (hdfsFS[outp]) return [out(`Output ${outp} already exists. Bórralo: hdfs dfs -rm -r ${outp}`, "error")]; const inode = hdfsFS[inp]; if (!inode) return [out(`Input path not found: ${inp}`, "error")]; let all = ""; if (inode.type === "dir") { for (const ch of (inode.children || [])) { const cp = `${inp}/${ch}`; if (hdfsFS[cp]?.content) all += hdfsFS[cp].content + "\n"; } } else all = inode.content || ""; let matches = {}; try { const re = new RegExp(regex, "gi"); for (const line of all.split("\n")) { const m = line.match(re); if (m) for (const x of m) matches[x.toLowerCase()] = (matches[x.toLowerCase()] || 0) + 1; } } catch {} const sorted = Object.entries(matches).sort((a, b) => b[1] - a[1]); const rc = sorted.length > 0 ? sorted.map(([k, v]) => `${v}\t${k}`).join("\n") : "(sin coincidencias)"; let nf = ensureHdfsDir(outp, { ...hdfsFS }); nf[`${outp}/part-r-00000`] = { type: "file", content: rc, size: rc.length, owner: "hadoop", group: "supergroup" }; nf[`${outp}/_SUCCESS`] = { type: "file", content: "", size: 0, owner: "hadoop", group: "supergroup" }; nf[outp] = { ...nf[outp], children: [...new Set([...(nf[outp].children || []), "part-r-00000", "_SUCCESS"])] }; setHdfsFS(nf); const aid = appCounter; setAppCounter(c => c + 1); setYarnApps(prev => [...prev, { id: aid, name: "grep-search", state: "FINISHED" }]); return [out(`Job completed successfully.\n\n✓ Verifica: hdfs dfs -cat ${outp}/part-r-00000 | head`, "success")]; }
      if (tokens.length >= 5) { const inp = tokens[tokens.length - 2]; const outp = tokens[tokens.length - 1]; if (hdfsFS[outp]) return [out(`Output ${outp} already exists.`, "error")]; const inode = hdfsFS[inp]; if (!inode) return [out(`Input not found: ${inp}`, "error")]; let all = ""; if (inode.type === "dir") { for (const ch of (inode.children || [])) { const p = `${inp}/${ch}`; if (hdfsFS[p]?.content) all += hdfsFS[p].content + "\n"; } } else all = inode.content || ""; const words = {}; all.split(/\s+/).filter(Boolean).forEach(w => { const k = w.replace(/[^a-zA-Z0-9_.-]/g, ""); if (k) words[k] = (words[k] || 0) + 1; }); const rc = Object.entries(words).sort((a, b) => a[0].localeCompare(b[0])).map(([k, v]) => `${k}\t${v}`).join("\n"); let nf = ensureHdfsDir(outp, { ...hdfsFS }); nf[`${outp}/part-r-00000`] = { type: "file", content: rc, size: rc.length, owner: "hadoop", group: "supergroup" }; nf[`${outp}/_SUCCESS`] = { type: "file", content: "", size: 0, owner: "hadoop", group: "supergroup" }; nf[outp] = { ...nf[outp], children: ["part-r-00000", "_SUCCESS"] }; setHdfsFS(nf); const aid = appCounter; setAppCounter(c => c + 1); setYarnApps(prev => [...prev, { id: aid, name: jt || "wordcount", state: "FINISHED" }]); return [out(`Job completed successfully.\n\n✓ Verifica: hdfs dfs -cat ${outp}/part-r-00000 | head`, "success")]; }
      if (jar.includes("examples") && !jt) return [out(`An example program must be given as the first argument.\nValid program names are:\n  aggregatewordcount: An Aggregate based map/reduce program that counts the words in the input files.\n  aggregatewordhist: An Aggregate based map/reduce program that computes the histogram of the words in the input files.\n  bbp: A map/reduce program that uses Bailey-Borwein-Plouffe to compute exact digits of Pi.\n  dbcount: An example job that count the pageview counts from a database.\n  distbbp: A map/reduce program that uses Bailey-Borwein-Plouffe to compute exact digits of Pi.\n  grep: A map/reduce program that counts the matches of a regex in the input.\n  join: A job that effects a join over sorted, equally partitioned datasets\n  multifilewc: A job that counts words from several files.\n  pentomino: A map/reduce tile laying program to find solutions to pentomino problems.\n  pi: A map/reduce program that estimates Pi using a quasi-Monte Carlo method.\n  randomtextwriter: A map/reduce program that writes 10GB of random textual data per node.\n  randomwriter: A map/reduce program that writes 10GB of random data per node.\n  secondarysort: An example defining a secondary sort to the reduce.\n  sort: A map/reduce program that sorts the data written by the random writer.\n  sudoku: A sudoku solver.\n  teragen: Generate data for the terasort\n  terasort: Run the terasort\n  teravalidate: Checking results of terasort\n  wordcount: A map/reduce program that counts the words in the input files.\n  wordmean: A map/reduce program that counts the average length of the words in the input files.\n  wordmedian: A map/reduce program that counts the median length of the words in the input files.\n  wordstandarddeviation: A map/reduce program that counts the standard deviation of the length of the words in the input files.`, "output")];
      return [out(`Usage: hadoop jar <jar> [mainClass] args...`, "error")];
    }
    if (base === "javac") { const f = tokens.find(t => t.endsWith(".java")); if (!f) return [out("javac: no source files", "error")]; const nm = f.replace(".java", ""); let nf = { ...localFS }; if (nf[cwd]) { const cls = [`${nm}.class`, `${nm}$TokenizerMapper.class`, `${nm}$IntSumReducer.class`]; nf[cwd] = { ...nf[cwd], children: [...new Set([...(nf[cwd].children || []), ...cls])], files: { ...(nf[cwd].files || {}), ...Object.fromEntries(cls.map(c => [c, `[bytecode: ${c}]`])) } }; } setLocalFS(nf); return [out(`✓ Compilación exitosa`, "success")]; }
    if (base === "jar" && tokens[1] === "cf") { const jn = tokens[2]; if (!jn) return [out("jar: faltan argumentos", "error")]; let nf = { ...localFS }; if (nf[cwd]) nf[cwd] = { ...nf[cwd], children: [...new Set([...(nf[cwd].children || []), jn])], files: { ...(nf[cwd].files || {}), [jn]: `[JAR: ${jn}]` } }; setLocalFS(nf); return [out(`✓ ${jn} creado`, "success")]; }
    if (base === "gzip") {
      const keep = tokens.includes("-k"); const decomp = tokens.includes("-d");
      const target = tokens.find((t, i) => i > 0 && !t.startsWith("-"));
      if (!target) return [out("gzip: falta operando", "error")];
      const r = resolvePath(target, cwd); const nd = getLocalNode(r);
      if (!nd || nd.type !== "file") return [out(`gzip: ${target}: No existe`, "error")];
      if (decomp || target.endsWith(".gz")) return processCommand(`gunzip ${target}`);
      const gzName = target.endsWith(".gz") ? target : target + ".gz";
      const par = r.substring(0, r.lastIndexOf("/")) || "/"; const nm = r.substring(r.lastIndexOf("/") + 1);
      let nf = { ...localFS };
      nf[par] = { ...nf[par], children: [...new Set([...(nf[par].children || []).filter(c => keep || c !== nm), gzName])], files: { ...(nf[par].files || {}), [gzName]: `[gzip compressed: ${nm}]\n${nd.content || ""}` } };
      if (!keep) { const { [nm]: _, ...rest } = nf[par].files || {}; nf[par] = { ...nf[par], files: rest }; }
      setLocalFS(nf); return [out(`gzip: ${target} → ${gzName}`, "success")];
    }
    if (base === "gunzip") {
      const keep = tokens.includes("-k");
      const target = tokens.find((t, i) => i > 0 && !t.startsWith("-"));
      if (!target) return [out("gunzip: falta operando", "error")];
      if (!target.endsWith(".gz")) return [out(`gunzip: ${target}: unknown suffix -- ignored`, "error")];
      const r = resolvePath(target, cwd); const nd = getLocalNode(r);
      if (!nd || nd.type !== "file") return [out(`gunzip: ${target}: No existe`, "error")];
      const outName = target.slice(0, -3);
      const par = r.substring(0, r.lastIndexOf("/")) || "/"; const nm = r.substring(r.lastIndexOf("/") + 1);
      const rawContent = (nd.content || "").replace(/^\[gzip compressed: [^\]]+\]\n/, "");
      let nf = { ...localFS };
      const newChildren = [...new Set([...(nf[par].children || []).filter(c => keep || c !== nm), outName])];
      nf[par] = { ...nf[par], children: newChildren, files: { ...(nf[par].files || {}), [outName]: rawContent } };
      if (!keep) { const { [nm]: _, ...rest } = nf[par].files; nf[par] = { ...nf[par], files: rest }; }
      setLocalFS(nf); return [out(`gunzip: ${target} → ${outName}`, "success")];
    }
    if (base === "exit") return [out("(Nodo maestro. Usa 'reset' para reiniciar.)", "warn")];
    if (base === "hiveserver2") {
      if (!services.namenode) return [out("Error: HDFS no está activo.", "error")];
      if (!services.resourcemanager) return [out("Error: YARN no está activo.", "error")];
      setHiveServices(s => ({ ...s, hiveserver2: true }));
      return [out("2026-03-03 10:00:00 INFO  hive.metastore: Starting Hive Metastore Server\n2026-03-03 10:00:01 INFO  service.CompositeService: Starting HiveServer2\n2026-03-03 10:00:02 INFO  thrift.ThriftCLIService: Starting ThriftBinaryCLIService on port 10000\n2026-03-03 10:00:03 INFO  http.HttpServer: Started HiveServer2 Web UI on port 10002\n\n✓ HiveServer2 activo en puerto 10000\n  Web UI → pestaña Hive(:10002)", "success")];
    }
    if (base === "beeline") {
      if (!hiveServices.hiveserver2) return [out("Error: HiveServer2 no está activo.\nInicia primero:\n  cd /opt/hadoop/hive/bbdd\n  hiveserver2", "error")];
      setBeelineMode(true);
      setBeelineConnected(false);
      return [out("Beeline version 4.0.0 by Apache Hive\nbeeline>", "system")];
    }
    if (["nano", "vim", "vi", "gedit"].includes(base)) return [out(`(${base} no disponible. Usa echo >> archivo y cat.)`, "warn")];
    if (base === "bash" || base === "sh") { const sp = tokens[1]; if (!sp) return [out(`${base}: falta archivo`, "error")]; const nd = getLocalNode(resolvePath(sp, cwd)); if (!nd || nd.type !== "file") return [out(`${base}: ${sp}: No existe`, "error")]; const sLines = (nd.content || "").split("\n").filter(l => l.trim() && !l.trim().startsWith("#")); const results = []; for (const line of sLines) results.push(...processCommand(line.trim())); return results; }
    if (base.startsWith("./")) { const sn = base.substring(2); const r = resolvePath(sn, cwd); const nd = getLocalNode(r); if (!nd || nd.type !== "file") return [out(`bash: ${base}: No existe`, "error")]; const pm = permsMap[r] || "rw-r--r--"; if (!pm.includes("x")) return [out(`bash: ${base}: Permiso denegado\nTip: chmod u+x ${sn}`, "error")]; const sLines = (nd.content || "").split("\n").filter(l => l.trim() && !l.trim().startsWith("#")); const results = []; for (const line of sLines) results.push(...processCommand(line.trim())); return results.length === 0 ? [out(`(script ${sn} ejecutado)`, "success")] : results; }
    return [out(`bash: ${base}: comando no encontrado`, "error")];
  }, [cwd, services, hiveServices, localFS, hdfsFS, safeMode, hdfsSnapEnabled, hdfsSnapshots, appCounter, fsimageCounter, permsMap, out, resolvePath, getLocalNode, ensureHdfsDir, ensureLocalDir, formatLs, yarnApps, getDirItems]);

  // ── Beeline/HiveQL processor ──
  const processBeelineCommand = useCallback((cmd) => {
    const trimmed = cmd.trim().replace(/;\s*$/, "");
    const lower = trimmed.toLowerCase();

    // ── Helper: render table from cols + rows ──
    const renderTable = (cols, rows) => {
      if (rows.length === 0) {
        const maxWs = cols.map(c => c.length);
        const sep = "+" + maxWs.map(w => "-".repeat(w + 2)).join("+") + "+";
        return `${sep}\n| ${cols.join(" | ")} |\n${sep}\n${sep}\n0 rows selected`;
      }
      const maxWs = cols.map((c, i) => Math.max(c.length, ...rows.map(r => String(r[i] ?? "NULL").length)));
      const sep = "+" + maxWs.map(w => "-".repeat(w + 2)).join("+") + "+";
      const hdr = "| " + cols.map((c, i) => c.padEnd(maxWs[i])).join(" | ") + " |";
      const body = rows.map(r => "| " + cols.map((c, i) => String(r[i] ?? "NULL").padEnd(maxWs[i])).join(" | ") + " |");
      return `${sep}\n${hdr}\n${sep}\n${body.join("\n")}\n${sep}\n${rows.length} row${rows.length !== 1 ? "s" : ""} selected`;
    };

    // ── Helper: MapReduce job log ──
    const mrLog = (jobName, appId) => {
      const jobId = `job_1700000000000_${String(appId).padStart(4, "0")}`;
      return `INFO  : Compiling command(queryId=hive_${Date.now()})\nINFO  : Semantic Analysis Completed\nINFO  : Returning Hive schema field info\nINFO  : Starting job = ${jobId}, alias = ${jobName}\nINFO  : Hadoop job information for Stage-1: number of mappers: 1; number of reducers: 1\nINFO  : map = 0%,  reduce = 0%\nINFO  : map = 100%,  reduce = 0%\nINFO  : map = 100%,  reduce = 100%\nINFO  : Ended Job = ${jobId}`;
    };

    // ── Helper: evaluate single WHERE condition against a row ──
    const evalCond = (row, colNames, cond) => {
      const c = cond.trim();
      const nullM = c.match(/^(\w+)\s+IS\s+(NOT\s+)?NULL$/i);
      if (nullM) { const ci = colNames.indexOf(nullM[1]); if (ci < 0) return true; const v = row[ci]; return nullM[2] ? (v != null && v !== "" && v !== "NULL") : (v == null || v === "" || v === "NULL"); }
      const btwM = c.match(/^(\w+)\s+BETWEEN\s+([^\s]+)\s+AND\s+([^\s]+)$/i);
      if (btwM) { const ci = colNames.indexOf(btwM[1]); if (ci < 0) return true; const v = parseFloat(row[ci]); return v >= parseFloat(btwM[2]) && v <= parseFloat(btwM[3]); }
      const inM = c.match(/^(\w+)\s+NOT\s+IN\s*\(([^)]+)\)$/i);
      if (inM) { const ci = colNames.indexOf(inM[1]); if (ci < 0) return true; const vals = inM[2].split(",").map(v => v.trim().replace(/^['"]|['"]$/g, "")); return !vals.includes(String(row[ci] ?? "")); }
      const inM2 = c.match(/^(\w+)\s+IN\s*\(([^)]+)\)$/i);
      if (inM2) { const ci = colNames.indexOf(inM2[1]); if (ci < 0) return true; const vals = inM2[2].split(",").map(v => v.trim().replace(/^['"]|['"]$/g, "")); return vals.includes(String(row[ci] ?? "")); }
      const likeM = c.match(/^(\w+)\s+NOT\s+LIKE\s+['"](.*?)['"]$/i);
      if (likeM) { const ci = colNames.indexOf(likeM[1]); if (ci < 0) return true; const pat = likeM[2].replace(/%/g, ".*").replace(/_/g, "."); return !new RegExp("^" + pat + "$", "i").test(String(row[ci] ?? "")); }
      const likeM2 = c.match(/^(\w+)\s+LIKE\s+['"](.*?)['"]$/i);
      if (likeM2) { const ci = colNames.indexOf(likeM2[1]); if (ci < 0) return true; const pat = likeM2[2].replace(/%/g, ".*").replace(/_/g, "."); return new RegExp("^" + pat + "$", "i").test(String(row[ci] ?? "")); }
      const cmpM = c.match(/^(\w+)\s*(=|!=|<>|>=|<=|>|<)\s*['"]?(.*?)['"]?$/);
      if (cmpM) { const ci = colNames.indexOf(cmpM[1]); if (ci < 0) return true; const rv = String(row[ci] ?? ""); const op = cmpM[2]; const val = cmpM[3]; const rn = parseFloat(rv); const vn = parseFloat(val); const numOk = !isNaN(rn) && !isNaN(vn); if (op === "=" || op === "==") return numOk ? rn === vn : rv === val; if (op === "!=" || op === "<>") return numOk ? rn !== vn : rv !== val; if (op === ">") return rn > vn; if (op === "<") return rn < vn; if (op === ">=") return rn >= vn; if (op === "<=") return rn <= vn; }
      return true;
    };

    // ── Helper: apply full WHERE clause (supports AND / OR) ──
    const applyWhere = (rows, colNames, clause) => {
      if (!clause) return rows;
      return rows.filter(row => {
        // Split by OR first (lowest precedence)
        const orParts = clause.split(/\s+OR\s+/i);
        return orParts.some(orPart => {
          // Split by AND
          const andParts = orPart.split(/\s+AND\s+/i);
          return andParts.every(cond => evalCond(row, colNames, cond.trim()));
        });
      });
    };

    // ── Helper: parse column list handling nested parens (e.g. DECIMAL(10,2)) ──
    const parseColList = (str) => {
      const cols = []; let depth = 0; let cur = "";
      for (const ch of str) {
        if (ch === "(") { depth++; cur += ch; }
        else if (ch === ")") { depth--; cur += ch; }
        else if (ch === "," && depth === 0) { if (cur.trim()) cols.push(cur.trim()); cur = ""; }
        else cur += ch;
      }
      if (cur.trim()) cols.push(cur.trim());
      return cols.map(c => { const p = c.trim().split(/\s+/); return { name: p[0], type: p.slice(1).join(" ") || "STRING" }; }).filter(c => c.name);
    };

    // ── Helper: look up a file node in hdfsFS (checks parent dir's files) ──
    const getHdfsFile = (path) => {
      const abs = path.startsWith("/") ? path : `/user/hadoop/${path}`;
      // Direct node
      if (hdfsFS[abs] && hdfsFS[abs].type === "file") return { content: hdfsFS[abs].content || "" };
      // Check parent dir's files map
      const parentPath = abs.substring(0, abs.lastIndexOf("/")) || "/";
      const fname = abs.substring(abs.lastIndexOf("/") + 1);
      const parent = hdfsFS[parentPath];
      if (parent?.files?.[fname] !== undefined) return { content: parent.files[fname] };
      return null;
    };

    // ══════════════════════════════
    // BEELINE META-COMMANDS
    // ══════════════════════════════
    if (trimmed === "!exit" || trimmed === "!quit") {
      setBeelineMode(false); setBeelineConnected(false);
      return [out("Closing: 0: jdbc:hive2://hadoop-virtualbox:10000\n(Beeline cerrado)", "system")];
    }
    if (trimmed.startsWith("!connect")) {
      if (trimmed.match(/jdbc:hive2:\/\/hadoop-?virtualbox:10000/i)) {
        setBeelineConnected(true);
        return [out("Connecting to jdbc:hive2://hadoop-virtualbox:10000\nEnter username for jdbc:hive2://hadoop-virtualbox:10000: hadoop\nEnter password for jdbc:hive2://hadoop-virtualbox:10000: \nConnected to: Apache Hive (version 4.0.0)\nDriver: Hive JDBC (version 4.0.0)\nTransaction isolation: TRANSACTION_REPEATABLE_READ", "success")];
      }
      return [out("Error: Could not open connection. Check URL.", "error")];
    }
    if (trimmed.startsWith("!sh ")) {
      if (!beelineConnected) return [out("Error: Not connected.", "error")];
      const shCmd = trimmed.slice(4).trim();
      const result = processCommand(shCmd);
      return result;
    }
    if (trimmed === "!help" || trimmed === "help") {
      return [out(
        "Beeline / HiveQL — Comandos disponibles:\n" +
        "\n  META-COMANDOS (beeline):\n" +
        "  !connect jdbc:hive2://hadoop-virtualbox:10000\n" +
        "  !exit | !quit              — cerrar conexión\n" +
        "  !tables                    — listar tablas actuales\n" +
        "  !columns <tabla>           — columnas de tabla\n" +
        "  !describe <tabla>          — describir tabla\n" +
        "  !sh <comando>              — ejecutar comando Linux\n" +
        "  !set outputformat table    — formato de salida\n" +
        "  !set verbose true/false    — verbosidad\n" +
        "\n  DDL:\n" +
        "  CREATE DATABASE [IF NOT EXISTS] <db>;\n" +
        "  DROP DATABASE [IF EXISTS] <db> [CASCADE];\n" +
        "  USE <db>;\n" +
        "  CREATE [EXTERNAL] TABLE [IF NOT EXISTS] <t> (cols)\n" +
        "    [ROW FORMAT DELIMITED FIELDS TERMINATED BY ',']\n" +
        "    [ROW FORMAT SERDE '...' WITH SERDEPROPERTIES (...)]\n" +
        "    [STORED AS ORC|TEXTFILE|PARQUET]\n" +
        "    [TBLPROPERTIES (\"orc.compress\"=\"SNAPPY\")]\n" +
        "    [PARTITIONED BY (col STRING)]\n" +
        "    [CLUSTERED BY (col) INTO N BUCKETS]\n" +
        "    [LOCATION '/hdfs/path'];\n" +
        "  ALTER TABLE <t> ADD COLUMNS (col tipo);\n" +
        "  DROP TABLE [IF EXISTS] <t>;\n" +
        "  TRUNCATE TABLE <t>;\n" +
        "\n  DML:\n" +
        "  INSERT INTO [TABLE] <t> VALUES (...);\n" +
        "  INSERT INTO TABLE <t> [PARTITION (col)] SELECT ...;\n" +
        "  INSERT OVERWRITE TABLE <t> SELECT ...;\n" +
        "  INSERT OVERWRITE LOCAL DIRECTORY '...' ROW FORMAT DELIMITED FIELDS TERMINATED BY ',' SELECT ...;\n" +
        "  LOAD DATA [LOCAL] INPATH '...' [OVERWRITE] INTO TABLE <t>;\n" +
        "\n  QUERY:\n" +
        "  SELECT [col|*|agg] FROM <t> [JOIN ...] [WHERE ...] [GROUP BY ...] [HAVING ...] [ORDER BY ...] [LIMIT n];\n" +
        "  SELECT ... FROM <t> TABLESAMPLE(BUCKET n OUT OF m ON col);\n" +
        "\n  SHOW/DESCRIBE:\n" +
        "  SHOW DATABASES; SHOW TABLES; SHOW PARTITIONS <t>;\n" +
        "  SHOW CREATE TABLE <t>;\n" +
        "  DESCRIBE [FORMATTED] <t>;\n" +
        "  ANALYZE TABLE <t> COMPUTE STATISTICS;\n" +
        "\n  SET:\n" +
        "  SET hive.exec.dynamic.partition=true;\n" +
        "  SET hive.exec.dynamic.partition.mode=nonstrict;\n" +
        "  SET hive.enforce.bucketing=true;\n" +
        "  SET hive.execution.engine=mr;\n" +
        "  SET mapreduce.job.name=<nombre>;",
        "help"
      )];
    }
    if (trimmed.startsWith("!set ")) {
      const setVal = trimmed.slice(5).trim();
      if (setVal.startsWith("outputformat")) return [out(`outputformat set to ${setVal.split(/\s+/)[1] || "table"}`, "system")];
      if (setVal.startsWith("verbose")) return [out(`verbose set to ${setVal.split(/\s+/)[1] || "true"}`, "system")];
      return [out(`${setVal} set`, "system")];
    }
    if (trimmed.startsWith("!columns ") || trimmed.startsWith("!describe ")) {
      const tName = trimmed.split(/\s+/)[1];
      const db = hiveDBs[currentHiveDB];
      if (!db?.tables[tName]) return [out(`FAILED: Table ${tName} does not exist`, "error")];
      const cols = db.tables[tName].columns;
      return [out(renderTable(["TABLE_NAME", "COLUMN_NAME", "DATA_TYPE"], cols.map(c => [tName, c.name, c.type.toUpperCase()])))];
    }
    if (trimmed === "!tables") {
      const db = hiveDBs[currentHiveDB]; if (!db) return [out("(ninguna tabla)")];
      const tables = Object.keys(db.tables);
      return [out(renderTable(["tab_name"], tables.map(t => [t])))];
    }
    if (!beelineConnected) return [out("Error: Not connected. Use:\n  !connect jdbc:hive2://hadoop-virtualbox:10000", "error")];

    // ══════════════════════════════
    // SET commands
    // ══════════════════════════════
    if (lower.startsWith("set ")) {
      const setPart = trimmed.slice(4).trim();
      const kv = setPart.split("=");
      const key = kv[0].trim();
      const val = (kv[1] || "").trim();
      const knownSets = [
        "hive.exec.dynamic.partition", "hive.exec.dynamic.partition.mode",
        "hive.enforce.bucketing", "hive.exec.mode.local.auto",
        "hive.auto.convert.join", "hive.execution.engine",
        "mapreduce.job.name", "hive.mapred.mode",
      ];
      if (knownSets.some(k => key.toLowerCase().startsWith(k.toLowerCase()))) {
        return [out(`${key}=${val}`, "system")];
      }
      return [out(`${key}=${val}`, "system")];
    }

    // ══════════════════════════════
    // SHOW commands
    // ══════════════════════════════
    if (lower === "show databases" || lower === "show schemas") {
      const dbs = Object.keys(hiveDBs);
      return [out(`INFO  : Compiling command: show databases\nINFO  : Completed compiling command\nINFO  : Executing command: show databases\n` + renderTable(["database_name"], dbs.map(d => [d])))];
    }
    if (lower === "show tables") {
      const db = hiveDBs[currentHiveDB]; if (!db) return [out("(ninguna tabla)")];
      const tables = Object.keys(db.tables);
      return [out(renderTable(["tab_name"], tables.map(t => [t])))];
    }
    if (lower.startsWith("show tables in ")) {
      const dbName = trimmed.split(/\s+/)[3];
      const db = hiveDBs[dbName];
      if (!db) return [out(`FAILED: Database ${dbName} does not exist`, "error")];
      return [out(renderTable(["tab_name"], Object.keys(db.tables).map(t => [t])))];
    }
    if (lower.startsWith("show partitions ")) {
      const tName = trimmed.split(/\s+/)[2];
      const db = hiveDBs[currentHiveDB];
      if (!db?.tables[tName]) return [out(`FAILED: Table ${tName} does not exist`, "error")];
      const partitions = db.tables[tName].partitions || [];
      if (partitions.length === 0) return [out(`+---------------------+\n| partition           |\n+---------------------+\n+---------------------+\n0 rows selected`)];
      return [out(renderTable(["partition"], partitions.map(p => [p])))];
    }
    if (lower.startsWith("show create table ")) {
      const tName = trimmed.split(/\s+/)[3];
      const db = hiveDBs[currentHiveDB];
      if (!db?.tables[tName]) return [out(`FAILED: Table ${tName} does not exist`, "error")];
      const t = db.tables[tName];
      const cols = t.columns.map(c => `  ${c.name} ${c.type.toUpperCase()}`).join(",\n");
      const isExt = t.external ? "EXTERNAL " : "";
      const loc = t.location ? `\nLOCATION '${t.location}'` : `\nLOCATION '/user/hive/warehouse/${currentHiveDB === "default" ? "" : currentHiveDB + ".db/"}${tName}'`;
      const rowFmt = t.rowFormat ? `\nROW FORMAT ${t.rowFormat}` : "\nROW FORMAT DELIMITED\n  FIELDS TERMINATED BY '\\t'";
      const storedAs = t.storedAs ? `\nSTORED AS ${t.storedAs}` : "\nSTORED AS TEXTFILE";
      const partBy = t.partitionedBy ? `\nPARTITIONED BY (${t.partitionedBy.map(p => `${p.name} ${p.type}`).join(", ")})` : "";
      const clustBy = t.clusteredBy ? `\nCLUSTERED BY (${t.clusteredBy.col}) INTO ${t.clusteredBy.buckets} BUCKETS` : "";
      const tblProp = t.tblproperties ? `\nTBLPROPERTIES (${Object.entries(t.tblproperties).map(([k, v]) => `"${k}"="${v}"`).join(", ")})` : "";
      const ddl = `CREATE ${isExt}TABLE \`${tName}\` (\n${cols}\n)${rowFmt}${storedAs}${partBy}${clustBy}${loc}${tblProp}`;
      return [out(renderTable(["createtab_stmt"], [[ddl]]))];
    }

    // ══════════════════════════════
    // SELECT CURRENT_DATABASE()
    // ══════════════════════════════
    if (lower.startsWith("select current_database()")) {
      return [out(renderTable(["current_database()"], [[currentHiveDB]]))];
    }

    // ══════════════════════════════
    // DATABASE commands
    // ══════════════════════════════
    if (lower.startsWith("create database ") || lower.startsWith("create schema ")) {
      const ifNotExists = /if\s+not\s+exists/i.test(trimmed);
      const dbNameM = trimmed.match(/create\s+(?:database|schema)\s+(?:if\s+not\s+exists\s+)?(\w+)/i);
      const dbName = dbNameM ? dbNameM[1] : null;
      if (!dbName) return [out("Error: Falta nombre de base de datos", "error")];
      if (hiveDBs[dbName]) {
        if (ifNotExists) return [out(`No rows affected`)];
        return [out(`FAILED: Database ${dbName} already exists`, "error")];
      }
      setHiveDBs(prev => ({ ...prev, [dbName]: { tables: {} } }));
      const whPath = `/user/hive/warehouse/${dbName}.db`;
      setHdfsFS(prev => ensureHdfsDir(whPath, { ...prev }));
      return [out(`INFO  : Compiling command: create database ${dbName}\nINFO  : Executing command\nNo rows affected\n\n✓ Base de datos '${dbName}' creada.\n  HDFS: ${whPath}`, "success")];
    }
    if (lower.startsWith("drop database ") || lower.startsWith("drop schema ")) {
      const ifExists = /if\s+exists/i.test(trimmed);
      const dbNameM = trimmed.match(/drop\s+(?:database|schema)\s+(?:if\s+exists\s+)?(\w+)/i);
      const dbName = dbNameM ? dbNameM[1] : null;
      const cascade = lower.includes("cascade");
      if (!hiveDBs[dbName]) {
        if (ifExists) return [out("No rows affected")];
        return [out(`FAILED: Database ${dbName} does not exist`, "error")];
      }
      if (dbName === "default") return [out("FAILED: Cannot drop default database", "error")];
      if (!cascade && Object.keys(hiveDBs[dbName].tables).length > 0) return [out(`FAILED: Database ${dbName} is not empty. Use CASCADE.`, "error")];
      setHiveDBs(prev => { const n = { ...prev }; delete n[dbName]; return n; });
      if (currentHiveDB === dbName) setCurrentHiveDB("default");
      return [out(`No rows affected\n✓ Database '${dbName}' dropped`, "success")];
    }
    if (lower.startsWith("use ")) {
      const dbName = trimmed.split(/\s+/)[1];
      if (!hiveDBs[dbName]) return [out(`FAILED: Database ${dbName} does not exist`, "error")];
      setCurrentHiveDB(dbName);
      return [out(`No rows affected`)];
    }

    // ══════════════════════════════
    // CREATE TABLE (full parser)
    // ══════════════════════════════
    if (lower.startsWith("create ")) {
      const isExternal = /create\s+external\s+table/i.test(trimmed);
      const ifNotExists = /if\s+not\s+exists/i.test(trimmed);

      // Extract table name
      const tNameM = trimmed.match(/create\s+(?:external\s+)?table\s+(?:if\s+not\s+exists\s+)?(\w+)/i);
      if (!tNameM) return [out("Error: Syntax error in CREATE TABLE", "error")];
      const tName = tNameM[1];

      if (ifNotExists && hiveDBs[currentHiveDB]?.tables[tName]) return [out("No rows affected")];
      if (!ifNotExists && hiveDBs[currentHiveDB]?.tables[tName]) return [out(`FAILED: Table ${tName} already exists`, "error")];

      // Extract column list: find matching parens after table name
      // (handles DECIMAL(10,2) and multi-line)
      const afterName = trimmed.slice(trimmed.toLowerCase().indexOf(tName.toLowerCase()) + tName.length).trim();
      let colStr = "";
      let rest = afterName;
      if (afterName.startsWith("(")) {
        let depth = 0; let i = 0; let colEnd = -1;
        for (; i < afterName.length; i++) {
          if (afterName[i] === "(") depth++;
          else if (afterName[i] === ")") { depth--; if (depth === 0) { colEnd = i; break; } }
        }
        if (colEnd > 0) { colStr = afterName.slice(1, colEnd); rest = afterName.slice(colEnd + 1).trim(); }
      }

      // Parse columns using paren-aware splitter
      const colDefs = colStr ? parseColList(colStr) : [];

      // ROW FORMAT
      let rowFormat = null;
      const rfDelim = rest.match(/ROW\s+FORMAT\s+DELIMITED\s+FIELDS\s+TERMINATED\s+BY\s+['"](.*?)['"]/i);
      const rfSerde = rest.match(/ROW\s+FORMAT\s+SERDE\s+['"]([^'"]+)['"]/i);
      if (rfDelim) rowFormat = `DELIMITED FIELDS TERMINATED BY '${rfDelim[1]}'`;
      else if (rfSerde) {
        const serdeProps = rest.match(/WITH\s+SERDEPROPERTIES\s*\(([^)]+)\)/i);
        rowFormat = `SERDE '${rfSerde[1]}'${serdeProps ? " WITH SERDEPROPERTIES (" + serdeProps[1] + ")" : ""}`;
      }

      // STORED AS
      const storedM = rest.match(/STORED\s+AS\s+(\w+)/i);
      const storedAs = storedM ? storedM[1].toUpperCase() : "TEXTFILE";

      // TBLPROPERTIES
      let tblprops = null;
      const tblpM = rest.match(/TBLPROPERTIES\s*\(([^)]+)\)/i);
      if (tblpM) {
        tblprops = {};
        tblpM[1].split(",").forEach(kv => {
          const [k, v] = kv.split("=").map(s => s.trim().replace(/^["']|["']$/g, ""));
          if (k) tblprops[k] = v;
        });
      }

      // PARTITIONED BY
      let partitionedBy = null;
      const partM = rest.match(/PARTITIONED\s+BY\s*\(([^)]+)\)/i);
      if (partM) {
        partitionedBy = partM[1].split(",").map(p => { const pp = p.trim().split(/\s+/); return { name: pp[0], type: (pp[1] || "STRING").toUpperCase() }; });
      }

      // CLUSTERED BY
      let clusteredBy = null;
      const clustM = rest.match(/CLUSTERED\s+BY\s*\((\w+)\)\s+INTO\s+(\d+)\s+BUCKETS/i);
      if (clustM) clusteredBy = { col: clustM[1], buckets: parseInt(clustM[2]) };

      // LOCATION
      let location = null;
      const locM = rest.match(/LOCATION\s+['"]([^'"]+)['"]/i);
      if (locM) {
        location = locM[1];
        setHdfsFS(prev => ensureHdfsDir(location, { ...prev }));
      }

      const tableEntry = {
        columns: colDefs,
        rows: [],
        partitions: [],
        external: isExternal,
        rowFormat,
        storedAs,
        tblproperties: tblprops,
        partitionedBy,
        clusteredBy,
        location,
      };

      setHiveDBs(prev => {
        const db = { ...prev[currentHiveDB] };
        db.tables = { ...db.tables, [tName]: tableEntry };
        return { ...prev, [currentHiveDB]: db };
      });
      const whPath = location || `/user/hive/warehouse/${currentHiveDB === "default" ? "" : currentHiveDB + ".db/"}${tName}`;
      if (!location) setHdfsFS(prev => ensureHdfsDir(whPath, { ...prev }));
      setHiveQueries(prev => [...prev, { q: cmd, db: currentHiveDB, ts: Date.now(), state: "FINISHED" }]);

      const extNote = isExternal ? " EXTERNAL" : "";
      const storNote = storedAs !== "TEXTFILE" ? ` [STORED AS ${storedAs}]` : "";
      const partNote = partitionedBy ? ` [PARTITIONED BY (${partitionedBy.map(p => p.name).join(", ")})]` : "";
      const clustNote = clusteredBy ? ` [CLUSTERED BY (${clusteredBy.col}) INTO ${clusteredBy.buckets} BUCKETS]` : "";
      const locNote = location ? `\n  LOCATION: ${location}` : `\n  HDFS: ${whPath}`;
      return [out(`INFO  : Compiling command: create${extNote} table ${tName}\nINFO  : Starting task [Stage-0:DDL] in serial mode\nINFO  : Completed executing command\nNo rows affected\n\n✓ Tabla${extNote} '${tName}' creada en '${currentHiveDB}'${storNote}${partNote}${clustNote}${locNote}`, "success")];
    }

    // ══════════════════════════════
    // ALTER TABLE
    // ══════════════════════════════
    if (lower.startsWith("alter table ")) {
      const altM = trimmed.match(/alter\s+table\s+(\w+)\s+(.+)/i);
      if (!altM) return [out("Error: Syntax error in ALTER TABLE", "error")];
      const tName = altM[1]; const altOp = altM[2].trim();
      const db = hiveDBs[currentHiveDB];
      if (!db?.tables[tName]) return [out(`FAILED: Table ${tName} does not exist`, "error")];
      // ADD COLUMNS
      if (/^add\s+columns?\s*\(/i.test(altOp)) {
        const colM = altOp.match(/add\s+columns?\s*\(([^)]+)\)/i);
        if (!colM) return [out("Error: Syntax error in ADD COLUMNS", "error")];
        const newCols = colM[1].split(",").map(c => { const p = c.trim().split(/\s+/); return { name: p[0], type: (p[1] || "STRING").toUpperCase() }; });
        setHiveDBs(prev => {
          const d = { ...prev[currentHiveDB] };
          d.tables = { ...d.tables, [tName]: { ...d.tables[tName], columns: [...d.tables[tName].columns, ...newCols] } };
          return { ...prev, [currentHiveDB]: d };
        });
        return [out(`No rows affected\n✓ Columnas añadidas a '${tName}': ${newCols.map(c => c.name).join(", ")}`, "success")];
      }
      // ADD PARTITION
      if (/^add\s+partition/i.test(altOp)) {
        const pM = altOp.match(/partition\s*\(([^)]+)\)/i);
        const partVal = pM ? pM[1] : "unknown";
        setHiveDBs(prev => {
          const d = { ...prev[currentHiveDB] };
          const t = d.tables[tName];
          d.tables = { ...d.tables, [tName]: { ...t, partitions: [...(t.partitions || []), partVal] } };
          return { ...prev, [currentHiveDB]: d };
        });
        return [out(`No rows affected\n✓ Partición '${partVal}' añadida a '${tName}'`, "success")];
      }
      return [out(`No rows affected`)];
    }

    // ══════════════════════════════
    // DROP TABLE
    // ══════════════════════════════
    if (lower.startsWith("drop table ")) {
      const parts = trimmed.split(/\s+/);
      const ifExists = lower.includes("if exists");
      const tName = ifExists ? parts[4] : parts[2];
      const db = hiveDBs[currentHiveDB];
      if (!db?.tables[tName]) {
        if (ifExists) return [out("No rows affected")];
        return [out(`FAILED: Table ${tName} does not exist`, "error")];
      }
      setHiveDBs(prev => { const d = { ...prev[currentHiveDB] }; d.tables = { ...d.tables }; delete d.tables[tName]; return { ...prev, [currentHiveDB]: d }; });
      return [out(`No rows affected\n✓ Tabla '${tName}' eliminada`, "success")];
    }

    // ══════════════════════════════
    // TRUNCATE TABLE
    // ══════════════════════════════
    if (lower.startsWith("truncate table ")) {
      const tName = trimmed.split(/\s+/)[2];
      const db = hiveDBs[currentHiveDB];
      if (!db?.tables[tName]) return [out(`FAILED: Table ${tName} does not exist`, "error")];
      setHiveDBs(prev => { const d = { ...prev[currentHiveDB] }; d.tables = { ...d.tables, [tName]: { ...d.tables[tName], rows: [], partitions: [] } }; return { ...prev, [currentHiveDB]: d }; });
      return [out(`No rows affected`)];
    }

    // ══════════════════════════════
    // DESCRIBE / DESC
    // ══════════════════════════════
    if (lower.startsWith("describe formatted ") || lower.startsWith("desc formatted ")) {
      const tName = trimmed.split(/\s+/)[2];
      const db = hiveDBs[currentHiveDB];
      if (!db?.tables[tName]) return [out(`FAILED: Table ${tName} does not exist`, "error")];
      const t = db.tables[tName];
      const cols = t.columns;
      const maxN = Math.max(12, ...cols.map(c => c.name.length));
      const maxT = Math.max(9, ...cols.map(c => c.type.length));
      const sep = "+" + "-".repeat(maxN + 2) + "+" + "-".repeat(maxT + 2) + "+" + "-".repeat(12) + "+";
      let out2 = `${sep}\n| ${"col_name".padEnd(maxN)} | ${"data_type".padEnd(maxT)} | ${"comment".padEnd(10)} |\n${sep}\n`;
      out2 += cols.map(c => `| ${c.name.padEnd(maxN)} | ${c.type.toUpperCase().padEnd(maxT)} | ${"".padEnd(10)} |`).join("\n");
      out2 += `\n${sep}\n\n# Detailed Table Information\n`;
      out2 += `Database:             ${currentHiveDB}\n`;
      out2 += `Table:                ${tName}\n`;
      out2 += `Owner:                hadoop\n`;
      out2 += `Table Type:           ${t.external ? "EXTERNAL_TABLE" : "MANAGED_TABLE"}\n`;
      out2 += `Location:             ${t.location || `/user/hive/warehouse/${currentHiveDB === "default" ? "" : currentHiveDB + ".db/"}${tName}`}\n`;
      out2 += `InputFormat:          ${t.storedAs === "ORC" ? "org.apache.hadoop.hive.ql.io.orc.OrcInputFormat" : "org.apache.hadoop.mapred.TextInputFormat"}\n`;
      out2 += `OutputFormat:         ${t.storedAs === "ORC" ? "org.apache.hadoop.hive.ql.io.orc.OrcOutputFormat" : "org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat"}\n`;
      out2 += `Compressed:           ${(t.tblproperties?.["orc.compress"] === "SNAPPY") ? "Yes (SNAPPY)" : "No"}\n`;
      if (t.partitionedBy) out2 += `Partition Columns:    ${t.partitionedBy.map(p => `${p.name} (${p.type})`).join(", ")}\n`;
      if (t.clusteredBy) out2 += `Bucketing:            Bucketed by (${t.clusteredBy.col}) into ${t.clusteredBy.buckets} buckets\n`;
      if (t.rowFormat) out2 += `SerDe:                ${t.rowFormat.includes("OpenCSV") ? "org.apache.hadoop.hive.serde2.OpenCSVSerde" : "org.apache.hadoop.hive.serde2.lazy.LazySimpleSerDe"}\n`;
      return [out(out2)];
    }
    if (lower.startsWith("describe ") || lower.startsWith("desc ")) {
      const tName = trimmed.split(/\s+/)[1];
      const db = hiveDBs[currentHiveDB];
      if (!db?.tables[tName]) return [out(`FAILED: Table ${tName} does not exist`, "error")];
      const cols = db.tables[tName].columns;
      return [out(renderTable(["col_name", "data_type", "comment"], cols.map(c => [c.name, c.type.toUpperCase(), ""])))];
    }

    // ══════════════════════════════
    // ANALYZE TABLE
    // ══════════════════════════════
    if (lower.startsWith("analyze table ")) {
      const tName = trimmed.split(/\s+/)[2];
      const db = hiveDBs[currentHiveDB];
      if (!db?.tables[tName]) return [out(`FAILED: Table ${tName} does not exist`, "error")];
      const rowCount = db.tables[tName].rows.length;
      return [out(`INFO  : Table ${currentHiveDB}.${tName} stats: [numFiles=1, numRows=${rowCount}, totalSize=${rowCount * 50}, rawDataSize=${rowCount * 48}]\nNo rows affected\n✓ Statistics computed for '${tName}'`, "success")];
    }

    // ══════════════════════════════
    // INSERT
    // ══════════════════════════════
    if (lower.startsWith("insert ")) {
      // INSERT OVERWRITE LOCAL DIRECTORY
      const ildM = trimmed.match(/insert\s+overwrite\s+local\s+directory\s+['"](.*?)['"]\s+(?:row\s+format\s+delimited\s+(?:fields\s+terminated\s+by\s+['"](.*?)['"])\s+)?select\s+(.*?)\s+from\s+(\w+)(.*)/is);
      if (ildM) {
        const dirPath = ildM[1]; const sep2 = ildM[2] || ","; const selPart = ildM[3]; const tName = ildM[4]; const rest2 = ildM[5] || "";
        const db = hiveDBs[currentHiveDB];
        if (!db?.tables[tName]) return [out(`FAILED: Table ${tName} does not exist`, "error")];
        const tbl = db.tables[tName]; const colNames = tbl.columns.map(c => c.name);
        const selectedCols = selPart.trim() === "*" ? colNames : selPart.split(",").map(c => c.trim());
        const rows = tbl.rows;
        const content = rows.map(r => selectedCols.map(c => { const ci = colNames.indexOf(c); return ci >= 0 ? (r[ci] ?? "") : ""; }).join(sep2)).join("\n");
        const resolvedDir = resolvePath(dirPath, cwd);
        setLocalFS(prev => { const nf = ensureLocalDir(resolvedDir, { ...prev }); const parts2 = resolvedDir.split("/"); const fname = "000000_0"; nf[resolvedDir] = { ...nf[resolvedDir], files: { ...(nf[resolvedDir]?.files || {}), [fname]: content } }; return nf; });
        const aid = appCounter; setAppCounter(c => c + 1);
        setYarnApps(prev => [...prev, { id: aid, name: `export_${tName}`, state: "FINISHED" }]);
        return [out(`INFO  : Starting job = job_1700000000000_${String(aid).padStart(4, "0")}\n${mrLog("export", aid)}\nNo rows affected\n\n✓ ${rows.length} filas exportadas a directorio local '${dirPath}'`, "success")];
      }

      // INSERT OVERWRITE TABLE ... SELECT
      const insOvM = trimmed.match(/insert\s+overwrite\s+table\s+(\w+)\s+(?:partition\s*\(([^)]*)\)\s+)?select\s+(.*?)\s+from\s+(\w+)(.*)/is);
      if (insOvM) {
        const destTable = insOvM[1]; const partSpec = insOvM[2]; const selPart = insOvM[3]; const srcTable = insOvM[4]; const rest2 = insOvM[5] || "";
        const db = hiveDBs[currentHiveDB];
        if (!db?.tables[destTable]) return [out(`FAILED: Table ${destTable} does not exist`, "error")];
        if (!db?.tables[srcTable]) return [out(`FAILED: Table ${srcTable} does not exist`, "error")];
        const srcTbl = db.tables[srcTable]; const srcCols = srcTbl.columns.map(c => c.name);
        const dstCols = db.tables[destTable].columns.map(c => c.name);
        const selectedCols = selPart.trim() === "*" ? srcCols : selPart.split(",").map(c => c.trim().split(/\s+as\s+/i)[0].trim());
        // WHERE parsing from rest
        const whereM2 = rest2.match(/where\s+(.+?)(?:\s+group\s+by|\s+order\s+by|\s+limit|$)/is);
        let srcRows = [...srcTbl.rows];
        if (whereM2) srcRows = applyWhere(srcRows, srcCols, whereM2[1].trim());
        const mappedRows = srcRows.map(r => selectedCols.map(c => { const ci = srcCols.indexOf(c); return ci >= 0 ? (r[ci] ?? "") : ""; }));
        const aid = appCounter; setAppCounter(c => c + 1);
        setYarnApps(prev => [...prev, { id: aid, name: `insert_overwrite_${destTable}`, state: "FINISHED" }]);
        if (partSpec) {
          const pv = partSpec.split("=").map(s => s.trim().replace(/['"]/g, "")).join("=");
          setHiveDBs(prev => {
            const d = { ...prev[currentHiveDB] };
            const t = d.tables[destTable];
            d.tables = { ...d.tables, [destTable]: { ...t, rows: mappedRows, partitions: [...new Set([...(t.partitions || []), pv])] } };
            return { ...prev, [currentHiveDB]: d };
          });
        } else {
          setHiveDBs(prev => { const d = { ...prev[currentHiveDB] }; d.tables = { ...d.tables, [destTable]: { ...d.tables[destTable], rows: mappedRows } }; return { ...prev, [currentHiveDB]: d }; });
        }
        setHiveQueries(prev => [...prev, { q: cmd, db: currentHiveDB, ts: Date.now(), state: "FINISHED" }]);
        return [out(`${mrLog("insert_overwrite", aid)}\nNo rows affected\n\n✓ ${mappedRows.length} fila(s) escritas en '${destTable}'${partSpec ? " [partición: " + partSpec + "]" : ""}`, "success")];
      }

      // INSERT INTO TABLE ... PARTITION (...) SELECT
      const insPartSelM = trimmed.match(/insert\s+into\s+(?:table\s+)?(\w+)\s+partition\s*\(([^)]*)\)\s+select\s+(.*?)\s+from\s+(\w+)(.*)/is);
      if (insPartSelM) {
        const destTable = insPartSelM[1]; const partSpec = insPartSelM[2]; const selPart = insPartSelM[3]; const srcTable = insPartSelM[4]; const rest2 = insPartSelM[5] || "";
        const db = hiveDBs[currentHiveDB];
        if (!db?.tables[destTable]) return [out(`FAILED: Table ${destTable} does not exist`, "error")];
        if (!db?.tables[srcTable]) return [out(`FAILED: Table ${srcTable} does not exist`, "error")];
        const srcTbl = db.tables[srcTable]; const srcCols = srcTbl.columns.map(c => c.name);
        const selectedCols = selPart.trim() === "*" ? srcCols : selPart.split(",").map(c => c.trim().split(/\s+as\s+/i)[0].trim());
        const whereM2 = rest2.match(/where\s+(.+?)(?:\s+group\s+by|\s+order\s+by|\s+limit|$)/is);
        let srcRows = [...srcTbl.rows];
        if (whereM2) srcRows = applyWhere(srcRows, srcCols, whereM2[1].trim());
        const mappedRows = srcRows.map(r => selectedCols.map(c => { const ci = srcCols.indexOf(c); return ci >= 0 ? (r[ci] ?? "") : ""; }));
        const aid = appCounter; setAppCounter(c => c + 1);
        setYarnApps(prev => [...prev, { id: aid, name: `insert_${destTable}`, state: "FINISHED" }]);
        const pv = partSpec.split("=").map(s => s.trim().replace(/['"]/g, "")).join("=");
        setHiveDBs(prev => {
          const d = { ...prev[currentHiveDB] };
          const t = d.tables[destTable];
          d.tables = { ...d.tables, [destTable]: { ...t, rows: [...(t.rows || []), ...mappedRows], partitions: [...new Set([...(t.partitions || []), pv])] } };
          return { ...prev, [currentHiveDB]: d };
        });
        setHiveQueries(prev => [...prev, { q: cmd, db: currentHiveDB, ts: Date.now(), state: "FINISHED" }]);
        return [out(`${mrLog("insert_partition", aid)}\nNo rows affected\n\n✓ ${mappedRows.length} fila(s) insertadas en '${destTable}' [partición: ${partSpec}]`, "success")];
      }

      // INSERT INTO ... VALUES
      const insValM = trimmed.match(/insert\s+into\s+(?:table\s+)?(\w+)\s+values\s*(.+)/i);
      if (insValM) {
        const tName = insValM[1]; const db = hiveDBs[currentHiveDB];
        if (!db?.tables[tName]) return [out(`FAILED: Table ${tName} does not exist`, "error")];
        const valuesStr = insValM[2];
        const rowMatches = [...valuesStr.matchAll(/\(([^)]+)\)/g)];
        const newRows = rowMatches.map(rm => rm[1].split(",").map(v => v.trim().replace(/^['"]|['"]$/g, "")));
        const aid = appCounter; setAppCounter(c => c + 1);
        setYarnApps(prev => [...prev, { id: aid, name: `insert_${tName}`, state: "FINISHED" }]);
        setHiveDBs(prev => { const d = { ...prev[currentHiveDB] }; d.tables = { ...d.tables, [tName]: { ...d.tables[tName], rows: [...d.tables[tName].rows, ...newRows] } }; return { ...prev, [currentHiveDB]: d }; });
        setHiveQueries(prev => [...prev, { q: cmd, db: currentHiveDB, ts: Date.now(), state: "FINISHED" }]);
        return [out(`INFO  : Starting job = job_1700000000000_${String(aid).padStart(4, "0")}\nINFO  : map 100%  reduce 100%\nNo rows affected\n\n✓ ${newRows.length} fila(s) insertada(s) en '${tName}'`, "success")];
      }

      // INSERT INTO TABLE ... SELECT (without PARTITION)
      const insSelM = trimmed.match(/insert\s+into\s+(?:table\s+)?(\w+)\s+select\s+(.*?)\s+from\s+(\w+)(.*)/is);
      if (insSelM) {
        const destTable = insSelM[1]; const selPart = insSelM[2]; const srcTable = insSelM[3]; const rest2 = insSelM[4] || "";
        const db = hiveDBs[currentHiveDB];
        if (!db?.tables[destTable]) return [out(`FAILED: Table ${destTable} does not exist`, "error")];
        if (!db?.tables[srcTable]) return [out(`FAILED: Table ${srcTable} does not exist`, "error")];
        const srcTbl = db.tables[srcTable]; const srcCols = srcTbl.columns.map(c => c.name);
        const selectedCols = selPart.trim() === "*" ? srcCols : selPart.split(",").map(c => c.trim().split(/\s+as\s+/i)[0].trim());
        const whereM2 = rest2.match(/where\s+(.+?)(?:\s+group\s+by|\s+order\s+by|\s+limit|$)/is);
        let srcRows = [...srcTbl.rows];
        if (whereM2) srcRows = applyWhere(srcRows, srcCols, whereM2[1].trim());
        const mappedRows = srcRows.map(r => selectedCols.map(c => { const ci = srcCols.indexOf(c); return ci >= 0 ? (r[ci] ?? "") : ""; }));
        const aid = appCounter; setAppCounter(c => c + 1);
        setYarnApps(prev => [...prev, { id: aid, name: `insert_${destTable}`, state: "FINISHED" }]);
        setHiveDBs(prev => { const d = { ...prev[currentHiveDB] }; d.tables = { ...d.tables, [destTable]: { ...d.tables[destTable], rows: [...d.tables[destTable].rows, ...mappedRows] } }; return { ...prev, [currentHiveDB]: d }; });
        setHiveQueries(prev => [...prev, { q: cmd, db: currentHiveDB, ts: Date.now(), state: "FINISHED" }]);
        return [out(`${mrLog("insert_select", aid)}\nNo rows affected\n\n✓ ${mappedRows.length} fila(s) insertadas en '${destTable}'`, "success")];
      }

      return [out("Error: Syntax error in INSERT", "error")];
    }

    // ══════════════════════════════
    // LOAD DATA
    // ══════════════════════════════
    if (lower.startsWith("load data")) {
      const isLocal = /load\s+data\s+local/i.test(trimmed);
      const isOverwrite = /overwrite/i.test(trimmed);
      const ldM = trimmed.match(/load\s+data\s+(?:local\s+)?inpath\s+['"](.*?)['"]\s+(?:overwrite\s+)?into\s+table\s+(\w+)(?:\s+partition\s*\(([^)]*)\))?/i);
      if (!ldM) return [out("Error: Syntax error in LOAD DATA", "error")];
      const filePath = ldM[1]; const tName = ldM[2]; const partSpec = ldM[3];
      const db = hiveDBs[currentHiveDB];
      if (!db?.tables[tName]) return [out(`FAILED: Table ${tName} does not exist`, "error")];
      let nd = null;
      let fileRows = [];
      const tblDelim = db.tables[tName].rowFormat?.match(/TERMINATED BY ['"](.*?)['"]/)?.[1] || ",";
      const splitDelim = (line) => tblDelim === "\\t" || tblDelim === "\t" ? line.split("\t") : line.split(tblDelim);
      if (isLocal) {
        nd = getLocalNode(resolvePath(filePath, cwd));
        if (!nd || nd.type !== "file") return [out(`FAILED: File not found (local): ${filePath}`, "error")];
        fileRows = (nd.content || "").split("\n").filter(l => l.trim()).map(splitDelim);
      } else {
        // HDFS path — check both direct node and parent dir's files map
        const hNode = getHdfsFile(filePath);
        if (!hNode) return [out(`FAILED: File not found in HDFS: ${filePath}\nTip: usa LOAD DATA LOCAL INPATH para archivos locales`, "error")];
        fileRows = (hNode.content || "").split("\n").filter(l => l.trim()).map(splitDelim);
      }
      setHiveDBs(prev => {
        const d = { ...prev[currentHiveDB] };
        const t = d.tables[tName];
        const newRows = isOverwrite ? fileRows : [...(t.rows || []), ...fileRows];
        const newParts = partSpec ? [...new Set([...(t.partitions || []), partSpec.split("=").map(s => s.trim().replace(/['"]/g, "")).join("=")])] : t.partitions;
        d.tables = { ...d.tables, [tName]: { ...t, rows: newRows, partitions: newParts } };
        return { ...prev, [currentHiveDB]: d };
      });
      return [out(`Loading data to table ${tName}${partSpec ? " partition(" + partSpec + ")" : ""}\n${isOverwrite ? "Overwriting" : "Appending"} ${fileRows.length} row(s)\n✓ ${fileRows.length} filas cargadas desde ${isLocal ? "local" : "HDFS"}: ${filePath}`, "success")];
    }

    // ══════════════════════════════
    // SELECT (full)
    // ══════════════════════════════
    if (lower.startsWith("select ")) {
      // ── Step-by-step clause extractor ──
      // Find the first FROM that is not inside parens
      let fromIdx = -1;
      { let d = 0;
        for (let i = 0; i < lower.length - 4; i++) {
          if (lower[i] === "(") d++;
          else if (lower[i] === ")") d--;
          else if (d === 0 && lower.slice(i, i + 5) === " from" && /\s/.test(lower[i + 5] || " ")) { fromIdx = i + 1; break; }
        }
      }
      if (fromIdx < 0) return [out("Error: Syntax error in SELECT — falta FROM", "error")];

      const selPart = trimmed.slice(7, fromIdx).trim(); // everything between SELECT and FROM

      // Everything after FROM keyword
      const afterFrom = trimmed.slice(fromIdx + 4).trim();

      // LIMIT
      const limitM = afterFrom.match(/\blimit\s+(\d+)\s*$/i);
      const limitN = limitM ? parseInt(limitM[1]) : null;

      // ORDER BY (before LIMIT)
      const orderByM = afterFrom.match(/\border\s+by\s+(.+?)(?=\s+limit\s+\d+\s*$|$)/i);
      const orderByClause = orderByM ? orderByM[1].trim() : null;

      // HAVING (before ORDER BY / LIMIT)
      const havingM = afterFrom.match(/\bhaving\s+(.+?)(?=\s+order\s+by\b|\s+limit\s+\d+\s*$|$)/i);
      const havingClause = havingM ? havingM[1].trim() : null;

      // GROUP BY (before HAVING / ORDER BY / LIMIT)
      const groupByM = afterFrom.match(/\bgroup\s+by\s+(.+?)(?=\s+having\b|\s+order\s+by\b|\s+limit\s+\d+\s*$|$)/i);
      const groupByClause = groupByM ? groupByM[1].trim() : null;

      // WHERE (before GROUP BY / HAVING / ORDER BY / LIMIT)
      const whereM = afterFrom.match(/\bwhere\s+(.+?)(?=\s+group\s+by\b|\s+having\b|\s+order\s+by\b|\s+limit\s+\d+\s*$|$)/i);
      const whereClause = whereM ? whereM[1].trim() : null;

      // FROM clause: table [alias] — everything before first JOIN/WHERE/GROUP/HAVING/ORDER/LIMIT
      const CLAUSE_KWS = /\s+(?:(?:inner|left|right|full|cross)\s+(?:outer\s+)?)?join\b|\s+where\b|\s+group\s+by\b|\s+having\b|\s+order\s+by\b|\s+limit\b/i;
      const fromClauseM = afterFrom.match(/^(.+?)(?=\s+(?:(?:inner|left|right|full|cross)\s+(?:outer\s+)?)?join\b|\s+where\b|\s+group\s+by\b|\s+having\b|\s+order\s+by\b|\s+limit\b|$)/i);
      const fromClause = fromClauseM ? fromClauseM[1].trim() : afterFrom.split(CLAUSE_KWS)[0].trim();

      // JOIN detection
      const joinM2 = afterFrom.match(/\b(?:inner\s+|left\s+(?:outer\s+)?|right\s+(?:outer\s+)?|full\s+(?:outer\s+)?|cross\s+)?join\s+(\w+)(?:\s+(\w+))?\s+on\s+(.+?)(?=\s+(?:where|group\s+by|having|order\s+by|limit)\b|$)/i);

      // Parse FROM clause for table name + alias
      const RESERVED = new Set(["where","join","group","order","limit","having","inner","left","right","full","cross","on","tablesample"]);
      const fromParts = fromClause.split(/\s+/);
      const tName1 = fromParts[0];
      const alias1 = (fromParts[1] && !RESERVED.has(fromParts[1].toLowerCase())) ? fromParts[1] : tName1;
      const tName2 = joinM2 ? joinM2[1] : null;
      const alias2 = (joinM2 && joinM2[2] && !RESERVED.has(joinM2[2].toLowerCase())) ? joinM2[2] : tName2;
      const joinOnClause = joinM2 ? joinM2[3].trim() : null;

      const db = hiveDBs[currentHiveDB];
      if (!db?.tables[tName1]) return [out(`FAILED: Table ${tName1} does not exist`, "error")];
      const tbl1 = db.tables[tName1];
      const cols1 = tbl1.columns.map(c => c.name);

      let workRows = [];
      let workCols = [];

      if (tName2) {
        // JOIN
        if (!db?.tables[tName2]) return [out(`FAILED: Table ${tName2} does not exist`, "error")];
        const tbl2 = db.tables[tName2];
        const cols2 = tbl2.columns.map(c => c.name);
        workCols = [...cols1.map(c => `${alias1}.${c}`), ...cols2.map(c => `${alias2}.${c}`)];
        for (const r1 of tbl1.rows) {
          for (const r2 of tbl2.rows) {
            workRows.push([...r1, ...r2]);
          }
        }
        // Apply JOIN ON filter
        if (joinOnClause) {
          const onM = joinOnClause.match(/(\w+)\.(\w+)\s*=\s*(\w+)\.(\w+)/i);
          if (onM) {
            const left = `${onM[1]}.${onM[2]}`; const right = `${onM[3]}.${onM[4]}`;
            const li = workCols.indexOf(left); const ri = workCols.indexOf(right);
            if (li >= 0 && ri >= 0) workRows = workRows.filter(r => String(r[li]) === String(r[ri]));
          }
        }
      } else {
        workCols = cols1.map(c => c);
        workRows = [...tbl1.rows];
      }

      // WHERE
      if (whereClause) workRows = applyWhere(workRows, workCols, whereClause.trim());

      // TABLESAMPLE(BUCKET n OUT OF m ON col)
      const tsM = selPart.match(/TABLESAMPLE\s*\(\s*BUCKET\s+(\d+)\s+OUT\s+OF\s+(\d+)\s+ON\s+(\w+)\s*\)/i) ||
                  trimmed.match(/TABLESAMPLE\s*\(\s*BUCKET\s+(\d+)\s+OUT\s+OF\s+(\d+)\s+ON\s+(\w+)\s*\)/i);
      if (tsM) {
        const bn = parseInt(tsM[1]); const bTotal = parseInt(tsM[2]);
        workRows = workRows.filter((_, i) => (i % bTotal) === (bn - 1));
      }

      // Resolve column expressions (including alias.col form)
      const resolveColIdx = (expr) => {
        const cleanExpr = expr.trim().toLowerCase();
        // alias.col form
        const dotM = cleanExpr.match(/^(\w+)\.(\w+)$/);
        if (dotM) {
          const full = `${dotM[1]}.${dotM[2]}`;
          const idx = workCols.findIndex(c => c.toLowerCase() === full);
          if (idx >= 0) return idx;
          // try just colname
          return workCols.findIndex(c => c.toLowerCase().endsWith("." + dotM[2]) || c.toLowerCase() === dotM[2]);
        }
        return workCols.findIndex(c => c.toLowerCase() === cleanExpr || c.toLowerCase().endsWith("." + cleanExpr));
      };

      // Parse selected columns & detect aggregates
      const parseSelCols = (part) => {
        if (part.trim() === "*") return workCols.map((c, i) => ({ expr: c, label: c, idx: i, agg: null }));
        // split by comma respecting parens
        const parts2 = []; let depth2 = 0; let cur = "";
        for (const ch of part) { if (ch === "(" ) depth2++; else if (ch === ")") depth2--; if (ch === "," && depth2 === 0) { parts2.push(cur.trim()); cur = ""; } else cur += ch; }
        if (cur.trim()) parts2.push(cur.trim());
        return parts2.map(p => {
          const asM = p.match(/^(.*?)\s+AS\s+(\w+)$/i);
          const expr = asM ? asM[1].trim() : p.trim();
          const label = asM ? asM[2] : (expr.includes("(") ? expr : p.trim());
          const lExpr = expr.toLowerCase();
          if (lExpr.startsWith("count(distinct ")) { const inner = expr.match(/count\(distinct\s+(\w+)\)/i); return { expr, label, idx: -1, agg: "countdistinct", col: inner?.[1] }; }
          if (lExpr.startsWith("count(")) return { expr, label, idx: -1, agg: "count" };
          if (lExpr.startsWith("sum(")) { const inner = expr.match(/sum\((\w+)\)/i); return { expr, label, idx: -1, agg: "sum", col: inner?.[1] }; }
          if (lExpr.startsWith("avg(")) { const inner = expr.match(/avg\((\w+)\)/i); return { expr, label, idx: -1, agg: "avg", col: inner?.[1] }; }
          if (lExpr.startsWith("max(")) { const inner = expr.match(/max\((\w+)\)/i); return { expr, label, idx: -1, agg: "max", col: inner?.[1] }; }
          if (lExpr.startsWith("min(")) { const inner = expr.match(/min\((\w+)\)/i); return { expr, label, idx: -1, agg: "min", col: inner?.[1] }; }
          // CASE WHEN
          if (lExpr.startsWith("case")) return { expr, label, idx: -1, agg: "case" };
          return { expr, label, idx: resolveColIdx(expr), agg: null };
        });
      };

      const selDefs = parseSelCols(selPart.replace(/TABLESAMPLE\s*\([^)]+\)/i, "").trim());

      // GROUP BY
      let groupedRows = workRows;
      let isGrouped = false;
      if (groupByClause) {
        isGrouped = true;
        const gbCols = groupByClause.split(",").map(c => c.trim());
        const groups = {};
        for (const row of workRows) {
          const key = gbCols.map(gc => { const gi = resolveColIdx(gc); return gi >= 0 ? row[gi] : ""; }).join("|");
          if (!groups[key]) groups[key] = [];
          groups[key].push(row);
        }
        // Build one result row per group
        groupedRows = Object.values(groups).map(grpRows => {
          return selDefs.map(sd => {
            if (!sd.agg) { const gi = resolveColIdx(sd.expr); return gi >= 0 ? grpRows[0][gi] : ""; }
            if (sd.agg === "count") return String(grpRows.length);
            if (sd.agg === "countdistinct") { const ci = resolveColIdx(sd.col); const uniq = new Set(grpRows.map(r => r[ci])); return String(uniq.size); }
            const ci = resolveColIdx(sd.col);
            const nums = grpRows.map(r => parseFloat(r[ci]) || 0);
            if (sd.agg === "sum") return String(nums.reduce((a, b) => a + b, 0));
            if (sd.agg === "avg") return String((nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2));
            if (sd.agg === "max") return String(Math.max(...nums));
            if (sd.agg === "min") return String(Math.min(...nums));
            return "";
          });
        });
        // HAVING
        if (havingClause) {
          groupedRows = groupedRows.filter(row => {
            const hv = applyWhere([row], selDefs.map(sd => sd.label), havingClause.trim());
            return hv.length > 0;
          });
        }
      } else if (selDefs.some(sd => sd.agg)) {
        // Global aggregate without GROUP BY
        const aggRow = selDefs.map(sd => {
          if (!sd.agg) { const gi = sd.idx; return gi >= 0 ? (workRows[0]?.[gi] ?? "NULL") : "NULL"; }
          if (sd.agg === "count") return String(workRows.length);
          if (sd.agg === "countdistinct") { const ci = resolveColIdx(sd.col); const uniq = new Set(workRows.map(r => r[ci])); return String(uniq.size); }
          const ci = resolveColIdx(sd.col);
          const nums = workRows.map(r => parseFloat(r[ci]) || 0);
          if (sd.agg === "sum") return String(nums.reduce((a, b) => a + b, 0));
          if (sd.agg === "avg") return String((nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2));
          if (sd.agg === "max") return String(Math.max(...nums));
          if (sd.agg === "min") return String(Math.min(...nums));
          return "";
        });
        groupedRows = [aggRow];
        isGrouped = true;
      }

      // ORDER BY (applies to both grouped and non-grouped results)
      if (orderByClause) {
        // Support multiple sort keys: col1 DESC, col2 ASC
        const obParts = orderByClause.split(",").map(s => s.trim());
        const sortKeys = obParts.map(s => { const m = s.match(/^(\w+(?:\.\w+)?)\s*(asc|desc)?$/i); return m ? { col: m[1], desc: (m[2] || "asc").toLowerCase() === "desc" } : null; }).filter(Boolean);
        if (sortKeys.length > 0) {
          groupedRows = [...groupedRows].sort((a, b) => {
            for (const sk of sortKeys) {
              const obIdx = isGrouped ? selDefs.findIndex(sd => sd.label.toLowerCase() === sk.col.toLowerCase()) : resolveColIdx(sk.col);
              const av = String(a[obIdx] ?? ""); const bv = String(b[obIdx] ?? "");
              const an = parseFloat(av); const bn2 = parseFloat(bv);
              const numOk = !isNaN(an) && !isNaN(bn2);
              let cmp = numOk ? (an - bn2) : av.localeCompare(bv);
              if (sk.desc) cmp = -cmp;
              if (cmp !== 0) return cmp;
            }
            return 0;
          });
        }
      }

      // LIMIT
      let finalRows = limitN ? groupedRows.slice(0, limitN) : groupedRows;

      // ── Evaluate a cell value for non-grouped output ──
      const evalCell = (r, sd) => {
        if (sd.agg === "case") {
          // CASE WHEN col op val THEN x ELSE y END
          const caseM = sd.expr.match(/CASE\s+WHEN\s+(\w+)\s*(=|!=|>|<)\s*['"]?(.*?)['"]?\s+THEN\s+['"]?(.*?)['"]?\s+ELSE\s+['"]?(.*?)['"]?\s+END/i);
          if (caseM) {
            const ci = resolveColIdx(caseM[1]); const op = caseM[2]; const val = caseM[3]; const thenV = caseM[4]; const elseV = caseM[5];
            return evalCond(r, workCols, `${caseM[1]}${op}${val}`) ? thenV : elseV;
          }
          return "NULL";
        }
        if (sd.idx >= 0) return r[sd.idx] ?? "NULL";
        return "NULL";
      };

      // Build output columns and rows
      const outCols = selDefs.map(sd => sd.label);
      const outRows = isGrouped
        ? finalRows
        : finalRows.map(r => selDefs.map(sd => evalCell(r, sd)));

      setHiveQueries(prev => [...prev, { q: cmd, db: currentHiveDB, ts: Date.now(), state: "FINISHED" }]);
      return [out(renderTable(outCols, outRows.map(r => Array.isArray(r) ? r : [r])))];
    }

    // ══════════════════════════════
    // UNKNOWN
    // ══════════════════════════════
    return [out(`Error: Comando no reconocido: '${trimmed.substring(0, 60)}'\n\nEscribe 'help' para ver comandos disponibles.\n  - Comandos HiveQL terminan en ;\n  - Meta-comandos Beeline empiezan con !`, "error")];
  }, [beelineConnected, hiveDBs, currentHiveDB, out, appCounter, cwd, getLocalNode, resolvePath, ensureHdfsDir, hdfsFS, ensureLocalDir, processCommand, setAppCounter, setYarnApps, setHiveDBs, setHiveQueries, setCurrentHiveDB, setBeelineMode, setBeelineConnected, setLocalFS, setHdfsFS]);

  // ── Submit ──
  const handleSubmit = () => {
    const cmd = input.trim(); if (!cmd) return;
    setHistory(prev => [cmd, ...prev]); setHistIdx(-1); setInput("");

    if (beelineMode) {
      const prompt = { type: "prompt", text: `${beelineConnected ? "0: jdbc:hive2://hadoop-virtualbox:10000" : "beeline"}> ${cmd}` };
      const results = processBeelineCommand(cmd);
      if (results.some(r => r.type === "clear")) setLines([]); else setLines(prev => [...prev, prompt, ...results]);
      return;
    }

    const host = sshNode || "hadoop-VirtualBox"; const cwdD = (sshNode ? sshCwd : cwd); const d = cwdD === "/home/hadoop" ? "~" : cwdD;
    const prompt = { type: "prompt", text: `hadoop@${host}:${d}$ ${cmd}` };
    const results = sshNode ? processSlaveCommand(cmd) : processCommand(cmd);
    if (results.some(r => r.type === "clear")) setLines([]); else setLines(prev => [...prev, prompt, ...results]);
  };

  // ── Tab autocomplete ──
  const handleTab = useCallback(() => {
    const toks = input.split(" "); const last = toks[toks.length - 1] || "";
    if (toks.length === 1) { const cmds = sshNode ? ["exit", "logout", "jps", "hostname", "whoami", "pwd", "cd", "ls", "cat", "ps", "top", "free", "df", "uname", "help", "clear"] : ["hdfs", "hadoop", "yarn", "mapred", "jps", "ls", "cd", "pwd", "mkdir", "cat", "cp", "mv", "rm", "chmod", "touch", "ps", "top", "hostname", "uname", "free", "df", "lscpu", "echo", "clear", "help", "whoami", "head", "tail", "grep", "javac", "jar", "ssh", "scp", "md5sum", "wc", "bash", "sh", "reset", "exit", "ifconfig", "hiveserver2", "beeline"]; const matches = cmds.filter(c => c.startsWith(last)); if (matches.length === 1) { toks[toks.length - 1] = matches[0] + " "; setInput(toks.join(" ")); } else if (matches.length > 1) { let pf = last; for (let i = last.length; ; i++) { const ch = matches.map(m => m[i]).filter(Boolean); if (!ch.length || new Set(ch).size > 1) break; pf += ch[0]; } toks[toks.length - 1] = pf; setInput(toks.join(" ")); } return; }
    if (sshNode) return; let dir, prefix; if (last.includes("/")) { const li = last.lastIndexOf("/"); dir = last.substring(0, li) || "/"; prefix = last.substring(li + 1); } else { dir = "."; prefix = last; } const rd = resolvePath(dir, cwd); const dn = localFS?.[rd]; if (!dn) return; const items = getDirItems(dn); const matches = items.filter(i => i.startsWith(prefix)); if (matches.length === 0) return; let comp; if (matches.length === 1) { comp = matches[0]; const cp = rd === "/" ? `/${comp}` : `${rd}/${comp}`; if (localFS[cp]) comp += "/"; } else { let common = prefix; for (let i = prefix.length; ; i++) { const ch = matches.map(m => m[i]).filter(Boolean); if (!ch.length || new Set(ch).size > 1) break; common += ch[0]; } comp = common; } toks[toks.length - 1] = last.includes("/") ? last.substring(0, last.lastIndexOf("/") + 1) + comp : comp; setInput(toks.join(" "));
  }, [input, cwd, localFS, resolvePath, getDirItems, sshNode]);

  const handleKeyDown = (e) => { if (e.key === "Enter") handleSubmit(); else if (e.key === "ArrowUp") { e.preventDefault(); if (history.length > 0) { const ni = Math.min(histIdx + 1, history.length - 1); setHistIdx(ni); setInput(history[ni]); } } else if (e.key === "ArrowDown") { e.preventDefault(); if (histIdx > 0) { setHistIdx(histIdx - 1); setInput(history[histIdx - 1]); } else { setHistIdx(-1); setInput(""); } } else if (e.key === "Tab") { e.preventDefault(); handleTab(); } };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target.result;
      const name = file.name;
      const destDir = sshNode ? null : cwd;
      if (!destDir) { setLines(prev => [...prev, out(`upload: no disponible en SSH`, "error")]); return; }
      setLocalFS(prev => {
        const nf = { ...prev };
        const dir = nf[destDir] || { type: "dir", children: [], files: {} };
        const newChildren = dir.children.includes(name) ? dir.children : [...dir.children, name];
        nf[destDir] = { ...dir, children: newChildren, files: { ...(dir.files || {}), [name]: content } };
        return nf;
      });
      setLines(prev => [...prev, out(`Archivo cargado: ${destDir}/${name} (${file.size} bytes)`, "success")]);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const svcDot = (on) => <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: on ? "#4ade80" : "#ef4444", marginRight: 4, boxShadow: on ? "0 0 6px #4ade80" : "0 0 4px #ef4444" }} />;

  if (!localFS || !hdfsFS) return <div style={{ background: "#0d0d0d", color: "#ccc", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace" }}>Cargando...</div>;

  const host = sshNode || "hadoop-VirtualBox";
  const cwdD = (sshNode ? sshCwd : cwd) === "/home/hadoop" ? "~" : (sshNode ? sshCwd : cwd);

  // ═══════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════
  return (
    <div style={{ height: "100vh", width: "100%", display: "flex", flexDirection: "column", background: "#0a0a0a", fontFamily: "'JetBrains Mono', 'Fira Code', monospace", color: "#e0e0e0", overflow: "hidden" }}>
      {/* Title Bar */}
      <div style={{ background: sshNode ? "linear-gradient(180deg, #2a3a2a 0%, #1b2b1b 100%)" : "linear-gradient(180deg, #3a3a3a 0%, #2b2b2b 100%)", borderBottom: "1px solid #1a1a1a", padding: "6px 16px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
        </div>
        <span style={{ fontSize: 12, color: sshNode ? "#8ec07c" : "#999", flex: 1, textAlign: "center" }}>hadoop@{host}: {cwdD}{sshNode && <span style={{ marginLeft: 8, fontSize: 10, background: "#2d4a2d", padding: "1px 6px", borderRadius: 3, color: "#8f8" }}>SSH</span>}</span>
        <span style={{ fontSize: 10, color: "#666" }}>Ubuntu 22.04</span>
      </div>

      {/* Services */}
      <div style={{ background: "#111", borderBottom: "1px solid #222", padding: "5px 12px", display: "flex", gap: 14, fontSize: 11, flexShrink: 0, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ color: "#666", fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>Servicios:</span>
        {[["namenode", "NN"], ["datanode", "DN"], ["secondarynamenode", "2NN"]].map(([k, l]) => <span key={k} style={{ display: "flex", alignItems: "center" }}>{svcDot(services[k])}<span style={{ color: services[k] ? "#8f8" : "#666" }}>{l}</span></span>)}
        <span style={{ color: "#333" }}>│</span>
        {[["resourcemanager", "RM"], ["nodemanager", "NM"], ["historyserver", "HS"]].map(([k, l]) => <span key={k} style={{ display: "flex", alignItems: "center" }}>{svcDot(services[k])}<span style={{ color: services[k] ? "#8f8" : "#666" }}>{l}</span></span>)}
        <span style={{ color: "#333" }}>│</span>
        <span style={{ color: safeMode ? "#fbbf24" : "#555", fontSize: 10 }}>{safeMode ? "⚠ SAFE" : "Safe: OFF"}</span>
        {hiveServices.hiveserver2 && <><span style={{ color: "#333" }}>│</span><span style={{ display: "flex", alignItems: "center" }}>{svcDot(true)}<span style={{ color: "#f5a623" }}>Hive</span></span></>}
        {beelineMode && <span style={{ fontSize: 10, background: "#3a2a10", padding: "1px 6px", borderRadius: 3, color: "#f5a623", marginLeft: 4 }}>Beeline{beelineConnected ? " ✓" : ""}</span>}
        {sshNode && <><span style={{ color: "#333" }}>│</span><span style={{ color: "#8ec07c", fontSize: 10 }}>SSH→{sshNode}</span></>}
      </div>

      {/* ══ TABS ══ */}
      <div style={{ background: "#0f0f0f", borderBottom: "1px solid #1a1a1a", padding: "0 4px", display: "flex", fontSize: 11, flexShrink: 0, alignItems: "center" }}>
        {[
          ["terminal", "💻 Terminal", "#e2854b"],
          ["hdfs", "🐘 HDFS :9870", "#e47a2c"],
          ["yarn", "🧶 YARN :8088", "#0b7285"],
          ["history", "📋 History :19888", "#c85000"],
          ["hive", "🐝 Hive :10002", "#f5a623"],
          ["guide", "📖 Guía", "#e2854b"],
        ].map(([id, label, accent]) => {
          const isWeb = id === "hdfs" || id === "yarn" || id === "history" || id === "hive";
          return <button key={id} onClick={() => setActiveTab(id)} style={{ padding: "7px 12px", background: activeTab === id ? (isWeb ? "#f8f8f8" : "#1a1a1a") : "transparent", color: activeTab === id ? (isWeb ? "#333" : "#e0e0e0") : "#666", border: "none", borderBottom: activeTab === id ? `2px solid ${accent}` : "2px solid transparent", cursor: "pointer", fontFamily: "inherit", fontSize: 11 }}>{label}</button>;
        })}
        {/* Terminal sub-tabs (only when terminal is active) */}
        {activeTab === "terminal" && <>
          <span style={{ color: "#333", margin: "0 4px" }}>│</span>
          {termTabs.map(tab => (
            <div key={tab.id} style={{ display: "flex", alignItems: "center", background: activeTermTab === tab.id ? "#1a1a1a" : "transparent", borderBottom: activeTermTab === tab.id ? "2px solid #8ec07c" : "2px solid transparent", borderRadius: "3px 3px 0 0" }}>
              <button onClick={() => setActiveTermTab(tab.id)} style={{ padding: "5px 8px", color: activeTermTab === tab.id ? "#8ec07c" : "#555", border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit", fontSize: 10 }}>{tab.name}</button>
              {termTabs.length > 1 && <button onClick={() => { const remaining = termTabs.filter(t => t.id !== tab.id); setTermTabs(remaining); const nextId = activeTermTab === tab.id ? (remaining[0]?.id || 1) : activeTermTab; if (activeTermTab === tab.id) setActiveTermTab(nextId); setTermTabState(prev => { const n = { ...prev }; delete n[tab.id]; return n; }); }} style={{ padding: "2px 4px", color: "#555", border: "none", background: "transparent", cursor: "pointer", fontSize: 9, lineHeight: 1 }}>✕</button>}
            </div>
          ))}
          <button onClick={() => { const id = nextTermTabId.current++; setTermTabs(prev => [...prev, { id, name: `Terminal ${id}` }]); setActiveTermTab(id); setTermTabState(prev => ({ ...prev, [id]: { lines: welcomeLines, cwd: "/home/hadoop", history: [], histIdx: -1, input: "", sshNode: null, sshCwd: "/home/hadoop", beelineMode: false, beelineConnected: false } })); }} style={{ padding: "3px 8px", color: "#555", border: "none", background: "transparent", cursor: "pointer", fontSize: 14, lineHeight: 1 }} title="Nueva pestaña de terminal">+</button>
        </>}
      </div>

      {/* ══ CONTENT ══ */}
      {activeTab === "hdfs" && <HdfsWebUI services={services} hdfsFS={hdfsFS} safeMode={safeMode} hdfsSnapEnabled={hdfsSnapEnabled} fsimageCounter={fsimageCounter} />}
      {activeTab === "yarn" && <YarnWebUI services={services} yarnApps={yarnApps} />}
      {activeTab === "history" && <JobHistoryUI services={services} yarnApps={yarnApps} />}
      {activeTab === "hive" && <HiveWebUI hiveServices={hiveServices} hiveDBs={hiveDBs} currentHiveDB={currentHiveDB} hiveQueries={hiveQueries} />}

      {activeTab === "guide" && (
        <div style={{ flex: 1, overflow: "auto", padding: "12px 16px", fontSize: 12, lineHeight: 1.7, color: "#bbb" }}>
          <h3 style={{ color: "#e2854b", margin: "0 0 12px", fontSize: 14, fontWeight: 600 }}>Guía Rápida — Parcial Big Data</h3>
          <div style={{ display: "grid", gap: 10 }}>
            {[
              { title: "1. Arrancar el clúster", cmds: ["cd /opt/hadoop/sbin", "./start-dfs.sh", "./start-yarn.sh", "jps"] },
              { title: "2. Verificar nodos (SSH)", cmds: ["ssh nodo2", "jps", "hostname", "exit"] },
              { title: "3. Subir archivo a HDFS", cmds: ["hdfs dfs -mkdir /log-nodemanager", "cp /opt/hadoop/logs/hadoop-hadoop-nodemanager-hadoop-VirtualBox.log /tmp/", "hdfs dfs -put /tmp/hadoop-hadoop-nodemanager-hadoop-VirtualBox.log /log-nodemanager/"] },
              { title: "4. Grep MapReduce", cmds: ["cd /opt/hadoop/share/hadoop/mapreduce", "hadoop jar hadoop-mapreduce-examples-3.4.1.jar grep /log-nodemanager /resultado_lognm 'transitioned from'", "hdfs dfs -cat /resultado_lognm/part-r-00000 | head"] },
              { title: "5. Snapshot HDFS", cmds: ["hdfs dfsadmin -allowSnapshot /log-nodemanager", "hdfs dfs -createSnapshot /log-nodemanager snap_antes", "hdfs dfs -ls /log-nodemanager/.snapshot"] },
              { title: "6. Checkpoint", cmds: ["hdfs dfsadmin -safemode enter", "hdfs dfsadmin -saveNamespace", "hdfs dfsadmin -safemode leave", "ls -lh /datos/namenode/current"] },
              { title: "7. Benchmark", cmds: ["hadoop jar hadoop-mapreduce-client-jobclient-3.4.1-tests.jar TestDFSIO -write -nrFiles 10 -fileSize 100"] },
              { title: "8. Hive — Iniciar y Beeline", cmds: ["cd /opt/hadoop/hive/bbdd", "hiveserver2", "(En otra pestaña terminal →)", "beeline", "!connect jdbc:hive2://hadoop-virtualbox:10000", "show databases;", "create database ejemplo;", "use ejemplo;"] },
              { title: "9. Hive — Crear tabla e insertar", cmds: ["create table if not exists t1 (nombre string);", "insert into t1 values ('mi nombre');", "select * from t1;", "!tables", "describe t1;", "!exit"] },
              { title: "10. Web UIs", cmds: ["(Pestaña HDFS :9870 para ver NameNode)", "(Pestaña YARN :8088 para ResourceManager)", "(Pestaña Hive :10002 para HiveServer2)"] },
            ].map((s, i) => (
              <div key={i} style={{ background: "#151515", border: "1px solid #222", borderRadius: 6, padding: "8px 12px" }}>
                <div style={{ color: "#e2854b", fontWeight: 600, marginBottom: 4 }}>{s.title}</div>
                {s.cmds.map((c, j) => (
                  <div key={j} onClick={() => { if (!c.startsWith("(")) { setInput(c); setActiveTab("terminal"); setTimeout(() => inputRef.current?.focus(), 50); } }} style={{ padding: "2px 8px", margin: "1px 0", background: "#0d0d0d", borderRadius: 3, cursor: c.startsWith("(") ? "default" : "pointer", color: c.startsWith("(") ? "#888" : "#8ec07c", fontSize: 11.5, fontFamily: "inherit" }} onMouseEnter={e => { if (!c.startsWith("(")) e.target.style.background = "#1a2a1a"; }} onMouseLeave={e => e.target.style.background = "#0d0d0d"}>$ {c}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "terminal" && (
        <div ref={termRef} onClick={focusInput} style={{ flex: 1, overflow: "auto", padding: "8px 14px", cursor: "text", width: "100%", boxSizing: "border-box" }}>
          {lines.map((line, i) => {
            let color = "#e0e0e0";
            if (line.type === "prompt") color = "#8ec07c"; if (line.type === "error") color = "#fb4934"; if (line.type === "warn") color = "#fabd2f"; if (line.type === "success") color = "#b8bb26"; if (line.type === "system") color = "#83a598"; if (line.type === "help") color = "#d3869b";
            return <pre key={i} style={{ margin: 0, padding: line.type === "prompt" ? "6px 0 0" : "0 0 1px", fontFamily: "inherit", fontSize: 12.5, lineHeight: 1.5, color, whiteSpace: "pre-wrap", wordBreak: "break-all", textAlign: "left" }}>{line.text}</pre>;
          })}
          <div style={{ display: "flex", alignItems: "center", marginTop: 4 }}>
            {beelineMode ? <>
              <span style={{ color: "#f5a623", fontSize: 12.5, flexShrink: 0, fontWeight: 600 }}>{beelineConnected ? "0: jdbc:hive2://hadoop-virtualbox:10000" : "beeline"}</span>
              <span style={{ color: "#f5a623", margin: "0 4px 0 0", fontSize: 12.5 }}>&gt;</span>
            </> : <>
              <span style={{ color: sshNode ? "#fabd2f" : "#b8bb26", fontSize: 12.5, flexShrink: 0, fontWeight: 600 }}>hadoop@{host}</span>
              <span style={{ color: "#666", margin: "0 2px", fontSize: 12.5 }}>:</span>
              <span style={{ color: "#83a598", fontSize: 12.5, flexShrink: 0 }}>{cwdD}</span>
              <span style={{ color: "#e0e0e0", margin: "0 4px 0 2px", fontSize: 12.5 }}>$</span>
            </>}
            <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} autoFocus spellCheck={false} style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#e0e0e0", fontFamily: "inherit", fontSize: 12.5, caretColor: "#e2854b", lineHeight: 1.5, padding: 0, margin: 0 }} />
            <input ref={fileInputRef} type="file" onChange={handleFileUpload} style={{ display: "none" }} />
            <button onClick={() => fileInputRef.current?.click()} title={`Cargar archivo en ${cwdD}`} style={{ flexShrink: 0, marginLeft: 6, background: "transparent", border: "1px solid #444", borderRadius: 3, color: "#888", cursor: "pointer", fontSize: 11, padding: "1px 6px", lineHeight: 1.4 }}>↑ upload</button>
          </div>
        </div>
      )}

      <div style={{ background: "#111", borderTop: "1px solid #1a1a1a", padding: "4px 12px", fontSize: 10, color: "#444", display: "flex", justifyContent: "space-between", flexShrink: 0 }}>
        <span>Big Data 2026-I — hadoop-VirtualBox + nodo2 + nodo3</span>
        <span>Progreso guardado ✓ · reset: reiniciar</span>
      </div>
    </div>
  );
}