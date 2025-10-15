import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import './index.css'
import { Theme } from "@radix-ui/themes";

import App from './App.tsx'
import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from './tanstack/queryClient.ts';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    	<Theme>
      <QueryClientProvider client={queryClient}>
    <App />
    </QueryClientProvider>
    </Theme>
  </StrictMode>,
)


