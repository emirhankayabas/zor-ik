import fs from "fs";
import path from "path";
import tr from "../messages/tr.json" with { type: "json" };

const get = (ns, k) => {
  let o = tr[ns];
  for (const p of k.split(".")) {
    if (o == null) return undefined;
    o = o[p];
  }
  return o;
};

const files = [];
function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) {
      if (!/node_modules|\.next/.test(p)) walk(p);
    } else if (/\.tsx?$/.test(e.name)) {
      files.push(p);
    }
  }
}
walk("app");
walk("components");

let issues = 0;
for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  const map = {};
  const re =
    /(?:const|let)\s+(\w+)\s*=\s*(?:useTranslations|getTranslations)\(\s*["']([^"']+)["']\s*\)/g;
  let m;
  while ((m = re.exec(src))) map[m[1]] = m[2];
  if (!Object.keys(map).length) continue;

  for (const v of Object.keys(map)) {
    const kre = new RegExp("\\b" + v + "\\(\\s*[\"']([^\"'`]+)[\"']", "g");
    let km;
    while ((km = kre.exec(src))) {
      const key = km[1];
      if (get(map[v], key) === undefined) {
        console.log(`${f}  ->  ${map[v]}.${key}`);
        issues++;
      }
    }
  }
}
console.log(issues ? `\nTOPLAM EKSIK: ${issues}` : "\nTemiz: eksik statik anahtar yok");
