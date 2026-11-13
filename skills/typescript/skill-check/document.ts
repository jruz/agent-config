import { log } from "../files/scripts/lib/log.ts";

export const parseDocument = (text: string, source: string): unknown => {
  try {
    if (/\.ya?ml$/.test(source)) return Bun.YAML.parse(text);
    return JSON.parse(text);
  } catch (error) {
    log.error(`invalid document: ${source}`);
    throw error;
  }
};
