export async function main() {
  const signalDir = process.env["CONDUCTOR_SIGNAL_DIR"];
  const tabId = process.env["CONDUCTOR_TAB_ID"];

  if (!signalDir || !tabId) {
    return;
  }

  const signalPath = `${signalDir}/tab_${tabId}`;
  await Bun.write(signalPath, "");
}

void main();
