import { useState, useRef, useEffect, useCallback } from "react";

function createInitialState() {
  const localFS = {
    "/": { type: "dir", children: ["opt", "tmp", "home", "datos", "etc", "var", "usr", "bin", "sbin"] },
    "/opt": { type: "dir", children: ["hadoop"] },
    "/opt/hadoop": { type: "dir", children: ["sbin", "etc", "share", "logs", "bin"] },
    "/opt/hadoop/sbin": { type: "dir", children: ["start-dfs.sh", "stop-dfs.sh", "start-yarn.sh", "stop-yarn.sh"], files: { "start-dfs.sh": "#!/bin/bash\n# Start HDFS daemons", "stop-dfs.sh": "#!/bin/bash\n# Stop HDFS daemons", "start-yarn.sh": "#!/bin/bash\n# Start YARN daemons", "stop-yarn.sh": "#!/bin/bash\n# Stop YARN daemons" } },
    "/opt/hadoop/bin": { type: "dir", children: ["hadoop", "hdfs", "yarn", "mapred"] },
    "/opt/hadoop/etc": { type: "dir", children: ["hadoop"] },
    "/opt/hadoop/etc/hadoop": { type: "dir", children: ["core-site.xml", "hdfs-site.xml", "yarn-site.xml", "mapred-site.xml", "workers"], files: { "core-site.xml": "<configuration>\n  <property>\n    <name>fs.defaultFS</name>\n    <value>hdfs://localhost:9000</value>\n  </property>\n</configuration>", "hdfs-site.xml": "<configuration>\n  <property>\n    <name>dfs.replication</name>\n    <value>1</value>\n  </property>\n  <property>\n    <name>dfs.namenode.name.dir</name>\n    <value>file:///datos/namenode</value>\n  </property>\n  <property>\n    <name>dfs.datanode.data.dir</name>\n    <value>file:///datos/datanode</value>\n  </property>\n</configuration>", "yarn-site.xml": "<configuration>\n  <property>\n    <name>yarn.nodemanager.resource.memory-mb</name>\n    <value>4096</value>\n  </property>\n</configuration>", "mapred-site.xml": "<configuration>\n  <property>\n    <name>mapreduce.framework.name</name>\n    <value>yarn</value>\n  </property>\n</configuration>", "workers": "localhost" } },
    "/opt/hadoop/share": { type: "dir", children: ["hadoop"] },
    "/opt/hadoop/share/hadoop": { type: "dir", children: ["mapreduce"] },
    "/opt/hadoop/share/hadoop/mapreduce": { type: "dir", children: ["hadoop-mapreduce-examples-3.4.1.jar", "hadoop-mapreduce-client-jobclient-3.4.1-tests.jar"], files: {} },
    "/opt/hadoop/logs": { type: "dir", children: ["hadoop-hadoop-nodemanager-hadoop-VirtualBox.log", "hadoop-hadoop-resourcemanager-hadoop-VirtualBox.log"], files: { "hadoop-hadoop-nodemanager-hadoop-VirtualBox.log": generateNodeManagerLog(), "hadoop-hadoop-resourcemanager-hadoop-VirtualBox.log": generateResourceManagerLog() } },
    "/tmp": { type: "dir", children: [], files: {} },
    "/home": { type: "dir", children: ["hadoop"] },
    "/home/hadoop": { type: "dir", children: ["Descargas", "Documentos", "Escritorio"], files: {} },
    "/home/hadoop/Descargas": { type: "dir", children: [], files: {} },
    "/home/hadoop/Documentos": { type: "dir", children: [], files: {} },
    "/home/hadoop/Escritorio": { type: "dir", children: [], files: {} },
    "/datos": { type: "dir", children: ["namenode", "datanode"] },
    "/datos/namenode": { type: "dir", children: ["current"] },
    "/datos/namenode/current": { type: "dir", children: ["fsimage_0000000000000000042", "fsimage_0000000000000000042.md5", "edits_inprogress_0000000000000000043"], files: { "fsimage_0000000000000000042": "[binary fsimage data]", "fsimage_0000000000000000042.md5": "a3f2b8c91d4e5f6a7b8c9d0e1f2a3b4c", "edits_inprogress_0000000000000000043": "[binary edits data]" } },
    "/datos/datanode": { type: "dir", children: ["current"] },
    "/datos/datanode/current": { type: "dir", children: ["BP-1234567890-127.0.0.1-1700000000000"] },
    "/etc": { type: "dir", children: ["hosts", "hostname"], files: { hosts: "127.0.0.1 localhost\n127.0.1.1 hadoop-VirtualBox", hostname: "hadoop-VirtualBox" } },
    "/var": { type: "dir", children: ["log"] },
    "/var/log": { type: "dir", children: ["syslog"] },
    "/usr": { type: "dir", children: ["bin", "lib"] },
    "/usr/bin": { type: "dir", children: [] },
    "/usr/lib": { type: "dir", children: [] },
    "/bin": { type: "dir", children: [] },
    "/sbin": { type: "dir", children: [] },
  };
  const hdfsFS = { "/": { type: "dir", children: [], owner: "hadoop", group: "supergroup", perms: "drwxr-xr-x" } };
  return { localFS, hdfsFS };
}

function generateNodeManagerLog() {
  const lines = [];
  for (let i = 1; i <= 30; i++) {
    const d = String(i).padStart(2, "0");
    lines.push(`2026-02-${d} 08:00:01,234 INFO org.apache.hadoop.yarn.server.nodemanager.NodeManager: transitioned from INITED to STARTED`);
    lines.push(`2026-02-${d} 08:00:02,567 INFO org.apache.hadoop.yarn.server.nodemanager.containermanager.ContainerManagerImpl: Starting resource-monitoring for container_1700000000000_000${i}_01_000001`);
    lines.push(`2026-02-${d} 08:05:15,890 INFO org.apache.hadoop.yarn.server.nodemanager.containermanager.container.ContainerImpl: Container container_1700000000000_000${i}_01_000001 succeeded`);
    if (i % 7 === 0) lines.push(`2026-02-${d} 08:06:00,111 WARN org.apache.hadoop.yarn.server.nodemanager.containermanager.container.ContainerImpl: Container container_1700000000000_000${i}_01_000002 failed`);
    lines.push(`2026-02-${d} 08:00:01,500 INFO org.apache.hadoop.yarn.server.nodemanager.NodeStatusUpdaterImpl: transitioned from STARTED to RUNNING`);
  }
  return lines.join("\n");
}

function generateResourceManagerLog() {
  const lines = [];
  for (let i = 1; i <= 25; i++) {
    const d = String(i).padStart(2, "0");
    lines.push(`2026-02-${d} 08:00:00,100 INFO org.apache.hadoop.yarn.server.resourcemanager.ResourceManager: State change from NEW to SUBMITTED for application_1700000000000_000${i}`);
    lines.push(`2026-02-${d} 08:00:01,200 INFO org.apache.hadoop.yarn.server.resourcemanager.ResourceManager: State change from SUBMITTED to ACCEPTED for application_1700000000000_000${i}`);
    lines.push(`2026-02-${d} 08:00:05,300 INFO org.apache.hadoop.yarn.server.resourcemanager.scheduler.capacity.CapacityScheduler: Assigned container container_1700000000000_000${i}_01_000001 of capacity <memory:1024, vCores:1>`);
    lines.push(`2026-02-${d} 08:01:00,400 INFO org.apache.hadoop.yarn.server.resourcemanager.rmnode.RMNodeImpl: NodeManager from node hadoop-VirtualBox:45454 registered with capability: <memory:4096, vCores:4>`);
    if (i % 10 === 0) lines.push(`2026-02-${d} 09:00:00,500 WARN org.apache.hadoop.yarn.server.resourcemanager.rmnode.RMNodeImpl: Node hadoop-VirtualBox:45454 has shutdown gracefully`);
  }
  return lines.join("\n");
}

function generateBenchmarkOutput(mode, nrFiles, fileSize) {
  const rate = mode === "write" ? (45 + Math.random() * 30).toFixed(2) : (80 + Math.random() * 40).toFixed(2);
  const avg = (parseFloat(rate) / nrFiles).toFixed(2);
  return `26/03/03 10:00:00 INFO fs.TestDFSIO: ----- TestDFSIO ----- : ${mode}\n26/03/03 10:00:00 INFO fs.TestDFSIO:             Date & time: Tue Mar 03 10:00:00 COT 2026\n26/03/03 10:00:00 INFO fs.TestDFSIO:         Number of files: ${nrFiles}\n26/03/03 10:00:00 INFO fs.TestDFSIO:  Total MBytes processed: ${nrFiles * fileSize}\n26/03/03 10:00:00 INFO fs.TestDFSIO:       Throughput mb/sec: ${rate}\n26/03/03 10:00:00 INFO fs.TestDFSIO:  Average IO rate mb/sec: ${avg}\n26/03/03 10:00:00 INFO fs.TestDFSIO:   IO rate std deviation: ${(Math.random() * 5).toFixed(2)}\n26/03/03 10:00:00 INFO fs.TestDFSIO:      Test exec time sec: ${(10 + Math.random() * 20).toFixed(1)}`;
}

function parseTokens(cmd) {
  const tokens = []; let current = ""; let inQ = false; let qc = "";
  for (const ch of cmd) {
    if (inQ) { if (ch === qc) inQ = false; else current += ch; }
    else if (ch === "'" || ch === '"') { inQ = true; qc = ch; }
    else if (ch === " " || ch === "\t") { if (current) { tokens.push(current); current = ""; } }
    else current += ch;
  }
  if (current) tokens.push(current);
  return tokens;
}

