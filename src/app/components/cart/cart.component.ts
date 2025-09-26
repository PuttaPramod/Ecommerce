import { Component } from '@angular/core';
import { CartService, CartItem } from '../../services/cart.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cart',
  imports: [CommonModule,RouterModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent {
  constructor(public cartService: CartService) {}

  removeItem(item: CartItem): void {
    this.cartService.removeFromCart(item.product.id);
  }

  updateQuantity(item: CartItem, quantity: number): void {
    if (quantity > 0) {
      this.cartService.updateQuantity(item.product.id, quantity);
    } else {
      this.removeItem(item);
    }
  }

  clearCart(): void {
    this.cartService.clearCart();
  }

  getSubtotal(): number {
    return this.cartService.getTotalPrice();
  }

  getShipping(): number {
    return 10.00;
  }

  getTax(): number {
    return this.getSubtotal() * 0.08;
  }

  getTotal(): number {
    return this.getSubtotal() + this.getShipping() + this.getTax();
  }
}