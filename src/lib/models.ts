import glob from "glob";
import path from "path";
import AqaraDevice from "./device-aqara";
import MiioDevice from "./device-miio";

const models: Record<string, MiioDevice | AqaraDevice> = {};

glob.sync(path.resolve(__dirname, "./devices/*.js")).forEach((modelPath) => {
  const modelName = path.parse(modelPath).name;
  models[modelName] = require(modelPath);
});

export default models;
