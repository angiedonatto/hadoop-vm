export const STORAGE_KEY = "hadoop-vm-state";

export const SLAVE_NODES = {
  nodo2: { ip: "192.168.56.11", hostname: "nodo2" },
  nodo3: { ip: "192.168.56.12", hostname: "nodo3" },
};

export const WELCOME_LINES = [
  { type: "system", text: "Ubuntu 22.04.3 LTS — hadoop-VirtualBox" },
  { type: "system", text: "Simulador de entorno Hadoop/HDFS/YARN/MapReduce — Big Data 2026-I" },
  { type: "system", text: 'Escribe "help" para ver los comandos disponibles.\n' },
];

export const INITIAL_SERVICES = {
  namenode: false,
  datanode: false,
  secondarynamenode: false,
  resourcemanager: false,
  nodemanager: false,
  historyserver: false,
};
