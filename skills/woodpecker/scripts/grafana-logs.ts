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

function parseLokiStream(data: unknown): LokiStream {
  if (
    typeof data !== "object" ||
    data === null ||
    !("values" in data) ||
    !Array.isArray(data.values)
  )
    throw new Error("unexpected stream shape");
  return {
    values: data.values.map((v: unknown) => {
      if (
        !Array.isArray(v) ||
        v.length !== 2 ||
        typeof v[0] !== "string" ||
        typeof v[1] !== "string"
      )
        throw new Error("unexpected stream value shape");
      return [v[0], v[1]];
    }),
  };
}

function parseLokiResponse(data: unknown): LokiResponse {
  if (
    typeof data !== "object" ||
    data === null ||
    !("data" in data) ||
    typeof data.data !== "object" ||
    data.data === null ||
    !("result" in data.data) ||
    !Array.isArray(data.data.result)
  )
    throw new Error("unexpected Loki response shape");
  return { data: { result: data.data.result.map(parseLokiStream) } };
}

function parseArgs(): { stack: string; limit: number } {
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

  return { stack, limit };
}

function formatEntries(results: LokiStream[]): string {
  const entries = results.flatMap((stream) => stream.values);
  return entries
    .map(([ts, msg]) => {
      const date = new Date(Number(ts) / 1_000_000);
      const formatted = date.toISOString().replace("T", " ").slice(0, 19);
      return `${formatted} ${msg.trim()}`;
    })
    .sort()
    .join("\n");
}

async function main() {
  const { stack, limit } = parseArgs();
  const query = encodeURIComponent(`{stack="${stack}"}`);
  const url = `${GRAFANA_URL}/api/datasources/proxy/uid/${LOKI_UID}/loki/api/v1/query_range?query=${query}&limit=${limit}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      log.error(`Grafana returned ${res.status}: ${res.statusText}`);
      process.exit(1);
    }

    const raw: unknown = await res.json();
    const body = parseLokiResponse(raw);
    const results = body.data.result;

    if (results.length === 0) {
      log.warn("No logs found");
      return;
    }

    const output = formatEntries(results);
    console.log(output);
  } catch (err: unknown) {
    log.error(`Failed to fetch logs: ${String(err)}`);
    process.exit(1);
  }
}

void main();
