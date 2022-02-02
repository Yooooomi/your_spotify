import React from 'react';
import { Skeleton } from '@mui/material';
import ChartCard from '../../ChartCard';

interface LoadingImplementedChartProps {
  title: string;
  className?: string;
}

export default function LoadingImplementedChart({
  title,
  className,
}: LoadingImplementedChartProps) {
  return (
    <ChartCard title={title} className={className}>
      <Skeleton variant="rectangular" height="100%" width="100%" />
    </ChartCard>
  );
}
