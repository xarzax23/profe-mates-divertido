import React from 'react';
import { motion } from 'framer-motion';
import { useDraggable } from '@dnd-kit/core';

interface DraggableItemProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function DraggableItem({ id, children, className = '', onClick, disabled = false }: DraggableItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`${className} ${isDragging ? 'opacity-50 z-50' : ''}`}
      onClick={onClick}
      whileHover={!disabled ? { scale: 1.05 } : undefined}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
    >
      {children}
    </motion.div>
  );
}