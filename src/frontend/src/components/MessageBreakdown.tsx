import { Label, Pie, PieChart } from 'recharts';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from './ui/chart';
import { Typography } from '@mui/material';

const chartConfig = {
  messages: {
    label: 'Messages'
  },
  pending: {
    label: 'Pending',
    color: 'hsl(var(--chart-1))'
  },
  succeeded: {
    label: 'Succeeded',
    color: 'hsl(var(--chart-2))'
  },
  failed: {
    label: 'Failed',
    color: 'hsl(var(--chart-3))'
  }
} satisfies ChartConfig;

interface MessageBreakdownProps {
  totalMessages: number;
  numberSent: number;
  numberFailed: number;
}

const MessageBreakdown = ({ totalMessages, numberSent, numberFailed }: MessageBreakdownProps) => {
  const chartData = [
    { type: 'pending', messages: totalMessages - numberSent, fill: 'var(--color-pending)' },
    { type: 'failed', messages: numberFailed, fill: 'var(--color-failed)' },
    { type: 'succeeded', messages: numberSent - numberFailed, fill: 'var(--color-succeeded)' }
  ];

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Message Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {totalMessages === 0 ? (
          <Typography my={10} textAlign={'center'}>
            No Messages Generated Yet
          </Typography>
        ) : (
          <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Pie data={chartData} dataKey="messages" nameKey="type" innerRadius={60} strokeWidth={5}>
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                          <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                            {totalMessages.toLocaleString()}
                          </tspan>
                          <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                            Messages
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="leading-none text-muted-foreground">Showing Message Breakdown for This Producer</div>
      </CardFooter>
    </Card>
  );
};

export default MessageBreakdown;
