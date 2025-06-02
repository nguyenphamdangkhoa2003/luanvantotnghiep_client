import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { requestRouteMutationFn } from '@/api/routes/route';
import { toast } from 'sonner';

interface RouteRequestDialogProps {
    routeId: string;
    seats: number;
}

export function RouteRequestDialog({
    routeId,
    seats,
}: RouteRequestDialogProps) {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');

    const mutation = useMutation({
        mutationFn: requestRouteMutationFn,
        onSuccess: () => {
            toast.success('Route request sent successfully');
            setOpen(false);
            setMessage('');
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const handleSubmit = () => {
        mutation.mutate({
            routeId,
            seats,
            message: message || undefined,
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Request Route</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Request Route</DialogTitle>
                    <DialogDescription>
                        Send a request for the selected route. Add an optional
                        message if needed.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="routeId" className="text-right">
                            Route ID
                        </Label>
                        <Input
                            id="routeId"
                            value={routeId}
                            disabled
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="seats" className="text-right">
                            Seats
                        </Label>
                        <Input
                            id="seats"
                            value={seats}
                            disabled
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="message" className="text-right">
                            Message
                        </Label>
                        <Textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Enter your message (optional)"
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={mutation.isPending}>
                        {mutation.isPending ? 'Sending...' : 'Send Request'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
