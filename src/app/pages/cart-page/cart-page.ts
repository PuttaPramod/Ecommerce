// cart-page.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartComponent } from '../../components/cart/cart.component';

@Component({
  selector: 'app-cart-page',
  imports: [CommonModule, CartComponent],
  template: `<app-cart></app-cart>`
})
export class CartPageComponent {}