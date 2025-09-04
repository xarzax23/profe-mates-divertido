import React from 'react';
import { motion } from 'framer-motion';
import { useDroppable } from '@dnd-kit/core';

interface DroppableTargetProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function DroppableTarget({ id, children, className = '', onClick, disabled = false }: DroppableTargetProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    disabled
  });

  return (
    <motion.div
      ref={setNodeRef}
      className={`${className} ${isOver ? 'ring-2 ring-primary bg-primary/10' : ''}`}
      onClick={onClick}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
    >
      {children}
    </motion.div>
  );
}