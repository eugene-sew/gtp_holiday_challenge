import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Card from "../ui/Card";

/**
 * @interface ChartDataItem
 * Defines the structure for each data item used in the pie chart.
 */
interface ChartDataItem {
  name: string; // Name of the segment (e.g., "Completed", "In Progress")
  value: number; // Numerical value for the segment (e.g., count of tasks)
  color: string; // Hex color code for the segment's visual representation
}

/**
 * @interface TasksChartProps
 * Defines the props for the TasksChart component.
 */
interface TasksChartProps {
  data: ChartDataItem[]; // Array of data items to plot in the chart.
}

/**
 * TasksChart component: Renders a pie chart displaying task status distribution.
 * Uses the Recharts library for charting.
 * Filters out data items with zero value to prevent rendering empty segments.
 * Shows a message if there is no data to display.
 * @param {TasksChartProps} props - The props for the component.
 */
const TasksChart = ({ data }: TasksChartProps) => {
  // Filter out segments with no value to avoid Recharts errors and improve clarity.
  const chartData = data.filter((item) => item.value > 0);
  // Calculate total value to determine if there's any data to show.
  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);

  // If all filtered items have a value of 0, or if there are no items, display a message.
  if (totalValue === 0) {
    return (
      <Card title="Task Status Distribution" className="h-full">
        <div className="h-64 flex flex-col items-center justify-center text-gray-500">
          <p>No task data to display.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Task Status Distribution" className="h-full">
      {/* ResponsiveContainer ensures the chart adapts to its parent's width and height. */}
      <ResponsiveContainer width="100%" height={256}>
        <PieChart>
          <Pie
            data={chartData} // Data for the pie slices
            cx="50%" // Center x-coordinate of the pie
            cy="50%" // Center y-coordinate of the pie
            labelLine={false} // Disable lines pointing from chart to labels (labels can be on slices or in legend)
            // Example for direct labels on slices (currently commented out):
            // label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80} // Radius of the pie chart
            fill="#8884d8" // Default fill color (overridden by Cell fills)
            dataKey="value" // Key in data objects that holds the numerical value
            nameKey="name" // Key in data objects that holds the name for tooltip/legend
          >
            {/* Map over chartData to create a <Cell> for each pie segment, applying its specific color. */}
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          {/* Tooltip configuration for hover details. */}
          <Tooltip
            formatter={(value: number, name: string) => [
              `${value} tasks`, // Custom formatting for the value shown in tooltip
              name, // Name of the segment
            ]}
          />
          {/* Legend to display segment names and colors. */}
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default TasksChart;
