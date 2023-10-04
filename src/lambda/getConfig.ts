import {
  LambdaClient,
  GetFunctionConfigurationCommand,
} from "@aws-sdk/client-lambda";

export interface GetConfig {
  functionName: string;
  region: string;
}

export default async ({ functionName, region }: GetConfig) => {
  const client = new LambdaClient({ region });
  const input = {
    FunctionName: functionName,
  };

  const command = new GetFunctionConfigurationCommand(input);

  return await client.send(command);
};
