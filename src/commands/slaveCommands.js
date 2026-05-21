import { parseTokens } from "../domain/tokens";
import { SLAVE_NODES } from "../domain/constants";

export function runSlaveCommand(cmd, ctx) {
  const { out, sshNode, sshCwd, services, setSshNode, setSshCwd } = ctx;
  const trimmed = cmd.trim();
  if (!trimmed) return [];
  const tokens = parseTokens(trimmed);
  const base = tokens[0];
  const node = SLAVE_NODES[sshNode];
  if (!node) return [];
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
}