export default function HadoopVMSimulator() {
  const [lines, setLines] = useState([
    { type: "system", text: "Ubuntu 22.04.3 LTS — hadoop-VirtualBox" },
    { type: "system", text: "Simulador de entorno Hadoop/HDFS/YARN/MapReduce — Big Data 2026-I" },
    { type: "system", text: 'Escribe "help" para ver los comandos disponibles.\n' },
  ]);
  const [input, setInput] = useState("");
  const [cwd, setCwd] = useState("/home/hadoop");
  const [history, setHistory] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [services, setServices] = useState({ namenode: false, datanode: false, secondarynamenode: false, resourcemanager: false, nodemanager: false, historyserver: false });
  const [localFS, setLocalFS] = useState(null);
  const [hdfsFS, setHdfsFS] = useState(null);
  const [safeMode, setSafeMode] = useState(false);
  const [hdfsSnapEnabled, setHdfsSnapEnabled] = useState(new Set());
  const [hdfsSnapshots, setHdfsSnapshots] = useState({});
  const [yarnApps, setYarnApps] = useState([]);
  const [appCounter, setAppCounter] = useState(1);
  const [fsimageCounter, setFsimageCounter] = useState(42);
  const termRef = useRef(null);
  const inputRef = useRef(null);
  const [showHelp, setShowHelp] = useState(false);
  const [tabHighlight, setTabHighlight] = useState("terminal");

  useEffect(() => { const s = createInitialState(); setLocalFS(s.localFS); setHdfsFS(s.hdfsFS); }, []);
  useEffect(() => { if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight; }, [lines]);

  const focusInput = () => inputRef.current?.focus();
  const out = useCallback((text, type = "output") => ({ type, text }), []);

  const resolvePath = useCallback((p, base) => {
    if (!p) return base;
    let parts;
    if (p.startsWith("/")) parts = p.split("/").filter(Boolean);
    else if (p === "~" || p.startsWith("~/")) parts = ["home", "hadoop", ...p.slice(1).replace(/^\//, "").split("/").filter(Boolean)];
    else parts = [...base.split("/").filter(Boolean), ...p.split("/").filter(Boolean)];
    const resolved = [];
    for (const seg of parts) { if (seg === ".") continue; else if (seg === "..") resolved.pop(); else resolved.push(seg); }
    return "/" + resolved.join("/");
  }, []);

  const getLocalNode = useCallback((path) => {
    if (!localFS) return null;
    if (localFS[path]) return localFS[path];
    const parent = path.substring(0, path.lastIndexOf("/")) || "/";
    const name = path.substring(path.lastIndexOf("/") + 1);
    const pNode = localFS[parent];
    if (pNode?.files && name in pNode.files) return { type: "file", content: pNode.files[name] };
    if (pNode?.children?.includes(name)) return { type: "dir_ref" };
    return null;
  }, [localFS]);

  const ensureHdfsDir = useCallback((path, fs) => {
    if (fs[path]) return fs;
    const nf = { ...fs }; const parts = path.split("/").filter(Boolean); let cur = "/";
    for (const p of parts) {
      const next = cur === "/" ? `/${p}` : `${cur}/${p}`;
      if (!nf[next]) { nf[next] = { type: "dir", children: [], owner: "hadoop", group: "supergroup", perms: "drwxr-xr-x" }; if (nf[cur] && !nf[cur].children.includes(p)) nf[cur] = { ...nf[cur], children: [...nf[cur].children, p] }; }
      cur = next;
    }
    return nf;
  }, []);

  const ensureLocalDir = useCallback((path, fs) => {
    if (fs[path]) return fs;
    const nf = { ...fs }; const parts = path.split("/").filter(Boolean); let cur = "/";
    for (const p of parts) {
      const next = cur === "/" ? `/${p}` : `${cur}/${p}`;
      if (!nf[next]) { nf[next] = { type: "dir", children: [], files: {} }; if (nf[cur] && !nf[cur].children.includes(p)) nf[cur] = { ...nf[cur], children: [...nf[cur].children, p] }; }
      cur = next;
    }
    return nf;
  }, []);

  const getDirItems = useCallback((node) => {
    const set = new Set(node.children || []);
    if (node.files) Object.keys(node.files).forEach(f => set.add(f));
    return [...set];
  }, []);

  // Format ls for a single resolved path with flags
  const formatLsSingle = useCallback((resolved, flags) => {
    const node = localFS[resolved];
    if (!node) return null;
    if (node.type !== "dir") return resolved;
    let items = getDirItems(node);
    if (!flags.includes("a")) items = items.filter(i => !i.startsWith("."));
    items.sort((a, b) => a.localeCompare(b));
    if (flags.includes("r")) items.reverse();
    if (items.length === 0 && !flags.includes("a")) return "";
    if (flags.includes("l") || flags.includes("h")) {
      const all = flags.includes("a") ? [".", "..", ...items] : items;
      const rows = all.map(i => {
        if (i === "." || i === "..") return `drwxr-xr-x 2 hadoop hadoop   4096 Feb 28 10:00 ${i}`;
        const cp = resolved === "/" ? `/${i}` : `${resolved}/${i}`;
        const isDir = !!localFS[cp];
        const rawSize = isDir ? 4096 : (node.files?.[i]?.length || 0);
        let sz;
        if (flags.includes("h")) { if (rawSize >= 1048576) sz = (rawSize / 1048576).toFixed(1) + "M"; else if (rawSize >= 1024) sz = (rawSize / 1024).toFixed(1) + "K"; else sz = String(rawSize); }
        else sz = String(rawSize).padStart(8);
        return `${isDir ? "d" : "-"}rwxr-xr-x 1 hadoop hadoop ${sz} Feb 28 10:00 ${i}`;
      });
      return `total ${all.length * 4}\n${rows.join("\n")}`;
    }
    return items.join("  ");
  }, [localFS, getDirItems]);

  const processCommand = useCallback((cmd) => {
    const trimmed = cmd.trim();
    if (!trimmed) return [];
    const pipes = trimmed.split("|").map(s => s.trim());
    const mainCmd = pipes[0];
    const tokens = parseTokens(mainCmd);
    const base = tokens[0];

    // Simple commands
    if (base === "help") return [out("╔══════════════════════════════════════════════════════════════════╗\n║            SIMULADOR HADOOP — COMANDOS DISPONIBLES              ║\n╠══════════════════════════════════════════════════════════════════╣\n║ LINUX: ls [-l,-a,-r,-la,-lh], cd, pwd, mkdir [-p], touch,      ║\n║   cp [-r], mv, rm [-r,-f], cat, head [-n], tail [-n], grep     ║\n║   [-i,-v,-c], chmod, wc [-l,-w,-c], ps [aux], top, hostname,   ║\n║   uname [-a], free [-h], df [-h], lscpu, echo, clear, whoami   ║\n║                                                                 ║\n║ SERVICIOS: ./start-dfs.sh  ./stop-dfs.sh                       ║\n║   ./start-yarn.sh  ./stop-yarn.sh  jps [-l]                    ║\n║   mapred historyserver                                          ║\n║                                                                 ║\n║ HDFS: hdfs dfs -ls/-mkdir/-put/-get/-cat/-rm/-chmod/-cp         ║\n║   hdfs dfs -createSnapshot/-deleteSnapshot                      ║\n║   hdfs dfsadmin -report/-safemode/-saveNamespace                ║\n║   hdfs dfsadmin -allowSnapshot/-disallowSnapshot                ║\n║   hdfs fsck / [-files -blocks -locations]                       ║\n║                                                                 ║\n║ YARN: yarn node -list [--showDetails]                           ║\n║   yarn application -list/-status/-kill                          ║\n║   yarn applicationattempt -list / yarn container -list          ║\n║                                                                 ║\n║ MAPREDUCE: hadoop jar <jar> grep/wordcount/TestDFSIO ...        ║\n║ JAVA: javac -classpath $(hadoop classpath) <F>.java             ║\n║       jar cf <name>.jar <F>*.class                              ║\n║                                                                 ║\n║ Tab: autocompleta comandos y rutas · ↑↓: historial             ║\n╚══════════════════════════════════════════════════════════════════╝", "help")];
    if (base === "clear") return [{ type: "clear" }];
    if (base === "pwd") return [out(cwd)];
    if (base === "whoami") return [out("hadoop")];
    if (base === "hostname") return [out("hadoop-VirtualBox")];
    if (base === "uname") return [out(tokens.includes("-a") ? "Linux hadoop-VirtualBox 5.15.0-91-generic #101-Ubuntu SMP x86_64 x86_64 x86_64 GNU/Linux" : "Linux")];
    if (base === "lsb_release") return [out("Distributor ID: Ubuntu\nDescription:    Ubuntu 22.04.3 LTS\nRelease:        22.04\nCodename:       jammy")];
    if (base === "lscpu") return [out("Architecture:          x86_64\nCPU op-mode(s):        32-bit, 64-bit\nCPU(s):                4\nThread(s) per core:    1\nCore(s) per socket:    4\nSocket(s):             1\nModel name:            Intel(R) Core(TM) i7-10750H CPU @ 2.60GHz\nCPU MHz:               2592.000")];
    if (base === "free") return [out("              total        used        free      shared  buff/cache   available\nMem:          8.0Gi       3.2Gi       2.1Gi       256Mi       2.7Gi       4.3Gi\nSwap:         2.0Gi          0B       2.0Gi")];
    if (base === "df") return [out("Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        50G   18G   30G  38% /\ntmpfs           4.0G     0  4.0G   0% /dev/shm\n/dev/sda2       100G   25G   70G  27% /datos")];

    if (base === "echo") {
      const arg = tokens.slice(1).join(" ").replace(/['"]/g, "");
      if (arg.includes("$(hadoop classpath)")) return [out("/opt/hadoop/etc/hadoop:/opt/hadoop/share/hadoop/common/lib/*:/opt/hadoop/share/hadoop/common/*:/opt/hadoop/share/hadoop/hdfs:/opt/hadoop/share/hadoop/hdfs/lib/*:/opt/hadoop/share/hadoop/hdfs/*:/opt/hadoop/share/hadoop/mapreduce/*:/opt/hadoop/share/hadoop/yarn/*:/opt/hadoop/share/hadoop/yarn/lib/*")];
      if (arg.includes("$HADOOP_HOME") || arg.includes("${HADOOP_HOME}")) return [out("/opt/hadoop")];
      if (arg.includes("$HOME") || arg.includes("${HOME}")) return [out("/home/hadoop")];
      if (arg.includes("$JAVA_HOME")) return [out("/usr/lib/jvm/java-11-openjdk-amd64")];
      return [out(arg)];
    }

    if (base === "wc") {
      const target = tokens.find((t, i) => i > 0 && !t.startsWith("-"));
      if (!target) return [out("wc: falta un operando", "error")];
      const node = getLocalNode(resolvePath(target, cwd));
      if (!node || node.type !== "file") return [out(`wc: ${target}: No existe`, "error")];
      const c = node.content || ""; const lc = c.split("\n").length; const wc = c.split(/\s+/).filter(Boolean).length;
      if (tokens.includes("-l")) return [out(`  ${lc} ${target}`)];
      if (tokens.includes("-w")) return [out(`  ${wc} ${target}`)];
      if (tokens.includes("-c")) return [out(`  ${c.length} ${target}`)];
      return [out(`  ${lc}  ${wc} ${c.length} ${target}`)];
    }

    if (base === "top") {
      const p = [];
      if (services.namenode) p.push("  1234 hadoop    20   0 1.2g 256m  28m S  2.0  3.2   0:45.12 java (NameNode)");
      if (services.datanode) p.push("  1235 hadoop    20   0 1.1g 200m  24m S  1.5  2.5   0:32.45 java (DataNode)");
      if (services.resourcemanager) p.push("  1236 hadoop    20   0 1.3g 300m  32m S  3.0  3.7   0:58.90 java (ResourceManager)");
      if (services.nodemanager) p.push("  1237 hadoop    20   0 1.0g 180m  20m S  1.0  2.2   0:22.33 java (NodeManager)");
      return [out(`top - 10:00:00 up 2 days,  1 user,  load average: 0.15, 0.10, 0.05\nTasks: ${120 + p.length} total,   1 running, ${119 + p.length} sleeping\n%Cpu(s):  5.2 us,  1.3 sy,  0.0 ni, 93.0 id,  0.5 wa\nMiB Mem:   8192.0 total,   2150.0 free,   3280.0 used,   2762.0 buff/cache\n\n  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND\n${p.join("\n")}\n(presiona q para salir — simulado)`)];
    }

    if (base === "ps") {
      let pl = "  PID TTY          TIME CMD\n 1000 pts/0    00:00:00 bash";
      if (services.namenode) pl += "\n 1234 ?        00:00:45 java -Dproc_namenode";
      if (services.datanode) pl += "\n 1235 ?        00:00:32 java -Dproc_datanode";
      if (services.secondarynamenode) pl += "\n 1238 ?        00:00:12 java -Dproc_secondarynamenode";
      if (services.resourcemanager) pl += "\n 1236 ?        00:00:58 java -Dproc_resourcemanager";
      if (services.nodemanager) pl += "\n 1237 ?        00:00:22 java -Dproc_nodemanager";
      if (services.historyserver) pl += "\n 1239 ?        00:00:08 java -Dproc_historyserver";
      return [out(pl)];
    }

    if (base === "jps") {
      const p = [];
      if (services.namenode) p.push("1234 NameNode");
      if (services.datanode) p.push("1235 DataNode");
      if (services.secondarynamenode) p.push("1238 SecondaryNameNode");
      if (services.resourcemanager) p.push("1236 ResourceManager");
      if (services.nodemanager) p.push("1237 NodeManager");
      if (services.historyserver) p.push("1239 JobHistoryServer");
      p.push(`${1240 + p.length} Jps`);
      if (tokens.includes("-l")) {
        const fqn = { NameNode: "org.apache.hadoop.hdfs.server.namenode.NameNode", DataNode: "org.apache.hadoop.hdfs.server.datanode.DataNode", SecondaryNameNode: "org.apache.hadoop.hdfs.server.namenode.SecondaryNameNode", ResourceManager: "org.apache.hadoop.yarn.server.resourcemanager.ResourceManager", NodeManager: "org.apache.hadoop.yarn.server.nodemanager.NodeManager", JobHistoryServer: "org.apache.hadoop.mapreduce.v2.hs.JobHistoryServer", Jps: "sun.tools.jps.Jps" };
        return [out(p.map(x => { const [pid, nm] = x.split(" "); return `${pid} ${fqn[nm] || nm}`; }).join("\n"))];
      }
      return [out(p.join("\n"))];
    }

    if (base === "cd") {
      const target = tokens[1] || "~";
      const resolved = resolvePath(target, cwd);
      const node = getLocalNode(resolved);
      if (!node && !localFS[resolved]) return [out(`bash: cd: ${target}: No existe el archivo o el directorio`, "error")];
      if (node?.type === "file") return [out(`bash: cd: ${target}: No es un directorio`, "error")];
      setCwd(resolved);
      return [];
    }

    // ── ls: supports multiple targets, -l, -a, -r, -la, -lh, -R ──
    if (base === "ls") {
      const allFlags = tokens.filter((t, i) => i > 0 && t.startsWith("-")).map(f => f.replace(/^-+/, "")).join("");
      const targets = tokens.filter((t, i) => i > 0 && !t.startsWith("-"));

      if (targets.length === 0) {
        const r = formatLsSingle(cwd, allFlags);
        return r ? [out(r)] : [];
      }
      if (targets.length === 1) {
        const resolved = resolvePath(targets[0], cwd);
        const node = getLocalNode(resolved);
        if (!node && !localFS[resolved]) return [out(`ls: no se puede acceder a '${targets[0]}': No existe el archivo o el directorio`, "error")];
        if (node?.type === "file") {
          if (allFlags.includes("l")) return [out(`-rw-r--r-- 1 hadoop hadoop ${(node.content || "").length} Feb 28 10:00 ${targets[0]}`)];
          return [out(targets[0])];
        }
        const r = formatLsSingle(resolved, allFlags);
        return r ? [out(r)] : [];
      }
      // Multiple targets
      const results = [];
      for (let ti = 0; ti < targets.length; ti++) {
        const resolved = resolvePath(targets[ti], cwd);
        const node = getLocalNode(resolved);
        if (!node && !localFS[resolved]) { results.push(out(`ls: no se puede acceder a '${targets[ti]}': No existe el archivo o el directorio`, "error")); continue; }
        if (node?.type === "file") { results.push(out(targets[ti])); continue; }
        const body = formatLsSingle(resolved, allFlags) || "";
        const header = (ti > 0 ? "\n" : "") + `${targets[ti]}:`;
        results.push(out(header + "\n" + body));
      }
      return results;
    }

    if (base === "mkdir") {
      const dirs = tokens.filter((t, i) => i > 0 && !t.startsWith("-"));
      if (dirs.length === 0) return [out("mkdir: falta un operando", "error")];
      let nf = { ...localFS };
      for (const d of dirs) { const r = resolvePath(d, cwd); if (!nf[r]) nf = ensureLocalDir(r, nf); }
      setLocalFS(nf);
      return [];
    }

    if (base === "touch") {
      const files = tokens.slice(1).filter(t => !t.startsWith("-"));
      let nf = { ...localFS };
      for (const f of files) {
        const r = resolvePath(f, cwd); const par = r.substring(0, r.lastIndexOf("/")) || "/"; const nm = r.substring(r.lastIndexOf("/") + 1);
        if (!nf[par]) nf = ensureLocalDir(par, nf);
        if (nf[par]) nf[par] = { ...nf[par], files: { ...(nf[par].files || {}), [nm]: "" }, children: [...new Set([...(nf[par].children || []), nm])] };
      }
      setLocalFS(nf);
      return [];
    }

    if (base === "cat") {
      const target = tokens[1];
      if (!target) return [out("cat: falta un operando", "error")];
      const node = getLocalNode(resolvePath(target, cwd));
      if (!node) return [out(`cat: ${target}: No existe el archivo o el directorio`, "error")];
      if (node.type !== "file") return [out(`cat: ${target}: Es un directorio`, "error")];
      let content = node.content || "";
      // Handle pipes
      for (let pi = 1; pi < pipes.length; pi++) {
        const pt = pipes[pi].trim();
        if (pt.startsWith("head")) { const n = parseInt(pt.match(/-n?\s*(\d+)/)?.[1] || pt.match(/-(\d+)/)?.[1]) || 10; content = content.split("\n").slice(0, n).join("\n"); }
        else if (pt.startsWith("tail")) { const n = parseInt(pt.match(/-n?\s*(\d+)/)?.[1] || pt.match(/-(\d+)/)?.[1]) || 10; content = content.split("\n").slice(-n).join("\n"); }
        else if (pt.startsWith("wc")) { const l = content.split("\n").length; const w = content.split(/\s+/).filter(Boolean).length; content = `  ${l}  ${w} ${content.length}`; }
        else if (pt.startsWith("grep")) { const gt = parseTokens(pt); const pat = gt[1] || ""; try { const re = new RegExp(pat, "gi"); content = content.split("\n").filter(l => re.test(l)).join("\n"); } catch {} }
      }
      return [out(content)];
    }

    if (base === "head") {
      const target = tokens.find((t, i) => i > 0 && !t.startsWith("-"));
      if (!target) return [out("head: falta un operando", "error")];
      let n = 10; const nf = tokens.find(t => /^-\d+$/.test(t)); const dn = tokens.indexOf("-n");
      if (nf) n = parseInt(nf.slice(1)); else if (dn >= 0 && tokens[dn + 1]) n = parseInt(tokens[dn + 1]);
      const node = getLocalNode(resolvePath(target, cwd));
      if (!node || node.type !== "file") return [out(`head: ${target}: No existe`, "error")];
      return [out((node.content || "").split("\n").slice(0, n).join("\n"))];
    }

    if (base === "tail") {
      const target = tokens.find((t, i) => i > 0 && !t.startsWith("-"));
      if (!target) return [out("tail: falta un operando", "error")];
      let n = 10; const nf = tokens.find(t => /^-\d+$/.test(t)); const dn = tokens.indexOf("-n");
      if (nf) n = parseInt(nf.slice(1)); else if (dn >= 0 && tokens[dn + 1]) n = parseInt(tokens[dn + 1]);
      const node = getLocalNode(resolvePath(target, cwd));
      if (!node || node.type !== "file") return [out(`tail: ${target}: No existe`, "error")];
      return [out((node.content || "").split("\n").slice(-n).join("\n"))];
    }

    if (base === "grep") {
      const gf = tokens.filter(t => t.startsWith("-")).map(t => t.replace(/^-+/, "")).join("");
      const pos = tokens.filter((t, i) => i > 0 && !t.startsWith("-"));
      const pattern = pos[0]; const gTargets = pos.slice(1);
      if (!pattern || gTargets.length === 0) return [out("Usage: grep [OPTIONS] PATTERN FILE...", "error")];
      const results = [];
      for (const t of gTargets) {
        const node = getLocalNode(resolvePath(t, cwd));
        if (!node || node.type !== "file") { results.push(out(`grep: ${t}: No existe`, "error")); continue; }
        try {
          const re = new RegExp(pattern, gf.includes("i") ? "gi" : "g");
          let matches = (node.content || "").split("\n").filter(l => re.test(l));
          if (gf.includes("v")) matches = (node.content || "").split("\n").filter(l => !new RegExp(pattern, gf.includes("i") ? "gi" : "g").test(l));
          if (gf.includes("c")) { results.push(out(`${gTargets.length > 1 ? t + ":" : ""}${matches.length}`)); continue; }
          const pf = gTargets.length > 1 ? t + ":" : "";
          results.push(out(matches.length > 0 ? matches.slice(0, 50).map(l => pf + l).join("\n") : `(sin coincidencias para '${pattern}')`));
        } catch { results.push(out(`grep: regex inválida: '${pattern}'`, "error")); }
      }
      return results;
    }

    // ── cp: supports -r, multiple sources, dir as destination ──
    if (base === "cp") {
      const cf = tokens.filter(t => t.startsWith("-")).map(t => t.replace(/^-+/, "")).join("");
      const pos = tokens.filter((t, i) => i > 0 && !t.startsWith("-"));
      if (pos.length < 2) return [out("cp: faltan operandos", "error")];
      const dst = pos[pos.length - 1]; const srcs = pos.slice(0, -1);
      let nf = { ...localFS };
      const dstR = resolvePath(dst, cwd); const dstIsDir = !!nf[dstR];

      for (const src of srcs) {
        const srcR = resolvePath(src, cwd); const srcNode = getLocalNode(srcR);
        if (!srcNode) return [out(`cp: no se puede efectuar 'stat' sobre '${src}': No existe`, "error")];
        const srcName = srcR.substring(srcR.lastIndexOf("/") + 1);
        if (srcNode.type === "file") {
          const tp = dstIsDir ? dstR : (dstR.substring(0, dstR.lastIndexOf("/")) || "/");
          const tn = dstIsDir ? srcName : dstR.substring(dstR.lastIndexOf("/") + 1);
          if (!nf[tp]) nf = ensureLocalDir(tp, nf);
          nf[tp] = { ...nf[tp], files: { ...(nf[tp].files || {}), [tn]: srcNode.content }, children: [...new Set([...(nf[tp].children || []), tn])] };
        } else if (localFS[srcR]) {
          if (!cf.includes("r")) return [out(`cp: se omite el directorio '${src}' (usa -r)`, "error")];
          const tb = dstIsDir ? `${dstR}/${srcName}` : dstR;
          nf = ensureLocalDir(tb, nf);
          const sd = localFS[srcR];
          nf[tb] = { ...nf[tb], children: [...(sd.children || [])], files: { ...(sd.files || {}) } };
        }
      }
      setLocalFS(nf);
      return [];
    }

    // ── mv: supports multiple sources, dir as destination, dir moves ──
    if (base === "mv") {
      const pos = tokens.filter((t, i) => i > 0 && !t.startsWith("-"));
      if (pos.length < 2) return [out("mv: faltan operandos", "error")];
      const dst = pos[pos.length - 1]; const srcs = pos.slice(0, -1);
      let nf = { ...localFS };
      const dstR = resolvePath(dst, cwd); const dstIsDir = !!nf[dstR];

      for (const src of srcs) {
        const srcR = resolvePath(src, cwd); const srcPar = srcR.substring(0, srcR.lastIndexOf("/")) || "/"; const srcName = srcR.substring(srcR.lastIndexOf("/") + 1);
        const srcNode = getLocalNode(srcR);
        if (!srcNode) return [out(`mv: no se puede efectuar 'stat' sobre '${src}': No existe`, "error")];
        const tp = dstIsDir ? dstR : (dstR.substring(0, dstR.lastIndexOf("/")) || "/");
        const tn = dstIsDir ? srcName : dstR.substring(dstR.lastIndexOf("/") + 1);
        if (!nf[tp]) nf = ensureLocalDir(tp, nf);

        if (srcNode.type === "file") {
          nf[tp] = { ...nf[tp], files: { ...(nf[tp].files || {}), [tn]: srcNode.content }, children: [...new Set([...(nf[tp].children || []), tn])] };
          if (nf[srcPar]?.files) { const { [srcName]: _, ...rest } = nf[srcPar].files; nf[srcPar] = { ...nf[srcPar], files: rest, children: (nf[srcPar].children || []).filter(c => c !== srcName) }; }
        } else if (localFS[srcR]) {
          const newPath = dstIsDir ? `${dstR}/${srcName}` : dstR;
          nf[newPath] = { ...nf[srcR] }; delete nf[srcR];
          Object.keys(nf).forEach(k => { if (k.startsWith(srcR + "/")) { nf[newPath + k.substring(srcR.length)] = nf[k]; delete nf[k]; } });
          if (nf[srcPar]) nf[srcPar] = { ...nf[srcPar], children: (nf[srcPar].children || []).filter(c => c !== srcName) };
          const np = newPath.substring(0, newPath.lastIndexOf("/")) || "/"; const nn = newPath.substring(newPath.lastIndexOf("/") + 1);
          if (nf[np]) nf[np] = { ...nf[np], children: [...new Set([...(nf[np].children || []), nn])] };
        }
      }
      setLocalFS(nf);
      return [];
    }

    if (base === "rm") {
      const rf = tokens.filter(t => t.startsWith("-")).map(t => t.replace(/^-+/, "")).join("");
      const targets = tokens.filter((t, i) => i > 0 && !t.startsWith("-"));
      if (targets.length === 0) return [out("rm: falta un operando", "error")];
      let nf = { ...localFS };
      for (const t of targets) {
        const r = resolvePath(t, cwd); const par = r.substring(0, r.lastIndexOf("/")) || "/"; const nm = r.substring(r.lastIndexOf("/") + 1);
        if (nf[r]?.type === "dir") {
          if (!rf.includes("r")) return [out(`rm: no se puede borrar '${t}': Es un directorio (usa -r)`, "error")];
          Object.keys(nf).forEach(k => { if (k === r || k.startsWith(r + "/")) delete nf[k]; });
          if (nf[par]) nf[par] = { ...nf[par], children: (nf[par].children || []).filter(c => c !== nm) };
        } else if (nf[par]?.files?.[nm] !== undefined) {
          const { [nm]: _, ...rest } = nf[par].files;
          nf[par] = { ...nf[par], files: rest, children: (nf[par].children || []).filter(c => c !== nm) };
        } else if (!rf.includes("f")) return [out(`rm: no se puede borrar '${t}': No existe`, "error")];
      }
      setLocalFS(nf);
      return [];
    }

    if (base === "chmod") return [];
    if (base === "ssh") return [out(`ssh: connect to host ${tokens[1] || "?"} port 22: Connection refused\n(Simulación: solo hay un nodo pseudo-distribuido)`, "warn")];
    if (base === "scp") return [out("scp: Simulación — solo hay un nodo disponible en este pseudo-clúster.", "warn")];

    if (base === "md5sum") {
      const target = tokens.slice(1).join(" ");
      if (!target) return [];
      const mkHash = () => Array.from({ length: 32 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
      if (target.includes("fsimage")) {
        const r = [];
        for (let i = 42; i <= fsimageCounter; i++) r.push(`${mkHash()}  /datos/namenode/current/fsimage_${String(i).padStart(19, "0")}`);
        return [out(r.slice(-4).join("\n"))];
      }
      return [out(`${mkHash()}  ${target}`)];
    }

    // ── Service scripts ──
    if (trimmed === "./start-dfs.sh" || trimmed === "start-dfs.sh" || trimmed.endsWith("/start-dfs.sh")) {
      setServices(s => ({ ...s, namenode: true, datanode: true, secondarynamenode: true }));
      return [out("Starting namenodes on [localhost]\nStarting datanodes\nStarting secondary namenodes [hadoop-VirtualBox]\n\n✓ HDFS iniciado correctamente.", "success")];
    }
    if (trimmed === "./stop-dfs.sh" || trimmed === "stop-dfs.sh" || trimmed.endsWith("/stop-dfs.sh")) {
      setServices(s => ({ ...s, namenode: false, datanode: false, secondarynamenode: false }));
      return [out("Stopping namenodes on [localhost]\nStopping datanodes\nStopping secondary namenodes [hadoop-VirtualBox]\n\n✓ HDFS detenido.", "warn")];
    }
    if (trimmed === "./start-yarn.sh" || trimmed === "start-yarn.sh" || trimmed.endsWith("/start-yarn.sh")) {
      if (!services.namenode) return [out("WARN: HDFS no está activo. Inicia HDFS primero con ./start-dfs.sh", "error")];
      setServices(s => ({ ...s, resourcemanager: true, nodemanager: true }));
      return [out("Starting resourcemanager\nStarting nodemanagers\n\n✓ YARN iniciado correctamente.", "success")];
    }
    if (trimmed === "./stop-yarn.sh" || trimmed === "stop-yarn.sh" || trimmed.endsWith("/stop-yarn.sh")) {
      setServices(s => ({ ...s, resourcemanager: false, nodemanager: false }));
      return [out("Stopping resourcemanager\nStopping nodemanagers\n\n✓ YARN detenido.", "warn")];
    }
    if (base === "mapred" && tokens[1] === "historyserver") {
      if (!services.resourcemanager) return [out("Error: YARN no está activo.", "error")];
      setServices(s => ({ ...s, historyserver: true }));
      return [out("Starting JobHistoryServer...\n✓ JobHistoryServer iniciado en http://hadoop-VirtualBox:19888", "success")];
    }

    // ── HDFS ──
    if (base === "hdfs") {
      if (!services.namenode) return [out("Call From hadoop-VirtualBox/127.0.0.1 to localhost:9000 failed on connection exception.\n\n✗ Error: HDFS no está iniciado. Ejecuta: cd /opt/hadoop/sbin && ./start-dfs.sh", "error")];
      const sub = tokens[1];
      if (sub === "dfs") {
        const flag = tokens[2];
        if (flag === "-ls") {
          const t = tokens[3] || "/"; const n = hdfsFS[t];
          if (!n) return [out(`ls: '${t}': No such file or directory`, "error")];
          if (n.type === "dir") {
            const items = n.children || [];
            if (items.length === 0) return [out("Found 0 items")];
            const det = items.map(i => { const cp = t === "/" ? `/${i}` : `${t}/${i}`; const cn = hdfsFS[cp]; if (cn?.type === "dir") return `drwxr-xr-x   - hadoop supergroup          0 2026-02-28 10:00 ${cp}`; return `-rw-r--r--   1 hadoop supergroup     ${String(cn?.size || 1024).padStart(8)} 2026-02-28 10:00 ${cp}`; });
            return [out(`Found ${items.length} items\n${det.join("\n")}`)];
          }
          return [out(`-rw-r--r--   1 hadoop supergroup     ${n.size || 0} 2026-02-28 10:00 ${t}`)];
        }
        if (flag === "-mkdir") { let nf = { ...hdfsFS }; for (const p of tokens.slice(3).filter(t => !t.startsWith("-"))) nf = ensureHdfsDir(p, nf); setHdfsFS(nf); return []; }
        if (flag === "-put") {
          const lp = tokens[3]; const hp = tokens[4];
          if (!lp || !hp) return [out("Usage: hdfs dfs -put <localsrc> <dst>", "error")];
          const rl = resolvePath(lp, cwd); const ln = getLocalNode(rl);
          if (!ln) return [out(`put: '${lp}': No such file or directory`, "error")];
          let nf = { ...hdfsFS }; const hpp = hp.replace(/\/$/, "");
          if (!nf[hpp]) nf = ensureHdfsDir(hpp, nf);
          if (ln.type === "file") { const fn = rl.substring(rl.lastIndexOf("/") + 1); const fp = `${hpp}/${fn}`; nf[fp] = { type: "file", content: ln.content, size: (ln.content || "").length, owner: "hadoop", group: "supergroup" }; if (nf[hpp]) nf[hpp] = { ...nf[hpp], children: [...new Set([...(nf[hpp].children || []), fn])] }; }
          setHdfsFS(nf); return [];
        }
        if (flag === "-get") {
          const hs = tokens[3]; const ld = tokens[4] || "."; const hn = hdfsFS[hs];
          if (!hn) return [out(`get: '${hs}': No such file or directory`, "error")];
          const rd = resolvePath(ld, cwd); const fn = hs.substring(hs.lastIndexOf("/") + 1);
          let nf = { ...localFS }; const tp = nf[rd] ? rd : (rd.substring(0, rd.lastIndexOf("/")) || "/"); const tn = nf[rd] ? fn : rd.substring(rd.lastIndexOf("/") + 1);
          if (!nf[tp]) nf = ensureLocalDir(tp, nf);
          nf[tp] = { ...nf[tp], files: { ...(nf[tp].files || {}), [tn]: hn.content || `[Contenido de ${hs}]` }, children: [...new Set([...(nf[tp].children || []), tn])] };
          setLocalFS(nf); return [];
        }
        if (flag === "-cat") {
          const t = tokens[3]; if (!t) return [out("cat: falta ruta", "error")];
          const n = hdfsFS[t]; if (!n) return [out(`cat: '${t}': No such file or directory`, "error")];
          let c = n.content || "";
          for (let pi = 1; pi < pipes.length; pi++) {
            const pt = pipes[pi].trim();
            if (pt.startsWith("head")) { const num = parseInt(pt.match(/-n?\s*(\d+)/)?.[1] || pt.match(/-(\d+)/)?.[1]) || 10; c = c.split("\n").slice(0, num).join("\n"); }
            else if (pt.startsWith("tail")) { const num = parseInt(pt.match(/-n?\s*(\d+)/)?.[1] || pt.match(/-(\d+)/)?.[1]) || 10; c = c.split("\n").slice(-num).join("\n"); }
          }
          return [out(c)];
        }
        if (flag === "-rm") {
          const rec = tokens.includes("-r"); const t = tokens.find((x, i) => i > 2 && !x.startsWith("-"));
          if (!t) return [out("rm: falta ruta", "error")];
          let nf = { ...hdfsFS }; const par = t.substring(0, t.lastIndexOf("/")) || "/"; const nm = t.substring(t.lastIndexOf("/") + 1);
          if (rec) Object.keys(nf).forEach(k => { if (k === t || k.startsWith(t + "/")) delete nf[k]; }); else delete nf[t];
          if (nf[par]) nf[par] = { ...nf[par], children: (nf[par].children || []).filter(c => c !== nm) };
          setHdfsFS(nf); return [out(`Deleted ${t}`)];
        }
        if (flag === "-chmod") return [];
        if (flag === "-cp") {
          const aa = tokens.slice(3).filter(t => !t.startsWith("-"));
          if (aa.length < 2) return [out("cp: faltan operandos", "error")];
          const d = aa[aa.length - 1]; const ss = aa.slice(0, -1);
          let nf = { ...hdfsFS };
          for (const s of ss) {
            if (s.includes("*")) {
              const dir = s.substring(0, s.lastIndexOf("/")); const dn = nf[dir];
              if (dn) for (const ch of (dn.children || [])) { const sp = `${dir}/${ch}`; if (nf[sp]) { if (!nf[d]) nf = ensureHdfsDir(d, nf); nf[`${d}/${ch}`] = { ...nf[sp] }; nf[d] = { ...nf[d], children: [...new Set([...(nf[d].children || []), ch])] }; } }
            } else {
              const sn = nf[s]; if (sn) { const nm = s.substring(s.lastIndexOf("/") + 1); if (!nf[d]) nf = ensureHdfsDir(d, nf); nf[`${d}/${nm}`] = { ...sn }; nf[d] = { ...nf[d], children: [...new Set([...(nf[d].children || []), nm])] }; }
            }
          }
          setHdfsFS(nf); return [];
        }
        if (flag === "-createSnapshot") {
          const dir = tokens[3]; const sn = tokens[4];
          if (!dir || !sn) return [out("Usage: hdfs dfs -createSnapshot <dir> <name>", "error")];
          if (!hdfsSnapEnabled.has(dir)) return [out(`${dir}: Snapshottable directory is not enabled. Use hdfs dfsadmin -allowSnapshot ${dir}`, "error")];
          if (!hdfsFS[dir]) return [out(`createSnapshot: '${dir}': No such file or directory`, "error")];
          const ss = {}; Object.keys(hdfsFS).forEach(k => { if (k === dir || k.startsWith(dir + "/")) ss[k] = { ...hdfsFS[k] }; });
          setHdfsSnapshots(prev => ({ ...prev, [`${dir}/${sn}`]: ss }));
          let nf = { ...hdfsFS }; const sd = `${dir}/.snapshot`;
          if (!nf[sd]) nf[sd] = { type: "dir", children: [sn], owner: "hadoop", group: "supergroup", perms: "drwxr-xr-x" };
          else nf[sd] = { ...nf[sd], children: [...new Set([...(nf[sd].children || []), sn])] };
          const sp = `${sd}/${sn}`; const on = nf[dir];
          nf[sp] = { type: "dir", children: [...(on.children || [])], owner: "hadoop", group: "supergroup", perms: "drwxr-xr-x" };
          for (const ch of (on.children || [])) { const src = `${dir}/${ch}`; if (nf[src]) nf[`${sp}/${ch}`] = { ...nf[src] }; }
          setHdfsFS(nf); return [out(`Created snapshot ${sd}/${sn}`, "success")];
        }
        if (flag === "-deleteSnapshot") {
          const dir = tokens[3]; const sn = tokens[4];
          if (!dir || !sn) return [out("Usage: hdfs dfs -deleteSnapshot <dir> <name>", "error")];
          setHdfsSnapshots(prev => { const n = { ...prev }; delete n[`${dir}/${sn}`]; return n; });
          let nf = { ...hdfsFS }; const sd = `${dir}/.snapshot`;
          if (nf[sd]) nf[sd] = { ...nf[sd], children: (nf[sd].children || []).filter(c => c !== sn) };
          delete nf[`${sd}/${sn}`]; setHdfsFS(nf);
          return [out(`Deleted snapshot ${sn} under ${dir}`, "success")];
        }
        return [out(`hdfs dfs: Unknown command: ${flag}`, "error")];
      }
      if (sub === "dfsadmin") {
        const flag = tokens[2];
        if (flag === "-report") {
          const u = Object.keys(hdfsFS).filter(k => hdfsFS[k].type === "file").length;
          return [out(`Configured Capacity: 53687091200 (50.00 GB)\nPresent Capacity: 48318382080 (45.00 GB)\nDFS Remaining: ${(45 - u * 0.001).toFixed(2)} GB\nDFS Used: ${(u * 1024).toLocaleString()} (${u} files)\nDFS Used%: ${(u * 0.002).toFixed(2)}%\nReplicated Blocks:\n\tUnder replicated blocks: 0\n\tBlocks with corrupt replicas: 0\n\tMissing blocks: 0\n\n-------------------------------------------------\nLive datanodes (1):\n\nName: 127.0.0.1:9866 (localhost)\nHostname: hadoop-VirtualBox\nDecommission Status : Normal\nConfigured Capacity: 53687091200 (50.00 GB)\nDFS Used: ${(u * 1024).toLocaleString()}\nDFS Remaining: ${(45 - u * 0.001).toFixed(2)} GB\nLast contact: Tue Mar 03 10:00:00 COT 2026`)];
        }
        if (flag === "-safemode") {
          const a = tokens[3];
          if (a === "enter") { setSafeMode(true); return [out("Safe mode is ON", "warn")]; }
          if (a === "leave") { setSafeMode(false); return [out("Safe mode is OFF", "success")]; }
          if (a === "get") return [out(`Safe mode is ${safeMode ? "ON" : "OFF"}`)];
          return [out("Usage: hdfs dfsadmin -safemode enter|leave|get", "error")];
        }
        if (flag === "-saveNamespace") {
          if (!safeMode) return [out("saveNamespace: Safe mode should be turned ON.\nUse: hdfs dfsadmin -safemode enter", "error")];
          const nc = fsimageCounter + 1; setFsimageCounter(nc);
          let nf = { ...localFS }; const fi = `fsimage_${String(nc).padStart(19, "0")}`; const md = fi + ".md5"; const ed = `edits_inprogress_${String(nc + 1).padStart(19, "0")}`;
          const mkH = () => Array.from({ length: 32 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
          nf["/datos/namenode/current"] = { ...nf["/datos/namenode/current"], children: [...(nf["/datos/namenode/current"]?.children || []), fi, md, ed], files: { ...(nf["/datos/namenode/current"]?.files || {}), [fi]: "[binary fsimage data]", [md]: mkH(), [ed]: "[binary edits data]" } };
          setLocalFS(nf); return [out(`Save namespace successful.\nNew fsimage: ${fi}`, "success")];
        }
        if (flag === "-allowSnapshot") {
          const d = tokens[3]; if (!d) return [out("Usage: hdfs dfsadmin -allowSnapshot <dir>", "error")];
          if (!hdfsFS[d]) return [out(`allowSnapshot: '${d}': No such file or directory`, "error")];
          setHdfsSnapEnabled(prev => new Set([...prev, d]));
          return [out(`Allowing snapshot on ${d} succeeded`, "success")];
        }
        if (flag === "-disallowSnapshot") {
          const d = tokens[3]; setHdfsSnapEnabled(prev => { const n = new Set(prev); n.delete(d); return n; });
          return [out(`Disallowing snapshot on ${d} succeeded`, "success")];
        }
        return [out(`hdfs dfsadmin: Unknown command: ${flag}`, "error")];
      }
      if (sub === "fsck") {
        const t = tokens[2] || "/"; const det = tokens.includes("-files") || tokens.includes("-blocks");
        const fc = Object.keys(hdfsFS).filter(k => hdfsFS[k].type === "file").length;
        const dc = Object.keys(hdfsFS).filter(k => hdfsFS[k].type === "dir").length;
        let r = `Connecting to namenode via http://localhost:9870/fsck?ugi=hadoop&path=${t}\nFSCK started by hadoop from /127.0.0.1 for path ${t}`;
        if (det) Object.keys(hdfsFS).filter(k => hdfsFS[k].type === "file").forEach(k => { r += `\n${k} ${hdfsFS[k].size || 1024} bytes, replication=1, 1 block(s): OK`; });
        r += `\n\nStatus: HEALTHY\n Total size:    ${fc * 1024} B\n Total dirs:    ${dc}\n Total files:   ${fc}\n Total blocks (validated): ${fc}\n\nThe filesystem under path '${t}' is HEALTHY`;
        return [out(r)];
      }
      return [out(`hdfs: Unknown command: ${sub}`, "error")];
    }

    // ── YARN ──
    if (base === "yarn") {
      if (!services.resourcemanager) return [out("✗ YARN no está iniciado. Ejecuta: cd /opt/hadoop/sbin && ./start-yarn.sh", "error")];
      const sub = tokens[1];
      if (sub === "node") {
        let o = "Total Nodes:1\n         Node-Id\t     Node-State\tNode-Http-Address\tNumber-of-Running-Containers\nhadoop-VirtualBox:45454\t       RUNNING\thadoop-VirtualBox:8042\t\t\t\t   0";
        if (tokens.includes("-showDetails") || tokens.includes("--showDetails")) o += "\n   Rack: /default-rack\n   ResourceUtilization: Memory: 3200/4096 MB, VCores: 1/4";
        return [out(o)];
      }
      if (sub === "application") {
        const f = tokens[2];
        if (f === "-list") {
          const active = yarnApps.filter(a => ["RUNNING", "SUBMITTED", "ACCEPTED"].includes(a.state));
          if (active.length === 0) return [out("Total number of applications: 0")];
          return [out(`Total number of applications: ${active.length}\n${active.map(a => `application_1700000000000_${String(a.id).padStart(4, "0")}\t${a.name}\tMAPREDUCE\thadoop\tdefault\t${a.state}`).join("\n")}`)];
        }
        if (f === "-status") {
          const aid = tokens[3]; if (!aid) return [out("Usage: yarn application -status <App ID>", "error")];
          const idn = parseInt(aid.split("_").pop()); const app = yarnApps.find(a => a.id === idn);
          if (!app) return [out(`Application with id '${aid}' doesn't exist in RM.`, "error")];
          return [out(`Application Report :\n\tApplication-Id : ${aid}\n\tApplication-Name : ${app.name}\n\tApplication-Type : MAPREDUCE\n\tUser : hadoop\n\tQueue : default\n\tState : ${app.state}\n\tFinal-State : ${app.state === "FINISHED" ? "SUCCEEDED" : "UNDEFINED"}\n\tProgress : ${app.state === "FINISHED" ? "100" : "0"}%\n\tTracking-URL : http://hadoop-VirtualBox:${app.state === "FINISHED" ? "19888" : "8088"}/proxy/${aid}/`)];
        }
        if (f === "-kill") { const aid = tokens[3]; const idn = parseInt(aid?.split("_").pop()); setYarnApps(prev => prev.map(a => a.id === idn ? { ...a, state: "KILLED" } : a)); return [out(`✓ Application ${aid} killed.`, "success")]; }
        return [out(`yarn application: Unknown: ${f}`, "error")];
      }
      if (sub === "applicationattempt") {
        const aid = tokens[3]; if (!aid) return [out("Usage: yarn applicationattempt -list <App ID>", "error")];
        return [out(`Total application attempts: 1\nappattempt_${aid.replace("application_", "")}_000001\tRUNNING\tcontainer_${aid.replace("application_", "")}_01_000001`)];
      }
      if (sub === "container") {
        const atid = tokens[3]; if (!atid) return [out("Usage: yarn container -list <Attempt Id>", "error")];
        const cid = atid.replace("appattempt_", "");
        return [out(`Total containers: 2\ncontainer_${cid}_000001\tRUNNING\thadoop-VirtualBox:45454\ncontainer_${cid}_000002\tRUNNING\thadoop-VirtualBox:45454`)];
      }
      return [out(`yarn: Unknown command: ${sub}`, "error")];
    }

    // ── hadoop jar ──
    if (base === "hadoop" && tokens[1] === "jar") {
      if (!services.resourcemanager) return [out("Error: YARN no está activo.", "error")];
      const jar = tokens[2] || ""; const jt = tokens[3] || "";

      if (jar.includes("tests.jar") || jt === "TestDFSIO") {
        const mode = tokens.includes("-write") ? "write" : "read";
        const nrF = parseInt(tokens.find((t, i) => tokens[i - 1] === "-nrFiles") || "10");
        const fS = parseInt(tokens.find((t, i) => tokens[i - 1] === "-fileSize") || "100");
        const aid = appCounter; setAppCounter(c => c + 1);
        setYarnApps(prev => [...prev, { id: aid, name: `TestDFSIO-${mode}`, state: "FINISHED", port: 19888 }]);
        let nf = ensureHdfsDir("/benchmarks/TestDFSIO", { ...hdfsFS });
        nf[`/benchmarks/TestDFSIO/io_${mode}`] = { type: "file", content: generateBenchmarkOutput(mode, nrF, fS), size: 512, owner: "hadoop", group: "supergroup" };
        if (!nf["/benchmarks"].children.includes("TestDFSIO")) nf["/benchmarks"] = { ...nf["/benchmarks"], children: [...nf["/benchmarks"].children, "TestDFSIO"] };
        setHdfsFS(nf);
        return [out(`26/03/03 10:00:00 INFO mapreduce.Job: Running job: job_1700000000000_${String(aid).padStart(4, "0")}\n26/03/03 10:00:05 INFO mapreduce.Job: map 0% reduce 0%\n26/03/03 10:00:15 INFO mapreduce.Job: map 50% reduce 0%\n26/03/03 10:00:25 INFO mapreduce.Job: map 100% reduce 0%\n26/03/03 10:00:35 INFO mapreduce.Job: map 100% reduce 100%\n26/03/03 10:00:36 INFO mapreduce.Job: Job completed successfully\n\n${generateBenchmarkOutput(mode, nrF, fS)}`, "success")];
      }

      if (jt === "grep") {
        const inp = tokens[4]; const outp = tokens[5]; const regex = tokens.slice(6).join(" ").replace(/^['"]|['"]$/g, "");
        if (!inp || !outp) return [out("Usage: hadoop jar <jar> grep <in> <out> '<regex>'", "error")];
        if (hdfsFS[outp]) return [out(`Output directory ${outp} already exists.\n✗ Bórralo con: hdfs dfs -rm -r ${outp}`, "error")];
        const inode = hdfsFS[inp]; if (!inode) return [out(`Input path does not exist: ${inp}`, "error")];
        let all = "";
        if (inode.type === "dir") { for (const ch of (inode.children || [])) { const cp = `${inp}/${ch}`; if (hdfsFS[cp]?.content) all += hdfsFS[cp].content + "\n"; } }
        else all = inode.content || "";
        let matches = {};
        try { const re = new RegExp(regex, "gi"); for (const line of all.split("\n")) { const m = line.match(re); if (m) for (const x of m) { const k = x.toLowerCase(); matches[k] = (matches[k] || 0) + 1; } } } catch { matches["(regex error)"] = 0; }
        const sorted = Object.entries(matches).sort((a, b) => b[1] - a[1]);
        const rc = sorted.length > 0 ? sorted.map(([k, v]) => `${v}\t${k}`).join("\n") : "(sin coincidencias)";
        let nf = ensureHdfsDir(outp, { ...hdfsFS });
        nf[`${outp}/part-r-00000`] = { type: "file", content: rc, size: rc.length, owner: "hadoop", group: "supergroup" };
        nf[`${outp}/_SUCCESS`] = { type: "file", content: "", size: 0, owner: "hadoop", group: "supergroup" };
        nf[outp] = { ...nf[outp], children: [...new Set([...(nf[outp].children || []), "part-r-00000", "_SUCCESS"])] };
        setHdfsFS(nf);
        const aid = appCounter; setAppCounter(c => c + 1);
        setYarnApps(prev => [...prev, { id: aid, name: "grep-search", state: "FINISHED", port: 19888 }]);
        return [out(`26/03/03 10:00:00 INFO client.RMProxy: Connecting to ResourceManager\n26/03/03 10:00:02 INFO mapreduce.Job: Running job: job_1700000000000_${String(aid).padStart(4, "0")}\n26/03/03 10:00:10 INFO mapreduce.Job: map 0% reduce 0%\n26/03/03 10:00:20 INFO mapreduce.Job: map 100% reduce 0%\n26/03/03 10:00:30 INFO mapreduce.Job: map 100% reduce 100%\n26/03/03 10:00:31 INFO mapreduce.Job: Job completed successfully\n\n✓ Verifica con: hdfs dfs -cat ${outp}/part-r-00000 | head`, "success")];
      }

      // wordcount / custom
      if (tokens.length >= 5) {
        const inp = tokens[tokens.length - 2]; const outp = tokens[tokens.length - 1];
        if (hdfsFS[outp]) return [out(`Output directory ${outp} already exists. Bórralo con: hdfs dfs -rm -r ${outp}`, "error")];
        const inode = hdfsFS[inp]; if (!inode) return [out(`Input path does not exist: ${inp}`, "error")];
        let all = "";
        if (inode.type === "dir") { for (const ch of (inode.children || [])) { const p = `${inp}/${ch}`; if (hdfsFS[p]?.content) all += hdfsFS[p].content + "\n"; } }
        else all = inode.content || "";
        const words = {}; all.split(/\s+/).filter(Boolean).forEach(w => { const k = w.replace(/[^a-zA-Z0-9_.-]/g, ""); if (k) words[k] = (words[k] || 0) + 1; });
        const ws = Object.entries(words).sort((a, b) => a[0].localeCompare(b[0]));
        const rc = ws.map(([k, v]) => `${k}\t${v}`).join("\n");
        let nf = ensureHdfsDir(outp, { ...hdfsFS });
        nf[`${outp}/part-r-00000`] = { type: "file", content: rc, size: rc.length, owner: "hadoop", group: "supergroup" };
        nf[`${outp}/_SUCCESS`] = { type: "file", content: "", size: 0, owner: "hadoop", group: "supergroup" };
        nf[outp] = { ...nf[outp], children: ["part-r-00000", "_SUCCESS"] };
        setHdfsFS(nf);
        const aid = appCounter; setAppCounter(c => c + 1);
        setYarnApps(prev => [...prev, { id: aid, name: jt || "wordcount", state: "FINISHED", port: 19888 }]);
        return [out(`26/03/03 10:00:00 INFO mapreduce.Job: Running job: job_1700000000000_${String(aid).padStart(4, "0")}\n26/03/03 10:00:15 INFO mapreduce.Job: map 100% reduce 100%\n26/03/03 10:00:31 INFO mapreduce.Job: Job completed successfully\n\n✓ Verifica con: hdfs dfs -cat ${outp}/part-r-00000 | head`, "success")];
      }
      return [out("hadoop jar: No se reconoce el job. Usa grep, wordcount, o TestDFSIO.", "error")];
    }

    if (base === "javac") {
      const f = tokens.find(t => t.endsWith(".java")); if (!f) return [out("javac: no source files", "error")];
      const nm = f.replace(".java", "");
      let nf = { ...localFS };
      if (nf[cwd]) { const cls = [`${nm}.class`, `${nm}$TokenizerMapper.class`, `${nm}$IntSumReducer.class`]; nf[cwd] = { ...nf[cwd], children: [...new Set([...(nf[cwd].children || []), ...cls])], files: { ...(nf[cwd].files || {}), ...Object.fromEntries(cls.map(c => [c, `[bytecode: ${c}]`])) } }; }
      setLocalFS(nf); return [out(`✓ Compilación exitosa: ${nm}.class, ${nm}$TokenizerMapper.class, ${nm}$IntSumReducer.class`, "success")];
    }

    if (base === "jar" && tokens[1] === "cf") {
      const jn = tokens[2]; if (!jn) return [out("jar: faltan argumentos", "error")];
      let nf = { ...localFS };
      if (nf[cwd]) nf[cwd] = { ...nf[cwd], children: [...new Set([...(nf[cwd].children || []), jn])], files: { ...(nf[cwd].files || {}), [jn]: `[JAR: ${jn}]` } };
      setLocalFS(nf); return [out(`✓ ${jn} creado correctamente`, "success")];
    }

    if (["nano", "vim", "vi", "gedit"].includes(base)) return [out(`(Simulación: ${base} no disponible. Usa 'cat' para ver archivos.)`, "warn")];
    return [out(`bash: ${base}: comando no encontrado`, "error")];
  }, [cwd, services, localFS, hdfsFS, safeMode, hdfsSnapEnabled, hdfsSnapshots, appCounter, fsimageCounter, out, resolvePath, getLocalNode, ensureHdfsDir, ensureLocalDir, formatLsSingle, yarnApps, getDirItems]);

  const handleSubmit = () => {
    const cmd = input.trim(); if (!cmd) return;
    const prompt = { type: "prompt", text: `hadoop@hadoop-VirtualBox:${cwd === "/home/hadoop" ? "~" : cwd}$ ${cmd}` };
    setHistory(prev => [cmd, ...prev]); setHistIdx(-1); setInput("");
    const results = processCommand(cmd);
    if (results.some(r => r.type === "clear")) setLines([]); else setLines(prev => [...prev, prompt, ...results]);
  };

  // ── Tab: autocomplete commands AND paths ──
  const handleTab = useCallback(() => {
    const toks = input.split(" ");
    const last = toks[toks.length - 1] || "";
    const isFirst = toks.length === 1;

    if (isFirst) {
      const cmds = ["hdfs", "hadoop", "yarn", "mapred", "jps", "ls", "cd", "pwd", "mkdir", "cat", "cp", "mv", "rm", "chmod", "touch", "ps", "top", "hostname", "uname", "free", "df", "lscpu", "echo", "clear", "help", "whoami", "head", "tail", "grep", "javac", "jar", "ssh", "scp", "md5sum", "lsb_release", "wc"];
      const matches = cmds.filter(c => c.startsWith(last));
      if (matches.length === 1) { toks[toks.length - 1] = matches[0] + " "; setInput(toks.join(" ")); }
      else if (matches.length > 1) { let pf = last; for (let i = last.length; ; i++) { const ch = matches.map(m => m[i]).filter(Boolean); if (!ch.length || new Set(ch).size > 1) break; pf += ch[0]; } toks[toks.length - 1] = pf; setInput(toks.join(" ")); }
      return;
    }

    // Path autocomplete
    let dir, prefix;
    if (last.includes("/")) {
      const li = last.lastIndexOf("/"); dir = last.substring(0, li) || "/"; prefix = last.substring(li + 1);
    } else { dir = "."; prefix = last; }

    const rd = resolvePath(dir, cwd);
    const dn = localFS?.[rd];
    if (!dn) return;
    const items = getDirItems(dn);
    const matches = items.filter(i => i.startsWith(prefix));
    if (matches.length === 0) return;

    let completion;
    if (matches.length === 1) {
      completion = matches[0];
      const cp = rd === "/" ? `/${completion}` : `${rd}/${completion}`;
      if (localFS[cp]) completion += "/";
    } else {
      let common = prefix;
      for (let i = prefix.length; ; i++) { const ch = matches.map(m => m[i]).filter(Boolean); if (!ch.length || new Set(ch).size > 1) break; common += ch[0]; }
      completion = common;
    }

    toks[toks.length - 1] = last.includes("/") ? last.substring(0, last.lastIndexOf("/") + 1) + completion : completion;
    setInput(toks.join(" "));
  }, [input, cwd, localFS, resolvePath, getDirItems]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
    else if (e.key === "ArrowUp") { e.preventDefault(); if (history.length > 0) { const ni = Math.min(histIdx + 1, history.length - 1); setHistIdx(ni); setInput(history[ni]); } }
    else if (e.key === "ArrowDown") { e.preventDefault(); if (histIdx > 0) { setHistIdx(histIdx - 1); setInput(history[histIdx - 1]); } else { setHistIdx(-1); setInput(""); } }
    else if (e.key === "Tab") { e.preventDefault(); handleTab(); }
  };

  const svcDot = (on) => <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: on ? "#4ade80" : "#ef4444", marginRight: 4, boxShadow: on ? "0 0 6px #4ade80" : "0 0 4px #ef4444" }} />;

  if (!localFS || !hdfsFS) return <div style={{ background: "#0d0d0d", color: "#ccc", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace" }}>Cargando sistema...</div>;

  return (
    <div style={{ height: "100vh", minWidth: "100wh", display: "flex", flexDirection: "column", background: "#0a0a0a", fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'SF Mono', monospace", color: "#e0e0e0", overflow: "hidden" }}>
      {/* Title Bar */}
      <div style={{ background: "linear-gradient(180deg, #3a3a3a 0%, #2b2b2b 100%)", borderBottom: "1px solid #1a1a1a", padding: "6px 16px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57", border: "1px solid #e0443e" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e", border: "1px solid #d4a123" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840", border: "1px solid #1aab29" }} />
        </div>
        <span style={{ fontSize: 12, color: "#999", flex: 1, textAlign: "center", letterSpacing: 0.5 }}>hadoop@hadoop-VirtualBox: {cwd === "/home/hadoop" ? "~" : cwd}</span>
        <span style={{ fontSize: 10, color: "#666" }}>Ubuntu 22.04</span>
      </div>

      {/* Services */}
      <div style={{ background: "#111", borderBottom: "1px solid #222", padding: "5px 12px", display: "flex", gap: 14, fontSize: 11, flexShrink: 0, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ color: "#666", fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>Servicios:</span>
        {[["namenode", "NameNode"], ["datanode", "DataNode"], ["secondarynamenode", "2NN"]].map(([k, l]) => <span key={k} style={{ display: "flex", alignItems: "center" }}>{svcDot(services[k])}<span style={{ color: services[k] ? "#8f8" : "#666" }}>{l}</span></span>)}
        <span style={{ color: "#333" }}>│</span>
        {[["resourcemanager", "RM"], ["nodemanager", "NM"], ["historyserver", "HS"]].map(([k, l]) => <span key={k} style={{ display: "flex", alignItems: "center" }}>{svcDot(services[k])}<span style={{ color: services[k] ? "#8f8" : "#666" }}>{l}</span></span>)}
        <span style={{ color: "#333" }}>│</span>
        <span style={{ color: safeMode ? "#fbbf24" : "#555", fontSize: 10 }}>{safeMode ? "⚠ SAFE MODE" : "Safe Mode: OFF"}</span>
      </div>

      {/* Tabs */}
      <div style={{ background: "#0f0f0f", borderBottom: "1px solid #1a1a1a", padding: "0 8px", display: "flex", fontSize: 11, flexShrink: 0 }}>
        {[["terminal", "Terminal"], ["guide", "Guía Rápida"]].map(([id, label]) => (
          <button key={id} onClick={() => { setTabHighlight(id); setShowHelp(id === "guide"); }} style={{ padding: "7px 14px", background: tabHighlight === id ? "#1a1a1a" : "transparent", color: tabHighlight === id ? "#e0e0e0" : "#666", border: "none", borderBottom: tabHighlight === id ? "2px solid #e2854b" : "2px solid transparent", cursor: "pointer", fontFamily: "inherit", fontSize: 11 }}>{label}</button>
        ))}
      </div>

      {/* Content */}
      {showHelp ? (
        <div style={{ flex: 1, overflow: "auto", padding: "12px 16px", fontSize: 12, lineHeight: 1.7, color: "#bbb" }}>
          <h3 style={{ color: "#e2854b", margin: "0 0 12px", fontSize: 14, fontWeight: 600 }}>Guía Rápida — Parcial Big Data</h3>
          <div style={{ display: "grid", gap: 10 }}>
            {[
              { title: "1. Arrancar el clúster", cmds: ["cd /opt/hadoop/sbin", "./start-dfs.sh", "./start-yarn.sh", "jps"] },
              { title: "2. Subir archivo a HDFS", cmds: ["hdfs dfs -mkdir /log-nodemanager", "cp /opt/hadoop/logs/hadoop-hadoop-nodemanager-hadoop-VirtualBox.log /tmp/", "hdfs dfs -put /tmp/hadoop-hadoop-nodemanager-hadoop-VirtualBox.log /log-nodemanager/"] },
              { title: "3. Grep MapReduce", cmds: ["cd /opt/hadoop/share/hadoop/mapreduce", "hadoop jar hadoop-mapreduce-examples-3.4.1.jar grep /log-nodemanager /resultado_lognm 'transitioned from'", "hdfs dfs -cat /resultado_lognm/part-r-00000 | head"] },
              { title: "4. Snapshot HDFS", cmds: ["hdfs dfsadmin -allowSnapshot /log-nodemanager", "hdfs dfs -createSnapshot /log-nodemanager snap_antes", "hdfs dfs -ls /log-nodemanager/.snapshot", "hdfs dfs -rm /log-nodemanager/hadoop-hadoop-nodemanager-hadoop-VirtualBox.log", "hdfs dfs -cp /log-nodemanager/.snapshot/snap_antes/* /log-nodemanager/"] },
              { title: "5. Checkpoint (fsimage)", cmds: ["ls -lh /datos/namenode/current", "hdfs dfsadmin -safemode enter", "hdfs dfsadmin -saveNamespace", "hdfs dfsadmin -safemode leave", "ls -lh /datos/namenode/current"] },
              { title: "6. Benchmark TestDFSIO", cmds: ["hadoop jar hadoop-mapreduce-client-jobclient-3.4.1-tests.jar TestDFSIO -write -nrFiles 10 -fileSize 100"] },
              { title: "7. YARN CLI", cmds: ["yarn node -list", "yarn application -list"] },
            ].map((s, i) => (
              <div key={i} style={{ background: "#151515", border: "1px solid #222", borderRadius: 6, padding: "8px 12px" }}>
                <div style={{ color: "#e2854b", fontWeight: 600, marginBottom: 4, fontSize: 12 }}>{s.title}</div>
                {s.cmds.map((c, j) => (
                  <div key={j} onClick={() => { setInput(c); setTabHighlight("terminal"); setShowHelp(false); setTimeout(() => inputRef.current?.focus(), 50); }} style={{ padding: "2px 8px", margin: "1px 0", background: "#0d0d0d", borderRadius: 3, cursor: "pointer", color: "#8ec07c", fontSize: 11.5, fontFamily: "inherit" }} onMouseEnter={e => e.target.style.background = "#1a2a1a"} onMouseLeave={e => e.target.style.background = "#0d0d0d"}>$ {c}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div ref={termRef} onClick={focusInput} style={{ flex: 1, overflow: "auto", padding: "8px 14px", cursor: "text", width: "100%", boxSizing: "border-box" }}>
          {lines.map((line, i) => {
            let color = "#e0e0e0";
            if (line.type === "prompt") color = "#8ec07c";
            if (line.type === "error") color = "#fb4934";
            if (line.type === "warn") color = "#fabd2f";
            if (line.type === "success") color = "#b8bb26";
            if (line.type === "system") color = "#83a598";
            if (line.type === "help") color = "#d3869b";
            return <pre key={i} style={{ margin: 0, padding: line.type === "prompt" ? "6px 0 0" : "0 0 1px", fontFamily: "inherit", fontSize: 12.5, lineHeight: 1.5, color, whiteSpace: "pre-wrap", wordBreak: "break-all", textAlign: "left" }}>{line.text}</pre>;
          })}
          <div style={{ display: "flex", alignItems: "center", marginTop: 4 }}>
            <span style={{ color: "#b8bb26", fontSize: 12.5, flexShrink: 0, fontWeight: 600 }}>hadoop@hadoop-VirtualBox</span>
            <span style={{ color: "#666", margin: "0 2px", fontSize: 12.5 }}>:</span>
            <span style={{ color: "#83a598", fontSize: 12.5, flexShrink: 0 }}>{cwd === "/home/hadoop" ? "~" : cwd}</span>
            <span style={{ color: "#e0e0e0", margin: "0 4px 0 2px", fontSize: 12.5 }}>$</span>
            <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} autoFocus spellCheck={false} style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#e0e0e0", fontFamily: "inherit", fontSize: 12.5, caretColor: "#e2854b", lineHeight: 1.5, padding: 0, margin: 0 }} />
          </div>
        </div>
      )}

      <div style={{ background: "#111", borderTop: "1px solid #1a1a1a", padding: "4px 12px", fontSize: 10, color: "#444", display: "flex", justifyContent: "space-between", flexShrink: 0 }}>
        <span>Big Data 2026-I — Simulador Hadoop</span>
        <span>Tab: autocompletar rutas y comandos · ↑↓: historial · help: comandos</span>
      </div>
    </div>
  );
}