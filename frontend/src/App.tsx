import { RouterProvider } from 'react-router-dom';
import { router } from './routes/router';
import { Toaster } from '@/components/ui/sonner';

export function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster richColors theme="dark" />
    </>
  );
}


