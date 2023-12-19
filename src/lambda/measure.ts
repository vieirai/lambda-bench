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
  warm: boolean;
}

const warmPreMeasure = async (
  paddedIteration: string,
  iterations: number,
  region: string | undefined,
  iteration: number,
  functionName: string,
  parallel: number,
  event: object,
) => {
  let spinner;
  if (iteration === 1) {
    spinner = ora(`[${paddedIteration}/${iterations}] - Warming λ`).start();

    await Promise.all(
      Array.from({ length: parallel }, () =>
        invoke({ funcName: functionName, region, payload: event }),
      ),
    );

    spinner.text = `[${paddedIteration}/${iterations}] - Invoking λ`;
  } else {
    spinner = ora(`[${paddedIteration}/${iterations}] - Invoking λ`).start();
  }

  return spinner;
};

const coldPreMeasure = async (
  paddedIteration: string,
  iterations: number,
  region: string | undefined,
  dependency: string[],
) => {
  const spinner = ora(
    `[${paddedIteration}/${iterations}] - Resetting λ`,
  ).start();

  await Promise.all(dependency.map((name) => reset(name, region)));

  spinner.text = `[${paddedIteration}/${iterations}] - Invoking λ`;

  return spinner;
};

export default async ({
  functionName,
  event,
  region,
  parallel,
  iteration,
  iterations,
  dependency,
  warm,
}: Measure) => {
  const paddedIteration = String(iteration).padStart(
    String(iterations).length,
    "0",
  );

  const spinner = warm
    ? await warmPreMeasure(
        paddedIteration,
        iterations,
        region,
        iteration,
        functionName,
        parallel,
        event,
      )
    : await coldPreMeasure(paddedIteration, iterations, region, dependency);

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
