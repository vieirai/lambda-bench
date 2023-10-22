#! /usr/bin/env node
import { Command } from "commander";

import measure from "./measure";

const program = new Command();

program
  .name("coldshift")
  .version("1.0.0")
  .description("A CLI for measuring cold start times on a lambda function");

program
  .command("lambda")
  .description(
    "Measure cold start times on lambda using RequestResponse invocation.",
  )
  .argument("<name>", "Lambda function name")
  .argument("<event>", "Path to event JSON file")
  .option("-r, --region <string>", "AWS region")
  .option(
    "-i, --iterations <number>",
    "Number of iterations to test cold starts",
    "5",
  )
  .option(
    "-p, --parallelInvocations <number>",
    "Number of parallel invocations in each iteration",
    "5",
  )
  .action(async (name, event, options) => {
    await measure({ eventPath: event, functionName: name, ...options });
  });

program
  .command("apig")
  .description("Measure cold start times on lambda exposed with API Gateway.")
  .argument("<name>", "Lambda function name")
  .argument("<url>", "URL to invoke")
  .option("-X, --request <string>", "The request method to use", "GET")
  .option("-H, --header <string...>", "Headers to supply with request.")
  .option("-d, --data <string>", "Headers to supply with request.")
  .option("-r, --region <string>", "AWS region")
  .option(
    "-i, --iterations <number>",
    "Number of iterations to test cold starts",
    "5",
  )
  .option(
    "-p, --parallelInvocations <number>",
    "Number of parallel invocations in each iteration",
    "5",
  )
  .action(async (name, url, options) => {
    console.log({ name, url, options });
  });

program.parse();
