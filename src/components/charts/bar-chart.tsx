
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export interface BarChartData {
  name: string;
  value: number;
}

interface BarChartProps {
  data: BarChartData[];
  title: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  color?: string;
}

const BarChart = ({ 
  data, 
  title, 
  xAxisLabel = "", 
  yAxisLabel = "",
  color = "#33C3F0" 
}: BarChartProps) => {
  // Format data for better display
  const formattedData = data.map(item => ({
    ...item,
    value: Number(item.value.toFixed(2))
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart
              data={formattedData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis 
                dataKey="name" 
                label={{ 
                  value: xAxisLabel, 
                  position: 'insideBottom', 
                  offset: -10 
                }}
                stroke="#888"
              />
              <YAxis 
                label={{ 
                  value: yAxisLabel, 
                  angle: -90, 
                  position: 'insideLeft'
                }}
                stroke="#888"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(23, 23, 23, 0.9)',
                  borderColor: 'rgba(100, 100, 100, 0.5)',
                  color: '#fff'
                }}
                formatter={(value) => [`₹${value}`, 'Amount']}
              />
              <Legend />
              <Bar
                dataKey="value"
                name="Amount"
                fill={color}
                radius={[4, 4, 0, 0]}
                animationDuration={1500}
              />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default BarChart;
