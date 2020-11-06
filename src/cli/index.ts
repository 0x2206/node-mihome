#!/usr/bin/env node

import path from "path";
import yargs from "yargs";

yargs.commandDir(path.join(__dirname, "commands")).recommendCommands().demandCommand().argv;
