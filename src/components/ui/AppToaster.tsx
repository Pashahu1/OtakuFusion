'use client';

import { Toaster } from 'sonner';
import 'sonner/dist/styles.css';
import './AppToaster.scss';

export function AppToaster() {
  return (
    <Toaster
      className="otakufusion-toaster-banner"
      theme="dark"
      richColors
      position="top-center"
      closeButton
      offset={0}
      gap={0}
      visibleToasts={3}
      toastOptions={{
        duration: 4000,
      }}
    />
  );
}
