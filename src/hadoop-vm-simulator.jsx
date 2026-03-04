import { useState, useRef, useEffect, useCallback } from "react";

// ─── Simulated State Factory ───────────────────────────────────────
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

  const hdfsFS = {
    "/": { type: "dir", children: [], owner: "hadoop", group: "supergroup", perms: "drwxr-xr-x" },
  };

  return { localFS, hdfsFS };
}

function generateNodeManagerLog() {
  const lines = [];
  const ts = "2026-02-";
  for (let i = 1; i <= 30; i++) {
    const d = String(i).padStart(2, "0");
    lines.push(`${ts}${d} 08:00:01,234 INFO org.apache.hadoop.yarn.server.nodemanager.NodeManager: transitioned from INITED to STARTED`);
    lines.push(`${ts}${d} 08:00:02,567 INFO org.apache.hadoop.yarn.server.nodemanager.containermanager.ContainerManagerImpl: Starting resource-monitoring for container_1700000000000_000${i}_01_000001`);
    lines.push(`${ts}${d} 08:05:15,890 INFO org.apache.hadoop.yarn.server.nodemanager.containermanager.container.ContainerImpl: Container container_1700000000000_000${i}_01_000001 succeeded`);
    if (i % 7 === 0) {
      lines.push(`${ts}${d} 08:06:00,111 WARN org.apache.hadoop.yarn.server.nodemanager.containermanager.container.ContainerImpl: Container container_1700000000000_000${i}_01_000002 failed`);
    }
    lines.push(`${ts}${d} 08:00:01,500 INFO org.apache.hadoop.yarn.server.nodemanager.NodeStatusUpdaterImpl: transitioned from STARTED to RUNNING`);
  }
  return lines.join("\n");
}

function generateResourceManagerLog() {
  const lines = [];
  const ts = "2026-02-";
  for (let i = 1; i <= 25; i++) {
    const d = String(i).padStart(2, "0");
    lines.push(`${ts}${d} 08:00:00,100 INFO org.apache.hadoop.yarn.server.resourcemanager.ResourceManager: State change from NEW to SUBMITTED for application_1700000000000_000${i}`);
    lines.push(`${ts}${d} 08:00:01,200 INFO org.apache.hadoop.yarn.server.resourcemanager.ResourceManager: State change from SUBMITTED to ACCEPTED for application_1700000000000_000${i}`);
    lines.push(`${ts}${d} 08:00:05,300 INFO org.apache.hadoop.yarn.server.resourcemanager.scheduler.capacity.CapacityScheduler: Assigned container container_1700000000000_000${i}_01_000001 of capacity <memory:1024, vCores:1>`);
    lines.push(`${ts}${d} 08:01:00,400 INFO org.apache.hadoop.yarn.server.resourcemanager.rmnode.RMNodeImpl: NodeManager from node hadoop-VirtualBox:45454 registered with capability: <memory:4096, vCores:4>`);
    if (i % 10 === 0) {
      lines.push(`${ts}${d} 09:00:00,500 WARN org.apache.hadoop.yarn.server.resourcemanager.rmnode.RMNodeImpl: Node hadoop-VirtualBox:45454 has shutdown gracefully`);
    }
  }
  return lines.join("\n");
}

function generateBenchmarkOutput(mode, nrFiles, fileSize) {
  const rate = mode === "write" ? (45 + Math.random() * 30).toFixed(2) : (80 + Math.random() * 40).toFixed(2);
  const avg = (parseFloat(rate) / nrFiles).toFixed(2);
  return [
    `26/03/03 10:00:00 INFO fs.TestDFSIO: ----- TestDFSIO ----- : ${mode}`,
    `26/03/03 10:00:00 INFO fs.TestDFSIO:             Date & time: Tue Mar 03 10:00:00 COT 2026`,
    `26/03/03 10:00:00 INFO fs.TestDFSIO:         Number of files: ${nrFiles}`,
    `26/03/03 10:00:00 INFO fs.TestDFSIO:  Total MBytes processed: ${nrFiles * fileSize}`,
    `26/03/03 10:00:00 INFO fs.TestDFSIO:       Throughput mb/sec: ${rate}`,
    `26/03/03 10:00:00 INFO fs.TestDFSIO:  Average IO rate mb/sec: ${avg}`,
    `26/03/03 10:00:00 INFO fs.TestDFSIO:   IO rate std deviation: ${(Math.random() * 5).toFixed(2)}`,
    `26/03/03 10:00:00 INFO fs.TestDFSIO:      Test exec time sec: ${(10 + Math.random() * 20).toFixed(1)}`,
    `26/03/03 10:00:00 INFO fs.TestDFSIO:`,
  ].join("\n");
}

