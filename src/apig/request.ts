import axios from "axios";

interface Request {
  body: string;
  headers: Record<string, string>;
  request: "GET" | "POST" | "PUT";
  url: string;
}

export default async ({ body, headers, url, request: method }: Request) => {
  const start = Date.now();

  await axios({
    method,
    url,
    data: body,
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      "Content-Type": "application/json",
      ...headers,
    },
  });

  return (Date.now() - start) / 1000;
};
