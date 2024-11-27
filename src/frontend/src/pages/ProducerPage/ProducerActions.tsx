import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useActivateProducer, useGenerateMessages } from '@/hooks/producer.hooks';
import { useToast } from '@/hooks/use-toast';
import { Producer } from '@/utils/types';
import { DialogClose } from '@radix-ui/react-dialog';
import { useState } from 'react';

interface ProducerActionsProps {
  producer: Producer;
  onRefreshRateChanged: (newRefreshRate: number) => void;
}

const ProducerActions = ({ producer, onRefreshRateChanged }: ProducerActionsProps) => {
  const { mutateAsync: generateMessages } = useGenerateMessages(producer.id);
  const { mutateAsync: activateProducer } = useActivateProducer(producer.id);
  const [refreshRate, setRefreshRate] = useState(5);
  const existingRefreshRate = parseFloat(localStorage.getItem('refreshRate') ?? '5');

  const { toast } = useToast();

  const onGenerateMessagesClicked = async () => {
    try {
      await generateMessages();
      toast({
        title: 'Successfully generated new messages'
      });
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: 'Failed to generate messages',
          description: error.message
        });
      }
    }
  };

  const onActivateProducerClicked = async () => {
    try {
      await activateProducer();
      toast({
        title: 'Successfully sent all pending messages'
      });
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: 'Failed to activate prodcuer',
          description: error.message
        });
      }
    }
  };

  return (
    <Dialog>
      <DropdownMenu>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={onGenerateMessagesClicked}>Generate Messages</DropdownMenuItem>
          <DropdownMenuItem onClick={onActivateProducerClicked}>Send Messages</DropdownMenuItem>
          <DialogTrigger asChild>
            <DropdownMenuItem>Set Refresh Rate</DropdownMenuItem>
          </DialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Refresh Rate</DialogTitle>
          <DialogDescription>Set how frequently in seconds you want to check the status of this producer</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-8 items-center gap-4">
            <Label htmlFor="name" className="col-span-3">
              Refresh Rate
            </Label>
            <Input
              id="name"
              defaultValue={`${existingRefreshRate}`}
              type="number"
              className="col-span-5"
              onChange={(e) => setRefreshRate(parseFloat(e.target.value))}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose>
            <Button type="submit" onClick={() => onRefreshRateChanged(refreshRate)}>
              Save changes
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProducerActions;
