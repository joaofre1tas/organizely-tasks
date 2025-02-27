
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface NewTagProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTag: (name: string, color: string) => void;
}

export function NewTagDialog({ open, onOpenChange, onCreateTag }: NewTagProps) {
  const { toast } = useToast();
  const [newTag, setNewTag] = useState<{ name: string; color: string }>({ 
    name: "", 
    color: "#4c6ef5" 
  });

  const handleCreateTag = () => {
    if (!newTag.name.trim()) {
      toast({
        title: "Erro",
        description: "O nome da tag é obrigatório",
        variant: "destructive",
      });
      return;
    }
    
    onCreateTag(newTag.name, newTag.color);
    setNewTag({ name: "", color: "#4c6ef5" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Nova tag</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome</label>
            <Input
              value={newTag.name}
              onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
              placeholder="Digite o nome da tag"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Cor</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={newTag.color}
                onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <Input
                value={newTag.color}
                onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                placeholder="#000000"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreateTag}>
            Criar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
