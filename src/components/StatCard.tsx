import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  description?: string;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
}: StatCardProps) {
  return (
    <div
      className="
        relative overflow-hidden rounded-2xl
        bg-white/10 backdrop-blur-lg
        border border-white/20
        p-4 sm:p-6
        transition-all duration-300
        hover:scale-[1.03] hover:shadow-2xl
      "
    >
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-transparent to-blue-500/10 opacity-0 hover:opacity-100 transition-opacity" />

      <div className="relative flex items-center justify-between gap-4">
        {/* Left content */}
        <div className="flex-1">
          <p className="text-xs sm:text-sm font-medium text-white/70">
            {title}
          </p>

          <p className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 text-white">
            {value}
          </p>

          {trend && (
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${trend.isPositive
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                  }`}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}%
              </span>
              <span className="text-xs text-white/60">
                {trend.label}
              </span>
            </div>
          )}

          {description && (
            <p className="text-xs text-white/60 mt-1">
              {description}
            </p>
          )}
        </div>

        {/* Icon */}
        <div
          className="
            flex h-11 w-11 sm:h-12 sm:w-12
            items-center justify-center
            rounded-xl
            bg-gradient-to-br from-cyan-400/20 to-blue-500/20
            text-cyan-300
            shadow-lg
          "
        >
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
      </div>
    </div>
  );
}
