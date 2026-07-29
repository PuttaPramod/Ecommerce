import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { ProductsComponent } from './pages/products/products';
import { CartPageComponent } from './pages/cart-page/cart-page';
import { CheckoutPageComponent } from './pages/checkout-page/checkout-page';
import { Register } from './auth/register/register';
import { Login } from './auth/login/login';
import { ProductDetail } from './components/product-detail/product-detail';
import { OrderConfirmationComponent } from './pages/order-confirmation/order-confirmation';
import { Profile } from './components/profile/profile';

export const routes: Routes = [
    { path: '', component: HomeComponent },
      { path: 'products', component: ProductsComponent },
      { path: 'products/:id', component: ProductDetail },
      { path: 'cart', component: CartPageComponent },
      { path: 'checkout', component: CheckoutPageComponent },
      { path: 'order-confirmation/:orderNumber', component: OrderConfirmationComponent },
      { path: 'register', component:Register},
      { path: 'login', component: Login},
      { path: 'profile', component: Profile },
      { path: 'orders', component: Profile, data: { section: 'orders' } },
      { path: 'wishlist', component: Profile, data: { section: 'wishlist' } },
      { path: '**', redirectTo: '' }
];
