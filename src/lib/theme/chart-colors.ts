/**
 * Chart / SVG colors driven by CSS design tokens (works with data-theme).
 */
export type ChartThemeColors = {
  grid: string
  tick: string
  polar: string
  tooltipBg: string
  tooltipBorder: string
  tooltipFg: string
  series1: string
  series2: string
  series3: string
  seriesFill: string
}

function readCssVar(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

export function getChartThemeColors(): ChartThemeColors {
  return {
    grid: readCssVar('--chart-grid', 'rgba(255,255,255,0.06)'),
    tick: readCssVar('--chart-tick', 'rgba(255,255,255,0.6)'),
    polar: readCssVar('--chart-polar', 'rgba(255,255,255,0.08)'),
    tooltipBg: readCssVar('--chart-tooltip-bg', 'rgba(17, 24, 39, 0.9)'),
    tooltipBorder: readCssVar('--chart-tooltip-border', 'rgba(255,255,255,0.08)'),
    tooltipFg: readCssVar('--chart-tooltip-fg', '#f8fafc'),
    series1: readCssVar('--chart-series-1', '#2563eb'),
    series2: readCssVar('--chart-series-2', '#1d4ed8'),
    series3: readCssVar('--chart-series-3', '#06b6d4'),
    seriesFill: readCssVar('--chart-series-fill', 'rgba(37,99,235,0.18)'),
  }
}

export function chartTooltipStyle(colors: ChartThemeColors): Record<string, string | number> {
  return {
    background: colors.tooltipBg,
    border: `1px solid ${colors.tooltipBorder}`,
    borderRadius: 14,
    backdropFilter: 'blur(10px)',
    color: colors.tooltipFg,
  }
}
