#!/usr/bin/env node
import { Command } from 'commander';
import esMain from 'es-main';

import { defineCLI, run } from './runner';

if (esMain(import.meta)) {
  const program = new Command();

  defineCLI(program);
  run(program);
}
