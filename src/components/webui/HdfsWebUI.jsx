import { useState } from "react";
import { WS } from "./webUiStyles";

export function HdfsWebUI({ services, hdfsFS, safeMode, hdfsSnapEnabled, fsimageCounter }) {
  const [subTab, setSubTab] = useState("overview");
  const [browsePath, setBrowsePath] = useState("/");
  const isUp = services.namenode;
  const files = hdfsFS ? Object.keys(hdfsFS).filter(k => hdfsFS[k].type === "file") : [];
  const dirs = hdfsFS ? Object.keys(hdfsFS).filter(k => hdfsFS[k].type === "dir") : [];
  const totalSize = files.reduce((s, k) => s + (hdfsFS[k].size || 0), 0);
  const totalCap = 107374182400;
  const usedBytes = totalSize * 2;
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
      <div style={WS.hdr}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#e47a2c" }}>🐘 Hadoop</span>
          <span style={{ fontSize: 13, color: "#666" }}>NameNode — hadoop-VirtualBox:9870</span>
        </div>
        <span style={{ fontSize: 11, color: "#999" }}>Version 3.4.1, r2024-01</span>
      </div>
      <div style={WS.nav}>
        {[["overview", "Overview"], ["datanodes", "Datanodes"], ["browse", "Browse Directory"], ["journal", "Startup / Journal"]].map(([id, l]) => (
          <button key={id} onClick={() => setSubTab(id)} style={WS.navBtn(subTab === id)}>{l}</button>
        ))}
      </div>
      <div style={{ padding: "12px 18px" }}>
        {subTab === "overview" && <>
          <div style={WS.section}>
            <div style={WS.sTitle}>Summary</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 20px", fontSize: 12.5, lineHeight: 1.9 }}>
              <div><b>Security:</b> OFF</div><div><b>Safe Mode:</b> <span style={{ color: safeMode ? "#c00" : "#090" }}>{safeMode ? "ON" : "OFF"}</span></div>
              <div><b>Started:</b> Tue Mar 03 08:00:00 COT 2026</div><div><b>Version:</b> 3.4.1</div>
              <div><b>Cluster ID:</b> CID-a1b2c3d4-e5f6-7890</div><div><b>Block Pool ID:</b> BP-1234567890-127.0.0.1-1700000000000</div>
            </div>
          </div>
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
          <div style={WS.section}>
            <div style={WS.sTitle}>NameNode Storage</div>
            <table style={WS.tbl}><thead><tr><th style={WS.th}>Storage Directory</th><th style={WS.th}>Type</th><th style={WS.th}>State</th></tr></thead>
              <tbody>
                <tr><td style={WS.td}>/datos/namenode</td><td style={WS.td}>IMAGE_AND_EDITS</td><td style={{ ...WS.td, color: "#090" }}>Active</td></tr>
              </tbody>
            </table>
          </div>
        </>}

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
          <div style={WS.section}>
            <div style={WS.sTitle}>Volume Failures</div>
            <div style={{ fontSize: 12, color: "#090", padding: 8, background: "#f0fff0", border: "1px solid #cfc", borderRadius: 4 }}>No volume failures detected across any datanodes.</div>
          </div>
        </>}

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
