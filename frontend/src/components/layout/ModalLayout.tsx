'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalLayoutProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function ModalLayout({ isOpen, onClose, title, children }: ModalLayoutProps) {
  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open" onClose={onClose}>
      <div className="modal-box relative">
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
        <h3 className="text-lg font-bold mb-4">{title}</h3>
        {children}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>Schließen</button>
      </form>
    </dialog>
  );
} 