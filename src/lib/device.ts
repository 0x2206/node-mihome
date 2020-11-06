import models from "./models";

type Options = {
  model: string;
};

export default function createDevice(options: Options) {
  if (!options.model) {
    throw new Error("Missing model config");
  }
  if (!models[options.model]) {
    throw new Error(`Model ${options.model} is not supported`);
  }
  const D = models[options.model];
  return new D(options);
}
