import chalk from "chalk";
import Table from "cli-table3";
import stats from "stats-lite";

interface Result {
  billedDuration: number;
  initDuration: number;
  duration: number;
  memoryUsed: number;
}

export const output = (results: Result[], warm: boolean) => {
  const duration: number[] = results.map(({ duration }) => duration);
  const billedDuration = results.map(({ billedDuration }) => billedDuration);
  const initDuration = results.map(({ initDuration }) => initDuration);
  const memoryUsed = results.map(({ memoryUsed }) => memoryUsed);

  const table = new Table({
    chars: {
      top: "═",
      "top-mid": "╤",
      "top-left": "╔",
      "top-right": "╗",
      bottom: "═",
      "bottom-mid": "╧",
      "bottom-left": "╚",
      "bottom-right": "╝",
      left: "║",
      "left-mid": "╟",
      right: "║",
      "right-mid": "╢",
    },
    head: [
      "",
      chalk.bold.green("Average"),
      chalk.bold.green("Minimum"),
      chalk.bold.green("Maximum"),
      chalk.bold.green("p99"),
      chalk.bold.green("p95"),
      chalk.bold.green("p90"),
    ],
  });
  table.push({
    [chalk.bold.blue("Duration")]: [
      stats.mean(duration).toFixed(3),
      Math.min(...duration),
      Math.max(...duration),
      stats.percentile(duration, 0.99),
      stats.percentile(duration, 0.95),
      stats.percentile(duration, 0.9),
    ],
  });
  table.push({
    [chalk.bold.blue("BilledDuration")]: [
      stats.mean(billedDuration).toFixed(3),
      Math.min(...billedDuration),
      Math.max(...billedDuration),
      stats.percentile(billedDuration, 0.99),
      stats.percentile(billedDuration, 0.95),
      stats.percentile(billedDuration, 0.9),
    ],
  });
  if (!warm) {
    table.push({
      [chalk.bold.blue("InitDuration")]: [
        stats.mean(initDuration).toFixed(3),
        Math.min(...initDuration),
        Math.max(...initDuration),
        stats.percentile(initDuration, 0.99),
        stats.percentile(initDuration, 0.95),
        stats.percentile(initDuration, 0.9),
      ],
    });
  }
  table.push({
    [chalk.bold.blue("MemoryUsed")]: [
      stats.mean(memoryUsed).toFixed(3),
      Math.min(...memoryUsed),
      Math.max(...memoryUsed),
      stats.percentile(memoryUsed, 0.99),
      stats.percentile(memoryUsed, 0.95),
      stats.percentile(memoryUsed, 0.9),
    ],
  });

  console.info(table.toString());
};
