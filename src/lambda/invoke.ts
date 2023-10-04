import { InvokeCommand, LambdaClient, LogType } from "@aws-sdk/client-lambda";

export interface Invoke {
  funcName: string;
  payload: object;
  region?: string;
}

export default async ({ funcName, payload, region }: Invoke) => {
  const client = new LambdaClient({ region });
  const command = new InvokeCommand({
    FunctionName: funcName,
    Payload: JSON.stringify(payload),
    LogType: LogType.Tail,
  });

  const { LogResult, StatusCode } = await client.send(command);

  const logs = Buffer.from(LogResult, "base64").toString();
  return { logs, status: StatusCode };
};
