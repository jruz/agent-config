import { Glob } from "bun";
import { log } from "./log.ts";

const root = process.cwd();

const listMmdFiles = (): string[] => {
  const glob = new Glob("specs/**/*.mmd");
  const scanned = glob.scanSync({ cwd: root });
  const files = Array.from(scanned);
  return files.sort();
};

const serveFile = async (path: string): Promise<Response> => {
  const file = Bun.file(`${root}/${path}`);
  if (!(await file.exists())) {
    return new Response("not found", { status: 404 });
  }
  return new Response(file);
};

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Mermaid Preview</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #1e1e2e; color: #cdd6f4; font-family: monospace; }
    nav {
      padding: 12px 20px;
      background: #181825;
      border-bottom: 1px solid #313244;
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 14px;
    }
    nav a {
      color: #89b4fa;
      text-decoration: none;
      padding: 4px 8px;
      border-radius: 4px;
    }
    nav a:hover, nav a.active {
      background: #313244;
    }
    nav a.active { color: #a6e3a1; }
    .status {
      margin-left: auto;
      color: #6c7086;
      font-size: 12px;
    }
    #diagram {
      display: flex;
      justify-content: center;
      padding: 40px 20px;
      overflow: auto;
    }
    #diagram svg { max-width: 100%; height: auto; }
  </style>
</head>
<body>
  <nav id="nav"></nav>
  <div id="diagram">select a diagram</div>

  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: { edgeLabelBackground: 'transparent' },
      flowchart: { useMaxWidth: true, htmlLabels: true }
    });

    let current = null;
    let lastContent = '';
    let renderCounter = 0;

    const loadFileList = async () => {
      const res = await fetch('/api/files');
      const files = await res.json();
      const nav = document.getElementById('nav');
      nav.innerHTML = files
        .map(f => '<a href="#" data-file="' + f + '">' + f.replace('specs/', '') + '</a>')
        .join('')
        + '<span class="status" id="status"></span>';
      nav.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', (e) => {
          e.preventDefault();
          select(a.dataset.file);
        });
      });
    };

    const select = (file) => {
      current = file;
      lastContent = '';
      document.querySelectorAll('nav a').forEach(a => {
        a.classList.toggle('active', a.dataset.file === file);
      });
      poll();
    };

    const render = async (source) => {
      renderCounter++;
      const id = 'mmd-' + renderCounter;
      const { svg } = await mermaid.render(id, source);
      document.getElementById('diagram').innerHTML = svg;
    };

    const poll = async () => {
      if (!current) return;
      const res = await fetch('/file/' + current + '?t=' + Date.now());
      const content = await res.text();
      if (content !== lastContent) {
        lastContent = content;
        const status = document.getElementById('status');
        if (status) status.textContent = 'updated ' + new Date().toLocaleTimeString();
        await render(content);
      }
    };

    await loadFileList();
    const params = new URLSearchParams(window.location.search);
    const initial = params.get('file');
    if (initial) select(initial);

    setInterval(poll, 1000);
  </script>
</body>
</html>`;

const server = Bun.serve({
  hostname: "0.0.0.0",
  port: 0,
  fetch: async (req) => {
    const url = new URL(req.url);

    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(html, {
        headers: { "content-type": "text/html" },
      });
    }

    if (url.pathname === "/api/files") {
      const files = listMmdFiles();
      return Response.json(files);
    }

    if (url.pathname.startsWith("/file/")) {
      const path = url.pathname.slice(6);
      return serveFile(path);
    }

    return new Response("not found", { status: 404 });
  },
});

log.info(`mermaid preview: http://mini-local:${server.port}`);
