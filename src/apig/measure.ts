import ora from "ora";

import { reset } from "../helpers";
import request from "./request.ts";

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

export default async ({
  dependency,
  iteration,
  iterations,
  region,
  parallel,
  ...params
}: Measure) => {
  const paddedIteration = String(iteration).padStart(
    String(iterations).length,
    "0",
  );

  const spinner = ora(
    `[${paddedIteration}/${iterations}] - Resetting λ`,
  ).start();

  await Promise.all(dependency.map((name) => reset(name, region)));

  spinner.text = `[${paddedIteration}/${iterations}] - Sending request to λ`;

  const results = await Promise.all(
    Array.from({ length: parallel }, () => request(params)),
  );

  const fastest = parallel > 1 ? " Fastest:" : "";

  spinner.succeed(
    `[${paddedIteration}/${iterations}] -${fastest} ${Math.min(
      ...results.map((duration) => duration),
    ).toFixed(3)} ⚡`,
  );

  return results;
};
