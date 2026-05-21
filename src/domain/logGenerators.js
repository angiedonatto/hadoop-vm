export function genNMLog() {
  const lines = [];
  for (let i = 1; i <= 30; i++) {
    const d = String(i).padStart(2, "0");
    lines.push(
      `2026-02-${d} 08:00:01,234 INFO org.apache.hadoop.yarn.server.nodemanager.NodeManager: transitioned from INITED to STARTED`,
      `2026-02-${d} 08:00:02,567 INFO org.apache.hadoop.yarn.server.nodemanager.containermanager.ContainerManagerImpl: Starting resource-monitoring for container_1700000000000_000${i}_01_000001`,
      `2026-02-${d} 08:05:15,890 INFO org.apache.hadoop.yarn.server.nodemanager.containermanager.container.ContainerImpl: Container container_1700000000000_000${i}_01_000001 succeeded`
    );
    if (i % 7 === 0)
      lines.push(`2026-02-${d} 08:06:00,111 WARN org.apache.hadoop.yarn.server.nodemanager.containermanager.container.ContainerImpl: Container container_1700000000000_000${i}_01_000002 failed`);
    lines.push(`2026-02-${d} 08:00:01,500 INFO org.apache.hadoop.yarn.server.nodemanager.NodeStatusUpdaterImpl: transitioned from STARTED to RUNNING`);
  }
  return lines.join("\n");
}

export function genRMLog() {
  const lines = [];
  for (let i = 1; i <= 25; i++) {
    const d = String(i).padStart(2, "0");
    lines.push(
      `2026-02-${d} 08:00:00,100 INFO org.apache.hadoop.yarn.server.resourcemanager.ResourceManager: State change from NEW to SUBMITTED for application_1700000000000_000${i}`,
      `2026-02-${d} 08:00:01,200 INFO org.apache.hadoop.yarn.server.resourcemanager.ResourceManager: State change from SUBMITTED to ACCEPTED for application_1700000000000_000${i}`,
      `2026-02-${d} 08:00:05,300 INFO org.apache.hadoop.yarn.server.resourcemanager.scheduler.capacity.CapacityScheduler: Assigned container container_1700000000000_000${i}_01_000001 of capacity <memory:1024, vCores:1>`,
      `2026-02-${d} 08:01:00,400 INFO org.apache.hadoop.yarn.server.resourcemanager.rmnode.RMNodeImpl: NodeManager from node hadoop-VirtualBox:45454 registered with capability: <memory:4096, vCores:4>`
    );
    if (i % 10 === 0)
      lines.push(`2026-02-${d} 09:00:00,500 WARN org.apache.hadoop.yarn.server.resourcemanager.rmnode.RMNodeImpl: Node hadoop-VirtualBox:45454 has shutdown gracefully`);
  }
  return lines.join("\n");
}

export function genBenchmark(mode, nrFiles, fileSize) {
  const rate = mode === "write" ? (45 + Math.random() * 30).toFixed(2) : (80 + Math.random() * 40).toFixed(2);
  return `26/03/03 10:00:00 INFO fs.TestDFSIO: ----- TestDFSIO ----- : ${mode}\n26/03/03 10:00:00 INFO fs.TestDFSIO:             Date & time: Tue Mar 03 10:00:00 COT 2026\n26/03/03 10:00:00 INFO fs.TestDFSIO:         Number of files: ${nrFiles}\n26/03/03 10:00:00 INFO fs.TestDFSIO:  Total MBytes processed: ${nrFiles * fileSize}\n26/03/03 10:00:00 INFO fs.TestDFSIO:       Throughput mb/sec: ${rate}\n26/03/03 10:00:00 INFO fs.TestDFSIO:  Average IO rate mb/sec: ${(parseFloat(rate) / nrFiles).toFixed(2)}\n26/03/03 10:00:00 INFO fs.TestDFSIO:   IO rate std deviation: ${(Math.random() * 5).toFixed(2)}\n26/03/03 10:00:00 INFO fs.TestDFSIO:      Test exec time sec: ${(10 + Math.random() * 20).toFixed(1)}`;
}
