import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import useSize from "./useSize";
import {
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import getTransactionsVsDateAxes from "./axes";
import { motion } from "framer-motion";

export default function Visualization({ transactions }) {
  const [groupBy, setGroupBy] = useState("memo");

  const { ref, height, width } = useSize();

  const margin = {
    r: 50,
    t: 50,
    l: 50,
    b: 50,
  };

  const expenses = d3.rollup(
    transactions.filter((t) => t.amount < 0),
    (g) => d3.sum(g, (t) => t.amount),
    (t) => t.date.format("YY/MM")
  );

  const income = d3.rollup(
    transactions.filter((t) => t.amount >= 0),
    (g) => d3.sum(g, (t) => t.amount),
    (t) => t.date.format("YY/MM")
  );

  const net = d3.rollup(
    transactions,
    (g) => d3.sum(g, (t) => t.amount),
    (t) => t.date.format("YY/MM")
  );

  const { xAxis, xScale, yAxis, yScale } = getTransactionsVsDateAxes(
    [d3.min([...expenses.values(), 0]), d3.max([...income.values(), 0])],
    d3.extent(transactions, (t) => t.date),
    width,
    height,
    margin
  );

  const lineAtZero = d3.line()([
    [margin.l, yScale(0)],
    [width - margin.r, yScale(0)],
  ]);

  useEffect(() => {
    d3.select("#container")
      .select("g.yAxis")
      .attr("transform", `translate(${margin.r})`)
      .transition()
      .duration(500)
      .call(yAxis);

    d3.select("#container")
      .select("g.xAxis")
      .attr("transform", `translate(0, ${height - margin.b})`)
      .transition()
      .duration(500)
      .call(xAxis);

    d3.select("path.lineAtZero")
      .transition()
      .duration(500)
      .attr("d", lineAtZero)
      .style("stroke", "gray");

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupBy, transactions, width, height]);

  function groupByKey(t) {
    switch (groupBy) {
      case "memo":
        return t.memo;
      case "category":
        return t.categ;
      case "weekday":
        return t.date.format("ddd");
      default:
        console.error("unknown groupBy", groupBy);
    }
  }

  const biggestExpensesByMemo = d3.rollup(
    transactions.filter((t) => t.amount < 0),
    (g) => d3.sum(g, (d) => -d.amount),
    (d) => d.date.format("YY/MM"),
    (d) => groupByKey(d)
  );
  function expensesTitle(yearMonth) {
    const biggestExpensesThisMonth = biggestExpensesByMemo.get(yearMonth);
    let total = d3.sum(biggestExpensesThisMonth.entries(), ([d, v]) => v);

    return (
      <Stack max-height="100%">
        <Typography>Expenses: {total}</Typography>
        {Array.from(biggestExpensesThisMonth.entries())
          .sort((d1, d2) => d2[1] - d1[1])
          .slice(0, 10)
          .map((d) => {
            return (
              <Typography key={d[0]} variant="body2">
                {d[0]}: {d[1]}
              </Typography>
            );
          })}
      </Stack>
    );
  }

  function incomeTitle(yearMonth) {
    let income = transactions
      .filter((t) => t.amount >= 0)
      .filter((t) => t.date.format("YY/MM") === yearMonth);
    let total = d3.sum(income, (t) => t.amount);
    return (
      <Stack>
        <Typography>Income: {total}</Typography>
        {income
          .sort((t1, t2) => t1.amount - t2.amount[1])
          .slice(0, 5)
          .map((t) => {
            return (
              <Typography key={t.id} variant="body2">
                {t.memo}: {t.amount}
              </Typography>
            );
          })}
      </Stack>
    );
  }

  const netByMonth = d3.rollup(
    transactions,
    (g) => d3.sum(g, (d) => d.amount),
    (d) => d.date.format("YY/MM")
  );
  function netTitle(yearMonth) {
    const netThisMonth = netByMonth.get(yearMonth);

    return (
      <Stack>
        <Typography>Net</Typography>
        <Typography variant="body2">Total: {netThisMonth}</Typography>
      </Stack>
    );
  }

  return (
    <Stack sx={{ flex: 1, height: "100%" }}>
      <FormControl component="fieldset">
        <FormLabel component="legend">Group By</FormLabel>
        <RadioGroup
          row
          aria-label="groupby options"
          name="groupby"
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value)}
        >
          <FormControlLabel value="memo" control={<Radio />} label="memo" />
          <FormControlLabel
            value="category"
            control={<Radio />}
            label="category"
          />
          <FormControlLabel
            value="weekday"
            control={<Radio />}
            label="weekday"
          />
        </RadioGroup>
      </FormControl>

      <Box height="100%" ref={ref}>
        <svg height="100%" width="100%" id="container">
          <g className="xAxis"></g>
          <path className="lineAtZero"></path>
          <g className="yAxis"></g>
          <g className="income">
            {Array.from(income.entries()).map((d) => {
              return (
                <Tooltip key={d[0]} title={incomeTitle(d[0])} placement="right">
                  <motion.rect
                    animate={{
                      x: xScale(d[0]),
                      y: yScale(d[1]),
                      height: Math.abs(yScale(0) - yScale(d[1])),
                      width: xScale.bandwidth() / 3,
                    }}
                    // initial={false}
                    transition={{ duration: 0.5 }}
                    style={{ fill: "#b3de69" }}
                  />
                </Tooltip>
              );
            })}
          </g>
          <g className="expenses">
            {Array.from(expenses.entries()).map((d) => {
              return (
                <Tooltip
                  key={d[0]}
                  title={expensesTitle(d[0])}
                  placement="right"
                >
                  <motion.rect
                    animate={{
                      x: xScale(d[0]) + xScale.bandwidth() / 3,
                      y: yScale(0),
                      height: Math.abs(yScale(0) - yScale(d[1])),
                      width: xScale.bandwidth() / 3,
                    }}
                    // initial={false}
                    transition={{ duration: 0.5 }}
                    style={{ fill: "#fb8072" }}
                  ></motion.rect>
                </Tooltip>
              );
            })}
          </g>
          <g className="net">
            {Array.from(net.entries()).map((d) => {
              return (
                <Tooltip key={d[0]} title={netTitle(d[0])} placement="right">
                  <motion.rect
                    animate={{
                      x: xScale(d[0]) + (2 * xScale.bandwidth()) / 3,
                      y: Math.min(yScale(0), yScale(d[1])),
                      height: Math.abs(yScale(0) - yScale(d[1])),
                      width: xScale.bandwidth() / 3,
                    }}
                    // initial={false}
                    transition={{ duration: 0.5 }}
                    style={{ fill: "#80b1d3" }}
                  ></motion.rect>
                </Tooltip>
              );
            })}
          </g>
        </svg>
      </Box>
    </Stack>
  );
}