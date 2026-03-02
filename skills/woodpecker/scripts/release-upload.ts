import { log } from "./log";
import { Glob } from "bun";
import { z } from "zod";

const ReleaseSchema = z.object({ id: z.number() });

const headers = (token: string) => ({
  Authorization: `token ${token}`,
});

const ensureRelease = async (
  tag: string,
  token: string,
  repo: string,
): Promise<number> => {
  const url = `https://codeberg.org/api/v1/repos/${repo}/releases/tags/${tag}`;
  const res = await fetch(url, { headers: headers(token) });

  if (res.ok) {
    const data: unknown = await res.json();
    const release = ReleaseSchema.parse(data);
    log.info(`release ${tag} already exists (id: ${release.id})`);
    return release.id;
  }

  if (res.status !== 404) {
    const text = await res.text();
    throw new Error(`check release: ${res.status} ${text}`);
  }

  log.info(`creating release ${tag}...`);
  const createRes = await fetch(
    `https://codeberg.org/api/v1/repos/${repo}/releases`,
    {
      method: "POST",
      headers: { ...headers(token), "Content-Type": "application/json" },
      body: JSON.stringify({ tag_name: tag, name: tag }),
    },
  );

  if (!createRes.ok) {
    const text = await createRes.text();
    throw new Error(`create release: ${createRes.status} ${text}`);
  }

  const created: unknown = await createRes.json();
  const createdRelease = ReleaseSchema.parse(created);
  log.info(`created release ${tag} (id: ${createdRelease.id})`);
  return createdRelease.id;
};

const upload = async (
  file: string,
  releaseId: number,
  token: string,
  repo: string,
): Promise<void> => {
  const url = `https://codeberg.org/api/v1/repos/${repo}/releases/${releaseId}/assets?name=${file}`;
  const body = await Bun.file(file).arrayBuffer();

  const res = await fetch(url, {
    method: "POST",
    headers: { ...headers(token), "Content-Type": "application/octet-stream" },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`upload ${file}: ${res.status} ${text}`);
  }
};

const main = async () => {
  const tag = process.argv[2];
  if (!tag) {
    log.error("usage: bun scripts/release-upload.ts <tag>");
    process.exit(1);
  }

  const token = process.env["CODEBERG_TOKEN"];
  if (!token) throw new Error("CODEBERG_TOKEN is not set");

  const repo = process.env["CI_REPO"];
  if (!repo) throw new Error("CI_REPO is not set");

  const glob = new Glob("BINARY_NAME-*");
  const files = Array.from(glob.scanSync("."));

  if (files.length === 0) {
    log.error("no BINARY_NAME-* files found");
    process.exit(1);
  }

  const releaseId = await ensureRelease(tag, token, repo);

  await Promise.all(
    files.map(async (file) => {
      log.info(`uploading ${file}...`);
      await upload(file, releaseId, token, repo);
      log.info(`uploaded ${file}`);
    }),
  );

  log.info("release upload complete");
};

await main();
