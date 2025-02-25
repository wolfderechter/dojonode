import { Config } from "./types";
import fs from "fs/promises";

export async function readConfig(): Promise<Config> {
  const defaultConfig: Config = { NODE_API_URL: "http://localhost:8545" };
  try {
    const config = await fs.readFile("./config.json", "utf8");
    console.log("read config:", config);
    return { ...defaultConfig, ...JSON.parse(config) }; // default NODE_API_URL will be overriden by the NODE_API_URL from config
  } catch (error) {
    console.error("Failed to read config file");
    writeConfig(defaultConfig);
    return defaultConfig;
  }
}
export async function writeConfig(config: Config) {
  try {
    await fs.writeFile("./config.json", JSON.stringify(config));
    console.log("wrote config:", config);
  } catch (error) {
    console.error("Failed to write config file");
  }
}
