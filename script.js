const fs = require("node:fs");

const routeManifestPath = "./.next/routes-manifest.json";
const firebaseConfigPath = "./firebase.json";
const env = process.argv[2] || "staging";

function run(env) {
  if (!fs.existsSync(routeManifestPath)) {
    throw new Error("Route manifest is not exist!");
  }
  const routeManifest = JSON.parse(
    fs.readFileSync(routeManifestPath, { encoding: "utf-8" })
  );

  const rewritesRule = routeManifest.dynamicRoutes.map((route) => ({
    source: route.regex,
    destination: `${route.page}.html`,
  }));
  if (!rewritesRule.length) {
    return console.log("No dynamic routes");
  }

  const firebaseConfig = JSON.parse(
    fs.readFileSync(firebaseConfigPath, { encoding: "utf-8" })
  );
  for (let i = 0; i < firebaseConfig.hosting.length; i++) {
    if (firebaseConfig.hosting[i].target === env) {
      if (firebaseConfig.hosting[i].rewrites) {
        firebaseConfig.hosting[i].rewrites =
          firebaseConfig.hosting[i].rewrites.concat(rewritesRule);
      } else {
        firebaseConfig.hosting[i].rewrites = rewritesRule;
      }
      break;
    }
  }
  fs.writeFileSync(firebaseConfigPath, JSON.stringify(firebaseConfig));
  console.log(
    `Add rewrites:\n${rewritesRule
      .map((rule) => `  - ${rule.source}`)
      .join("\n")}`
  );
}

run(env);
