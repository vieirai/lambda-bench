import {
  FunctionConfiguration,
  LastUpdateStatus,
} from "@aws-sdk/client-lambda";
import chalk from "chalk";
import Table from "cli-table3";
import { randomUUID } from "crypto";
import { readFileSync } from "fs";
import ora from "ora";
import stats from "stats-lite";

import sleep from "./helpers/sleep";
import { getConfig, invoke, setEnv } from "./lambda";

export interface Measure {
  functionName: string;
  eventPath: string;
  region?: string;
  parallelInvocations?: number;
  iterations?: number;
}

const measure = async (
  functionName: string,
  event: object,
  region: string,
  config: FunctionConfiguration,
  parallelInvocations: number,
  iteration: number,
  iterations: number,
) => {
  const spinner = ora(`[${iteration}/${iterations}] - Resetting λ`).start();

  await setEnv({
    functionName,
    region,
    env: { ...config.Environment.Variables, measureHash: randomUUID() },
  });

  let functionStatus: LastUpdateStatus | string = LastUpdateStatus.InProgress;

  while (functionStatus !== LastUpdateStatus.Successful) {
    functionStatus = (await getConfig({ functionName, region }))
      .LastUpdateStatus;

    await sleep(1000);
  }

  spinner.text = `[${iteration}/${iterations}] - Invoking λ`;

  const results = await Promise.all(
    Array.from({ length: parallelInvocations }, () =>
      invoke({ funcName: functionName, region, payload: event }),
    ),
  );

  spinner.succeed(
    `[${iteration}/${iterations}] - Fastest: ${Math.min(
      ...results.map(({ billedDuration }) => billedDuration),
    )}`,
  );

  return results;
};

interface Result {
  billedDuration: number;
  initDuration: number;
  duration: number;
  memoryUsed: number;
  status: number;
}

const output = (results: Result[]) => {
  const duration: number[] = results.map(({ duration }) => duration);
  const billedDuration = results.map(({ billedDuration }) => billedDuration);
  const initDuration = results.map(({ initDuration }) => initDuration);
  const memoryUsed = results.map(({ memoryUsed }) => memoryUsed);

  const table = new Table({
    chars: {
      top: "═",
      "top-mid": "╤",
      "top-left": "╔",
      "top-right": "╗",
      bottom: "═",
      "bottom-mid": "╧",
      "bottom-left": "╚",
      "bottom-right": "╝",
      left: "║",
      "left-mid": "╟",
      right: "║",
      "right-mid": "╢",
    },
    head: [
      "",
      chalk.bold.green("Average"),
      chalk.bold.green("Minimum"),
      chalk.bold.green("Maximum"),
      chalk.bold.green("p99"),
      chalk.bold.green("p95"),
      chalk.bold.green("p90"),
    ],
  });
  table.push(
    {
      [chalk.bold.blue("Duration")]: [
        stats.mean(duration),
        Math.min(...duration),
        Math.max(...duration),
        stats.percentile(duration, 0.99),
        stats.percentile(duration, 0.95),
        stats.percentile(duration, 0.9),
      ],
    },
    {
      [chalk.bold.blue("BilledDuration")]: [
        stats.mean(billedDuration),
        Math.min(...billedDuration),
        Math.max(...billedDuration),
        stats.percentile(billedDuration, 0.99),
        stats.percentile(billedDuration, 0.95),
        stats.percentile(billedDuration, 0.9),
      ],
    },
    {
      [chalk.bold.blue("InitDuration")]: [
        stats.mean(initDuration),
        Math.min(...initDuration),
        Math.max(...initDuration),
        stats.percentile(initDuration, 0.99),
        stats.percentile(initDuration, 0.95),
        stats.percentile(initDuration, 0.9),
      ],
    },
    {
      [chalk.bold.blue("MemoryUsed")]: [
        stats.mean(memoryUsed),
        Math.min(...memoryUsed),
        Math.max(...memoryUsed),
        stats.percentile(memoryUsed, 0.99),
        stats.percentile(memoryUsed, 0.95),
        stats.percentile(memoryUsed, 0.9),
      ],
    },
  );

  console.info(table.toString());
};

export default async ({
  functionName,
  eventPath,
  region,
  parallelInvocations = 10,
  iterations = 10,
}: Measure) => {
  console.info(chalk.black.bgGreen.bold(` λ ${functionName} `));
  const event = JSON.parse(readFileSync(eventPath).toString());

  const config = await getConfig({ functionName, region });

  let results = [];

  try {
    for (let i = 0; i < iterations; i++) {
      results.push(
        ...(await measure(
          functionName,
          event,
          region,
          config,
          parallelInvocations,
          i + 1,
          iterations,
        )),
      );
    }

    output(results);
  } finally {
    await setEnv({ functionName, region, env: config.Environment.Variables });
  }
};
