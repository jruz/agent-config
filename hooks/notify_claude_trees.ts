export async function main() {
  const signalDir = process.env["CLAUDE_TREES_SIGNAL_DIR"];
  const tabId = process.env["CLAUDE_TREES_TAB_ID"];

  if (!signalDir || !tabId) {
    return;
  }

  const signalPath = `${signalDir}/tab_${tabId}`;
  await Bun.write(signalPath, "");
}

void main();
