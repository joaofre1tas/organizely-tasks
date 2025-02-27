
import React from "react";
import { Button } from "@/components/ui/button";

interface TextFormattingToolbarProps {
  onFormat: (command: string) => void;
}

export function TextFormattingToolbar({ onFormat }: TextFormattingToolbarProps) {
  return (
    <div className="flex gap-1 mb-1">
      <Button 
        type="button" 
        variant="outline" 
        size="sm" 
        className="h-7 px-2 text-xs"
        onClick={() => onFormat('bold')}
      >
        B
      </Button>
      <Button 
        type="button" 
        variant="outline" 
        size="sm" 
        className="h-7 px-2 text-xs italic"
        onClick={() => onFormat('italic')}
      >
        I
      </Button>
      <Button 
        type="button" 
        variant="outline" 
        size="sm" 
        className="h-7 px-2 text-xs underline"
        onClick={() => onFormat('underline')}
      >
        U
      </Button>
      <Button 
        type="button" 
        variant="outline" 
        size="sm" 
        className="h-7 px-2 text-xs"
        onClick={() => onFormat('bullet')}
      >
        •
      </Button>
    </div>
  );
}
