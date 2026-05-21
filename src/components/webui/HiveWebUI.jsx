import { useState } from "react";
import { WS } from "./webUiStyles";

export function HiveWebUI({ hiveServices, hiveDBs, currentHiveDB, hiveQueries }) {
  const [subTab, setSubTab] = useState("home");
  const isUp = hiveServices.hiveserver2;

  if (!isUp) return <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", fontFamily: "Verdana, sans-serif" }}><div style={{ textAlign: "center", color: "#c00" }}><div style={{ fontSize: 48, marginBottom: 12 }}>⚠</div><div style={{ fontSize: 16, fontWeight: 600 }}>HiveServer2 no está activo</div><div style={{ fontSize: 13, color: "#888", marginTop: 6 }}>Inicia Hive:<br/><code>cd /opt/hadoop/hive/bbdd</code><br/><code>hiveserver2</code><br/>Luego: <code>beeline</code></div></div></div>;

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
