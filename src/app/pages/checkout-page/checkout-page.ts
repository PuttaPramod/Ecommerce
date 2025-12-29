import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CheckoutService, OrderData } from '../../services/checkout.service';
import { CartService, CartItem } from '../../services/cart.service';
import { from } from 'rxjs';

interface CheckoutItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout-page.html',
  styleUrls: ['./checkout-page.css']
})
export class CheckoutPageComponent implements OnInit {
  checkoutForm!: FormGroup;
  isSubmitting = false;
  orderSubmitted = false;
  orderNumber = '';
  selectedPaymentMethod: 'card' | 'debit' = 'card';

  // Cart items from CartService
  cartItems: CheckoutItem[] = [];
  subtotal = 0;
  shipping = 10.0;
  tax = 0;
  total = 0;

  constructor(
    private formBuilder: FormBuilder,
    private checkoutService: CheckoutService,
    private cartService: CartService  // Inject CartService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setupPaymentMethodListener();
    this.loadCartItems();
  }

  /**
   * Load cart items from CartService
   */
  private loadCartItems(): void {
    const items = this.cartService.getCartItems();

    // Transform CartItems to CheckoutItems
    this.cartItems = items.map(item => ({
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      image: item.product.image
    }));

    // Calculate totals
    this.calculateTotal();
  }

  /**
   * Calculate total price, tax, and shipping
   */
  private calculateTotal(): void {
    this.subtotal = this.cartItems.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );
    this.subtotal = parseFloat(this.subtotal.toFixed(2));

    // Calculate shipping based on cart count
    const cartCount = this.cartService.getCartCount();
    this.shipping = cartCount > 0 ? 10.0 : 0;

    // Calculate tax (8%)
    this.tax = parseFloat((this.subtotal * 0.08).toFixed(2));

    // Calculate total
    this.total = parseFloat((this.subtotal + this.shipping + this.tax).toFixed(2));
  }

  /**
   * Initialize the checkout form with validation
   */
  private initializeForm(): void {
    this.checkoutForm = this.formBuilder.group({
      // Shipping Information
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      zip: ['', [Validators.required, Validators.pattern(/^[0-9]{5,6}$/)]],

      // Payment Information
      paymentMethod: ['card', Validators.required],
      cardholderName: [''],
      cardNumber: [''],
      expiry: [''],
      cvv: [''],
      sameAddress: [true]
    });
  }

  /**
   * Listen to payment method changes and toggle card fields
   */
  private setupPaymentMethodListener(): void {
    this.checkoutForm.get('paymentMethod')?.valueChanges.subscribe(method => {
      this.selectedPaymentMethod = method;
      const cardFields = ['cardholderName', 'cardNumber', 'expiry', 'cvv'];

      if (method === 'card' || method === 'debit') {
        cardFields.forEach(field => {
          this.checkoutForm.get(field)?.setValidators([Validators.required]);
        });
      } else {
        cardFields.forEach(field => {
          this.checkoutForm.get(field)?.clearValidators();
        });
      }

      cardFields.forEach(field => {
        this.checkoutForm.get(field)?.updateValueAndValidity({ emitEvent: false });
      });
    });
  }

  /**
   * Handle card number input formatting
   */
  onCardNumberInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formatted = this.checkoutService.formatCardNumber(input.value);
    this.checkoutForm.patchValue({ cardNumber: formatted }, { emitEvent: false });
  }

  /**
   * Handle expiry date input formatting
   */
  onExpiryInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formatted = this.checkoutService.formatExpiry(input.value);
    this.checkoutForm.patchValue({ expiry: formatted }, { emitEvent: false });
  }

  /**
   * Handle CVV input - numbers only
   */
  onCVVInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
  }

  /**
   * Check if a form field is invalid and touched
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.checkoutForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Get error message for a specific field
   */
  getErrorMessage(fieldName: string): string {
    const control = this.checkoutForm.get(fieldName);

    if (!control || !control.errors) {
      return '';
    }

    if (control.errors['required']) {
      return `${this.formatFieldName(fieldName)} is required`;
    }
    if (control.errors['email']) {
      return 'Please enter a valid email address';
    }
    if (control.errors['pattern']) {
      if (fieldName === 'phone') {
        return 'Phone number must be 10 digits';
      }
      if (fieldName === 'zip') {
        return 'ZIP code must be 5-6 digits';
      }
    }

    return 'Invalid input';
  }

  /**
   * Format field name for display
   */
  private formatFieldName(fieldName: string): string {
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.checkoutForm.invalid) {
      Object.keys(this.checkoutForm.controls).forEach(key => {
        this.checkoutForm.get(key)?.markAsTouched();
      });
      return;
    }

    // Additional card validation
    const cardNumber = this.checkoutForm.get('cardNumber')?.value;
    if (!this.checkoutService.validateCardNumber(cardNumber)) {
      this.checkoutForm.get('cardNumber')?.setErrors({ 'invalidCard': true });
      return;
    }

    this.isSubmitting = true;

    // Prepare order data
    const orderData: OrderData = {
      shipping: {
        firstName: this.checkoutForm.get('firstName')?.value,
        lastName: this.checkoutForm.get('lastName')?.value,
        email: this.checkoutForm.get('email')?.value,
        phone: this.checkoutForm.get('phone')?.value,
        address: this.checkoutForm.get('address')?.value,
        city: this.checkoutForm.get('city')?.value,
        state: this.checkoutForm.get('state')?.value,
        zip: this.checkoutForm.get('zip')?.value
      },
      card: {
        cardholderName: this.checkoutForm.get('cardholderName')?.value,
        cardNumber: this.checkoutForm.get('cardNumber')?.value,
        expiry: this.checkoutForm.get('expiry')?.value,
        cvv: this.checkoutForm.get('cvv')?.value,
        paymentMethod: this.checkoutForm.get('paymentMethod')?.value
      },
      total: this.total.toString(),
      timestamp: new Date().toLocaleString()
    };

    // Submit order via service
    this.checkoutService.submitOrder(orderData).subscribe({
      next: (response) => {
        this.handleOrderSuccess(orderData);
      },
      error: (error) => {
        this.handleOrderError(error);
      }
    });
  }

  /**
   * Handle successful order submission
   */
  private handleOrderSuccess(orderData: OrderData): void {
    this.orderNumber = this.checkoutService.generateOrderNumber();
    this.orderSubmitted = true;
    this.isSubmitting = false;

    // Clear cart after successful order
    this.cartService.clearCart();

    // Log order details
    console.log('Order submitted successfully:', {
      orderNumber: this.orderNumber,
      ...orderData
    });
  }

  /**
   * Handle order submission error
   */
  private handleOrderError(error: any): void {
    console.error('Order submission failed:', error);
    this.isSubmitting = false;
    alert('Order submission failed. Please try again.');
  }

  /**
   * Reset form and start new order
   */
  resetCheckout(): void {
    this.orderSubmitted = false;
    this.checkoutForm.reset({ paymentMethod: 'card' });
    this.selectedPaymentMethod = 'card';
  }
}
