import chalk from "chalk";
import Table from "cli-table3";
import stats from "stats-lite";

export const output = (duration: number[]) => {
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

  console.info(table.toString());
};
