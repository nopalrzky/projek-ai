import { cn } from "@/lib/utils";
import { PageStatsProps } from "./types";
import StatCard from "./StatCard";

const PageStats = ({
    stats,
    className,
    columns = 4,
    animate = true,
    variant = "default",
}: PageStatsProps) => {
    const gridCols = {
        1: "grid-cols-1",
        2: "grid-cols-1 md:grid-cols-2",
        3: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
        4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    };

    if (!stats || stats.length === 0) return null;

    return (
        <div
            className={cn("grid gap-4 md:gap-6", gridCols[columns], className)}
        >
            {stats.map((stat, index) => (
                <div
                    key={`${stat.label}-${index}`}
                    className={cn(
                        animate &&
                            "animate-fadeInUp [animation-fill-mode:both]",
                    )}
                    style={
                        animate ? { animationDelay: `${index * 60}ms` } : undefined
                    }
                >
                    <StatCard item={stat} animate={animate} variant={variant} />
                </div>
            ))}
        </div>
    );
};

export default PageStats;
