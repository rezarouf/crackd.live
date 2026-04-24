import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      gutter={8}
      toastOptions={{
        duration: 3000,
        style: {
          background: '#161B25',
          color: '#F0F0F0',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px',
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          fontWeight: 500,
          padding: '12px 16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        },
        success: {
          iconTheme: { primary: '#22C55E', secondary: '#161B25' },
        },
        error: {
          iconTheme: { primary: '#EF4444', secondary: '#161B25' },
        },
      }}
    />
  );
}

export { toast } from 'react-hot-toast';
