# Hadoop VM Simulator

Simulador interactivo de un entorno Hadoop orientado a práctica académica y demostración de conceptos de Big Data. La aplicación recrea, desde el navegador, una experiencia similar a trabajar sobre una máquina virtual con servicios de `HDFS`, `YARN`, `MapReduce` y `Hive`, incluyendo terminal, archivos, estados de servicios y vistas tipo Web UI.

Su objetivo es ofrecer un entorno accesible para explorar flujos comunes de administración y uso de Hadoop sin depender de una instalación distribuida real.

## Vista General

El proyecto está construido con `React` y `Vite` y presenta una interfaz principal tipo terminal desde la que se pueden ejecutar comandos simulados de Linux y Hadoop. A esto se suman paneles visuales para consultar el estado de `HDFS`, `YARN`, `Job History` y `Hive`.

La aplicación mantiene estado local en el navegador, por lo que el progreso del usuario puede persistir entre sesiones. También incluye un sistema de archivos local simulado, un sistema de archivos `HDFS` virtual, pestañas múltiples de terminal y navegación entre nodos esclavos mediante `SSH`.

## Características

- Terminal interactiva con comandos Linux básicos y utilidades frecuentes para laboratorio.
- Simulación de servicios `NameNode`, `DataNode`, `SecondaryNameNode`, `ResourceManager`, `NodeManager` y `JobHistoryServer`.
- Soporte para comandos `hdfs dfs`, `hdfs dfsadmin`, `hdfs fsck`, `yarn` y `hadoop jar`.
- Flujo de trabajo de `HiveServer2` y cliente `Beeline` con consultas `HiveQL`.
- Carga de archivos al sistema local simulado y transferencia hacia `HDFS`.
- Pestañas visuales para `HDFS`, `YARN`, `History` y `Hive` emulando Web UIs.
- Persistencia de estado con `localStorage`.
- Historial de comandos, autocompletado con `Tab` y múltiples pestañas de terminal.
- Escenarios de práctica como snapshots, safemode, checkpoint y ejecución de ejemplos MapReduce.

## Tecnologías

- `React 19`
- `Vite 7`
- `ESLint 9`
- JavaScript modular con separación por dominio, comandos y componentes UI

## Estructura del Proyecto

```text
src/
  commands/
    handlers/        # Lógica de comandos HDFS, YARN y Hadoop JAR
  components/
    webui/           # Interfaces visuales de HDFS, YARN, History y Hive
  domain/            # Estado inicial, constantes, filesystem y utilidades
  App.jsx
  main.jsx
```

## Instalación

Requisitos:

- `Node.js` 18 o superior
- `npm`

Instalación y arranque:

```bash
npm install
npm run dev
```

Para generar la versión de producción:

```bash
npm run build
```

Para previsualizar el build:

```bash
npm run preview
```

## Scripts Disponibles

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Flujo de Uso

Una secuencia típica dentro del simulador puede ser:

```bash
cd /opt/hadoop/sbin
./start-dfs.sh
./start-yarn.sh
jps
hdfs dfs -mkdir /log-nodemanager
mapred historyserver
cd /opt/hadoop/hive/bbdd
hiveserver2
beeline
!connect jdbc:hive2://hadoop-virtualbox:10000
show databases;
```

Desde la interfaz también es posible:

- Abrir varias pestañas de terminal.
- Cambiar entre el nodo maestro y nodos esclavos con `ssh nodo2` o `ssh nodo3`.
- Consultar paneles gráficos de servicios desde las pestañas superiores.
- Reiniciar el entorno con `reset`.

## Alcance del Simulador

Este proyecto no ejecuta un clúster Hadoop real. En cambio, modela comportamientos esperados de comandos, servicios, archivos y salidas para fines didácticos. Eso lo hace especialmente útil para:

- Prácticas guiadas de clase.
- Demostraciones funcionales.
- Repaso de comandos y flujos operativos.
- Prototipado de experiencias de aprendizaje interactivas.

## Calidad y Mantenimiento

El código está organizado en módulos con responsabilidades separadas:

- `domain`: estado, utilidades y modelos base.
- `commands`: interpretación y ejecución de comandos simulados.
- `components`: experiencia visual principal y paneles auxiliares.

Esta separación facilita extender el simulador con nuevos comandos, más vistas o escenarios académicos adicionales.

## Licencia

Si deseas publicar o distribuir este proyecto, conviene añadir una licencia explícita en el repositorio, por ejemplo `MIT`.
