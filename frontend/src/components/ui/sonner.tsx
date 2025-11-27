import React from 'react';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light" // Thème fixe au lieu d'utiliser next-themes
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: 'group toast bg-white text-gray-900 border border-gray-200 shadow-lg',
          description: 'text-gray-500',
          actionButton: 'bg-blue-600 text-white hover:bg-blue-700',
          cancelButton: 'bg-gray-100 text-gray-500 hover:bg-gray-200',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
