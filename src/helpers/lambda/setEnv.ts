import {
  LambdaClient,
  UpdateFunctionConfigurationCommand,
} from "@aws-sdk/client-lambda";

export interface SetEnv {
  functionName: string;
  env: Record<string, string>;
  region?: string;
}

export default async ({ functionName, env, region }: SetEnv) => {
  const client = new LambdaClient({ region });
  const input = {
    FunctionName: functionName,
    Environment: {
      Variables: {
        ...env,
      },
    },
  };

  const command = new UpdateFunctionConfigurationCommand(input);

  return await client.send(command);
};
