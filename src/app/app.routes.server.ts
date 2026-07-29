import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Product IDs and order numbers are only known at runtime, so they cannot be prerendered.
  // Client rendering also lets the confirmation page use browser navigation state safely.
  {
    path: 'products/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'order-confirmation/:orderNumber',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
