#! /usr/bin/env node
import { Command } from "commander";

import measure from "./measure";

const program = new Command();

program
  .version("1.0.0")
  .description("A CLI for measuring cold start times on a lambda function")
  .requiredOption("-f, --functionName <value>", "Lambda function name")
  .requiredOption("-e, --event <value>", "Path to event JSON file")
  .option("-r, --region <value>", "AWS region")
  .option(
    "-i, --iterations <value>",
    "Number of iterations to test cold starts",
  )
  .option(
    "-p, --parallelInvocations <value>",
    "Number of parallel invocations in each iteration",
  )
  .action(async ({ event, ...params }) => {
    await measure({ ...params, eventPath: event });
  });

program.parse();
