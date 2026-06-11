import { scoreToColor, scoreToBg } from "@/utils/formatters";

interface Props {
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

export function MatchScoreRing({
  score,
  size = 96,
  strokeWidth = 8,
  showLabel = true,
}: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  const colorClass = scoreToColor(score);
  const bgClass = scoreToBg(score);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E6ECF4"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={colorClass}
          style={{
            transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-display text-2xl font-bold ${colorClass}`}>
            {score}
          </span>
          <span className="text-[10px] text-ink-400 font-medium mt-0.5">匹配度</span>
        </div>
      )}
      <div
        className={`absolute inset-0 rounded-full opacity-[0.08] ${bgClass}`}
        style={{ padding: strokeWidth }}
      />
    </div>
  );
}
