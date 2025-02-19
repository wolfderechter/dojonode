import { Config } from "./types";

export async function readConfig(): Promise<Config> {
  const defaultConfig: Config = { NODE_API_URL: "http://localhost:8545"};
  try{
    const config = await Bun.file("./config.json", { type: "application/json" }).json();
    return {...defaultConfig, ...config}; // default NODE_API_URL will be overriden by the NODE_API_URL from config
  } catch(error){
    console.error("Failed to read config file");
    writeConfig(defaultConfig);
    return defaultConfig;
  }
}
export async function writeConfig(config: Config){
  try{
    await Bun.write("./config.json", JSON.stringify(config));
  } catch(error){
    console.error("Failed to write config file");
  }
}
