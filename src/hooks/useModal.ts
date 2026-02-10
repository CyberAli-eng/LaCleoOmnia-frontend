import { useState } from 'react';

export interface UseModalResult<T = any> {
  isOpen: boolean;
  data: T | null;
  open: (modalData?: T) => void;
  close: () => void;
  toggle: () => void;
}

export function useModal<T = any>(): UseModalResult<T> {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | null>(null);

  const open = (modalData?: T) => {
    if (modalData !== undefined) {
      setData(modalData);
    }
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setData(null);
  };

  const toggle = () => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  };

  return { isOpen, data, open, close, toggle };
}
