import yargs from "yargs";
import micloudProtocol from "../../lib/protocol-micloud";
import { log } from "../log";

type Arguments = {
  username: string;
  password: string;
  country: string; // @TODO take from array
};

export const command = "cloud-devices";

export const description = "Get list devices from cloud";

export const builder = {
  username: {
    alias: "u",
    type: "string",
    description: "Username",
    required: true,
  },
  password: {
    alias: "p",
    type: "string",
    required: "Password",
  },
  country: {
    alias: "c",
    type: "string",
    description: "Country code",
    default: "cn",
  },
};

export const handler = async (argv: yargs.Argv<Arguments>) => {
  const { username, password, country } = argv;
  try {
    await micloudProtocol.login(username, password);
    let devices = await micloudProtocol.getDevices(null, { country });
    devices = devices.map(({ did, name, token, model }) => {
      return {
        did,
        name,
        token,
        model,
      };
    });
    log.table(devices);
  } catch (e) {
    log.error(e.message);
  }
};
