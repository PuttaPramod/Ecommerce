import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { ProductsComponent } from './pages/products/products';
import { CartPageComponent } from './pages/cart-page/cart-page';
import { CheckoutPageComponent } from './pages/checkout-page/checkout-page';

export const routes: Routes = [
    { path: '', component: HomeComponent },
      { path: 'products', component: ProductsComponent },
      { path: 'cart', component: CartPageComponent },
      { path: 'checkout', component: CheckoutPageComponent },
      { path: '**', redirectTo: '' }
];
