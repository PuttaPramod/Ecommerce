import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CheckoutService, OrderDetails } from '../../services/checkout.service';

@Component({
  selector: 'app-order-confirmation',
  imports: [CommonModule, RouterModule],
  templateUrl: './order-confirmation.html',
  styleUrl: './order-confirmation.css',
})
export class OrderConfirmationComponent implements OnInit {
  order?: OrderDetails;
  isLoading = true;
  loadError = '';

  constructor(
    private route: ActivatedRoute,
    private checkoutService: CheckoutService,
    @Inject(PLATFORM_ID) private platformId: object,
    private changeDetector: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const orderNumber = this.route.snapshot.paramMap.get('orderNumber');
    if (!orderNumber) {
      this.loadError = 'Order number not found.';
      this.isLoading = false;
      return;
    }

    // `history` only exists in a browser; SSR falls back to the API request below.
    const navigationOrder = isPlatformBrowser(this.platformId)
      ? (history.state?.['order'] as OrderDetails | undefined)
      : undefined;
    if (navigationOrder?.orderNumber === orderNumber) {
      this.order = navigationOrder;
      this.isLoading = false;
      this.changeDetector.markForCheck();
      return;
    }

    this.checkoutService.getOrder(orderNumber).subscribe({
      next: (response) => {
        this.order = response.order;
        this.isLoading = false;
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.loadError = 'We could not load this order. Please check that the backend is running.';
        this.isLoading = false;
        this.changeDetector.markForCheck();
      },
    });
  }
}
