import chalk from "chalk";
import { readFileSync } from "fs";

import { finalReset } from "../helpers";
import measure from "./measure.ts";
import { output } from "./output.ts";

export interface Lambda {
  functionName: string;
  eventPath: string;
  region?: string;
  parallel: number;
  iterations: number;
  dependency?: string[];
}

export default async ({
  functionName,
  eventPath,
  region,
  parallel,
  iterations,
  dependency = [],
}: Lambda) => {
  console.info(chalk.black.bgGreen.bold(` λ ${functionName} `));
  const event = JSON.parse(readFileSync(eventPath).toString());

  dependency.push(functionName);

  const results = [];

  try {
    for (let i = 0; i < iterations; i++) {
      results.push(
        ...(await measure({
          functionName,
          event,
          region,
          parallel,
          iteration: i + 1,
          iterations,
          dependency,
        })),
      );
    }

    output(results);
  } finally {
    await Promise.all(dependency.map((name) => finalReset(name, region)));
  }
};
