
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string | number;
  className?: string;
  iconClassName?: string;
  currency?: string;
}

const SummaryCard = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendValue,
  className,
  iconClassName,
  currency = "₹", // Default to rupee symbol
}: SummaryCardProps) => {
  // Format the value with currency if it's a number
  const formattedValue = typeof value === 'number' ? 
    `${currency}${value.toLocaleString('en-IN')}` : value;

  return (
    <Card className={cn("card-hover overflow-hidden", className)}>
      <CardContent className="p-6 flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className="flex items-baseline space-x-1">
            <h3 className="text-2xl font-bold tracking-tight">{formattedValue}</h3>
            {trend && (
              <span
                className={cn("text-xs", {
                  "text-[hsl(var(--success))]": trend === "up",
                  "text-[hsl(var(--destructive))]": trend === "down",
                  "text-muted-foreground": trend === "neutral",
                })}
              >
                {trendValue}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <div
          className={cn(
            "rounded-full p-2 bg-primary/10",
            iconClassName
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
