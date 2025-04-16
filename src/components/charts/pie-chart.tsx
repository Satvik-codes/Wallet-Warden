
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

export interface PieChartData {
  name: string;
  value: number;
}

interface PieChartProps {
  data: PieChartData[];
  title: string;
  colors?: string[];
}

// Default colors for the pie chart
const DEFAULT_COLORS = [
  "#33C3F0", // Cyan
  "#D946EF", // Magenta
  "#8B5CF6", // Purple
  "#F97316", // Orange
  "#10B981", // Green
  "#F43F5E", // Pink
  "#3B82F6", // Blue
  "#A3A3A3", // Gray
];

const PieChart = ({ 
  data, 
  title,
  colors = DEFAULT_COLORS 
}: PieChartProps) => {
  // Format data for better display
  const formattedData = data
    .filter(item => item.value > 0) // Only show items with positive values
    .map(item => ({
      ...item,
      value: Number(item.value.toFixed(2))
    }));

  const total = formattedData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={formattedData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                innerRadius={40}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                animationDuration={1500}
              >
                {formattedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={colors[index % colors.length]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`₹${value} (${((value / total) * 100).toFixed(1)}%)`, 'Amount']}
                contentStyle={{ 
                  backgroundColor: 'rgba(23, 23, 23, 0.9)',
                  borderColor: 'rgba(100, 100, 100, 0.5)',
                  color: '#fff'
                }}
              />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PieChart;
