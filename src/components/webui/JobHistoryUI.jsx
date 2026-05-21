import { useState } from "react";
import { WS } from "./webUiStyles";
import { InfoBtn } from "./InfoModal";

export function JobHistoryUI({ services, yarnApps }) {
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
      <div style={{ background: "#fff", borderBottom: "3px solid #c85000", padding: "7px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22, fontWeight: 900, color: "#e47a2c", letterSpacing: -1 }}>hadoop</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#333" }}>JobHistory</span>
          <span style={{ fontSize: 11, color: "#999", marginLeft: 4 }}>hadoop-VirtualBox:19888</span>
        </div>
        <span style={{ fontSize: 11, color: "#aaa" }}>Hadoop 3.4.1 · MapReduce History Server</span>
      </div>

      <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>
        <div style={{ width: 160, background: "#fff", borderRight: "1px solid #ddd", flexShrink: 0, paddingTop: 10 }}>
          <div style={{ padding: "4px 8px", fontWeight: 700, fontSize: 12, color: "#333" }}>▾ Application</div>
          <SideLink id="about" label="About" />
          <div style={{ padding: "4px 8px", fontWeight: 700, fontSize: 12, color: "#333", marginTop: 6 }}>▾ Tools</div>
          <SideLink id="config" label="Configuration" />
          <SideLink id="logs" label="Local logs" />
          <SideLink id="stacks" label="Server stacks" />
          <SideLink id="metrics" label="Server metrics" />
        </div>

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
