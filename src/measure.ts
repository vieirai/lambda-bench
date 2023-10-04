import { FunctionConfiguration } from "@aws-sdk/client-lambda";
import { randomUUID } from "crypto";
import { readFileSync } from "fs";

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
) => {
  await setEnv({
    functionName,
    region,
    env: { measureHash: randomUUID(), ...config.Environment.Variables },
  });

  return await Promise.all(
    Array(parallelInvocations).map(() =>
      invoke({ funcName: functionName, region, payload: event }),
    ),
  );
};

export default async ({
  functionName,
  eventPath,
  region,
  parallelInvocations = 10,
  iterations = 10,
}: Measure) => {
  const event = JSON.parse(readFileSync(eventPath).toString());

  const config = await getConfig({ functionName, region });

  const results = [];

  for (let i = 0; i < iterations; i++) {
    results.push(
      ...(await measure(
        functionName,
        event,
        region,
        config,
        parallelInvocations,
      )),
    );
  }

  await setEnv({ functionName, region, env: config.Environment.Variables });

  console.log(results);
};