// ─── Main Component ────────────────────────────────────────────────
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
  const [env, setEnv] = useState({ HADOOP_HOME: "/opt/hadoop", JAVA_HOME: "/usr/lib/jvm/java-11-openjdk-amd64", USER: "hadoop", HOME: "/home/hadoop", HOSTNAME: "hadoop-VirtualBox" });
  const termRef = useRef(null);
  const inputRef = useRef(null);
  const [showHelp, setShowHelp] = useState(false);
  const [tabHighlight, setTabHighlight] = useState("terminal");

  useEffect(() => {
    const s = createInitialState();
    setLocalFS(s.localFS);
    setHdfsFS(s.hdfsFS);
  }, []);

  useEffect(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
  }, [lines]);

  const focusInput = () => inputRef.current?.focus();

  const out = useCallback((text, type = "output") => {
    return { type, text };
  }, []);

  const resolvePath = useCallback((p, base) => {
    if (!p) return base;
    let parts;
    if (p.startsWith("/")) { parts = p.split("/").filter(Boolean); }
    else if (p === "~" || p.startsWith("~/")) {
      const rest = p.slice(1).replace(/^\//, "");
      parts = ["home", "hadoop", ...rest.split("/").filter(Boolean)];
    } else {
      parts = [...base.split("/").filter(Boolean), ...p.split("/").filter(Boolean)];
    }
    const resolved = [];
    for (const seg of parts) {
      if (seg === ".") continue;
      else if (seg === "..") resolved.pop();
      else resolved.push(seg);
    }
    return "/" + resolved.join("/");
  }, []);

  const getLocalNode = useCallback((path) => {
    if (!localFS) return null;
    const node = localFS[path];
    if (node) return node;
    // check if it's a file inside a dir
    const parent = path.substring(0, path.lastIndexOf("/")) || "/";
    const name = path.substring(path.lastIndexOf("/") + 1);
    const pNode = localFS[parent];
    if (pNode && pNode.files && name in pNode.files) return { type: "file", content: pNode.files[name] };
    if (pNode && pNode.children && pNode.children.includes(name)) return { type: "dir_ref" };
    return null;
  }, [localFS]);

  const getHdfsNode = useCallback((path) => {
    if (!hdfsFS) return null;
    return hdfsFS[path] || null;
  }, [hdfsFS]);

  const ensureHdfsDir = useCallback((path, fs) => {
    if (fs[path]) return fs;
    const newFs = { ...fs };
    const parts = path.split("/").filter(Boolean);
    let current = "/";
    for (const p of parts) {
      const next = current === "/" ? `/${p}` : `${current}/${p}`;
      if (!newFs[next]) {
        newFs[next] = { type: "dir", children: [], owner: "hadoop", group: "supergroup", perms: "drwxr-xr-x" };
        if (newFs[current] && !newFs[current].children.includes(p)) {
          newFs[current] = { ...newFs[current], children: [...newFs[current].children, p] };
        }
      }
      current = next;
    }
    return newFs;
  }, []);

  const ensureLocalDir = useCallback((path, fs) => {
    if (fs[path]) return fs;
    const newFs = { ...fs };
    const parts = path.split("/").filter(Boolean);
    let current = "/";
    for (const p of parts) {
      const next = current === "/" ? `/${p}` : `${current}/${p}`;
      if (!newFs[next]) {
        newFs[next] = { type: "dir", children: [], files: {} };
        if (newFs[current] && !newFs[current].children.includes(p)) {
          newFs[current] = { ...newFs[current], children: [...newFs[current].children, p] };
        }
      }
      current = next;
    }
    return newFs;
  }, []);

  // ─── Command Processor ──────────────────────────────────────────
  const processCommand = useCallback((cmd) => {
    const trimmed = cmd.trim();
    if (!trimmed) return [];
    const results = [];

    // Parse pipes simplistically
    const parts = trimmed.split("|").map(s => s.trim());
    const mainCmd = parts[0];
    const tokens = parseTokens(mainCmd);
    const base = tokens[0];

    // ── help ──
    if (base === "help") {
      return [out([
        "╔══════════════════════════════════════════════════════════════╗",
        "║          SIMULADOR HADOOP — COMANDOS DISPONIBLES           ║",
        "╠══════════════════════════════════════════════════════════════╣",
        "║ LINUX BÁSICO                                               ║",
        "║  ls, cd, pwd, mkdir, touch, cp, mv, rm, cat, chmod,       ║",
        "║  ps, top, hostname, uname, free, df, lscpu, lsb_release,  ║",
        "║  echo, clear, whoami, ssh, scp, head, tail, grep           ║",
        "║                                                            ║",
        "║ SERVICIOS HADOOP                                           ║",
        "║  ./start-dfs.sh  ./stop-dfs.sh                            ║",
        "║  ./start-yarn.sh ./stop-yarn.sh                           ║",
        "║  jps, mapred historyserver                                 ║",
        "║                                                            ║",
        "║ HDFS                                                       ║",
        "║  hdfs dfs -ls/-mkdir/-put/-get/-cat/-rm/-chmod/-cp         ║",
        "║  hdfs dfs -createSnapshot/-deleteSnapshot                  ║",
        "║  hdfs dfsadmin -report/-safemode/-saveNamespace            ║",
        "║  hdfs dfsadmin -allowSnapshot/-disallowSnapshot            ║",
        "║  hdfs fsck /                                               ║",
        "║                                                            ║",
        "║ YARN                                                       ║",
        "║  yarn node -list [--showDetails]                           ║",
        "║  yarn application -list/-status/-kill                      ║",
        "║  yarn applicationattempt -list <appId>                     ║",
        "║  yarn container -list <attemptId>                          ║",
        "║                                                            ║",
        "║ MAPREDUCE                                                  ║",
        "║  hadoop jar <jar> grep <in> <out> '<regex>'                ║",
        "║  hadoop jar <jar> wordcount <in> <out>                     ║",
        "║  hadoop jar <jar> TestDFSIO -write/-read ...               ║",
        "║                                                            ║",
        "║ COMPILACIÓN JAVA                                           ║",
        "║  javac -classpath $(hadoop classpath) <File>.java          ║",
        "║  jar cf <name>.jar <File>*.class                           ║",
        "║                                                            ║",
        "║ TIPS: Usa Tab para autocompletar. ↑↓ para historial.      ║",
        "╚══════════════════════════════════════════════════════════════╝",
      ].join("\n"), "help")];
    }

    // ── clear ──
    if (base === "clear") return [{ type: "clear" }];

    // ── pwd ──
    if (base === "pwd") return [out(cwd)];

    // ── whoami ──
    if (base === "whoami") return [out("hadoop")];

    // ── hostname ──
    if (base === "hostname") return [out("hadoop-VirtualBox")];

    // ── uname ──
    if (base === "uname") {
      if (tokens.includes("-a")) return [out("Linux hadoop-VirtualBox 5.15.0-91-generic #101-Ubuntu SMP x86_64 x86_64 x86_64 GNU/Linux")];
      return [out("Linux")];
    }

    // ── lsb_release ──
    if (base === "lsb_release") {
      return [out("Distributor ID: Ubuntu\nDescription:    Ubuntu 22.04.3 LTS\nRelease:        22.04\nCodename:       jammy")];
    }

    // ── lscpu ──
    if (base === "lscpu") {
      return [out("Architecture:          x86_64\nCPU op-mode(s):        32-bit, 64-bit\nCPU(s):                4\nThread(s) per core:    1\nCore(s) per socket:    4\nSocket(s):             1\nModel name:            Intel(R) Core(TM) i7-10750H CPU @ 2.60GHz\nCPU MHz:               2592.000")];
    }

    // ── free ──
    if (base === "free") {
      return [out("              total        used        free      shared  buff/cache   available\nMem:          8.0Gi       3.2Gi       2.1Gi       256Mi       2.7Gi       4.3Gi\nSwap:         2.0Gi          0B       2.0Gi")];
    }

    // ── df ──
    if (base === "df") {
      return [out("Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        50G   18G   30G  38% /\ntmpfs           4.0G     0  4.0G   0% /dev/shm\n/dev/sda2       100G   25G   70G  27% /datos")];
    }

    // ── echo ──
    if (base === "echo") {
      const arg = tokens.slice(1).join(" ").replace(/['"]/g, "");
      if (arg.includes("$(hadoop classpath)")) {
        return [out("/opt/hadoop/etc/hadoop:/opt/hadoop/share/hadoop/common/lib/*:/opt/hadoop/share/hadoop/common/*:/opt/hadoop/share/hadoop/hdfs:/opt/hadoop/share/hadoop/hdfs/lib/*:/opt/hadoop/share/hadoop/hdfs/*:/opt/hadoop/share/hadoop/mapreduce/*:/opt/hadoop/share/hadoop/yarn/*:/opt/hadoop/share/hadoop/yarn/lib/*")];
      }
      if (arg.includes("$HADOOP_HOME") || arg.includes("${HADOOP_HOME}")) return [out("/opt/hadoop")];
      if (arg.includes("$HOME") || arg.includes("${HOME}")) return [out("/home/hadoop")];
      if (arg.includes("$JAVA_HOME")) return [out("/usr/lib/jvm/java-11-openjdk-amd64")];
      return [out(arg)];
    }

    // ── top ──
    if (base === "top") {
      const procs = [];
      if (services.namenode) procs.push("  1234 hadoop    20   0 1.2g 256m  28m S  2.0  3.2   0:45.12 java (NameNode)");
      if (services.datanode) procs.push("  1235 hadoop    20   0 1.1g 200m  24m S  1.5  2.5   0:32.45 java (DataNode)");
      if (services.resourcemanager) procs.push("  1236 hadoop    20   0 1.3g 300m  32m S  3.0  3.7   0:58.90 java (ResourceManager)");
      if (services.nodemanager) procs.push("  1237 hadoop    20   0 1.0g 180m  20m S  1.0  2.2   0:22.33 java (NodeManager)");
      return [out(`top - 10:00:00 up 2 days, 4:30,  1 user,  load average: 0.15, 0.10, 0.05\nTasks: ${120 + procs.length} total,   1 running, ${119 + procs.length} sleeping\n%Cpu(s):  5.2 us,  1.3 sy,  0.0 ni, 93.0 id,  0.5 wa\nMiB Mem:   8192.0 total,   2150.0 free,   3280.0 used,   2762.0 buff/cache\n\n  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND\n${procs.join("\n")}\n(presiona q para salir — simulado)`)];
    }

    // ── ps ──
    if (base === "ps") {
      let plist = "  PID TTY          TIME CMD\n 1000 pts/0    00:00:00 bash";
      if (services.namenode) plist += "\n 1234 ?        00:00:45 java -Dproc_namenode";
      if (services.datanode) plist += "\n 1235 ?        00:00:32 java -Dproc_datanode";
      if (services.secondarynamenode) plist += "\n 1238 ?        00:00:12 java -Dproc_secondarynamenode";
      if (services.resourcemanager) plist += "\n 1236 ?        00:00:58 java -Dproc_resourcemanager";
      if (services.nodemanager) plist += "\n 1237 ?        00:00:22 java -Dproc_nodemanager";
      if (services.historyserver) plist += "\n 1239 ?        00:00:08 java -Dproc_historyserver";
      return [out(plist)];
    }

    // ── jps ──
    if (base === "jps") {
      const procs = [];
      if (services.namenode) procs.push("1234 NameNode");
      if (services.datanode) procs.push("1235 DataNode");
      if (services.secondarynamenode) procs.push("1238 SecondaryNameNode");
      if (services.resourcemanager) procs.push("1236 ResourceManager");
      if (services.nodemanager) procs.push("1237 NodeManager");
      if (services.historyserver) procs.push("1239 JobHistoryServer");
      procs.push(`${1240 + procs.length} Jps`);
      if (tokens.includes("-l")) {
        return [out(procs.map(p => {
          const [pid, name] = p.split(" ");
          const fqn = { NameNode: "org.apache.hadoop.hdfs.server.namenode.NameNode", DataNode: "org.apache.hadoop.hdfs.server.datanode.DataNode", SecondaryNameNode: "org.apache.hadoop.hdfs.server.namenode.SecondaryNameNode", ResourceManager: "org.apache.hadoop.yarn.server.resourcemanager.ResourceManager", NodeManager: "org.apache.hadoop.yarn.server.nodemanager.NodeManager", JobHistoryServer: "org.apache.hadoop.mapreduce.v2.hs.JobHistoryServer", Jps: "sun.tools.jps.Jps" };
          return `${pid} ${fqn[name] || name}`;
        }).join("\n"))];
      }
      return [out(procs.join("\n"))];
    }

    // ── cd ──
    if (base === "cd") {
      const target = tokens[1] || "~";
      const resolved = resolvePath(target, cwd);
      const node = getLocalNode(resolved);
      if (!node && !localFS[resolved]) return [out(`bash: cd: ${target}: No existe el archivo o el directorio`, "error")];
      if (node && node.type === "file") return [out(`bash: cd: ${target}: No es un directorio`, "error")];
      setCwd(resolved);
      return [];
    }

    // ── ls ──
    if (base === "ls") {
      const flags = tokens.filter(t => t.startsWith("-")).join("");
      const target = tokens.find((t, i) => i > 0 && !t.startsWith("-"));
      const resolved = resolvePath(target, cwd);
      const node = localFS[resolved];
      if (!node) return [out(`ls: no se puede acceder a '${target || resolved}': No existe el archivo o el directorio`, "error")];
      if (node.type === "dir") {
        const items = [...(node.children || []), ...(node.files ? Object.keys(node.files).filter(f => !node.children?.includes(f)) : [])];
        if (flags.includes("l")) {
          const detailed = items.map(i => {
            const isDir = localFS[resolved === "/" ? `/${i}` : `${resolved}/${i}`];
            const d = isDir ? "d" : "-";
            const size = isDir ? "4096" : String(Math.floor(Math.random() * 50000) + 100).padStart(6);
            return `${d}rwxr-xr-x 1 hadoop hadoop ${size} Feb 28 10:00 ${i}`;
          });
          return [out(`total ${items.length * 4}\n${detailed.join("\n")}`)];
        }
        if (items.length === 0) return [];
        return [out(items.join("  "))];
      }
      return [out(target || resolved)];
    }

    // ── mkdir ──
    if (base === "mkdir") {
      const flags = tokens.filter(t => t.startsWith("-"));
      const dirs = tokens.filter((t, i) => i > 0 && !t.startsWith("-"));
      if (dirs.length === 0) return [out("mkdir: falta un operando", "error")];
      let newFs = { ...localFS };
      for (const d of dirs) {
        const resolved = resolvePath(d, cwd);
        if (newFs[resolved]) continue;
        newFs = ensureLocalDir(resolved, newFs);
      }
      setLocalFS(newFs);
      return [];
    }

    // ── touch ──
    if (base === "touch") {
      const files = tokens.slice(1).filter(t => !t.startsWith("-"));
      let newFs = { ...localFS };
      for (const f of files) {
        const resolved = resolvePath(f, cwd);
        const parent = resolved.substring(0, resolved.lastIndexOf("/")) || "/";
        const name = resolved.substring(resolved.lastIndexOf("/") + 1);
        if (!newFs[parent]) newFs = ensureLocalDir(parent, newFs);
        if (newFs[parent]) {
          newFs[parent] = { ...newFs[parent], files: { ...(newFs[parent].files || {}), [name]: "" }, children: [...new Set([...(newFs[parent].children || []), name])] };
        }
      }
      setLocalFS(newFs);
      return [];
    }

    // ── cat ──
    if (base === "cat") {
      const target = tokens[1];
      if (!target) return [out("cat: falta un operando", "error")];
      const resolved = resolvePath(target, cwd);
      const node = getLocalNode(resolved);
      if (!node) return [out(`cat: ${target}: No existe el archivo o el directorio`, "error")];
      if (node.type === "file") {
        let content = node.content || "";
        if (parts.length > 1 && parts[1].startsWith("head")) {
          const n = parseInt(parts[1].match(/-(\d+)/)?.[1]) || 10;
          content = content.split("\n").slice(0, n).join("\n");
        }
        return [out(content)];
      }
      return [out(`cat: ${target}: Es un directorio`, "error")];
    }

    // ── head ──
    if (base === "head") {
      const target = tokens.find((t, i) => i > 0 && !t.startsWith("-"));
      if (!target) return [out("head: falta un operando", "error")];
      const n = parseInt(tokens.find(t => t.match(/^-\d+$/))?.slice(1)) || 10;
      const resolved = resolvePath(target, cwd);
      const node = getLocalNode(resolved);
      if (!node || node.type !== "file") return [out(`head: ${target}: No existe`, "error")];
      return [out(node.content.split("\n").slice(0, n).join("\n"))];
    }

    // ── tail ──
    if (base === "tail") {
      const target = tokens.find((t, i) => i > 0 && !t.startsWith("-"));
      if (!target) return [out("tail: falta un operando", "error")];
      const resolved = resolvePath(target, cwd);
      const node = getLocalNode(resolved);
      if (!node || node.type !== "file") return [out(`tail: ${target}: No existe`, "error")];
      return [out(node.content.split("\n").slice(-10).join("\n"))];
    }

    // ── grep (local) ──
    if (base === "grep") {
      const pattern = tokens[1];
      const target = tokens[2];
      if (!pattern || !target) return [out("Usage: grep PATTERN FILE", "error")];
      const resolved = resolvePath(target, cwd);
      const node = getLocalNode(resolved);
      if (!node || node.type !== "file") return [out(`grep: ${target}: No existe`, "error")];
      try {
        const re = new RegExp(pattern.replace(/'/g, ""), "gi");
        const matches = node.content.split("\n").filter(l => re.test(l));
        return [out(matches.length > 0 ? matches.slice(0, 30).join("\n") : `(sin coincidencias para '${pattern}')`)];
      } catch { return [out(`grep: regex inválida: '${pattern}'`, "error")]; }
    }

    // ── cp (local) ──
    if (base === "cp") {
      const src = tokens.find((t, i) => i > 0 && !t.startsWith("-"));
      const dst = tokens.filter((t, i) => i > 0 && !t.startsWith("-"))[1];
      if (!src || !dst) return [out("cp: faltan operandos", "error")];
      const srcR = resolvePath(src, cwd);
      const dstR = resolvePath(dst, cwd);
      const srcNode = getLocalNode(srcR);
      if (!srcNode) return [out(`cp: no se puede efectuar 'stat' sobre '${src}': No existe`, "error")];
      let newFs = { ...localFS };
      const dstParent = dstR.substring(0, dstR.lastIndexOf("/")) || "/";
      const dstName = dstR.substring(dstR.lastIndexOf("/") + 1);
      if (!newFs[dstParent]) newFs = ensureLocalDir(dstParent, newFs);
      if (srcNode.type === "file") {
        newFs[dstParent] = { ...newFs[dstParent], files: { ...(newFs[dstParent].files || {}), [dstName]: srcNode.content }, children: [...new Set([...(newFs[dstParent].children || []), dstName])] };
      }
      setLocalFS(newFs);
      return [];
    }

    // ── mv ──
    if (base === "mv") {
      const src = tokens.filter((t, i) => i > 0 && !t.startsWith("-"))[0];
      const dst = tokens.filter((t, i) => i > 0 && !t.startsWith("-"))[1];
      if (!src || !dst) return [out("mv: faltan operandos", "error")];
      const srcR = resolvePath(src, cwd);
      const dstR = resolvePath(dst, cwd);
      const srcParent = srcR.substring(0, srcR.lastIndexOf("/")) || "/";
      const srcName = srcR.substring(srcR.lastIndexOf("/") + 1);
      const srcNode = getLocalNode(srcR);
      if (!srcNode) return [out(`mv: no se puede efectuar 'stat' sobre '${src}': No existe`, "error")];
      let newFs = { ...localFS };
      const dstParent = dstR.substring(0, dstR.lastIndexOf("/")) || "/";
      const dstName = dstR.substring(dstR.lastIndexOf("/") + 1);
      if (!newFs[dstParent]) newFs = ensureLocalDir(dstParent, newFs);
      if (srcNode.type === "file") {
        newFs[dstParent] = { ...newFs[dstParent], files: { ...(newFs[dstParent].files || {}), [dstName]: srcNode.content }, children: [...new Set([...(newFs[dstParent].children || []), dstName])] };
        if (newFs[srcParent]?.files) { const { [srcName]: _, ...rest } = newFs[srcParent].files; newFs[srcParent] = { ...newFs[srcParent], files: rest, children: newFs[srcParent].children.filter(c => c !== srcName) }; }
      }
      setLocalFS(newFs);
      return [];
    }

    // ── rm (local) ──
    if (base === "rm") {
      const flags = tokens.filter(t => t.startsWith("-")).join("");
      const targets = tokens.filter((t, i) => i > 0 && !t.startsWith("-"));
      let newFs = { ...localFS };
      for (const t of targets) {
        const resolved = resolvePath(t, cwd);
        const parent = resolved.substring(0, resolved.lastIndexOf("/")) || "/";
        const name = resolved.substring(resolved.lastIndexOf("/") + 1);
        if (newFs[resolved] && flags.includes("r")) {
          delete newFs[resolved];
          if (newFs[parent]) newFs[parent] = { ...newFs[parent], children: newFs[parent].children.filter(c => c !== name) };
        } else if (newFs[parent]?.files?.[name] !== undefined) {
          const { [name]: _, ...rest } = newFs[parent].files;
          newFs[parent] = { ...newFs[parent], files: rest, children: newFs[parent].children.filter(c => c !== name) };
        }
      }
      setLocalFS(newFs);
      return [];
    }

    // ── chmod ──
    if (base === "chmod") return []; // silently accept

    // ── ssh ──
    if (base === "ssh") {
      const host = tokens[1] || "";
      return [out(`ssh: connect to host ${host} port 22: Connection refused\n(Simulación: solo hay un nodo pseudo-distribuido)`, "warn")];
    }

    // ── scp ──
    if (base === "scp") return [out("scp: Simulación — solo hay un nodo disponible en este pseudo-clúster.", "warn")];

    // ── md5sum ──
    if (base === "md5sum") {
      const target = tokens[1];
      if (!target) return [];
      if (target.includes("fsimage")) {
        const lines = [];
        for (let i = 42; i <= fsimageCounter; i++) {
          const hash = Array.from({length:32}, () => "0123456789abcdef"[Math.floor(Math.random()*16)]).join("");
          lines.push(`${hash}  /datos/namenode/current/fsimage_${String(i).padStart(19, "0")}`);
        }
        return [out(lines.slice(-4).join("\n"))];
      }
      return [];
    }

    // ────────────────────────────────────────────────────────────────
    // HADOOP SERVICE SCRIPTS
    // ────────────────────────────────────────────────────────────────
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

    // ── mapred historyserver ──
    if (base === "mapred" && tokens[1] === "historyserver") {
      if (!services.resourcemanager) return [out("Error: YARN no está activo.", "error")];
      setServices(s => ({ ...s, historyserver: true }));
      return [out("Starting JobHistoryServer...\n✓ JobHistoryServer iniciado en http://hadoop-VirtualBox:19888", "success")];
    }

    // ────────────────────────────────────────────────────────────────
    // HDFS COMMANDS
    // ────────────────────────────────────────────────────────────────
    if (base === "hdfs") {
      if (!services.namenode) return [out("Call From hadoop-VirtualBox/127.0.0.1 to localhost:9000 failed on connection exception.\n\n✗ Error: HDFS no está iniciado. Ejecuta: cd /opt/hadoop/sbin && ./start-dfs.sh", "error")];

      const sub = tokens[1];

      // hdfs dfs
      if (sub === "dfs") {
        const flag = tokens[2];

        // -ls
        if (flag === "-ls") {
          const target = tokens[3] || "/";
          const node = hdfsFS[target];
          if (!node) return [out(`ls: '${target}': No such file or directory`, "error")];
          if (node.type === "dir") {
            const items = node.children || [];
            if (items.length === 0) return [out(`Found 0 items`)];
            const detailed = items.map(i => {
              const childPath = target === "/" ? `/${i}` : `${target}/${i}`;
              const childNode = hdfsFS[childPath];
              if (childNode?.type === "dir") return `drwxr-xr-x   - hadoop supergroup          0 2026-02-28 10:00 ${childPath}`;
              // it's a file
              const size = childNode?.size || Math.floor(Math.random() * 500000) + 1000;
              return `-rw-r--r--   1 hadoop supergroup     ${String(size).padStart(8)} 2026-02-28 10:00 ${childPath}`;
            });
            return [out(`Found ${items.length} items\n${detailed.join("\n")}`)];
          }
          return [out(`-rw-r--r--   1 hadoop supergroup     ${node.size || 0} 2026-02-28 10:00 ${target}`)];
        }

        // -mkdir
        if (flag === "-mkdir") {
          const paths = tokens.slice(3).filter(t => !t.startsWith("-"));
          let newFs = { ...hdfsFS };
          for (const p of paths) {
            newFs = ensureHdfsDir(p, newFs);
          }
          setHdfsFS(newFs);
          return [];
        }

        // -put
        if (flag === "-put") {
          const localPath = tokens[3];
          const hdfsPath = tokens[4];
          if (!localPath || !hdfsPath) return [out("Usage: hdfs dfs -put <localsrc> <dst>", "error")];
          const resolvedLocal = resolvePath(localPath, cwd);
          const localNode = getLocalNode(resolvedLocal);
          if (!localNode) return [out(`put: '${localPath}': No such file or directory`, "error")];

          let newFs = { ...hdfsFS };
          // ensure parent exists
          const hdfsParent = hdfsPath.endsWith("/") ? hdfsPath.replace(/\/$/, "") : hdfsPath;
          if (!newFs[hdfsParent]) newFs = ensureHdfsDir(hdfsParent, newFs);

          if (localNode.type === "file") {
            const fname = resolvedLocal.substring(resolvedLocal.lastIndexOf("/") + 1);
            const filePath = `${hdfsPath.replace(/\/$/, "")}/${fname}`;
            newFs[filePath] = { type: "file", content: localNode.content, size: localNode.content.length, owner: "hadoop", group: "supergroup" };
            const parent = hdfsPath.replace(/\/$/, "");
            if (newFs[parent]) newFs[parent] = { ...newFs[parent], children: [...new Set([...(newFs[parent].children || []), fname])] };
          }
          setHdfsFS(newFs);
          return [];
        }

        // -get
        if (flag === "-get") {
          const hdfsSrc = tokens[3];
          const localDst = tokens[4] || ".";
          const hdfsNode = hdfsFS[hdfsSrc];
          if (!hdfsNode) return [out(`get: '${hdfsSrc}': No such file or directory`, "error")];
          const resolvedDst = resolvePath(localDst, cwd);
          const dstParent = resolvedDst.includes(".") ? resolvedDst : resolvedDst;
          const fname = hdfsSrc.substring(hdfsSrc.lastIndexOf("/") + 1);
          let newFs = { ...localFS };
          const actualParent = newFs[resolvedDst] ? resolvedDst : (resolvedDst.substring(0, resolvedDst.lastIndexOf("/")) || "/");
          if (!newFs[actualParent]) newFs = ensureLocalDir(actualParent, newFs);
          if (newFs[actualParent]) {
            const targetName = newFs[resolvedDst] ? fname : resolvedDst.substring(resolvedDst.lastIndexOf("/") + 1);
            const targetParent = newFs[resolvedDst] ? resolvedDst : actualParent;
            newFs[targetParent] = { ...newFs[targetParent], files: { ...(newFs[targetParent].files || {}), [targetName]: hdfsNode.content || `[Contenido descargado de ${hdfsSrc}]` }, children: [...new Set([...(newFs[targetParent].children || []), targetName])] };
          }
          setLocalFS(newFs);
          return [];
        }

        // -cat
        if (flag === "-cat") {
          const target = tokens[3];
          if (!target) return [out("cat: falta ruta", "error")];
          const node = hdfsFS[target];
          if (!node) return [out(`cat: '${target}': No such file or directory`, "error")];
          let content = node.content || "";
          // handle pipe to head
          if (parts.length > 1 && parts[1].includes("head")) {
            content = content.split("\n").slice(0, 10).join("\n");
          }
          return [out(content)];
        }

        // -rm
        if (flag === "-rm") {
          const recursive = tokens.includes("-r");
          const target = tokens.find((t, i) => i > 2 && !t.startsWith("-"));
          if (!target) return [out("rm: falta ruta", "error")];
          let newFs = { ...hdfsFS };
          const parent = target.substring(0, target.lastIndexOf("/")) || "/";
          const name = target.substring(target.lastIndexOf("/") + 1);
          if (recursive) {
            // delete dir and all children
            Object.keys(newFs).forEach(k => { if (k === target || k.startsWith(target + "/")) delete newFs[k]; });
          } else {
            delete newFs[target];
          }
          if (newFs[parent]) newFs[parent] = { ...newFs[parent], children: (newFs[parent].children || []).filter(c => c !== name) };
          setHdfsFS(newFs);
          return [out(`Deleted ${target}`)];
        }

        // -chmod
        if (flag === "-chmod") return [];

        // -cp
        if (flag === "-cp") {
          const srcs = [];
          const allArgs = tokens.slice(3).filter(t => !t.startsWith("-"));
          if (allArgs.length < 2) return [out("cp: faltan operandos", "error")];
          const dst = allArgs[allArgs.length - 1];
          const srcPaths = allArgs.slice(0, -1);
          let newFs = { ...hdfsFS };

          for (const src of srcPaths) {
            // Handle glob *
            if (src.includes("*")) {
              const dir = src.substring(0, src.lastIndexOf("/"));
              const dirNode = newFs[dir];
              if (dirNode) {
                for (const child of (dirNode.children || [])) {
                  const srcPath = `${dir}/${child}`;
                  const srcNode = newFs[srcPath];
                  if (srcNode) {
                    const dstPath = `${dst}/${child}`;
                    newFs[dstPath] = { ...srcNode };
                    if (!newFs[dst]) newFs = ensureHdfsDir(dst, newFs);
                    newFs[dst] = { ...newFs[dst], children: [...new Set([...(newFs[dst].children || []), child])] };
                  }
                }
              }
            } else {
              const srcNode = newFs[src];
              if (srcNode) {
                const name = src.substring(src.lastIndexOf("/") + 1);
                const dstPath = `${dst}/${name}`;
                newFs[dstPath] = { ...srcNode };
                if (!newFs[dst]) newFs = ensureHdfsDir(dst, newFs);
                newFs[dst] = { ...newFs[dst], children: [...new Set([...(newFs[dst].children || []), name])] };
              }
            }
          }
          setHdfsFS(newFs);
          return [];
        }

        // -createSnapshot
        if (flag === "-createSnapshot") {
          const dir = tokens[3];
          const snapName = tokens[4];
          if (!dir || !snapName) return [out("Usage: hdfs dfs -createSnapshot <dir> <name>", "error")];
          if (!hdfsSnapEnabled.has(dir)) return [out(`${dir}: Snapshottable directory is not enabled. Use hdfs dfsadmin -allowSnapshot ${dir}`, "error")];
          const node = hdfsFS[dir];
          if (!node) return [out(`createSnapshot: '${dir}': No such file or directory`, "error")];
          // Deep copy directory state
          const snapState = {};
          Object.keys(hdfsFS).forEach(k => { if (k === dir || k.startsWith(dir + "/")) snapState[k] = { ...hdfsFS[k] }; });
          setHdfsSnapshots(prev => ({ ...prev, [`${dir}/${snapName}`]: snapState }));
          // Create .snapshot dir representation
          let newFs = { ...hdfsFS };
          const snapDir = `${dir}/.snapshot`;
          if (!newFs[snapDir]) {
            newFs[snapDir] = { type: "dir", children: [snapName], owner: "hadoop", group: "supergroup", perms: "drwxr-xr-x" };
          } else {
            newFs[snapDir] = { ...newFs[snapDir], children: [...new Set([...(newFs[snapDir].children || []), snapName])] };
          }
          const snapPath = `${snapDir}/${snapName}`;
          // copy children refs into snapshot
          const origNode = newFs[dir];
          newFs[snapPath] = { type: "dir", children: [...(origNode.children || [])], owner: "hadoop", group: "supergroup", perms: "drwxr-xr-x" };
          // copy files into snapshot subdir
          for (const child of (origNode.children || [])) {
            const srcPath = `${dir}/${child}`;
            if (newFs[srcPath]) newFs[`${snapPath}/${child}`] = { ...newFs[srcPath] };
          }
          setHdfsFS(newFs);
          return [out(`Created snapshot ${dir}/.snapshot/${snapName}`, "success")];
        }

        // -deleteSnapshot
        if (flag === "-deleteSnapshot") {
          const dir = tokens[3];
          const snapName = tokens[4];
          if (!dir || !snapName) return [out("Usage: hdfs dfs -deleteSnapshot <dir> <name>", "error")];
          setHdfsSnapshots(prev => { const n = { ...prev }; delete n[`${dir}/${snapName}`]; return n; });
          let newFs = { ...hdfsFS };
          const snapDir = `${dir}/.snapshot`;
          if (newFs[snapDir]) newFs[snapDir] = { ...newFs[snapDir], children: (newFs[snapDir].children || []).filter(c => c !== snapName) };
          delete newFs[`${snapDir}/${snapName}`];
          setHdfsFS(newFs);
          return [out(`Deleted snapshot ${snapName} under ${dir}`, "success")];
        }

        return [out(`hdfs dfs: Unknown command: ${flag}`, "error")];
      }

      // hdfs dfsadmin
      if (sub === "dfsadmin") {
        const flag = tokens[2];

        if (flag === "-report") {
          const used = Object.keys(hdfsFS).filter(k => hdfsFS[k].type === "file").length;
          return [out(`Configured Capacity: 53687091200 (50.00 GB)\nPresent Capacity: 48318382080 (45.00 GB)\nDFS Remaining: ${45 - used * 0.001} GB\nDFS Used: ${(used * 1024).toLocaleString()} (${used} files)\nDFS Used%: ${(used * 0.002).toFixed(2)}%\nReplicated Blocks:\n\tUnder replicated blocks: 0\n\tBlocks with corrupt replicas: 0\n\tMissing blocks: 0\n\n-------------------------------------------------\nLive datanodes (1):\n\nName: 127.0.0.1:9866 (localhost)\nHostname: hadoop-VirtualBox\nDecommission Status : Normal\nConfigured Capacity: 53687091200 (50.00 GB)\nDFS Used: ${(used * 1024).toLocaleString()}\nDFS Remaining: ${(45 - used * 0.001).toFixed(2)} GB\nDFS Used%: ${(used * 0.002).toFixed(2)}%\nLast contact: Tue Mar 03 10:00:00 COT 2026`)];
        }

        if (flag === "-safemode") {
          const action = tokens[3];
          if (action === "enter") { setSafeMode(true); return [out("Safe mode is ON", "warn")]; }
          if (action === "leave") { setSafeMode(false); return [out("Safe mode is OFF", "success")]; }
          if (action === "get") return [out(`Safe mode is ${safeMode ? "ON" : "OFF"}`)];
          return [out("Usage: hdfs dfsadmin -safemode enter|leave|get", "error")];
        }

        if (flag === "-saveNamespace") {
          if (!safeMode) return [out("saveNamespace: Safe mode should be turned ON to do saveNamespace.\nUse: hdfs dfsadmin -safemode enter", "error")];
          const newCounter = fsimageCounter + 1;
          setFsimageCounter(newCounter);
          // Update local FS to reflect new fsimage
          let newFs = { ...localFS };
          const newFsimage = `fsimage_${String(newCounter).padStart(19, "0")}`;
          const newMd5 = `fsimage_${String(newCounter).padStart(19, "0")}.md5`;
          const newEdits = `edits_inprogress_${String(newCounter + 1).padStart(19, "0")}`;
          newFs["/datos/namenode/current"] = {
            ...newFs["/datos/namenode/current"],
            children: [...(newFs["/datos/namenode/current"]?.children || []), newFsimage, newMd5, newEdits],
            files: { ...(newFs["/datos/namenode/current"]?.files || {}), [newFsimage]: "[binary fsimage data]", [newMd5]: Array.from({length:32}, () => "0123456789abcdef"[Math.floor(Math.random()*16)]).join(""), [newEdits]: "[binary edits data]" }
          };
          setLocalFS(newFs);
          return [out(`Save namespace successful.\nNew fsimage: ${newFsimage}`, "success")];
        }

        if (flag === "-allowSnapshot") {
          const dir = tokens[3];
          if (!dir) return [out("Usage: hdfs dfsadmin -allowSnapshot <dir>", "error")];
          if (!hdfsFS[dir]) return [out(`allowSnapshot: '${dir}': No such file or directory`, "error")];
          setHdfsSnapEnabled(prev => new Set([...prev, dir]));
          return [out(`Allowing snapshot on ${dir} succeeded`, "success")];
        }

        if (flag === "-disallowSnapshot") {
          const dir = tokens[3];
          setHdfsSnapEnabled(prev => { const n = new Set(prev); n.delete(dir); return n; });
          return [out(`Disallowing snapshot on ${dir} succeeded`, "success")];
        }

        return [out(`hdfs dfsadmin: Unknown command: ${flag}`, "error")];
      }

      // hdfs fsck
      if (sub === "fsck") {
        const target = tokens[2] || "/";
        const detailed = tokens.includes("-files") || tokens.includes("-blocks");
        const fileCount = Object.keys(hdfsFS).filter(k => hdfsFS[k].type === "file").length;
        const dirCount = Object.keys(hdfsFS).filter(k => hdfsFS[k].type === "dir").length;
        let report = `Connecting to namenode via http://localhost:9870/fsck?ugi=hadoop&path=${target}\nFSCK started by hadoop (auth:SIMPLE) from /127.0.0.1 for path ${target} at Tue Mar 03 10:00:00 COT 2026`;
        if (detailed) {
          Object.keys(hdfsFS).filter(k => hdfsFS[k].type === "file").forEach(k => {
            report += `\n${k} ${hdfsFS[k].size || 1024} bytes, replicated: replication=1, 1 block(s): OK`;
          });
        }
        report += `\n\nStatus: HEALTHY\n Total size:    ${fileCount * 1024} B\n Total dirs:    ${dirCount}\n Total files:   ${fileCount}\n Total symlinks: 0\n Total blocks (validated): ${fileCount} (avg. block size 1024 B)\n\nFSCK ended at Tue Mar 03 10:00:01 COT 2026 in 15 milliseconds\n\nThe filesystem under path '${target}' is HEALTHY`;
        return [out(report)];
      }

      return [out(`hdfs: Unknown command: ${sub}`, "error")];
    }

    // ────────────────────────────────────────────────────────────────
    // YARN COMMANDS
    // ────────────────────────────────────────────────────────────────
    if (base === "yarn") {
      if (!services.resourcemanager) return [out("Error: Could not find the main class org.apache.hadoop.yarn... \n\n✗ YARN no está iniciado. Ejecuta: cd /opt/hadoop/sbin && ./start-yarn.sh", "error")];
      const sub = tokens[1];

      if (sub === "node") {
        const showDetails = tokens.includes("-showDetails") || tokens.includes("--showDetails");
        let output = "Total Nodes:1\n         Node-Id\t     Node-State\tNode-Http-Address\tNumber-of-Running-Containers\nhadoop-VirtualBox:45454\t       RUNNING\thadoop-VirtualBox:8042\t\t\t\t   0";
        if (showDetails) output += "\n   Rack: /default-rack\n   Node-Labels:\n   ResourceUtilization:\n      Memory: 3200/4096 MB, VCores: 1/4";
        return [out(output)];
      }

      if (sub === "application") {
        const flag = tokens[2];
        if (flag === "-list") {
          if (yarnApps.length === 0) return [out("Total number of applications (application-types: [], states: [SUBMITTED, ACCEPTED, RUNNING]):0\n                Application-Id\t    Application-Name\t    Application-Type\t      User\t     Queue\t             State\t       Final-State\t       Progress\t                       Tracking-URL")];
          const rows = yarnApps.filter(a => a.state === "RUNNING" || a.state === "SUBMITTED" || a.state === "ACCEPTED").map(a => `application_1700000000000_${String(a.id).padStart(4, "0")}\t${a.name}\t\tMAPREDUCE\thadoop\tdefault\t${a.state}\t\tUNDEFINED\t\t100%\thttp://hadoop-VirtualBox:${a.port || 8088}`);
          return [out(`Total number of applications: ${rows.length}\n                Application-Id\t    Application-Name\t    Application-Type\t      User\t     Queue\t             State\t       Final-State\t       Progress\t                       Tracking-URL\n${rows.join("\n")}`)];
        }
        if (flag === "-status") {
          const appId = tokens[3];
          if (!appId) return [out("Usage: yarn application -status <Application ID>", "error")];
          const idNum = parseInt(appId.split("_").pop());
          const app = yarnApps.find(a => a.id === idNum);
          if (!app) return [out(`Application with id '${appId}' doesn't exist in RM.`, "error")];
          return [out(`Application Report :\n\tApplication-Id : ${appId}\n\tApplication-Name : ${app.name}\n\tApplication-Type : MAPREDUCE\n\tUser : hadoop\n\tQueue : default\n\tApplication Priority : 0\n\tStart-Time : Tue Mar 03 10:00:00 COT 2026\n\tFinish-Time : ${app.state === "FINISHED" ? "Tue Mar 03 10:02:00 COT 2026" : "N/A"}\n\tProgress : ${app.state === "FINISHED" ? "100" : "0"}%\n\tState : ${app.state}\n\tFinal-State : ${app.state === "FINISHED" ? "SUCCEEDED" : "UNDEFINED"}\n\tTracking-URL : http://hadoop-VirtualBox:${app.state === "FINISHED" ? "19888" : "8088"}/proxy/${appId}/`)];
        }
        if (flag === "-kill") {
          const appId = tokens[3];
          const idNum = parseInt(appId?.split("_").pop());
          setYarnApps(prev => prev.map(a => a.id === idNum ? { ...a, state: "KILLED" } : a));
          return [out(`Killing application ${appId}\n✓ Application ${appId} killed.`, "success")];
        }
        return [out(`yarn application: Unknown sub-command: ${flag}`, "error")];
      }

      if (sub === "applicationattempt") {
        const appId = tokens[3];
        if (!appId) return [out("Usage: yarn applicationattempt -list <Application ID>", "error")];
        return [out(`Total number of application attempts: 1\n         ApplicationAttempt-Id\t               State\t                    AM-Container-Id\t                       Tracking-URL\nappattempt_${appId.replace("application_", "")}_000001\t            RUNNING\tcontainer_${appId.replace("application_", "")}_01_000001\thttp://hadoop-VirtualBox:8088`)];
      }

      if (sub === "container") {
        const attemptId = tokens[3];
        if (!attemptId) return [out("Usage: yarn container -list <Application Attempt Id>", "error")];
        return [out(`Total number of containers: 2\n                  Container-Id\t          Start Time\t         Finish Time\t               State\t                Host\t   Node Http Address\t                            LOG-URL\ncontainer_${attemptId.replace("appattempt_", "")}_000001\tTue Mar 03 10:00\t                N/A\t             RUNNING\thadoop-VirtualBox:45454\thttp://hadoop-VirtualBox:8042\thttp://hadoop-VirtualBox:8042/node/containerlogs/...\ncontainer_${attemptId.replace("appattempt_", "")}_000002\tTue Mar 03 10:00\t                N/A\t             RUNNING\thadoop-VirtualBox:45454\thttp://hadoop-VirtualBox:8042\thttp://hadoop-VirtualBox:8042/node/containerlogs/...`)];
      }

      return [out(`yarn: Unknown command: ${sub}`, "error")];
    }

    // ────────────────────────────────────────────────────────────────
    // HADOOP JAR (MapReduce)
    // ────────────────────────────────────────────────────────────────
    if (base === "hadoop" && tokens[1] === "jar") {
      if (!services.resourcemanager) return [out("Error: YARN no está activo. Inicia YARN primero.", "error")];

      const jarFile = tokens[2] || "";
      const jobType = tokens[3] || "";

      // TestDFSIO benchmark
      if (jarFile.includes("tests.jar") || jobType === "TestDFSIO") {
        const mode = tokens.includes("-write") ? "write" : tokens.includes("-read") ? "read" : "write";
        const nrFiles = parseInt(tokens.find((t, i) => tokens[i - 1] === "-nrFiles") || "10");
        const fileSizeStr = tokens.find((t, i) => tokens[i - 1] === "-fileSize") || "100";
        const fileSize = parseInt(fileSizeStr);

        const newAppId = appCounter;
        setAppCounter(c => c + 1);
        setYarnApps(prev => [...prev, { id: newAppId, name: `TestDFSIO-${mode}`, state: "FINISHED", port: 19888 }]);

        // Create benchmark results in HDFS
        let newFs = ensureHdfsDir("/benchmarks/TestDFSIO", { ...hdfsFS });
        newFs["/benchmarks/TestDFSIO/io_${mode}"] = { type: "file", content: generateBenchmarkOutput(mode, nrFiles, fileSize), size: 512, owner: "hadoop", group: "supergroup" };
        if (!newFs["/benchmarks"].children.includes("TestDFSIO")) newFs["/benchmarks"] = { ...newFs["/benchmarks"], children: [...newFs["/benchmarks"].children, "TestDFSIO"] };
        setHdfsFS(newFs);

        return [out(`26/03/03 10:00:00 INFO mapreduce.Job: Running job: job_1700000000000_${String(newAppId).padStart(4, "0")}\n26/03/03 10:00:05 INFO mapreduce.Job: map 0% reduce 0%\n26/03/03 10:00:15 INFO mapreduce.Job: map 50% reduce 0%\n26/03/03 10:00:25 INFO mapreduce.Job: map 100% reduce 0%\n26/03/03 10:00:35 INFO mapreduce.Job: map 100% reduce 100%\n26/03/03 10:00:36 INFO mapreduce.Job: Job job_1700000000000_${String(newAppId).padStart(4, "0")} completed successfully\n\n${generateBenchmarkOutput(mode, nrFiles, fileSize)}`, "success")];
      }

      // grep MapReduce
      if (jobType === "grep") {
        const inputPath = tokens[4];
        const outputPath = tokens[5];
        const regex = tokens.slice(6).join(" ").replace(/^['"]|['"]$/g, "");

        if (!inputPath || !outputPath) return [out("Usage: hadoop jar <jar> grep <input> <output> '<regex>'", "error")];
        if (hdfsFS[outputPath]) return [out(`org.apache.hadoop.mapred.FileAlreadyExistsException: Output directory ${outputPath} already exists\n\n✗ El directorio de salida ya existe. Bórralo con: hdfs dfs -rm -r ${outputPath}`, "error")];

        // Find input
        const inputNode = hdfsFS[inputPath];
        if (!inputNode) return [out(`Input path does not exist: ${inputPath}`, "error")];

        // Gather all file content from the input directory
        let allContent = "";
        if (inputNode.type === "dir") {
          for (const child of (inputNode.children || [])) {
            const childPath = `${inputPath}/${child}`;
            if (hdfsFS[childPath]?.content) allContent += hdfsFS[childPath].content + "\n";
          }
        } else {
          allContent = inputNode.content || "";
        }

        // Count regex matches
        let matches = {};
        try {
          const re = new RegExp(regex, "gi");
          const allLines = allContent.split("\n");
          for (const line of allLines) {
            const m = line.match(re);
            if (m) {
              for (const match of m) {
                const key = match.toLowerCase();
                matches[key] = (matches[key] || 0) + 1;
              }
            }
          }
        } catch { matches["(regex error)"] = 0; }

        const sorted = Object.entries(matches).sort((a, b) => b[1] - a[1]);
        const resultContent = sorted.length > 0
          ? sorted.map(([k, v]) => `${v}\t${k}`).join("\n")
          : "(sin coincidencias)";

        // Create output in HDFS
        let newFs = ensureHdfsDir(outputPath, { ...hdfsFS });
        const partFile = `${outputPath}/part-r-00000`;
        const successFile = `${outputPath}/_SUCCESS`;
        newFs[partFile] = { type: "file", content: resultContent, size: resultContent.length, owner: "hadoop", group: "supergroup" };
        newFs[successFile] = { type: "file", content: "", size: 0, owner: "hadoop", group: "supergroup" };
        newFs[outputPath] = { ...newFs[outputPath], children: [...new Set([...(newFs[outputPath].children || []), "part-r-00000", "_SUCCESS"])] };
        setHdfsFS(newFs);

        const newAppId = appCounter;
        setAppCounter(c => c + 1);
        setYarnApps(prev => [...prev, { id: newAppId, name: `grep-search`, state: "FINISHED", port: 19888 }]);

        return [out(`26/03/03 10:00:00 INFO client.RMProxy: Connecting to ResourceManager at hadoop-VirtualBox/127.0.0.1:8032\n26/03/03 10:00:01 INFO mapreduce.JobSubmitter: number of splits:1\n26/03/03 10:00:01 INFO mapreduce.JobSubmitter: Submitting tokens for job: job_1700000000000_${String(newAppId).padStart(4, "0")}\n26/03/03 10:00:02 INFO mapreduce.Job: Running job: job_1700000000000_${String(newAppId).padStart(4, "0")}\n26/03/03 10:00:10 INFO mapreduce.Job: map 0% reduce 0%\n26/03/03 10:00:20 INFO mapreduce.Job: map 100% reduce 0%\n26/03/03 10:00:30 INFO mapreduce.Job: map 100% reduce 100%\n26/03/03 10:00:31 INFO mapreduce.Job: Job job_1700000000000_${String(newAppId).padStart(4, "0")} completed successfully\n26/03/03 10:00:31 INFO mapreduce.Job: Counters: 30\n\tMap-Reduce Framework\n\t\tMap input records=${allContent.split("\n").length}\n\t\tMap output records=${sorted.reduce((a, [, v]) => a + v, 0)}\n\t\tReduce input records=${sorted.length}\n\t\tReduce output records=${sorted.length}\n\n✓ Job completado. Verifica con: hdfs dfs -cat ${partFile} | head`, "success")];
      }

      // wordcount
      if (jobType === "wordcount" || (tokens[2] && !tokens[2].includes("tests") && tokens.length >= 5 && !["grep", "TestDFSIO"].includes(jobType))) {
        const inputPath = tokens.length >= 5 ? tokens[tokens.length - 2] : tokens[4];
        const outputPath = tokens[tokens.length - 1];

        if (!inputPath || !outputPath) return [out("Usage: hadoop jar <jar> <MainClass> <input> <output>", "error")];
        if (hdfsFS[outputPath]) return [out(`Output directory ${outputPath} already exists. Bórralo con: hdfs dfs -rm -r ${outputPath}`, "error")];

        const inputNode = hdfsFS[inputPath];
        if (!inputNode) return [out(`Input path does not exist: ${inputPath}`, "error")];

        let allContent = "";
        if (inputNode.type === "dir") {
          for (const child of (inputNode.children || [])) {
            const p = inputPath.endsWith("/") ? `${inputPath}${child}` : `${inputPath}/${child}`;
            if (hdfsFS[p]?.content) allContent += hdfsFS[p].content + "\n";
          }
        } else { allContent = inputNode.content || ""; }

        // word count
        const words = {};
        allContent.split(/\s+/).filter(Boolean).forEach(w => { const k = w.replace(/[^a-zA-Z0-9_.-]/g, ""); if (k) words[k] = (words[k] || 0) + 1; });
        const sorted = Object.entries(words).sort((a, b) => a[0].localeCompare(b[0]));
        const resultContent = sorted.map(([k, v]) => `${k}\t${v}`).join("\n");

        let newFs = ensureHdfsDir(outputPath, { ...hdfsFS });
        newFs[`${outputPath}/part-r-00000`] = { type: "file", content: resultContent, size: resultContent.length, owner: "hadoop", group: "supergroup" };
        newFs[`${outputPath}/_SUCCESS`] = { type: "file", content: "", size: 0, owner: "hadoop", group: "supergroup" };
        newFs[outputPath] = { ...newFs[outputPath], children: ["part-r-00000", "_SUCCESS"] };
        setHdfsFS(newFs);

        const newAppId = appCounter;
        setAppCounter(c => c + 1);
        setYarnApps(prev => [...prev, { id: newAppId, name: jobType || "wordcount", state: "FINISHED", port: 19888 }]);

        return [out(`26/03/03 10:00:00 INFO mapreduce.Job: Running job: job_1700000000000_${String(newAppId).padStart(4, "0")}\n26/03/03 10:00:15 INFO mapreduce.Job: map 100% reduce 0%\n26/03/03 10:00:30 INFO mapreduce.Job: map 100% reduce 100%\n26/03/03 10:00:31 INFO mapreduce.Job: Job completed successfully\n\n✓ Job completado. Verifica con: hdfs dfs -cat ${outputPath}/part-r-00000 | head`, "success")];
      }

      return [out(`hadoop jar: No se reconoce el job type. Usa grep, wordcount, o TestDFSIO.`, "error")];
    }

    // ── javac ──
    if (base === "javac") {
      const file = tokens.find(t => t.endsWith(".java"));
      if (!file) return [out("javac: no source files", "error")];
      const name = file.replace(".java", "");
      let newFs = { ...localFS };
      const dir = cwd;
      if (newFs[dir]) {
        const classFiles = [`${name}.class`, `${name}$TokenizerMapper.class`, `${name}$IntSumReducer.class`];
        newFs[dir] = { ...newFs[dir], children: [...new Set([...(newFs[dir].children || []), ...classFiles])], files: { ...(newFs[dir].files || {}), ...Object.fromEntries(classFiles.map(f => [f, `[compiled bytecode: ${f}]`])) } };
      }
      setLocalFS(newFs);
      return [out(`✓ Compilación exitosa: ${name}.class, ${name}$TokenizerMapper.class, ${name}$IntSumReducer.class`, "success")];
    }

    // ── jar (create) ──
    if (base === "jar" && tokens[1] === "cf") {
      const jarName = tokens[2];
      if (!jarName) return [out("jar: faltan argumentos", "error")];
      let newFs = { ...localFS };
      if (newFs[cwd]) {
        newFs[cwd] = { ...newFs[cwd], children: [...new Set([...(newFs[cwd].children || []), jarName])], files: { ...(newFs[cwd].files || {}), [jarName]: `[JAR archive: ${jarName}]` } };
      }
      setLocalFS(newFs);
      return [out(`✓ ${jarName} creado correctamente`, "success")];
    }

    // ── nano / vim / gedit ──
    if (["nano", "vim", "vi", "gedit"].includes(base)) {
      return [out(`(Simulación: el editor ${base} no está disponible en este simulador.\nUsa 'cat' para ver archivos o 'echo "contenido" > archivo' para crear.)`, "warn")];
    }

    // ── unknown command ──
    return [out(`bash: ${base}: comando no encontrado`, "error")];
  }, [cwd, services, localFS, hdfsFS, safeMode, hdfsSnapEnabled, hdfsSnapshots, appCounter, fsimageCounter, out, resolvePath, getLocalNode, getHdfsNode, ensureHdfsDir, ensureLocalDir, yarnApps]);

  function parseTokens(cmd) {
    const tokens = [];
    let current = "";
    let inQuote = false;
    let quoteChar = "";
    for (const ch of cmd) {
      if (inQuote) {
        if (ch === quoteChar) { inQuote = false; }
        else current += ch;
      } else if (ch === "'" || ch === '"') {
        inQuote = true; quoteChar = ch;
      } else if (ch === " " || ch === "\t") {
        if (current) { tokens.push(current); current = ""; }
      } else { current += ch; }
    }
    if (current) tokens.push(current);
    return tokens;
  }

  const handleSubmit = () => {
    const cmd = input.trim();
    if (!cmd) return;

    const prompt = { type: "prompt", text: `hadoop@hadoop-VirtualBox:${cwd === "/home/hadoop" ? "~" : cwd}$ ${cmd}` };
    setHistory(prev => [cmd, ...prev]);
    setHistIdx(-1);
    setInput("");

    const results = processCommand(cmd);
    const isClear = results.some(r => r.type === "clear");

    if (isClear) {
      setLines([]);
    } else {
      setLines(prev => [...prev, prompt, ...results]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") { handleSubmit(); }
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0) {
        const newIdx = Math.min(histIdx + 1, history.length - 1);
        setHistIdx(newIdx);
        setInput(history[newIdx]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx > 0) { setHistIdx(histIdx - 1); setInput(history[histIdx - 1]); }
      else { setHistIdx(-1); setInput(""); }
    } else if (e.key === "Tab") {
      e.preventDefault();
      // Basic autocomplete
      const tokens = input.split(" ");
      const last = tokens[tokens.length - 1];
      if (last) {
        const commands = ["hdfs", "hadoop", "yarn", "mapred", "jps", "ls", "cd", "pwd", "mkdir", "cat", "cp", "mv", "rm", "chmod", "touch", "ps", "top", "hostname", "uname", "free", "df", "lscpu", "echo", "clear", "help", "whoami", "head", "tail", "grep", "javac", "jar", "ssh", "scp", "md5sum", "lsb_release"];
        const match = commands.find(c => c.startsWith(last));
        if (match) { tokens[tokens.length - 1] = match; setInput(tokens.join(" ")); }
      }
    }
  };

  // ── Service Status Bar ──
  const svcDot = (active) => (
    <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: active ? "#4ade80" : "#ef4444", marginRight: 4, boxShadow: active ? "0 0 6px #4ade80" : "0 0 4px #ef4444" }} />
  );

  if (!localFS || !hdfsFS) return <div style={{ background: "#0d0d0d", color: "#ccc", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace" }}>Cargando sistema...</div>;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#0a0a0a", fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'SF Mono', monospace", color: "#e0e0e0", overflow: "hidden" }}>
      {/* ── Title Bar ── */}
      <div style={{ background: "linear-gradient(180deg, #3a3a3a 0%, #2b2b2b 100%)", borderBottom: "1px solid #1a1a1a", padding: "6px 16px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57", border: "1px solid #e0443e" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e", border: "1px solid #d4a123" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840", border: "1px solid #1aab29" }} />
        </div>
        <span style={{ fontSize: 12, color: "#999", flex: 1, textAlign: "center", letterSpacing: 0.5 }}>
          hadoop@hadoop-VirtualBox: {cwd === "/home/hadoop" ? "~" : cwd}
        </span>
        <span style={{ fontSize: 10, color: "#666" }}>Ubuntu 22.04</span>
      </div>

      {/* ── Service Status ── */}
      <div style={{ background: "#111", borderBottom: "1px solid #222", padding: "5px 12px", display: "flex", gap: 16, fontSize: 11, flexShrink: 0, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ color: "#777", fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>Servicios:</span>
        <span style={{ display: "flex", alignItems: "center" }}>{svcDot(services.namenode)}<span style={{ color: services.namenode ? "#8f8" : "#888" }}>NameNode</span></span>
        <span style={{ display: "flex", alignItems: "center" }}>{svcDot(services.datanode)}<span style={{ color: services.datanode ? "#8f8" : "#888" }}>DataNode</span></span>
        <span style={{ display: "flex", alignItems: "center" }}>{svcDot(services.secondarynamenode)}<span style={{ color: services.secondarynamenode ? "#8f8" : "#888" }}>2NN</span></span>
        <span style={{ color: "#333" }}>│</span>
        <span style={{ display: "flex", alignItems: "center" }}>{svcDot(services.resourcemanager)}<span style={{ color: services.resourcemanager ? "#8f8" : "#888" }}>RM</span></span>
        <span style={{ display: "flex", alignItems: "center" }}>{svcDot(services.nodemanager)}<span style={{ color: services.nodemanager ? "#8f8" : "#888" }}>NM</span></span>
        <span style={{ display: "flex", alignItems: "center" }}>{svcDot(services.historyserver)}<span style={{ color: services.historyserver ? "#8f8" : "#888" }}>HistoryServer</span></span>
        <span style={{ color: "#333" }}>│</span>
        <span style={{ color: safeMode ? "#fbbf24" : "#555", fontSize: 10 }}>{safeMode ? "⚠ SAFE MODE" : "Safe Mode: OFF"}</span>
      </div>

      {/* ── Quick Reference Tabs ── */}
      <div style={{ background: "#0f0f0f", borderBottom: "1px solid #1a1a1a", padding: "0 8px", display: "flex", gap: 0, fontSize: 11, flexShrink: 0 }}>
        {[
          { id: "terminal", label: "Terminal" },
          { id: "guide", label: "Guía Rápida" },
        ].map(tab => (
          <button key={tab.id} onClick={() => { setTabHighlight(tab.id); if (tab.id === "guide") setShowHelp(true); else setShowHelp(false); }} style={{ padding: "7px 14px", background: tabHighlight === tab.id ? "#1a1a1a" : "transparent", color: tabHighlight === tab.id ? "#e0e0e0" : "#666", border: "none", borderBottom: tabHighlight === tab.id ? "2px solid #e2854b" : "2px solid transparent", cursor: "pointer", fontFamily: "inherit", fontSize: 11, transition: "all 0.2s" }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Main Content ── */}
      {showHelp ? (
        <div style={{ flex: 1, overflow: "auto", padding: 16, fontSize: 12, lineHeight: 1.7, color: "#bbb" }}>
          <div style={{ maxWidth: 800 }}>
            <h3 style={{ color: "#e2854b", margin: "0 0 12px", fontSize: 14, fontWeight: 600 }}>Guía Rápida de Estudio — Parcial Big Data</h3>
            <div style={{ display: "grid", gap: 12 }}>
              {[
                { title: "1. Arrancar el clúster", cmds: ["cd /opt/hadoop/sbin", "./start-dfs.sh", "./start-yarn.sh", "jps"] },
                { title: "2. Crear dir y subir archivo a HDFS", cmds: ["hdfs dfs -mkdir /log-nodemanager", "cp /opt/hadoop/logs/hadoop-hadoop-nodemanager-hadoop-VirtualBox.log /tmp/", "hdfs dfs -put /tmp/hadoop-hadoop-nodemanager-hadoop-VirtualBox.log /log-nodemanager/"] },
                { title: "3. Ejecutar Grep MapReduce", cmds: ["cd /opt/hadoop/share/hadoop/mapreduce", "hadoop jar hadoop-mapreduce-examples-3.4.1.jar grep /log-nodemanager /resultado_lognm 'transitioned from'", "hdfs dfs -cat /resultado_lognm/part-r-00000"] },
                { title: "4. Snapshot HDFS", cmds: ["hdfs dfsadmin -allowSnapshot /log-nodemanager", "hdfs dfs -createSnapshot /log-nodemanager snap_antes", "hdfs dfs -ls /log-nodemanager/.snapshot", "hdfs dfs -rm /log-nodemanager/hadoop-hadoop-nodemanager-hadoop-VirtualBox.log", "hdfs dfs -cp /log-nodemanager/.snapshot/snap_antes/* /log-nodemanager/"] },
                { title: "5. Checkpoint manual (fsimage)", cmds: ["ls -lh /datos/namenode/current", "hdfs dfsadmin -safemode enter", "hdfs dfsadmin -saveNamespace", "hdfs dfsadmin -safemode leave", "ls -lh /datos/namenode/current"] },
                { title: "6. Benchmark TestDFSIO", cmds: ["hadoop jar hadoop-mapreduce-client-jobclient-3.4.1-tests.jar TestDFSIO -write -nrFiles 10 -fileSize 100"] },
                { title: "7. YARN CLI", cmds: ["yarn node -list", "yarn application -list", "yarn application -status application_1700000000000_0001"] },
              ].map((section, i) => (
                <div key={i} style={{ background: "#151515", border: "1px solid #222", borderRadius: 6, padding: "10px 14px" }}>
                  <div style={{ color: "#e2854b", fontWeight: 600, marginBottom: 6, fontSize: 12 }}>{section.title}</div>
                  {section.cmds.map((cmd, j) => (
                    <div key={j} onClick={() => { setInput(cmd); setTabHighlight("terminal"); setShowHelp(false); setTimeout(() => inputRef.current?.focus(), 100); }} style={{ padding: "3px 8px", margin: "2px 0", background: "#0d0d0d", borderRadius: 3, cursor: "pointer", color: "#8ec07c", fontSize: 11.5, fontFamily: "inherit", transition: "background 0.15s" }} onMouseEnter={e => e.target.style.background = "#1a2a1a"} onMouseLeave={e => e.target.style.background = "#0d0d0d"}>
                      $ {cmd}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div ref={termRef} onClick={focusInput} style={{ flex: 1, overflow: "auto", padding: "8px 12px", cursor: "text" }}>
          {lines.map((line, i) => {
            let color = "#e0e0e0";
            let bg = "transparent";
            if (line.type === "prompt") color = "#8ec07c";
            if (line.type === "error") color = "#fb4934";
            if (line.type === "warn") color = "#fabd2f";
            if (line.type === "success") color = "#b8bb26";
            if (line.type === "system") { color = "#83a598"; }
            if (line.type === "help") color = "#d3869b";

            return (
              <pre key={i} style={{ margin: 0, padding: line.type === "prompt" ? "6px 0 0" : "0 0 1px", fontFamily: "inherit", fontSize: 12.5, lineHeight: 1.5, color, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                {line.text}
              </pre>
            );
          })}

          {/* ── Input Line ── */}
          <div style={{ display: "flex", alignItems: "center", marginTop: 4 }}>
            <span style={{ color: "#b8bb26", fontSize: 12.5, flexShrink: 0, fontWeight: 600 }}>
              hadoop@hadoop-VirtualBox
            </span>
            <span style={{ color: "#666", margin: "0 2px", fontSize: 12.5 }}>:</span>
            <span style={{ color: "#83a598", fontSize: 12.5, flexShrink: 0 }}>
              {cwd === "/home/hadoop" ? "~" : cwd}
            </span>
            <span style={{ color: "#e0e0e0", margin: "0 4px 0 2px", fontSize: 12.5 }}>$</span>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              spellCheck={false}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#e0e0e0",
                fontFamily: "inherit",
                fontSize: 12.5,
                caretColor: "#e2854b",
                lineHeight: 1.5,
              }}
            />
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <div style={{ background: "#111", borderTop: "1px solid #1a1a1a", padding: "4px 12px", fontSize: 10, color: "#444", display: "flex", justifyContent: "space-between", flexShrink: 0 }}>
        <span>Big Data 2026-I — Simulador Hadoop</span>
        <span>Tab: autocompletar · ↑↓: historial · help: comandos</span>
      </div>
    </div>
  );
}
