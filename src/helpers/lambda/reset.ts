import {
  FunctionConfiguration,
  LastUpdateStatus,
} from "@aws-sdk/client-lambda";
import { randomUUID } from "crypto";

import sleep from "../sleep.ts";
import getConfig from "./getConfig.ts";
import setEnv from "./setEnv.ts";

const configMap: Record<string, FunctionConfiguration> = {};

export const reset = async (name: string, region?: string) => {
  if (!configMap[name])
    configMap[name] = await getConfig({ functionName: name, region });

  await setEnv({
    functionName: name,
    region,
    env: {
      ...configMap[name]?.Environment?.Variables,
      measureHash: randomUUID(),
    },
  });

  let functionStatus;

  while (functionStatus !== LastUpdateStatus.Successful) {
    functionStatus = (await getConfig({ functionName: name, region }))
      .LastUpdateStatus;

    await sleep(1000);
  }
};

export const finalReset = async (functionName: string, region?: string) => {
  if (!configMap[functionName])
    configMap[functionName] = await getConfig({ functionName, region });

  await setEnv({
    functionName,
    region,
    env: configMap[functionName]?.Environment?.Variables ?? {},
  });
};
