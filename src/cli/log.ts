import chalk from "chalk";

const info = (...args: unknown[]): void => {
  console.log(chalk.bgWhite.black(" INFO "), args.join(" "));
};

const error = (...args: unknown[]): void => {
  console.log(chalk.bgWhite.black(" ERROR "), args.join(" "));
};

const warn = (...args: unknown[]): void => {
  console.log(chalk.bgWhite.black(" WARNING "), args.join(" "));
};

const plain = (...args: unknown[]): void => {
  console.log(args.join(" "));
};

const table = (...args: unknown[]): void => {
  console.table(args);
};

export const log = {
  info,
  error,
  warn,
  plain,
  table,
};
