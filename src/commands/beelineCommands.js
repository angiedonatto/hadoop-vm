export function runBeelineCommand(cmd, ctx) {
  const {
    out, beelineConnected, hiveDBs, currentHiveDB, appCounter, cwd, hdfsFS,
    getLocalNode, resolvePath, ensureHdfsDir, ensureLocalDir, run,
    setAppCounter, setYarnApps, setHiveDBs, setHiveQueries, setCurrentHiveDB,
    setBeelineMode, setBeelineConnected, setLocalFS, setHdfsFS,
  } = ctx;

  const trimmed = cmd.trim().replace(/;\s*$/, "").replace(/\s+/g, " ");
  const lower = trimmed.toLowerCase();

  const renderTable = (cols, rows) => {
    if (rows.length === 0) {
      const maxWs = cols.map(c => c.length);
      const sep = "+" + maxWs.map(w => "-".repeat(w + 2)).join("+") + "+";
      return `${sep}\n| ${cols.join(" | ")} |\n${sep}\n${sep}\n0 rows selected`;
    }
    const maxWs = cols.map((c, i) => Math.max(c.length, ...rows.map(r => String(r[i] ?? "NULL").length)));
    const sep = "+" + maxWs.map(w => "-".repeat(w + 2)).join("+") + "+";
    const hdr = "| " + cols.map((c, i) => c.padEnd(maxWs[i])).join(" | ") + " |";
    const body = rows.map(r => "| " + cols.map((c, i) => String(r[i] ?? "NULL").padEnd(maxWs[i])).join(" | ") + " |");
    return `${sep}\n${hdr}\n${sep}\n${body.join("\n")}\n${sep}\n${rows.length} row${rows.length !== 1 ? "s" : ""} selected`;
  };

  const mrLog = (jobName, appId) => {
    const jobId = `job_1700000000000_${String(appId).padStart(4, "0")}`;
    return `INFO  : Compiling command(queryId=hive_${Date.now()})\nINFO  : Semantic Analysis Completed\nINFO  : Returning Hive schema field info\nINFO  : Starting job = ${jobId}, alias = ${jobName}\nINFO  : Hadoop job information for Stage-1: number of mappers: 1; number of reducers: 1\nINFO  : map = 0%,  reduce = 0%\nINFO  : map = 100%,  reduce = 0%\nINFO  : map = 100%,  reduce = 100%\nINFO  : Ended Job = ${jobId}`;
  };

  const evalCond = (row, colNames, cond) => {
    const c = cond.trim();
    const nullM = c.match(/^(\w+)\s+IS\s+(NOT\s+)?NULL$/i);
    if (nullM) { const ci = colNames.indexOf(nullM[1]); if (ci < 0) return true; const v = row[ci]; return nullM[2] ? (v != null && v !== "" && v !== "NULL") : (v == null || v === "" || v === "NULL"); }
    const btwM = c.match(/^(\w+)\s+BETWEEN\s+([^\s]+)\s+AND\s+([^\s]+)$/i);
    if (btwM) { const ci = colNames.indexOf(btwM[1]); if (ci < 0) return true; const v = parseFloat(row[ci]); return v >= parseFloat(btwM[2]) && v <= parseFloat(btwM[3]); }
    const inM = c.match(/^(\w+)\s+NOT\s+IN\s*\(([^)]+)\)$/i);
    if (inM) { const ci = colNames.indexOf(inM[1]); if (ci < 0) return true; const vals = inM[2].split(",").map(v => v.trim().replace(/^['"]|['"]$/g, "")); return !vals.includes(String(row[ci] ?? "")); }
    const inM2 = c.match(/^(\w+)\s+IN\s*\(([^)]+)\)$/i);
    if (inM2) { const ci = colNames.indexOf(inM2[1]); if (ci < 0) return true; const vals = inM2[2].split(",").map(v => v.trim().replace(/^['"]|['"]$/g, "")); return vals.includes(String(row[ci] ?? "")); }
    const likeM = c.match(/^(\w+)\s+NOT\s+LIKE\s+['"](.*?)['"]$/i);
    if (likeM) { const ci = colNames.indexOf(likeM[1]); if (ci < 0) return true; const pat = likeM[2].replace(/%/g, ".*").replace(/_/g, "."); return !new RegExp("^" + pat + "$", "i").test(String(row[ci] ?? "")); }
    const likeM2 = c.match(/^(\w+)\s+LIKE\s+['"](.*?)['"]$/i);
    if (likeM2) { const ci = colNames.indexOf(likeM2[1]); if (ci < 0) return true; const pat = likeM2[2].replace(/%/g, ".*").replace(/_/g, "."); return new RegExp("^" + pat + "$", "i").test(String(row[ci] ?? "")); }
    const cmpM = c.match(/^(\w+)\s*(=|!=|<>|>=|<=|>|<)\s*['"]?(.*?)['"]?$/);
    if (cmpM) { const ci = colNames.indexOf(cmpM[1]); if (ci < 0) return true; const rv = String(row[ci] ?? ""); const op = cmpM[2]; const val = cmpM[3]; const rn = parseFloat(rv); const vn = parseFloat(val); const numOk = !isNaN(rn) && !isNaN(vn); if (op === "=" || op === "==") return numOk ? rn === vn : rv === val; if (op === "!=" || op === "<>") return numOk ? rn !== vn : rv !== val; if (op === ">") return rn > vn; if (op === "<") return rn < vn; if (op === ">=") return rn >= vn; if (op === "<=") return rn <= vn; }
    return true;
  };

  const applyWhere = (rows, colNames, clause) => {
    if (!clause) return rows;
    return rows.filter(row => {
      const orParts = clause.split(/\s+OR\s+/i);
      return orParts.some(orPart => {
        const andParts = orPart.split(/\s+AND\s+/i);
        return andParts.every(cond => evalCond(row, colNames, cond.trim()));
      });
    });
  };

  const parseColList = (str) => {
    const cols = []; let depth = 0; let cur = "";
    for (const ch of str) {
      if (ch === "(") { depth++; cur += ch; }
      else if (ch === ")") { depth--; cur += ch; }
      else if (ch === "," && depth === 0) { if (cur.trim()) cols.push(cur.trim()); cur = ""; }
      else cur += ch;
    }
    if (cur.trim()) cols.push(cur.trim());
    return cols.map(c => { const p = c.trim().split(/\s+/); return { name: p[0], type: p.slice(1).join(" ") || "STRING" }; }).filter(c => c.name);
  };

  const getHdfsFile = (path) => {
    const abs = path.startsWith("/") ? path : `/user/hadoop/${path}`;
    if (hdfsFS[abs] && hdfsFS[abs].type === "file") return { content: hdfsFS[abs].content || "" };
    const parentPath = abs.substring(0, abs.lastIndexOf("/")) || "/";
    const fname = abs.substring(abs.lastIndexOf("/") + 1);
    const parent = hdfsFS[parentPath];
    if (parent?.files?.[fname] !== undefined) return { content: parent.files[fname] };
    return null;
  };

  if (trimmed === "!exit" || trimmed === "!quit") {
    setBeelineMode(false); setBeelineConnected(false);
    return [out("Closing: 0: jdbc:hive2://hadoop-virtualbox:10000\n(Beeline cerrado)", "system")];
  }
  if (trimmed.startsWith("!connect")) {
    if (trimmed.match(/jdbc:hive2:\/\/hadoop-?virtualbox:10000/i)) {
      setBeelineConnected(true);
      return [out("Connecting to jdbc:hive2://hadoop-virtualbox:10000\nEnter username for jdbc:hive2://hadoop-virtualbox:10000: hadoop\nEnter password for jdbc:hive2://hadoop-virtualbox:10000: \nConnected to: Apache Hive (version 4.0.0)\nDriver: Hive JDBC (version 4.0.0)\nTransaction isolation: TRANSACTION_REPEATABLE_READ", "success")];
    }
    return [out("Error: Could not open connection. Check URL.", "error")];
  }
  if (trimmed.startsWith("!sh ")) {
    if (!beelineConnected) return [out("Error: Not connected.", "error")];
    const shCmd = trimmed.slice(4).trim();
    const result = run(shCmd);
    return result;
  }
  if (trimmed === "!help" || trimmed === "help") {
    return [out(
      "Beeline / HiveQL — Comandos disponibles:\n" +
      "\n  META-COMANDOS (beeline):\n" +
      "  !connect jdbc:hive2://hadoop-virtualbox:10000\n" +
      "  !exit | !quit              — cerrar conexión\n" +
      "  !tables                    — listar tablas actuales\n" +
      "  !columns <tabla>           — columnas de tabla\n" +
      "  !describe <tabla>          — describir tabla\n" +
      "  !sh <comando>              — ejecutar comando Linux\n" +
      "  !set outputformat table    — formato de salida\n" +
      "  !set verbose true/false    — verbosidad\n" +
      "\n  DDL:\n" +
      "  CREATE DATABASE [IF NOT EXISTS] <db>;\n" +
      "  DROP DATABASE [IF EXISTS] <db> [CASCADE];\n" +
      "  USE <db>;\n" +
      "  CREATE [EXTERNAL] TABLE [IF NOT EXISTS] <t> (cols)\n" +
      "    [ROW FORMAT DELIMITED FIELDS TERMINATED BY ',']\n" +
      "    [ROW FORMAT SERDE '...' WITH SERDEPROPERTIES (...)]\n" +
      "    [STORED AS ORC|TEXTFILE|PARQUET]\n" +
      "    [TBLPROPERTIES (\"orc.compress\"=\"SNAPPY\")]\n" +
      "    [PARTITIONED BY (col STRING)]\n" +
      "    [CLUSTERED BY (col) INTO N BUCKETS]\n" +
      "    [LOCATION '/hdfs/path'];\n" +
      "  ALTER TABLE <t> ADD COLUMNS (col tipo);\n" +
      "  DROP TABLE [IF EXISTS] <t>;\n" +
      "  TRUNCATE TABLE <t>;\n" +
      "\n  DML:\n" +
      "  INSERT INTO [TABLE] <t> VALUES (...);\n" +
      "  INSERT INTO TABLE <t> [PARTITION (col)] SELECT ...;\n" +
      "  INSERT OVERWRITE TABLE <t> SELECT ...;\n" +
      "  INSERT OVERWRITE LOCAL DIRECTORY '...' ROW FORMAT DELIMITED FIELDS TERMINATED BY ',' SELECT ...;\n" +
      "  LOAD DATA [LOCAL] INPATH '...' [OVERWRITE] INTO TABLE <t>;\n" +
      "\n  QUERY:\n" +
      "  SELECT [col|*|agg] FROM <t> [JOIN ...] [WHERE ...] [GROUP BY ...] [HAVING ...] [ORDER BY ...] [LIMIT n];\n" +
      "  SELECT ... FROM <t> TABLESAMPLE(BUCKET n OUT OF m ON col);\n" +
      "\n  SHOW/DESCRIBE:\n" +
      "  SHOW DATABASES; SHOW TABLES; SHOW PARTITIONS <t>;\n" +
      "  SHOW CREATE TABLE <t>;\n" +
      "  DESCRIBE [FORMATTED] <t>;\n" +
      "  ANALYZE TABLE <t> COMPUTE STATISTICS;\n" +
      "\n  SET:\n" +
      "  SET hive.exec.dynamic.partition=true;\n" +
      "  SET hive.exec.dynamic.partition.mode=nonstrict;\n" +
      "  SET hive.enforce.bucketing=true;\n" +
      "  SET hive.execution.engine=mr;\n" +
      "  SET mapreduce.job.name=<nombre>;",
      "help"
    )];
  }
  if (trimmed.startsWith("!set ")) {
    const setVal = trimmed.slice(5).trim();
    if (setVal.startsWith("outputformat")) return [out(`outputformat set to ${setVal.split(/\s+/)[1] || "table"}`, "system")];
    if (setVal.startsWith("verbose")) return [out(`verbose set to ${setVal.split(/\s+/)[1] || "true"}`, "system")];
    return [out(`${setVal} set`, "system")];
  }
  if (trimmed.startsWith("!columns ") || trimmed.startsWith("!describe ")) {
    const tName = trimmed.split(/\s+/)[1];
    const db = hiveDBs[currentHiveDB];
    if (!db?.tables[tName]) return [out(`FAILED: Table ${tName} does not exist`, "error")];
    const cols = db.tables[tName].columns;
    return [out(renderTable(["TABLE_NAME", "COLUMN_NAME", "DATA_TYPE"], cols.map(c => [tName, c.name, c.type.toUpperCase()])))];
  }
  if (trimmed === "!tables") {
    const db = hiveDBs[currentHiveDB]; if (!db) return [out("(ninguna tabla)")];
    const tables = Object.keys(db.tables);
    return [out(renderTable(["tab_name"], tables.map(t => [t])))];
  }
  if (!beelineConnected) return [out("Error: Not connected. Use:\n  !connect jdbc:hive2://hadoop-virtualbox:10000", "error")];

  if (lower.startsWith("set ")) {
    const setPart = trimmed.slice(4).trim();
    const kv = setPart.split("=");
    const key = kv[0].trim();
    const val = (kv[1] || "").trim();
    const knownSets = [
      "hive.exec.dynamic.partition", "hive.exec.dynamic.partition.mode",
      "hive.enforce.bucketing", "hive.exec.mode.local.auto",
      "hive.auto.convert.join", "hive.execution.engine",
      "mapreduce.job.name", "hive.mapred.mode",
    ];
    if (knownSets.some(k => key.toLowerCase().startsWith(k.toLowerCase()))) {
      return [out(`${key}=${val}`, "system")];
    }
    return [out(`${key}=${val}`, "system")];
  }

  if (lower === "show databases" || lower === "show schemas") {
    const dbs = Object.keys(hiveDBs);
    return [out(`INFO  : Compiling command: show databases\nINFO  : Completed compiling command\nINFO  : Executing command: show databases\n` + renderTable(["database_name"], dbs.map(d => [d])))];
  }
  if (lower === "show tables") {
    const db = hiveDBs[currentHiveDB]; if (!db) return [out("(ninguna tabla)")];
    const tables = Object.keys(db.tables);
    return [out(renderTable(["tab_name"], tables.map(t => [t])))];
  }
  if (lower.startsWith("show tables in ")) {
    const dbName = trimmed.split(/\s+/)[3];
    const db = hiveDBs[dbName];
    if (!db) return [out(`FAILED: Database ${dbName} does not exist`, "error")];
    return [out(renderTable(["tab_name"], Object.keys(db.tables).map(t => [t])))];
  }
  if (lower.startsWith("show partitions ")) {
    const tName = trimmed.split(/\s+/)[2];
    const db = hiveDBs[currentHiveDB];
    if (!db?.tables[tName]) return [out(`FAILED: Table ${tName} does not exist`, "error")];
    const partitions = db.tables[tName].partitions || [];
    if (partitions.length === 0) return [out(`+---------------------+\n| partition           |\n+---------------------+\n+---------------------+\n0 rows selected`)];
    return [out(renderTable(["partition"], partitions.map(p => [p])))];
  }
  if (lower.startsWith("show create table ")) {
    const tName = trimmed.split(/\s+/)[3];
    const db = hiveDBs[currentHiveDB];
    if (!db?.tables[tName]) return [out(`FAILED: Table ${tName} does not exist`, "error")];
    const t = db.tables[tName];
    const cols = t.columns.map(c => `  ${c.name} ${c.type.toUpperCase()}`).join(",\n");
    const isExt = t.external ? "EXTERNAL " : "";
    const loc = t.location ? `\nLOCATION '${t.location}'` : `\nLOCATION '/user/hive/warehouse/${currentHiveDB === "default" ? "" : currentHiveDB + ".db/"}${tName}'`;
    const rowFmt = t.rowFormat ? `\nROW FORMAT ${t.rowFormat}` : "\nROW FORMAT DELIMITED\n  FIELDS TERMINATED BY '\\t'";
    const storedAs = t.storedAs ? `\nSTORED AS ${t.storedAs}` : "\nSTORED AS TEXTFILE";
    const partBy = t.partitionedBy ? `\nPARTITIONED BY (${t.partitionedBy.map(p => `${p.name} ${p.type}`).join(", ")})` : "";
    const clustBy = t.clusteredBy ? `\nCLUSTERED BY (${t.clusteredBy.col}) INTO ${t.clusteredBy.buckets} BUCKETS` : "";
    const tblProp = t.tblproperties ? `\nTBLPROPERTIES (${Object.entries(t.tblproperties).map(([k, v]) => `"${k}"="${v}"`).join(", ")})` : "";
    const ddl = `CREATE ${isExt}TABLE \`${tName}\` (\n${cols}\n)${rowFmt}${storedAs}${partBy}${clustBy}${loc}${tblProp}`;
    return [out(renderTable(["createtab_stmt"], [[ddl]]))];
  }

  if (lower.startsWith("select current_database()")) {
    return [out(renderTable(["current_database()"], [[currentHiveDB]]))];
  }

  if (lower.startsWith("create database ") || lower.startsWith("create schema ")) {
    const ifNotExists = /if\s+not\s+exists/i.test(trimmed);
    const dbNameM = trimmed.match(/create\s+(?:database|schema)\s+(?:if\s+not\s+exists\s+)?(\w+)/i);
    const dbName = dbNameM ? dbNameM[1] : null;
    if (!dbName) return [out("Error: Falta nombre de base de datos", "error")];
    if (hiveDBs[dbName]) {
      if (ifNotExists) return [out(`No rows affected`)];
      return [out(`FAILED: Database ${dbName} already exists`, "error")];
    }
    setHiveDBs(prev => ({ ...prev, [dbName]: { tables: {} } }));
    const whPath = `/user/hive/warehouse/${dbName}.db`;
    setHdfsFS(prev => ensureHdfsDir(whPath, { ...prev }));
    return [out(`INFO  : Compiling command: create database ${dbName}\nINFO  : Executing command\nNo rows affected\n\n✓ Base de datos '${dbName}' creada.\n  HDFS: ${whPath}`, "success")];
  }
  if (lower.startsWith("drop database ") || lower.startsWith("drop schema ")) {
    const ifExists = /if\s+exists/i.test(trimmed);
    const dbNameM = trimmed.match(/drop\s+(?:database|schema)\s+(?:if\s+exists\s+)?(\w+)/i);
    const dbName = dbNameM ? dbNameM[1] : null;
    const cascade = lower.includes("cascade");
    if (!hiveDBs[dbName]) {
      if (ifExists) return [out("No rows affected")];
      return [out(`FAILED: Database ${dbName} does not exist`, "error")];
    }
    if (dbName === "default") return [out("FAILED: Cannot drop default database", "error")];
    if (!cascade && Object.keys(hiveDBs[dbName].tables).length > 0) return [out(`FAILED: Database ${dbName} is not empty. Use CASCADE.`, "error")];
    setHiveDBs(prev => { const n = { ...prev }; delete n[dbName]; return n; });
    if (currentHiveDB === dbName) setCurrentHiveDB("default");
    return [out(`No rows affected\n✓ Database '${dbName}' dropped`, "success")];
  }
  if (lower.startsWith("use ")) {
    const dbName = trimmed.split(/\s+/)[1];
    if (!hiveDBs[dbName]) return [out(`FAILED: Database ${dbName} does not exist`, "error")];
    setCurrentHiveDB(dbName);
    return [out(`No rows affected`)];
  }

  if (lower.startsWith("create ")) {
    const isExternal = /create\s+external\s+table/i.test(trimmed);
    const ifNotExists = /if\s+not\s+exists/i.test(trimmed);

    const tNameM = trimmed.match(/create\s+(?:external\s+)?table\s+(?:if\s+not\s+exists\s+)?(\w+)/i);
    if (!tNameM) return [out("Error: Syntax error in CREATE TABLE", "error")];
    const tName = tNameM[1];

    if (ifNotExists && hiveDBs[currentHiveDB]?.tables[tName]) return [out("No rows affected")];
    if (!ifNotExists && hiveDBs[currentHiveDB]?.tables[tName]) return [out(`FAILED: Table ${tName} already exists`, "error")];

    const afterName = trimmed.slice(trimmed.toLowerCase().indexOf(tName.toLowerCase()) + tName.length).trim();
    let colStr = "";
    let rest = afterName;
    if (afterName.startsWith("(")) {
      let depth = 0; let i = 0; let colEnd = -1;
      for (; i < afterName.length; i++) {
        if (afterName[i] === "(") depth++;
        else if (afterName[i] === ")") { depth--; if (depth === 0) { colEnd = i; break; } }
      }
      if (colEnd > 0) { colStr = afterName.slice(1, colEnd); rest = afterName.slice(colEnd + 1).trim(); }
    }

    const colDefs = colStr ? parseColList(colStr) : [];

    let rowFormat = null;
    const rfDelim = rest.match(/ROW\s+FORMAT\s+DELIMITED\s+FIELDS\s+TERMINATED\s+BY\s+['"](.*?)['"]/i);
    const rfSerde = rest.match(/ROW\s+FORMAT\s+SERDE\s+['"]([^'"]+)['"]/i);
    if (rfDelim) rowFormat = `DELIMITED FIELDS TERMINATED BY '${rfDelim[1]}'`;
    else if (rfSerde) {
      const serdeProps = rest.match(/WITH\s+SERDEPROPERTIES\s*\(([^)]+)\)/i);
      rowFormat = `SERDE '${rfSerde[1]}'${serdeProps ? " WITH SERDEPROPERTIES (" + serdeProps[1] + ")" : ""}`;
    }

    const storedM = rest.match(/STORED\s+AS\s+(\w+)/i);
    const storedAs = storedM ? storedM[1].toUpperCase() : "TEXTFILE";

    let tblprops = null;
    const tblpM = rest.match(/TBLPROPERTIES\s*\(([^)]+)\)/i);
    if (tblpM) {
      tblprops = {};
      tblpM[1].split(",").forEach(kv => {
        const [k, v] = kv.split("=").map(s => s.trim().replace(/^["']|["']$/g, ""));
        if (k) tblprops[k] = v;
      });
    }

    let partitionedBy = null;
    const partM = rest.match(/PARTITIONED\s+BY\s*\(([^)]+)\)/i);
    if (partM) {
      partitionedBy = partM[1].split(",").map(p => { const pp = p.trim().split(/\s+/); return { name: pp[0], type: (pp[1] || "STRING").toUpperCase() }; });
    }

    let clusteredBy = null;
    const clustM = rest.match(/CLUSTERED\s+BY\s*\((\w+)\)\s+INTO\s+(\d+)\s+BUCKETS/i);
    if (clustM) clusteredBy = { col: clustM[1], buckets: parseInt(clustM[2]) };

    let location = null;
    const locM = rest.match(/LOCATION\s+['"]([^'"]+)['"]/i);
    if (locM) {
      location = locM[1];
      setHdfsFS(prev => ensureHdfsDir(location, { ...prev }));
    }

    const tableEntry = {
      columns: colDefs,
      rows: [],
      partitions: [],
      external: isExternal,
      rowFormat,
      storedAs,
      tblproperties: tblprops,
      partitionedBy,
      clusteredBy,
      location,
    };

    setHiveDBs(prev => {
      const db = { ...prev[currentHiveDB] };
      db.tables = { ...db.tables, [tName]: tableEntry };
      return { ...prev, [currentHiveDB]: db };
    });
    const whPath = location || `/user/hive/warehouse/${currentHiveDB === "default" ? "" : currentHiveDB + ".db/"}${tName}`;
    if (!location) setHdfsFS(prev => ensureHdfsDir(whPath, { ...prev }));
    setHiveQueries(prev => [...prev, { q: cmd, db: currentHiveDB, ts: Date.now(), state: "FINISHED" }]);

    const extNote = isExternal ? " EXTERNAL" : "";
    const storNote = storedAs !== "TEXTFILE" ? ` [STORED AS ${storedAs}]` : "";
    const partNote = partitionedBy ? ` [PARTITIONED BY (${partitionedBy.map(p => p.name).join(", ")})]` : "";
    const clustNote = clusteredBy ? ` [CLUSTERED BY (${clusteredBy.col}) INTO ${clusteredBy.buckets} BUCKETS]` : "";
    const locNote = location ? `\n  LOCATION: ${location}` : `\n  HDFS: ${whPath}`;
    return [out(`INFO  : Compiling command: create${extNote} table ${tName}\nINFO  : Starting task [Stage-0:DDL] in serial mode\nINFO  : Completed executing command\nNo rows affected\n\n✓ Tabla${extNote} '${tName}' creada en '${currentHiveDB}'${storNote}${partNote}${clustNote}${locNote}`, "success")];
  }

  if (lower.startsWith("alter table ")) {
    const altM = trimmed.match(/alter\s+table\s+(\w+)\s+(.+)/i);
    if (!altM) return [out("Error: Syntax error in ALTER TABLE", "error")];
    const tName = altM[1]; const altOp = altM[2].trim();
    const db = hiveDBs[currentHiveDB];
    if (!db?.tables[tName]) return [out(`FAILED: Table ${tName} does not exist`, "error")];
    if (/^add\s+columns?\s*\(/i.test(altOp)) {
      const colM = altOp.match(/add\s+columns?\s*\(([^)]+)\)/i);
      if (!colM) return [out("Error: Syntax error in ADD COLUMNS", "error")];
      const newCols = colM[1].split(",").map(c => { const p = c.trim().split(/\s+/); return { name: p[0], type: (p[1] || "STRING").toUpperCase() }; });
      setHiveDBs(prev => {
        const d = { ...prev[currentHiveDB] };
        d.tables = { ...d.tables, [tName]: { ...d.tables[tName], columns: [...d.tables[tName].columns, ...newCols] } };
        return { ...prev, [currentHiveDB]: d };
      });
      return [out(`No rows affected\n✓ Columnas añadidas a '${tName}': ${newCols.map(c => c.name).join(", ")}`, "success")];
    }
    if (/^add\s+partition/i.test(altOp)) {
      const pM = altOp.match(/partition\s*\(([^)]+)\)/i);
      const partVal = pM ? pM[1] : "unknown";
      setHiveDBs(prev => {
        const d = { ...prev[currentHiveDB] };
        const t = d.tables[tName];
        d.tables = { ...d.tables, [tName]: { ...t, partitions: [...(t.partitions || []), partVal] } };
        return { ...prev, [currentHiveDB]: d };
      });
      return [out(`No rows affected\n✓ Partición '${partVal}' añadida a '${tName}'`, "success")];
    }
    return [out(`No rows affected`)];
  }

  if (lower.startsWith("drop table ")) {
    const parts = trimmed.split(/\s+/);
    const ifExists = lower.includes("if exists");
    const tName = ifExists ? parts[4] : parts[2];
    const db = hiveDBs[currentHiveDB];
    if (!db?.tables[tName]) {
      if (ifExists) return [out("No rows affected")];
      return [out(`FAILED: Table ${tName} does not exist`, "error")];
    }
    setHiveDBs(prev => { const d = { ...prev[currentHiveDB] }; d.tables = { ...d.tables }; delete d.tables[tName]; return { ...prev, [currentHiveDB]: d }; });
    return [out(`No rows affected\n✓ Tabla '${tName}' eliminada`, "success")];
  }

  if (lower.startsWith("truncate table ")) {
    const tName = trimmed.split(/\s+/)[2];
    const db = hiveDBs[currentHiveDB];
    if (!db?.tables[tName]) return [out(`FAILED: Table ${tName} does not exist`, "error")];
    setHiveDBs(prev => { const d = { ...prev[currentHiveDB] }; d.tables = { ...d.tables, [tName]: { ...d.tables[tName], rows: [], partitions: [] } }; return { ...prev, [currentHiveDB]: d }; });
    return [out(`No rows affected`)];
  }

  if (lower.startsWith("describe formatted ") || lower.startsWith("desc formatted ")) {
    const tName = trimmed.split(/\s+/)[2];
    const db = hiveDBs[currentHiveDB];
    if (!db?.tables[tName]) return [out(`FAILED: Table ${tName} does not exist`, "error")];
    const t = db.tables[tName];
    const cols = t.columns;
    const maxN = Math.max(12, ...cols.map(c => c.name.length));
    const maxT = Math.max(9, ...cols.map(c => c.type.length));
    const sep = "+" + "-".repeat(maxN + 2) + "+" + "-".repeat(maxT + 2) + "+" + "-".repeat(12) + "+";
    let out2 = `${sep}\n| ${"col_name".padEnd(maxN)} | ${"data_type".padEnd(maxT)} | ${"comment".padEnd(10)} |\n${sep}\n`;
    out2 += cols.map(c => `| ${c.name.padEnd(maxN)} | ${c.type.toUpperCase().padEnd(maxT)} | ${"".padEnd(10)} |`).join("\n");
    out2 += `\n${sep}\n\n# Detailed Table Information\n`;
    out2 += `Database:             ${currentHiveDB}\n`;
    out2 += `Table:                ${tName}\n`;
    out2 += `Owner:                hadoop\n`;
    out2 += `Table Type:           ${t.external ? "EXTERNAL_TABLE" : "MANAGED_TABLE"}\n`;
    out2 += `Location:             ${t.location || `/user/hive/warehouse/${currentHiveDB === "default" ? "" : currentHiveDB + ".db/"}${tName}`}\n`;
    out2 += `InputFormat:          ${t.storedAs === "ORC" ? "org.apache.hadoop.hive.ql.io.orc.OrcInputFormat" : "org.apache.hadoop.mapred.TextInputFormat"}\n`;
    out2 += `OutputFormat:         ${t.storedAs === "ORC" ? "org.apache.hadoop.hive.ql.io.orc.OrcOutputFormat" : "org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat"}\n`;
    out2 += `Compressed:           ${(t.tblproperties?.["orc.compress"] === "SNAPPY") ? "Yes (SNAPPY)" : "No"}\n`;
    if (t.partitionedBy) out2 += `Partition Columns:    ${t.partitionedBy.map(p => `${p.name} (${p.type})`).join(", ")}\n`;
    if (t.clusteredBy) out2 += `Bucketing:            Bucketed by (${t.clusteredBy.col}) into ${t.clusteredBy.buckets} buckets\n`;
    if (t.rowFormat) out2 += `SerDe:                ${t.rowFormat.includes("OpenCSV") ? "org.apache.hadoop.hive.serde2.OpenCSVSerde" : "org.apache.hadoop.hive.serde2.lazy.LazySimpleSerDe"}\n`;
    return [out(out2)];
  }
  if (lower.startsWith("describe ") || lower.startsWith("desc ")) {
    const tName = trimmed.split(/\s+/)[1];
    const db = hiveDBs[currentHiveDB];
    if (!db?.tables[tName]) return [out(`FAILED: Table ${tName} does not exist`, "error")];
    const cols = db.tables[tName].columns;
    return [out(renderTable(["col_name", "data_type", "comment"], cols.map(c => [c.name, c.type.toUpperCase(), ""])))];
  }

  if (lower.startsWith("analyze table ")) {
    const tName = trimmed.split(/\s+/)[2];
    const db = hiveDBs[currentHiveDB];
    if (!db?.tables[tName]) return [out(`FAILED: Table ${tName} does not exist`, "error")];
    const rowCount = db.tables[tName].rows.length;
    return [out(`INFO  : Table ${currentHiveDB}.${tName} stats: [numFiles=1, numRows=${rowCount}, totalSize=${rowCount * 50}, rawDataSize=${rowCount * 48}]\nNo rows affected\n✓ Statistics computed for '${tName}'`, "success")];
  }

  if (lower.startsWith("insert ")) {
    const ildM = trimmed.match(/insert\s+overwrite\s+local\s+directory\s+['"](.*?)['"]\s+(?:row\s+format\s+delimited\s+(?:fields\s+terminated\s+by\s+['"](.*?)['"])\s+)?select\s+(.*?)\s+from\s+(\w+)(.*)/is);
    if (ildM) {
      const dirPath = ildM[1]; const sep2 = ildM[2] || ","; const selPart = ildM[3]; const tName = ildM[4];
      const db = hiveDBs[currentHiveDB];
      if (!db?.tables[tName]) return [out(`FAILED: Table ${tName} does not exist`, "error")];
      const tbl = db.tables[tName]; const colNames = tbl.columns.map(c => c.name);
      const selectedCols = selPart.trim() === "*" ? colNames : selPart.split(",").map(c => c.trim());
      const rows = tbl.rows;
      const content = rows.map(r => selectedCols.map(c => { const ci = colNames.indexOf(c); return ci >= 0 ? (r[ci] ?? "") : ""; }).join(sep2)).join("\n");
      const resolvedDir = resolvePath(dirPath, cwd);
      setLocalFS(prev => { const nf = ensureLocalDir(resolvedDir, { ...prev }); const fname = "000000_0"; nf[resolvedDir] = { ...nf[resolvedDir], files: { ...(nf[resolvedDir]?.files || {}), [fname]: content } }; return nf; });
      const aid = appCounter; setAppCounter(c => c + 1);
      setYarnApps(prev => [...prev, { id: aid, name: `export_${tName}`, state: "FINISHED" }]);
      return [out(`INFO  : Starting job = job_1700000000000_${String(aid).padStart(4, "0")}\n${mrLog("export", aid)}\nNo rows affected\n\n✓ ${rows.length} filas exportadas a directorio local '${dirPath}'`, "success")];
    }

    const insOvM = trimmed.match(/insert\s+overwrite\s+table\s+(\w+)\s+(?:partition\s*\(([^)]*)\)\s+)?select\s+(.*?)\s+from\s+(\w+)(.*)/is);
    if (insOvM) {
      const destTable = insOvM[1]; const partSpec = insOvM[2]; const selPart = insOvM[3]; const srcTable = insOvM[4]; const rest2 = insOvM[5] || "";
      const db = hiveDBs[currentHiveDB];
      if (!db?.tables[destTable]) return [out(`FAILED: Table ${destTable} does not exist`, "error")];
      if (!db?.tables[srcTable]) return [out(`FAILED: Table ${srcTable} does not exist`, "error")];
      const srcTbl = db.tables[srcTable]; const srcCols = srcTbl.columns.map(c => c.name);
      const selectedCols = selPart.trim() === "*" ? srcCols : selPart.split(",").map(c => c.trim().split(/\s+as\s+/i)[0].trim());
      const whereM2 = rest2.match(/where\s+(.+?)(?:\s+group\s+by|\s+order\s+by|\s+limit|$)/is);
      let srcRows = [...srcTbl.rows];
      if (whereM2) srcRows = applyWhere(srcRows, srcCols, whereM2[1].trim());
      const mappedRows = srcRows.map(r => selectedCols.map(c => { const ci = srcCols.indexOf(c); return ci >= 0 ? (r[ci] ?? "") : ""; }));
      const aid = appCounter; setAppCounter(c => c + 1);
      setYarnApps(prev => [...prev, { id: aid, name: `insert_overwrite_${destTable}`, state: "FINISHED" }]);
      if (partSpec) {
        const pv = partSpec.split("=").map(s => s.trim().replace(/['"]/g, "")).join("=");
        setHiveDBs(prev => {
          const d = { ...prev[currentHiveDB] };
          const t = d.tables[destTable];
          d.tables = { ...d.tables, [destTable]: { ...t, rows: mappedRows, partitions: [...new Set([...(t.partitions || []), pv])] } };
          return { ...prev, [currentHiveDB]: d };
        });
      } else {
        setHiveDBs(prev => { const d = { ...prev[currentHiveDB] }; d.tables = { ...d.tables, [destTable]: { ...d.tables[destTable], rows: mappedRows } }; return { ...prev, [currentHiveDB]: d }; });
      }
      setHiveQueries(prev => [...prev, { q: cmd, db: currentHiveDB, ts: Date.now(), state: "FINISHED" }]);
      return [out(`${mrLog("insert_overwrite", aid)}\nNo rows affected\n\n✓ ${mappedRows.length} fila(s) escritas en '${destTable}'${partSpec ? " [partición: " + partSpec + "]" : ""}`, "success")];
    }

    const insPartSelM = trimmed.match(/insert\s+into\s+(?:table\s+)?(\w+)\s+partition\s*\(([^)]*)\)\s+select\s+(.*?)\s+from\s+(\w+)(.*)/is);
    if (insPartSelM) {
      const destTable = insPartSelM[1]; const partSpec = insPartSelM[2]; const selPart = insPartSelM[3]; const srcTable = insPartSelM[4]; const rest2 = insPartSelM[5] || "";
      const db = hiveDBs[currentHiveDB];
      if (!db?.tables[destTable]) return [out(`FAILED: Table ${destTable} does not exist`, "error")];
      if (!db?.tables[srcTable]) return [out(`FAILED: Table ${srcTable} does not exist`, "error")];
      const srcTbl = db.tables[srcTable]; const srcCols = srcTbl.columns.map(c => c.name);
      const selectedCols = selPart.trim() === "*" ? srcCols : selPart.split(",").map(c => c.trim().split(/\s+as\s+/i)[0].trim());
      const whereM2 = rest2.match(/where\s+(.+?)(?:\s+group\s+by|\s+order\s+by|\s+limit|$)/is);
      let srcRows = [...srcTbl.rows];
      if (whereM2) srcRows = applyWhere(srcRows, srcCols, whereM2[1].trim());
      const mappedRows = srcRows.map(r => selectedCols.map(c => { const ci = srcCols.indexOf(c); return ci >= 0 ? (r[ci] ?? "") : ""; }));
      const aid = appCounter; setAppCounter(c => c + 1);
      setYarnApps(prev => [...prev, { id: aid, name: `insert_${destTable}`, state: "FINISHED" }]);
      const pv = partSpec.split("=").map(s => s.trim().replace(/['"]/g, "")).join("=");
      setHiveDBs(prev => {
        const d = { ...prev[currentHiveDB] };
        const t = d.tables[destTable];
        d.tables = { ...d.tables, [destTable]: { ...t, rows: [...(t.rows || []), ...mappedRows], partitions: [...new Set([...(t.partitions || []), pv])] } };
        return { ...prev, [currentHiveDB]: d };
      });
      setHiveQueries(prev => [...prev, { q: cmd, db: currentHiveDB, ts: Date.now(), state: "FINISHED" }]);
      return [out(`${mrLog("insert_partition", aid)}\nNo rows affected\n\n✓ ${mappedRows.length} fila(s) insertadas en '${destTable}' [partición: ${partSpec}]`, "success")];
    }

    const insValM = trimmed.match(/insert\s+into\s+(?:table\s+)?(\w+)\s+values\s*(.+)/i);
    if (insValM) {
      const tName = insValM[1]; const db = hiveDBs[currentHiveDB];
      if (!db?.tables[tName]) return [out(`FAILED: Table ${tName} does not exist`, "error")];
      const valuesStr = insValM[2];
      const rowMatches = [...valuesStr.matchAll(/\(([^)]+)\)/g)];
      const newRows = rowMatches.map(rm => rm[1].split(",").map(v => v.trim().replace(/^['"]|['"]$/g, "")));
      const aid = appCounter; setAppCounter(c => c + 1);
      setYarnApps(prev => [...prev, { id: aid, name: `insert_${tName}`, state: "FINISHED" }]);
      setHiveDBs(prev => { const d = { ...prev[currentHiveDB] }; d.tables = { ...d.tables, [tName]: { ...d.tables[tName], rows: [...d.tables[tName].rows, ...newRows] } }; return { ...prev, [currentHiveDB]: d }; });
      setHiveQueries(prev => [...prev, { q: cmd, db: currentHiveDB, ts: Date.now(), state: "FINISHED" }]);
      return [out(`INFO  : Starting job = job_1700000000000_${String(aid).padStart(4, "0")}\nINFO  : map 100%  reduce 100%\nNo rows affected\n\n✓ ${newRows.length} fila(s) insertada(s) en '${tName}'`, "success")];
    }

    const insSelM = trimmed.match(/insert\s+into\s+(?:table\s+)?(\w+)\s+select\s+(.*?)\s+from\s+(\w+)(.*)/is);
    if (insSelM) {
      const destTable = insSelM[1]; const selPart = insSelM[2]; const srcTable = insSelM[3]; const rest2 = insSelM[4] || "";
      const db = hiveDBs[currentHiveDB];
      if (!db?.tables[destTable]) return [out(`FAILED: Table ${destTable} does not exist`, "error")];
      if (!db?.tables[srcTable]) return [out(`FAILED: Table ${srcTable} does not exist`, "error")];
      const srcTbl = db.tables[srcTable]; const srcCols = srcTbl.columns.map(c => c.name);
      const selectedCols = selPart.trim() === "*" ? srcCols : selPart.split(",").map(c => c.trim().split(/\s+as\s+/i)[0].trim());
      const whereM2 = rest2.match(/where\s+(.+?)(?:\s+group\s+by|\s+order\s+by|\s+limit|$)/is);
      let srcRows = [...srcTbl.rows];
      if (whereM2) srcRows = applyWhere(srcRows, srcCols, whereM2[1].trim());
      const mappedRows = srcRows.map(r => selectedCols.map(c => { const ci = srcCols.indexOf(c); return ci >= 0 ? (r[ci] ?? "") : ""; }));
      const aid = appCounter; setAppCounter(c => c + 1);
      setYarnApps(prev => [...prev, { id: aid, name: `insert_${destTable}`, state: "FINISHED" }]);
      setHiveDBs(prev => { const d = { ...prev[currentHiveDB] }; d.tables = { ...d.tables, [destTable]: { ...d.tables[destTable], rows: [...d.tables[destTable].rows, ...mappedRows] } }; return { ...prev, [currentHiveDB]: d }; });
      setHiveQueries(prev => [...prev, { q: cmd, db: currentHiveDB, ts: Date.now(), state: "FINISHED" }]);
      return [out(`${mrLog("insert_select", aid)}\nNo rows affected\n\n✓ ${mappedRows.length} fila(s) insertadas en '${destTable}'`, "success")];
    }

    return [out("Error: Syntax error in INSERT", "error")];
  }

  if (lower.startsWith("load data")) {
    const isLocal = /load\s+data\s+local/i.test(trimmed);
    const isOverwrite = /overwrite/i.test(trimmed);
    const ldM = trimmed.match(/load\s+data\s+(?:local\s+)?inpath\s+['"](.*?)['"]\s+(?:overwrite\s+)?into\s+table\s+(\w+)(?:\s+partition\s*\(([^)]*)\))?/i);
    if (!ldM) return [out("Error: Syntax error in LOAD DATA", "error")];
    const filePath = ldM[1]; const tName = ldM[2]; const partSpec = ldM[3];
    const db = hiveDBs[currentHiveDB];
    if (!db?.tables[tName]) return [out(`FAILED: Table ${tName} does not exist`, "error")];
    let nd = null;
    let fileRows = [];
    const tblDelim = db.tables[tName].rowFormat?.match(/TERMINATED BY ['"](.*?)['"]/)?.[1] || ",";
    const splitDelim = (line) => tblDelim === "\\t" || tblDelim === "\t" ? line.split("\t") : line.split(tblDelim);
    if (isLocal) {
      nd = getLocalNode(resolvePath(filePath, cwd));
      if (!nd || nd.type !== "file") return [out(`FAILED: File not found (local): ${filePath}`, "error")];
      fileRows = (nd.content || "").split("\n").filter(l => l.trim()).map(splitDelim);
    } else {
      const hNode = getHdfsFile(filePath);
      if (!hNode) return [out(`FAILED: File not found in HDFS: ${filePath}\nTip: usa LOAD DATA LOCAL INPATH para archivos locales`, "error")];
      fileRows = (hNode.content || "").split("\n").filter(l => l.trim()).map(splitDelim);
    }
    setHiveDBs(prev => {
      const d = { ...prev[currentHiveDB] };
      const t = d.tables[tName];
      const newRows = isOverwrite ? fileRows : [...(t.rows || []), ...fileRows];
      const newParts = partSpec ? [...new Set([...(t.partitions || []), partSpec.split("=").map(s => s.trim().replace(/['"]/g, "")).join("=")])] : t.partitions;
      d.tables = { ...d.tables, [tName]: { ...t, rows: newRows, partitions: newParts } };
      return { ...prev, [currentHiveDB]: d };
    });
    return [out(`Loading data to table ${tName}${partSpec ? " partition(" + partSpec + ")" : ""}\n${isOverwrite ? "Overwriting" : "Appending"} ${fileRows.length} row(s)\n✓ ${fileRows.length} filas cargadas desde ${isLocal ? "local" : "HDFS"}: ${filePath}`, "success")];
  }

  if (lower.startsWith("select ")) {
    let fromIdx = -1;
    { let d = 0;
      for (let i = 0; i < lower.length - 4; i++) {
        if (lower[i] === "(") d++;
        else if (lower[i] === ")") d--;
        else if (d === 0 && lower.slice(i, i + 5) === " from" && /\s/.test(lower[i + 5] || " ")) { fromIdx = i + 1; break; }
      }
    }
    if (fromIdx < 0) return [out("Error: Syntax error in SELECT — falta FROM", "error")];

    const selPart = trimmed.slice(7, fromIdx).trim();

    const afterFrom = trimmed.slice(fromIdx + 4).trim();

    const limitM = afterFrom.match(/\blimit\s+(\d+)\s*$/i);
    const limitN = limitM ? parseInt(limitM[1]) : null;

    const orderByM = afterFrom.match(/\border\s+by\s+(.+?)(?=\s+limit\s+\d+\s*$|$)/i);
    const orderByClause = orderByM ? orderByM[1].trim() : null;

    const havingM = afterFrom.match(/\bhaving\s+(.+?)(?=\s+order\s+by\b|\s+limit\s+\d+\s*$|$)/i);
    const havingClause = havingM ? havingM[1].trim() : null;

    const groupByM = afterFrom.match(/\bgroup\s+by\s+(.+?)(?=\s+having\b|\s+order\s+by\b|\s+limit\s+\d+\s*$|$)/i);
    const groupByClause = groupByM ? groupByM[1].trim() : null;

    const whereM = afterFrom.match(/\bwhere\s+(.+?)(?=\s+group\s+by\b|\s+having\b|\s+order\s+by\b|\s+limit\s+\d+\s*$|$)/i);
    const whereClause = whereM ? whereM[1].trim() : null;

    const CLAUSE_KWS = /\s+(?:(?:inner|left|right|full|cross)\s+(?:outer\s+)?)?join\b|\s+where\b|\s+group\s+by\b|\s+having\b|\s+order\s+by\b|\s+limit\b/i;
    const fromClauseM = afterFrom.match(/^(.+?)(?=\s+(?:(?:inner|left|right|full|cross)\s+(?:outer\s+)?)?join\b|\s+where\b|\s+group\s+by\b|\s+having\b|\s+order\s+by\b|\s+limit\b|$)/i);
    const fromClause = fromClauseM ? fromClauseM[1].trim() : afterFrom.split(CLAUSE_KWS)[0].trim();

    const joinM2 = afterFrom.match(/\b(?:inner\s+|left\s+(?:outer\s+)?|right\s+(?:outer\s+)?|full\s+(?:outer\s+)?|cross\s+)?join\s+(\w+)(?:\s+(\w+))?\s+on\s+(.+?)(?=\s+(?:where|group\s+by|having|order\s+by|limit)\b|$)/i);

    const RESERVED = new Set(["where","join","group","order","limit","having","inner","left","right","full","cross","on","tablesample"]);
    const fromParts = fromClause.split(/\s+/);
    const tName1 = fromParts[0];
    const alias1 = (fromParts[1] && !RESERVED.has(fromParts[1].toLowerCase())) ? fromParts[1] : tName1;
    const tName2 = joinM2 ? joinM2[1] : null;
    const alias2 = (joinM2 && joinM2[2] && !RESERVED.has(joinM2[2].toLowerCase())) ? joinM2[2] : tName2;
    const joinOnClause = joinM2 ? joinM2[3].trim() : null;

    const db = hiveDBs[currentHiveDB];
    if (!db?.tables[tName1]) return [out(`FAILED: Table ${tName1} does not exist`, "error")];
    const tbl1 = db.tables[tName1];
    const cols1 = tbl1.columns.map(c => c.name);

    let workRows = [];
    let workCols = [];

    if (tName2) {
      if (!db?.tables[tName2]) return [out(`FAILED: Table ${tName2} does not exist`, "error")];
      const tbl2 = db.tables[tName2];
      const cols2 = tbl2.columns.map(c => c.name);
      workCols = [...cols1.map(c => `${alias1}.${c}`), ...cols2.map(c => `${alias2}.${c}`)];
      for (const r1 of tbl1.rows) {
        for (const r2 of tbl2.rows) {
          workRows.push([...r1, ...r2]);
        }
      }
      if (joinOnClause) {
        const onM = joinOnClause.match(/(\w+)\.(\w+)\s*=\s*(\w+)\.(\w+)/i);
        if (onM) {
          const left = `${onM[1]}.${onM[2]}`; const right = `${onM[3]}.${onM[4]}`;
          const li = workCols.indexOf(left); const ri = workCols.indexOf(right);
          if (li >= 0 && ri >= 0) workRows = workRows.filter(r => String(r[li]) === String(r[ri]));
        }
      }
    } else {
      workCols = cols1.map(c => c);
      workRows = [...tbl1.rows];
    }

    if (whereClause) workRows = applyWhere(workRows, workCols, whereClause.trim());

    const tsM = selPart.match(/TABLESAMPLE\s*\(\s*BUCKET\s+(\d+)\s+OUT\s+OF\s+(\d+)\s+ON\s+(\w+)\s*\)/i) ||
                trimmed.match(/TABLESAMPLE\s*\(\s*BUCKET\s+(\d+)\s+OUT\s+OF\s+(\d+)\s+ON\s+(\w+)\s*\)/i);
    if (tsM) {
      const bn = parseInt(tsM[1]); const bTotal = parseInt(tsM[2]);
      workRows = workRows.filter((_, i) => (i % bTotal) === (bn - 1));
    }

    const resolveColIdx = (expr) => {
      const cleanExpr = expr.trim().toLowerCase();
      const dotM = cleanExpr.match(/^(\w+)\.(\w+)$/);
      if (dotM) {
        const full = `${dotM[1]}.${dotM[2]}`;
        const idx = workCols.findIndex(c => c.toLowerCase() === full);
        if (idx >= 0) return idx;
        return workCols.findIndex(c => c.toLowerCase().endsWith("." + dotM[2]) || c.toLowerCase() === dotM[2]);
      }
      return workCols.findIndex(c => c.toLowerCase() === cleanExpr || c.toLowerCase().endsWith("." + cleanExpr));
    };

    const splitTopLevel = (part) => {
      const items = []; let depth = 0; let caseDepth = 0; let cur = "";
      let i = 0;
      while (i < part.length) {
        const ch = part[i];
        if (ch === "(") { depth++; cur += ch; i++; continue; }
        if (ch === ")") { depth--; cur += ch; i++; continue; }
        if (ch === "," && depth === 0 && caseDepth === 0) { items.push(cur.trim()); cur = ""; i++; continue; }
        if (depth === 0) {
          const rest5 = part.slice(i).toUpperCase();
          if (rest5.startsWith("CASE") && /^CASE[\s(]/.test(rest5)) { caseDepth++; cur += part.slice(i, i + 4); i += 4; continue; }
          if (rest5.startsWith("END") && /^END(\s|,|$)/.test(rest5) && caseDepth > 0) { caseDepth--; cur += part.slice(i, i + 3); i += 3; continue; }
        }
        cur += ch; i++;
      }
      if (cur.trim()) items.push(cur.trim());
      return items;
    };

    const evalAggInner = (innerExpr, grpRows) => {
      const lInner = innerExpr.trim().toLowerCase();
      const caseM = innerExpr.match(/CASE\s+WHEN\s+(.+?)\s+THEN\s+(.+?)\s+ELSE\s+(.+?)\s+END/i);
      if (caseM) {
        return grpRows.map(r => {
          const condResult = evalCond(r, workCols, caseM[1].trim());
          const v = condResult ? caseM[2].trim() : caseM[3].trim();
          return parseFloat(v.replace(/['"]/g, "")) || 0;
        });
      }
      const ci = resolveColIdx(lInner);
      return grpRows.map(r => parseFloat(r[ci] ?? 0) || 0);
    };

    const parseSelCols = (part) => {
      if (part.trim() === "*") return workCols.map((c, i) => ({ expr: c, label: c, idx: i, agg: null }));
      const parts2 = splitTopLevel(part);
      return parts2.filter(p => p).map(p => {
        const asM = p.match(/^([\s\S]+?)\s+AS\s+(\w+)$/i);
        const expr = asM ? asM[1].trim() : p.trim();
        const label = asM ? asM[2] : (expr.includes("(") || expr.toUpperCase().startsWith("CASE") ? expr : p.trim());
        if (/^count\s*\(\s*distinct\s+/i.test(expr)) { const inner = expr.match(/count\s*\(\s*distinct\s+(\w+)\s*\)/i); return { expr, label, idx: -1, agg: "countdistinct", col: inner?.[1] }; }
        if (/^count\s*\(/i.test(expr)) return { expr, label, idx: -1, agg: "count" };
        if (/^sum\s*\(/i.test(expr)) { const inner = expr.match(/^sum\s*\((.+)\)$/i); return { expr, label, idx: -1, agg: "sum", innerExpr: inner?.[1]?.trim() }; }
        if (/^avg\s*\(/i.test(expr)) { const inner = expr.match(/^avg\s*\((.+)\)$/i); return { expr, label, idx: -1, agg: "avg", innerExpr: inner?.[1]?.trim() }; }
        if (/^max\s*\(/i.test(expr)) { const inner = expr.match(/^max\s*\((.+)\)$/i); return { expr, label, idx: -1, agg: "max", innerExpr: inner?.[1]?.trim() }; }
        if (/^min\s*\(/i.test(expr)) { const inner = expr.match(/^min\s*\((.+)\)$/i); return { expr, label, idx: -1, agg: "min", innerExpr: inner?.[1]?.trim() }; }
        if (/^case\b/i.test(expr)) return { expr, label, idx: -1, agg: "case" };
        return { expr, label, idx: resolveColIdx(expr), agg: null };
      });
    };

    const selDefs = parseSelCols(selPart.replace(/TABLESAMPLE\s*\([^)]+\)/i, "").trim());

    let groupedRows = workRows;
    let isGrouped = false;
    if (groupByClause) {
      isGrouped = true;
      const gbCols = groupByClause.split(",").map(c => c.trim());
      const groups = {};
      for (const row of workRows) {
        const key = gbCols.map(gc => { const gi = resolveColIdx(gc); return gi >= 0 ? row[gi] : ""; }).join("|");
        if (!groups[key]) groups[key] = [];
        groups[key].push(row);
      }
      groupedRows = Object.values(groups).map(grpRows => {
        return selDefs.map(sd => {
          if (!sd.agg) { const gi = resolveColIdx(sd.expr); return gi >= 0 ? grpRows[0][gi] : ""; }
          if (sd.agg === "count") return String(grpRows.length);
          if (sd.agg === "countdistinct") { const ci = resolveColIdx(sd.col); const uniq = new Set(grpRows.map(r => r[ci])); return String(uniq.size); }
          const nums = evalAggInner(sd.innerExpr || sd.col || "", grpRows);
          if (sd.agg === "sum") return String(nums.reduce((a, b) => a + b, 0));
          if (sd.agg === "avg") return nums.length ? String((nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(4).replace(/\.?0+$/, "")) : "0";
          if (sd.agg === "max") return String(Math.max(...nums));
          if (sd.agg === "min") return String(Math.min(...nums));
          return "";
        });
      });
      if (havingClause) {
        groupedRows = groupedRows.filter(row => {
          const hv = applyWhere([row], selDefs.map(sd => sd.label), havingClause.trim());
          return hv.length > 0;
        });
      }
    } else if (selDefs.some(sd => sd.agg)) {
      const aggRow = selDefs.map(sd => {
        if (!sd.agg) { const gi = sd.idx; return gi >= 0 ? (workRows[0]?.[gi] ?? "NULL") : "NULL"; }
        if (sd.agg === "count") return String(workRows.length);
        if (sd.agg === "countdistinct") { const ci = resolveColIdx(sd.col); const uniq = new Set(workRows.map(r => r[ci])); return String(uniq.size); }
        const nums = evalAggInner(sd.innerExpr || sd.col || "", workRows);
        if (sd.agg === "sum") return String(nums.reduce((a, b) => a + b, 0));
        if (sd.agg === "avg") return nums.length ? String((nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(4).replace(/\.?0+$/, "")) : "0";
        if (sd.agg === "max") return String(Math.max(...nums));
        if (sd.agg === "min") return String(Math.min(...nums));
        return "";
      });
      groupedRows = [aggRow];
      isGrouped = true;
    }

    if (orderByClause) {
      const obParts = orderByClause.split(",").map(s => s.trim());
      const sortKeys = obParts.map(s => { const m = s.match(/^(\w+(?:\.\w+)?)\s*(asc|desc)?$/i); return m ? { col: m[1], desc: (m[2] || "asc").toLowerCase() === "desc" } : null; }).filter(Boolean);
      if (sortKeys.length > 0) {
        groupedRows = [...groupedRows].sort((a, b) => {
          for (const sk of sortKeys) {
            const obIdx = isGrouped ? selDefs.findIndex(sd => sd.label.toLowerCase() === sk.col.toLowerCase()) : resolveColIdx(sk.col);
            const av = String(a[obIdx] ?? ""); const bv = String(b[obIdx] ?? "");
            const an = parseFloat(av); const bn2 = parseFloat(bv);
            const numOk = !isNaN(an) && !isNaN(bn2);
            let cmp = numOk ? (an - bn2) : av.localeCompare(bv);
            if (sk.desc) cmp = -cmp;
            if (cmp !== 0) return cmp;
          }
          return 0;
        });
      }
    }

    let finalRows = limitN ? groupedRows.slice(0, limitN) : groupedRows;

    const evalCell = (r, sd) => {
      if (sd.agg === "case") {
        const caseM = sd.expr.match(/CASE\s+WHEN\s+(.+?)\s+THEN\s+['"]?(.*?)['"]?\s+ELSE\s+['"]?(.*?)['"]?\s+END/i);
        if (caseM) return evalCond(r, workCols, caseM[1].trim()) ? caseM[2] : caseM[3];
        return "NULL";
      }
      if (sd.agg && sd.agg !== "case") {
        const nums = evalAggInner(sd.innerExpr || sd.col || "", [r]);
        if (sd.agg === "sum") return String(nums[0] ?? 0);
        if (sd.agg === "max") return String(nums[0] ?? 0);
        if (sd.agg === "min") return String(nums[0] ?? 0);
        return String(nums[0] ?? "NULL");
      }
      if (sd.idx >= 0) return r[sd.idx] ?? "NULL";
      return "NULL";
    };

    const outCols = selDefs.map(sd => sd.label);
    const outRows = isGrouped
      ? finalRows
      : finalRows.map(r => selDefs.map(sd => evalCell(r, sd)));

    setHiveQueries(prev => [...prev, { q: cmd, db: currentHiveDB, ts: Date.now(), state: "FINISHED" }]);
    return [out(renderTable(outCols, outRows.map(r => Array.isArray(r) ? r : [r])))];
  }

  return [out(`Error: Comando no reconocido: '${trimmed.substring(0, 60)}'\n\nEscribe 'help' para ver comandos disponibles.\n  - Comandos HiveQL terminan en ;\n  - Meta-comandos Beeline empiezan con !`, "error")];
}
