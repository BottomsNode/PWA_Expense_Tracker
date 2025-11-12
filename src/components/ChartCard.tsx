import { ChartCardProps } from "@/props";

export const ChartCard: React.FC<ChartCardProps> = ({
    title,
    children,
    className = "",
    subtitle,
    isLoading = false,
}) => (
    <div
        className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm p-6 transition-all duration-300 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 ${className}`}
        role="region"
        aria-labelledby={`chart-card-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
    >
        <div className="mb-4">
            <h3
                id={`chart-card-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
                className="text-lg font-semibold text-gray-900 dark:text-gray-100"
            >
                {title}
            </h3>
            {subtitle && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {subtitle}
                </p>
            )}
        </div>
        {isLoading ? (
            <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        ) : (
            children
        )}
    </div>
);
