import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, AlertTriangle } from "lucide-react";

interface ParentalGateProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pin: string) => void;
  isLoading: boolean;
  error?: string;
}

export function ParentalGate({ isOpen, onClose, onSubmit, isLoading, error }: ParentalGateProps) {
  const [pin, setPin] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim()) {
      onSubmit(pin);
    }
  };

  const handleClose = () => {
    setPin("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Solo para adultos
          </DialogTitle>
          <DialogDescription>
            Este paso ayuda a que el niño aprenda por sí mismo. Un adulto puede introducir el PIN para ver la solución.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="parent-pin" className="text-sm font-medium">
              PIN de adulto
            </label>
            <Input
              id="parent-pin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Introduce el PIN"
              className="text-center tracking-widest"
              maxLength={10}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Pide a un adulto que introduzca el PIN para ver la solución.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!pin.trim() || isLoading}
            >
              {isLoading ? "Verificando..." : "Desbloquear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}