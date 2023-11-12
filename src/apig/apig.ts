import axios from "axios";
import chalk from "chalk";
import ora from "ora";

import { finalReset, reset } from "../helpers";

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

  let results = [];

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

    console.log(results);
  } finally {
    await Promise.all(dependency.map((name) => finalReset(name, region)));
  }
};

export interface Measure {
  body: string;
  dependency: string[];
  headers: Record<string, string>;
  iteration: number;
  iterations: number;
  region?: string;
  request: "GET" | "POST" | "PUT";
  url: string;
  parallel: number;
}

const measure = async ({
  dependency,
  iteration,
  iterations,
  region,
  parallel,
  ...params
}: Measure) => {
  const spinner = ora(`[${iteration}/${iterations}] - Resetting λ`).start();

  await Promise.all(dependency.map((name) => reset(name, region)));

  spinner.text = `[${iteration}/${iterations}] - Sending request to λ`;

  const results = await Promise.all(
    Array.from({ length: parallel }, () => request(params)),
  );

  spinner.succeed(
    `[${iteration}/${iterations}] - Fastest: ${Math.min(
      ...results.map((duration) => duration),
    )}`,
  );

  return results;
};

interface Request {
  body: string;
  headers: Record<string, string>;
  request: "GET" | "POST" | "PUT";
  url: string;
}

const request = async ({ body, headers, url, request: method }: Request) => {
  const start = Date.now();

  await axios({
    method,
    url,
    data: body,
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      "Content-Type": "application/json",
      ...headers,
    },
  });

  return (Date.now() - start) / 1000;
};
