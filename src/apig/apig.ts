import chalk from "chalk";

import { finalReset } from "../helpers";
import measure from "./measure.ts";
import { output } from "./output.ts";

export interface APIG {
  body: string;
  dependency: string[];
  headers: Record<string, string>;
  iterations: number;
  name: string;
  parallel: number;
  region?: string;
  request: "GET" | "POST" | "PUT";
  url: string;
}

export default async ({
  name,
  region,
  iterations,
  dependency = [],
  ...params
}: APIG) => {
  console.info(chalk.black.bgGreen.bold(` λ ${name} `));

  dependency.push(name);

  const results = [];

  try {
    for (let i = 0; i < iterations; i++) {
      results.push(
        ...(await measure({
          iterations,
          iteration: i + 1,
          region,
          dependency,
          ...params,
        })),
      );
    }

    output(results);
  } finally {
    await Promise.all(dependency.map((name) => finalReset(name, region)));
  }
};
