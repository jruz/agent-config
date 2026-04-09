const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;

export const log = {
  ok: (msg: string) => {
    console.log(`${green("PASS")} ${msg}`);
  },
  error: (msg: string) => {
    console.error(`${red("FAIL")} ${msg}`);
  },
};
