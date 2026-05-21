import { useState, useRef, useEffect, useCallback } from "react";
import { createInitialState } from "../domain/initialState";
import { STORAGE_KEY, WELCOME_LINES, INITIAL_SERVICES } from "../domain/constants";
import * as fs from "../domain/filesystem";
import { out } from "../commands/output";
import { runMasterCommand } from "../commands/masterCommands";
import { runSlaveCommand } from "../commands/slaveCommands";
import { runBeelineCommand } from "../commands/beelineCommands";
import { HdfsWebUI } from "./webui/HdfsWebUI";
import { YarnWebUI } from "./webui/YarnWebUI";
import { JobHistoryUI } from "./webui/JobHistoryUI";
import { HiveWebUI } from "./webui/HiveWebUI";

const welcomeLines = WELCOME_LINES;

export default function HadoopVMSimulator() {
  const [services, setServices] = useState({ ...INITIAL_SERVICES });
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

  const [hiveServices, setHiveServices] = useState({ hiveserver2: false });
  const [hiveDBs, setHiveDBs] = useState({ default: { tables: {} } });
  const [currentHiveDB, setCurrentHiveDB] = useState("default");
  const [hiveQueries, setHiveQueries] = useState([]);

  const [termTabs, setTermTabs] = useState([{ id: 1, name: "Terminal 1" }]);
  const [activeTermTab, setActiveTermTab] = useState(1);
  const [termTabState, setTermTabState] = useState({
    1: { lines: welcomeLines, cwd: "/home/hadoop", history: [], histIdx: -1, input: "", sshNode: null, sshCwd: "/home/hadoop", beelineMode: false, beelineConnected: false },
  });
  const nextTermTabId = useRef(2);
  const termRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const saveTimer = useRef(null);

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
    ...prev, [id]: { ...prev[id], ...patch },
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

  const resolvePath = useCallback((p, base) => fs.resolvePath(p, base), []);
  const getLocalNode = useCallback((path) => fs.getLocalNode(localFS, path), [localFS]);
  const ensureHdfsDir = useCallback((path, f) => fs.ensureHdfsDir(path, f), []);
  const ensureLocalDir = useCallback((path, f) => fs.ensureLocalDir(path, f), []);
  const getDirItems = useCallback((node) => fs.getDirItems(node), []);
  const formatLs = useCallback((resolved, flags) => fs.formatLs(localFS, permsMap, resolved, flags), [localFS, permsMap]);

  const resetAll = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    const init = createInitialState();
    setLocalFS(init.localFS); setHdfsFS(init.hdfsFS); setCwd("/home/hadoop");
    setServices({ ...INITIAL_SERVICES });
    setSafeMode(false); setHdfsSnapEnabled(new Set()); setHdfsSnapshots({}); setYarnApps([]); setAppCounter(1); setFsimageCounter(42); setPermsMap({}); setHistory([]); setSshNode(null); setSshCwd("/home/hadoop"); setHiveServices({ hiveserver2: false }); setBeelineMode(false); setBeelineConnected(false); setHiveDBs({ default: { tables: {} } }); setCurrentHiveDB("default"); setHiveQueries([]); setLines(welcomeLines);
  }, []);

  const buildCtx = useCallback((run) => ({
    out,
    cwd, services, hiveServices, localFS, hdfsFS, safeMode, hdfsSnapEnabled, hdfsSnapshots,
    appCounter, fsimageCounter, permsMap, yarnApps, currentHiveDB, hiveDBs,
    sshNode, sshCwd, beelineConnected,
    setLocalFS, setHdfsFS, setServices, setSafeMode, setYarnApps, setAppCounter, setFsimageCounter,
    setHdfsSnapEnabled, setHdfsSnapshots, setHiveDBs, setHiveQueries, setCurrentHiveDB, setHiveServices,
    setSshNode, setSshCwd, setBeelineMode, setBeelineConnected, setPermsMap, setCwd, setHistory, setLines,
    resolvePath, getLocalNode, ensureHdfsDir, ensureLocalDir, formatLs, getDirItems,
    resetAll, run,
  }), [cwd, services, hiveServices, localFS, hdfsFS, safeMode, hdfsSnapEnabled, hdfsSnapshots, appCounter, fsimageCounter, permsMap, yarnApps, currentHiveDB, hiveDBs, sshNode, sshCwd, beelineConnected, resolvePath, getLocalNode, ensureHdfsDir, ensureLocalDir, formatLs, getDirItems, resetAll]);

  const runMaster = useCallback((cmd) => {
    const ctx = buildCtx((c) => runMaster(c));
    return runMasterCommand(cmd, ctx);
  }, [buildCtx]);

  const runSlave = useCallback((cmd) => {
    const ctx = buildCtx((c) => runMaster(c));
    return runSlaveCommand(cmd, ctx);
  }, [buildCtx, runMaster]);

  const runBeeline = useCallback((cmd) => {
    const ctx = buildCtx((c) => runMaster(c));
    return runBeelineCommand(cmd, ctx);
  }, [buildCtx, runMaster]);

  const handleSubmit = () => {
    const cmd = input.trim(); if (!cmd) return;
    setHistory(prev => [cmd, ...prev]); setHistIdx(-1); setInput("");

    if (beelineMode) {
      const prompt = { type: "prompt", text: `${beelineConnected ? "0: jdbc:hive2://hadoop-virtualbox:10000" : "beeline"}> ${cmd}` };
      const results = runBeeline(cmd);
      if (results.some(r => r.type === "clear")) setLines([]); else setLines(prev => [...prev, prompt, ...results]);
      return;
    }

    const host = sshNode || "hadoop-VirtualBox"; const cwdD = (sshNode ? sshCwd : cwd); const d = cwdD === "/home/hadoop" ? "~" : cwdD;
    const prompt = { type: "prompt", text: `hadoop@${host}:${d}$ ${cmd}` };
    const results = sshNode ? runSlave(cmd) : runMaster(cmd);
    if (results.some(r => r.type === "clear")) setLines([]); else setLines(prev => [...prev, prompt, ...results]);
  };

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

  return (
    <div style={{ height: "100vh", width: "100%", display: "flex", flexDirection: "column", background: "#0a0a0a", fontFamily: "'JetBrains Mono', 'Fira Code', monospace", color: "#e0e0e0", overflow: "hidden" }}>
      <div style={{ background: sshNode ? "linear-gradient(180deg, #2a3a2a 0%, #1b2b1b 100%)" : "linear-gradient(180deg, #3a3a3a 0%, #2b2b2b 100%)", borderBottom: "1px solid #1a1a1a", padding: "6px 16px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
        </div>
        <span style={{ fontSize: 12, color: sshNode ? "#8ec07c" : "#999", flex: 1, textAlign: "center" }}>hadoop@{host}: {cwdD}{sshNode && <span style={{ marginLeft: 8, fontSize: 10, background: "#2d4a2d", padding: "1px 6px", borderRadius: 3, color: "#8f8" }}>SSH</span>}</span>
        <span style={{ fontSize: 10, color: "#666" }}>Ubuntu 22.04</span>
      </div>

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
