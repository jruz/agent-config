export const log = {
  ok: (msg: string) => {
    console.log(`[\x1b[32mOK\x1b[0m] ${msg}`);
  },
  error: (msg: string) => {
    console.error(`[\x1b[31mERROR\x1b[0m] ${msg}`);
  },
};
