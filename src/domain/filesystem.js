export function resolvePath(p, base) {
  if (!p) return base;
  let parts;
  if (p.startsWith("/")) parts = p.split("/").filter(Boolean);
  else if (p === "~" || p.startsWith("~/")) parts = ["home", "hadoop", ...p.slice(1).replace(/^\//, "").split("/").filter(Boolean)];
  else parts = [...base.split("/").filter(Boolean), ...p.split("/").filter(Boolean)];
  const res = [];
  for (const seg of parts) {
    if (seg === ".") continue;
    else if (seg === "..") res.pop();
    else res.push(seg);
  }
  return "/" + res.join("/");
}

export function getLocalNode(localFS, path) {
  if (!localFS) return null;
  if (localFS[path]) return localFS[path];
  const par = path.substring(0, path.lastIndexOf("/")) || "/";
  const nm = path.substring(path.lastIndexOf("/") + 1);
  const pn = localFS[par];
  if (pn?.files && nm in pn.files) return { type: "file", content: pn.files[nm] };
  if (pn?.children?.includes(nm)) {
    const fp = par === "/" ? `/${nm}` : `${par}/${nm}`;
    if (localFS[fp]) return localFS[fp];
    return { type: "file", content: "" };
  }
  return null;
}

export function ensureHdfsDir(path, fs) {
  if (fs[path]) return fs;
  const nf = { ...fs };
  const pts = path.split("/").filter(Boolean);
  let cur = "/";
  for (const p of pts) {
    const nx = cur === "/" ? `/${p}` : `${cur}/${p}`;
    if (!nf[nx]) {
      nf[nx] = { type: "dir", children: [], owner: "hadoop", group: "supergroup", perms: "drwxr-xr-x" };
      if (nf[cur] && !nf[cur].children.includes(p)) nf[cur] = { ...nf[cur], children: [...nf[cur].children, p] };
    }
    cur = nx;
  }
  return nf;
}

export function ensureLocalDir(path, fs) {
  if (fs[path]) return fs;
  const nf = { ...fs };
  const pts = path.split("/").filter(Boolean);
  let cur = "/";
  for (const p of pts) {
    const nx = cur === "/" ? `/${p}` : `${cur}/${p}`;
    if (!nf[nx]) {
      nf[nx] = { type: "dir", children: [], files: {} };
      if (nf[cur] && !nf[cur].children.includes(p)) nf[cur] = { ...nf[cur], children: [...nf[cur].children, p] };
    }
    cur = nx;
  }
  return nf;
}

export function getDirItems(node) {
  const s = new Set(node.children || []);
  if (node.files) Object.keys(node.files).forEach(f => s.add(f));
  return [...s];
}

export function formatLs(localFS, permsMap, resolved, flags) {
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
    return `total ${all.length * 4}\n${all.map(i => {
      if (i === "." || i === "..") return `drwxr-xr-x 2 hadoop hadoop   4096 Feb 28 10:00 ${i}`;
      const cp = resolved === "/" ? `/${i}` : `${resolved}/${i}`;
      const isDir = !!localFS[cp];
      const rawSz = isDir ? 4096 : (node.files?.[i]?.length || 0);
      let sz;
      if (flags.includes("h")) {
        if (rawSz >= 1048576) sz = (rawSz / 1048576).toFixed(1) + "M";
        else if (rawSz >= 1024) sz = (rawSz / 1024).toFixed(1) + "K";
        else sz = String(rawSz);
      } else sz = String(rawSz).padStart(8);
      const pm = permsMap[cp] || (isDir ? "rwxr-xr-x" : "rw-r--r--");
      return `${isDir ? "d" : "-"}${pm} 1 hadoop hadoop ${sz} Feb 28 10:00 ${i}`;
    }).join("\n")}`;
  }
  return items.join("  ");
}
