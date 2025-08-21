import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface ParentPinDialogProps {
  open: boolean;
  onSubmit: (pin: string) => void;
  onClose: () => void;
}

export function ParentPinDialog({ open, onSubmit, onClose }: ParentPinDialogProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      setError('Introduce el PIN');
      return;
    }
    setError('');
    onSubmit(pin);
    setPin('');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Introduce el PIN de adulto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            value={pin}
            onChange={e => setPin(e.target.value)}
            placeholder="PIN"
            autoFocus
            maxLength={10}
          />
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="destructive">Aceptar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
