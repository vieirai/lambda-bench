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
    InvocationType: "RequestResponse",
  });

  const { LogResult, StatusCode } = await client.send(command);

  const logs = Buffer.from(LogResult, "base64").toString();

  return {
    billedDuration: logs.match(/(REPORT.*Billed Duration: )(\d+)/)[2],
    initDuration: logs.match(/(REPORT.*Init Duration: )(\d+)/)[2],
    duration: logs.match(/(REPORT.*\tDuration: )(\d+)/)[2],
    memoryUsed: logs.match(/(REPORT.*Memory Used: )(\d+)/)[2],
    status: StatusCode,
  };
};
