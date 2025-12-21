import { useState } from 'react';
import { EventSegmentAttendeeContribution } from 'common/schema';
import { Button, Icon, Input, Textarea } from '../../../components/design-system';
import { toast } from 'sonner';
export function SendInvitationForm({ onSend, disabled = false }: { onSend: (phoneNumber: string, message: string) => void; disabled?: boolean }) {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSend(phoneNumber, message);
        toast.success('Invitation sent successfully!');
        setPhoneNumber('');
        setMessage('');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-foreground mb-2">Recipient Phone Number</label>
                <Input
                    type="tel"
                    placeholder="Enter phone number to invite"
                    value={phoneNumber}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhoneNumber(e.target.value)}
                    required
                    className="w-full"
                    disabled={disabled}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-foreground mb-2">Invitation Message</label>
                <Textarea
                    placeholder="Come join my event!"
                    value={message}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                    required
                    className="w-full"
                    disabled={disabled}
                />
            </div>
            <Button type="submit" variant="primary" className="w-full" disabled={disabled}>
                <Icon name="envelope" size={20} text="Send Invitation" />
            </Button>
        </form>
    );
}
export function AddContributionForm({
    eventSegmentAttendeeId,
    onAdd,
    disabled = false,
}: {
    eventSegmentAttendeeId: string;
    onAdd: (item: string, desc: string, qty: number) => void;
    disabled?: boolean;
}) {
    const [item, setItem] = useState('');
    const [description, setDescription] = useState('');
    const [quantity, setQuantity] = useState('1');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (item.trim() && quantity.trim()) {
            onAdd(item, description, Number(quantity) || 1);
            toast.success('Contribution added successfully!');
            setItem('');
            setDescription('');
            setQuantity('1');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 p-6 border border-muted rounded-lg shadow-lg">
            <div>
                <label className="block text-sm font-medium text-foreground mb-2">Item</label>
                <Input
                    placeholder="e.g., Pizza, Board Games"
                    value={item}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setItem(e.target.value)}
                    required
                    className="w-full"
                    disabled={disabled}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <Input
                    placeholder="e.g., Vegetarian, Card games"
                    value={description}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
                    className="w-full"
                    disabled={disabled}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-foreground mb-2">Quantity</label>
                <Input
                    type="number"
                    inputMode='numeric'
                    placeholder="1"
                    value={quantity}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuantity(e.target.value)}
                    required
                    className="w-full"
                    disabled={disabled}
                />
            </div>
            <Button type="submit" variant="primary" className="w-full" disabled={disabled}>
                <Icon name="plus" size={20} text="Add Contribution" />
            </Button>
        </form>
    );
}

export function EditContributionForm({
    contribution,
    onUpdate,
    onCancel,
}: {
    contribution: EventSegmentAttendeeContribution;
    onUpdate: (item: string, desc: string, qty: number) => void;
    onCancel: () => void;
}) {
    const [item, setItem] = useState(contribution.item);
    const [description, setDescription] = useState(contribution.description);
    const [quantity, setQuantity] = useState(contribution.quantity.toString());

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (item.trim() && quantity.trim()) {
            onUpdate(item, description, Number(quantity) || 1);
            toast.success('Contribution updated successfully!');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-2 space-y-3 p-4 border border-accent rounded-lg bg-accent/5">
            <div>
                <label className="block text-sm font-medium text-foreground mb-1">Item</label>
                <Input
                    value={item}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setItem(e.target.value)}
                    required
                    className="w-full"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                <Input
                    value={description}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
                    className="w-full"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-foreground mb-1">Quantity</label>
                <Input
                    type="number"
                    value={quantity}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuantity(e.target.value)}
                    min={1}
                    required
                    className="w-full"
                />
            </div>
            <div className="flex gap-2">
                <Button type="submit" variant="primary" size="sm" className="flex-1">Update</Button>
                <Button type="button" onClick={onCancel} variant="accent" size="sm" className="flex-1">Cancel</Button>
            </div>
        </form>
    );
}