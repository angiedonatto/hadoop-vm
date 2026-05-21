import { useState } from "react";
import { WS } from "./webUiStyles";
import { InfoBtn } from "./InfoModal";

export function YarnWebUI({ services, yarnApps }) {
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
      <div style={{ background: "#fff", borderBottom: "3px solid #0b7285", padding: "7px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22, fontWeight: 900, color: "#e47a2c", letterSpacing: -1 }}>hadoop</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#333" }}>ResourceManager</span>
          <span style={{ fontSize: 11, color: "#999", marginLeft: 4 }}>hadoop-VirtualBox:8088</span>
        </div>
        <span style={{ fontSize: 11, color: "#aaa" }}>Hadoop 3.4.1 · CapacityScheduler</span>
      </div>

      <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>
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

        <div style={{ flex: 1, overflow: "auto", padding: "14px 20px" }}>

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
            <div style={{ display: "flex", gap: 16, marginBottom: 12, flexWrap: "wrap", background: "#fff", border: "1px solid #ddd", borderRadius: 4, padding: "8px 14px", fontSize: 11 }}>
              {[["#5cb85c", "Capacity"], ["#0b7285", "Used (normal)"], ["#e47a2c", "Used (over capacity)"], ["#9b59b6", "Max Capacity"], ["#f0ad4e", "Users Requesting Resources"]].map(([c, l]) => (
                <span key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 14, height: 14, background: c, borderRadius: 2, display: "inline-block" }} />{l}</span>
              ))}
            </div>
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
