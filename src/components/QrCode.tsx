import { useMemo } from "react";
import { cn } from "@/lib/utils";

function hashString(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildMatrix(value: string, n = 29) {
  const rand = mulberry32(hashString(value || "meetingflow"));
  const grid: boolean[][] = Array.from({ length: n }, () => Array.from({ length: n }, () => rand() > 0.52));

  const finder = (ox: number, oy: number) => {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        const edge = x === 0 || y === 0 || x === 6 || y === 6;
        const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        grid[oy + y][ox + x] = edge || core;
      }
    }
    for (let y = -1; y <= 7; y++) {
      for (let x = -1; x <= 7; x++) {
        const gy = oy + y;
        const gx = ox + x;
        if (gy < 0 || gx < 0 || gy >= n || gx >= n) continue;
        if (x === -1 || y === -1 || x === 7 || y === 7) grid[gy][gx] = false;
      }
    }
  };

  finder(0, 0);
  finder(n - 7, 0);
  finder(0, n - 7);

  // quiet the centre for the logo mark
  const c = Math.floor(n / 2);
  for (let y = c - 3; y <= c + 3; y++) {
    for (let x = c - 3; x <= c + 3; x++) {
      if (y >= 0 && x >= 0 && y < n && x < n) grid[y][x] = false;
    }
  }

  return grid;
}

export function QrCode({
  value,
  size = 168,
  className,
  dark = "#16233F",
}: {
  value: string;
  size?: number;
  className?: string;
  dark?: string;
}) {
  const n = 29;
  const grid = useMemo(() => buildMatrix(value, n), [value]);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${n} ${n}`}
      className={cn("shrink-0", className)}
      role="img"
      aria-label={`签到二维码 ${value}`}
      shapeRendering="crispEdges"
    >
      <rect width={n} height={n} fill="#ffffff" />
      {grid.map((row, y) =>
        row.map((on, x) =>
          on ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={dark} /> : null,
        ),
      )}
      <rect
        x={Math.floor(n / 2) - 2.4}
        y={Math.floor(n / 2) - 1.4}
        width={4.8}
        height={2.8}
        rx={0.4}
        fill="#ffffff"
      />
      <rect
        x={Math.floor(n / 2) - 1.6}
        y={Math.floor(n / 2) - 0.9}
        width={3.2}
        height={1.8}
        rx={0.3}
        fill={dark}
      />
    </svg>
  );
}
