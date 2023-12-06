import ora from "ora";

import { reset, invoke } from "../helpers";

export interface Measure {
  functionName: string;
  event: object;
  region?: string;
  parallel: number;
  iteration: number;
  iterations: number;
  dependency: string[];
}

export default async ({
  functionName,
  event,
  region,
  parallel,
  iteration,
  iterations,
  dependency,
}: Measure) => {
  const paddedIteration = String(iteration).padStart(
    String(iterations).length,
    "0",
  );

  const spinner = ora(
    `[${paddedIteration}/${iterations}] - Resetting λ`,
  ).start();

  await Promise.all(dependency.map((name) => reset(name, region)));

  spinner.text = `[${paddedIteration}/${iterations}] - Invoking λ`;

  const results = await Promise.all(
    Array.from({ length: parallel }, () =>
      invoke({ funcName: functionName, region, payload: event }),
    ),
  );

  const fastest = parallel > 1 ? " Fastest:" : "";

  spinner.succeed(
    `[${paddedIteration}/${iterations}] -${fastest} ${Math.min(
      ...results.map(({ billedDuration }) => billedDuration),
    ).toFixed(3)} ⚡`,
  );

  return results;
};
