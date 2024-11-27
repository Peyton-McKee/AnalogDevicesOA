import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from './ui/chart';
import { useEffect, useState } from 'react';

interface MessageDurationDistributionProps {
  messageTimes: number[];
}

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'hsl(var(--chart-1))'
  }
} satisfies ChartConfig;

interface GraphValue {
  x: number;
  y: number;
}

const MessageDurationDistribution = ({ messageTimes }: MessageDurationDistributionProps) => {
  const [chartData, setChartData] = useState([] as GraphValue[]);

  useEffect(() => {
    const messageTimeMap = new Map<number, number>();
    for (const time of messageTimes) {
      if (messageTimeMap.has(time)) {
        messageTimeMap.set(time, messageTimeMap.get(time)! + 1); // checked that it has it
      } else {
        messageTimeMap.set(time, 1);
      }
    }

    const newChartData: GraphValue[] = [];
    messageTimeMap.forEach((value, key) => {
      newChartData.push({
        x: key,
        y: value
      });
    });

    newChartData.sort((a, b) => a.x - b.x);

    setChartData(newChartData);
  }, [messageTimes]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Message Duration Distribution</CardTitle>
        <CardDescription>Showing distribution of the time each message took to send</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis dataKey="x" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => value} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
            <Area dataKey="y" type="natural" fill="var(--color-desktop)" fillOpacity={0.4} stroke="var(--color-desktop)" />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default MessageDurationDistribution;
