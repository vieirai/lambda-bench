import {
  FunctionConfiguration,
  LastUpdateStatus,
} from "@aws-sdk/client-lambda";
import { randomUUID } from "crypto";
import { readFileSync } from "fs";

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
) => {
  await setEnv({
    functionName,
    region,
    env: { ...config.Environment.Variables, measureHash: randomUUID() },
  });

  console.log("updated function config.");

  let functionStatus: LastUpdateStatus | string = LastUpdateStatus.InProgress;

  while (functionStatus !== LastUpdateStatus.Successful) {
    functionStatus = (await getConfig({ functionName, region }))
      .LastUpdateStatus;

    await sleep(1000);

    console.log("waiting...", functionStatus);
  }

  console.log("measuring...");

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

  try {
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

    console.log("results", { results });
  } finally {
    await setEnv({ functionName, region, env: config.Environment.Variables });
  }
};
