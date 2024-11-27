import { Box } from '@mui/material';
import { Label } from './ui/label';
import { ReactNode } from 'react';

interface IconDisplayProps {
  icon: ReactNode;
  label: string;
  spacing?: number;
}

const IconDisplay = ({ icon, label, spacing = 5 }: IconDisplayProps) => {
  return (
    <Box display={'flex'} alignItems={'center'}>
      {icon}
      <Box width={spacing} />
      <Label>{label}</Label>
    </Box>
  );
};

export default IconDisplay;
