import { useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import { CanvasRenderer } from "echarts/renderers";
import { GridComponent, LegendComponent, TooltipComponent } from "echarts/components";
import type { EChartsOption } from "echarts";
import { formatTimeValue } from "@/features/ranking";
import type { ThemeMode, TrendPoint } from "../types";

echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

type RecordHistoryChartProps = {
  points: TrendPoint[];
  themeMode: ThemeMode;
  onSelectPoint?: (point: TrendPoint) => void;
};

export const RecordHistoryChart = ({ points, themeMode, onSelectPoint }: RecordHistoryChartProps) => {
  const chartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!chartRef.current || points.length === 0) return;

    const chart = echarts.init(chartRef.current);
    const isDark = themeMode === "dark";
    const axisColor = isDark ? "#8b949e" : "#5a647c";
    const splitLineColor = isDark ? "#3a3f46" : "#e7ebf4";
    const tooltipBg = isDark ? "#21262d" : "#ffffff";
    const tooltipText = isDark ? "#dce5f2" : "#1f2937";

    const option: EChartsOption = {
      animation: true,
      grid: {
        top: 46,
        right: 18,
        bottom: 36,
        left: 46,
      },
      legend: {
        top: 8,
        textStyle: {
          color: axisColor,
          fontWeight: 700,
        },
      },
      tooltip: {
        trigger: "axis",
        backgroundColor: tooltipBg,
        borderColor: isDark ? "#3a3f46" : "#d7deed",
        textStyle: {
          color: tooltipText,
        },
        formatter: (rawParams: unknown) => {
          const params = Array.isArray(rawParams) ? rawParams : [rawParams];
          const dataIndex = (params[0] as { dataIndex?: number } | undefined)?.dataIndex ?? 0;
          const point = points[dataIndex];
          if (!point) return "";

          const values = params
            .map((item) => {
              const typed = item as { seriesName?: string; value?: number | null; marker?: string };
              return `${typed.marker ?? ""}${typed.seriesName ?? "-"}: ${formatTimeValue(typed.value ?? null)}`;
            })
            .join("<br/>");

          return `${point.compName}<br/>${point.roundName}<br/>${values}`;
        },
      },
      xAxis: {
        type: "category",
        data: points.map((item) => item.label),
        axisLabel: {
          color: axisColor,
          fontSize: 11,
        },
        axisLine: {
          lineStyle: { color: splitLineColor },
        },
      },
      yAxis: {
        type: "value",
        axisLabel: {
          color: axisColor,
          formatter: (value: number) => formatTimeValue(value),
        },
        splitLine: {
          lineStyle: {
            color: splitLineColor,
          },
        },
      },
      series: [
        {
          name: "최고",
          type: "line",
          smooth: 0.24,
          connectNulls: false,
          data: points.map((item) => item.single),
          symbolSize: 7,
          itemStyle: {
            color: "#ff5a7a",
          },
          lineStyle: {
            width: 2,
            color: "#ff5a7a",
          },
        },
        {
          name: "평균",
          type: "line",
          smooth: 0.24,
          connectNulls: false,
          data: points.map((item) => item.average),
          symbolSize: 7,
          itemStyle: {
            color: "#4d82ff",
          },
          lineStyle: {
            width: 2,
            color: "#4d82ff",
          },
        },
      ],
    };

    chart.setOption(option);
    chart.on("click", (params: unknown) => {
      const dataIndex = (params as { dataIndex?: number } | undefined)?.dataIndex;
      if (typeof dataIndex !== "number") return;
      const point = points[dataIndex];
      if (!point) return;
      onSelectPoint?.(point);
    });

    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.dispose();
    };
  }, [onSelectPoint, points, themeMode]);

  return <div ref={chartRef} className="profile-record-history-chart" />;
};
