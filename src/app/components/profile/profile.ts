import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { CheckoutService, OrderDetails } from '../../services/checkout.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  readonly activeSection: 'account' | 'orders' | 'wishlist';
  orders: OrderDetails[] = [];
  isLoadingOrders = false;
  ordersError = '';

  constructor(
    private route: ActivatedRoute,
    public authService: AuthService,
    public cartService: CartService,
    public wishlistService: WishlistService,
    private checkoutService: CheckoutService,
    private changeDetector: ChangeDetectorRef,
  ) {
    this.activeSection = this.route.snapshot.data['section'] || 'account';
  }

  ngOnInit(): void {
    const user = this.authService.currentUser;
    if (this.activeSection !== 'orders' || !user) return;

    this.isLoadingOrders = true;
    this.checkoutService.getOrdersForUser(user.id).subscribe({
      next: ({ orders }) => {
        this.orders = orders;
        this.isLoadingOrders = false;
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.ordersError = 'We could not load your orders. Please check the backend and MongoDB connection.';
        this.isLoadingOrders = false;
        this.changeDetector.markForCheck();
      },
    });
  }

  addWishlistItemToCart(product: Parameters<WishlistService['toggle']>[0]): void {
    this.cartService.addToCart(product);
  }

  orderItemSummary(order: OrderDetails): string {
    return order.items.map((item) => `${item.name} × ${item.quantity}`).join(' · ');
  }

}
