#! /usr/bin/env node
import { Command } from "commander";

import { apig } from "./apig";
import { lambda } from "./lambda";

const program = new Command();

program
  .name("lb")
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
    "-p, --parallel <number>",
    "Number of parallel invocations in each iteration",
    "5",
  )
  .option(
    "-d, --dependency <string...>",
    "Lambda function name of dependencies.",
  )
  .option("-w, --warm", "Measure warm invocations.")
  .action(async (name, event, options) => {
    await lambda({ eventPath: event, functionName: name, ...options });
  });

program
  .command("memory")
  .description("Benchmark lambda with different memory settings.")
  .argument("<name>", "Lambda function name")
  .argument("<event>", "Path to event JSON file")
  .option("-r, --region <string>", "AWS region")
  .option(
    "-i, --iterations <number>",
    "Number of iterations to test cold starts",
    "5",
  )
  .option(
    "-p, --parallel <number>",
    "Number of parallel invocations in each iteration",
    "5",
  )
  .action(async (name, event, options) => {
    console.log(name, event, options);
  });

program
  .command("apig")
  .description("Measure cold start times on lambda exposed with API Gateway.")
  .argument("<name>", "Lambda function name")
  .argument("<url>", "URL to invoke")
  .option("-X, --request <string>", "The request method to use", "GET")
  .option("-H, --header <string...>", "Headers to supply with request.")
  .option("-b, --body <string>", "Headers to supply with request.")
  .option("-r, --region <string>", "AWS region")
  .option(
    "-i, --iterations <number>",
    "Number of iterations to test cold starts",
    "5",
  )
  .option(
    "-p, --parallel <number>",
    "Number of parallel invocations in each iteration",
    "5",
  )
  .option(
    "-d, --dependency <string...>",
    "Lambda function name of dependencies.",
  )
  .action(async (name, url, { header = [], ...options }) => {
    await apig({
      name,
      url,
      headers: Object.fromEntries(header.map((h: string) => h.split(":"))),
      ...options,
    });
  });

program.parse();
