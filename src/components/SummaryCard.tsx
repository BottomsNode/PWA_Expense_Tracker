import { SummaryCardProps } from "@/props";

export const SummaryCard: React.FC<SummaryCardProps> = ({
    title,
    value,
    gradient,
    icon,
    subtitle,
    onClick,
}) => (
    <div
        onClick={onClick}
        className={`flex flex-col items-center justify-center text-center
                    bg-linear-to-br ${gradient}
                    text-white rounded-2xl
                    p-3 sm:p-4 shadow-xl hover:shadow-2xl
                    transition-transform duration-300 hover:scale-[1.04] active:scale-[0.97]
                    ${onClick ? "cursor-pointer" : ""}`}
    >
        {/* Optional icon */}
        {icon && <div className="mb-2 text-xl sm:text-2xl">{icon}</div>}

        {/* Title */}
        <p className="text-xs sm:text-sm uppercase font-bold tracking-wider opacity-80">
            {title}
        </p>

        {/* Value */}
        <p className="text-2xl sm:text-4xl md:text-5xl font-extrabold mt-3 leading-tight drop-shadow-md">
            {value}
        </p>

        {/* Optional subtitle */}
        {subtitle && (
            <p className="text-[11px] sm:text-xs mt-2 opacity-80 font-medium">{subtitle}</p>
        )}
    </div>
)
