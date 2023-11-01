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
  const spinner = ora(`[${iteration}/${iterations}] - Resetting λ`).start();

  await Promise.all(dependency.map((name) => reset(name, region)));

  spinner.text = `[${iteration}/${iterations}] - Invoking λ`;

  const results = await Promise.all(
    Array.from({ length: parallel }, () =>
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
