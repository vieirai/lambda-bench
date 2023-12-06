# lambda-measure-cold-start
CLI utility for benchmarking lambda cold starts

![Example](media/lb-lambda.gif)

## Usage

### Lambda event

Measure cold start times on lambda using `RequestResponse` invocation.

Example commands:
```bash
$ lb lambda function-name path/event.json

$ lb lambda help

$ lb lambda function-name path/event.json \
  --region us-east-1 \
  --iterations 10 \
  --parallel 1 \
  --dependency function-name-1 \
  --dependency function-name-2
```

### API Gateway event

Measure cold start times on lambda exposed with API Gateway.  
When used in this mode, we measure the HTTP request duration.

Example commands:
```bash
$ lb apig function-name http://my.example.url

$ lb apig help

$ lb apig function-name http://my.example.url \
  --request POST \
  --header 'header1: value' \
  --header 'header2: value' \
  --body '{}' \
  --iterations 1 \
  --parallel 1 \
  --dependency function-name-1 \
  --dependency function-name-2 \
  --region us-east-1
```

## Contributing


```bash
# install
$ bun install

# lint
$ bun lint

# build
$ bun run build
```
