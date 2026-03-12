import process from "node:process";
import { log } from "./log.ts";

const GRAFANA_URL = "https://grafana.jruz.io";
const LOKI_UID = "P8E80F9AEF21F6940";
const DEFAULT_LIMIT = 20;

type LokiStream = {
  values: [string, string][];
};

type LokiResponse = {
  data: {
    result: LokiStream[];
  };
};

function main() {
  const args = process.argv.slice(2);
  const stack = args[0];
  const limit = args[1] ? Number(args[1]) : DEFAULT_LIMIT;

  if (!stack) {
    log.error("Missing stack argument. Usage: grafana-logs <stack> [limit]");
    process.exit(1);
  }

  if (Number.isNaN(limit) || limit < 1) {
    log.error(`Invalid limit: ${args[1]}`);
    process.exit(1);
  }

  const query = encodeURIComponent(`{stack="${stack}"}`);
  const url = `${GRAFANA_URL}/api/datasources/proxy/uid/${LOKI_UID}/loki/api/v1/query_range?query=${query}&limit=${limit}`;

  fetch(url)
    .then((res) => {
      if (!res.ok) {
        log.error(`Grafana returned ${res.status}: ${res.statusText}`);
        process.exit(1);
      }
      return res.json() as Promise<LokiResponse>;
    })
    .then((body) => {
      const results = body.data.result;

      if (results.length === 0) {
        log.warn("No logs found");
        return;
      }

      const entries = results.flatMap((stream) => stream.values);
      const logs = entries
        .map(([ts, msg]) => {
          const date = new Date(Number(ts) / 1_000_000);
          const formatted = date.toISOString().replace("T", " ").slice(0, 19);
          return `${formatted} ${msg.trim()}`;
        })
        .sort();

      console.log(logs.join("\n"));
    })
    .catch((err) => {
      log.error(`Failed to fetch logs: ${err}`);
      process.exit(1);
    });
}

main();
