import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CheckoutService, OrderData, OrderDetails, SavedAddress } from '../../services/checkout.service';
import { CartService, CartItem } from '../../services/cart.service';
import { AuthService } from '../../services/auth-service';

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
  submitError = '';
  orderSubmitted = false;
  orderNumber = '';
  selectedPaymentMethod: 'card' | 'debit' = 'card';

  // Cart items from CartService
  cartItems: CheckoutItem[] = [];
  subtotal = 0;
  shipping = 10.0;
  tax = 0;
  total = 0;
  savedAddresses: SavedAddress[] = [];
  isLoadingAddresses = false;

  constructor(
    private formBuilder: FormBuilder,
    private checkoutService: CheckoutService,
    private cartService: CartService,
    public authService: AuthService,
    private router: Router,
    private changeDetector: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setupPaymentMethodListener();
    this.cartService.cartUpdates().subscribe(() => this.loadCartItems());
    this.prefillAccountDetails();
    this.loadSavedAddresses();
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
      saveAddress: [true],
      makeDefault: [false],

      // Payment Information
      paymentMethod: ['card', Validators.required],
      cardholderName: [''],
      cardNumber: [''],
      expiry: [''],
      cvv: [''],
      sameAddress: [true]
    });
  }

  private prefillAccountDetails(): void {
    const user = this.authService.currentUser;
    if (!user) return;
    const [firstName = '', ...lastName] = user.name.split(' ');
    this.checkoutForm.patchValue({ firstName, lastName: lastName.join(' '), email: user.email, phone: user.mobile });
  }

  private loadSavedAddresses(): void {
    const user = this.authService.currentUser;
    if (!user) return;
    this.isLoadingAddresses = true;
    this.checkoutService.getAddresses(user.id).subscribe({
      next: ({ addresses }) => {
        this.savedAddresses = addresses;
        this.isLoadingAddresses = false;
        const defaultAddress = addresses.find((address) => address.isDefault);
        if (defaultAddress) this.applySavedAddress(defaultAddress._id || '');
        this.changeDetector.markForCheck();
      },
      error: () => { this.isLoadingAddresses = false; this.changeDetector.markForCheck(); },
    });
  }

  applySavedAddress(addressId: string): void {
    const address = this.savedAddresses.find((item) => item._id === addressId);
    if (!address) return;
    this.checkoutForm.patchValue({ ...address, saveAddress: true, makeDefault: address.isDefault });
  }

  useManualAddress(): void {
    this.checkoutForm.patchValue({ address: '', city: '', state: '', zip: '', saveAddress: true, makeDefault: false });
  }

  private saveCurrentAddress(): void {
    const user = this.authService.currentUser;
    if (!user || !this.checkoutForm.get('saveAddress')?.value) return;
    const values = this.checkoutForm.getRawValue();
    const address: SavedAddress = {
      label: 'Delivery address', firstName: values.firstName, lastName: values.lastName,
      email: values.email, phone: values.phone, address: values.address, city: values.city,
      state: values.state, zip: values.zip, isDefault: values.makeDefault,
    };
    this.checkoutService.saveAddress(user.id, address).subscribe({
      next: ({ addresses }) => { this.savedAddresses = addresses; this.changeDetector.markForCheck(); },
    });
  }

  /**
   * Listen to payment method changes and toggle card fields
   */
  private setupPaymentMethodListener(): void {
    this.checkoutForm.get('paymentMethod')?.valueChanges.subscribe(method => {
      this.selectedPaymentMethod = method;
      this.setPaymentFieldValidators(method);
    });
    this.setPaymentFieldValidators(this.selectedPaymentMethod);
  }

  private setPaymentFieldValidators(method: 'card' | 'debit'): void {
    const cardFields = ['cardholderName', 'cardNumber', 'expiry', 'cvv'];
    cardFields.forEach(field => {
      const control = this.checkoutForm.get(field);
      if (method === 'card' || method === 'debit') {
        control?.setValidators([Validators.required]);
      } else {
        control?.clearValidators();
      }
      control?.updateValueAndValidity({ emitEvent: false });
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
    if (control.errors['invalidCard']) {
      return 'Please enter a valid 16-digit card number';
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
    if (this.cartItems.length === 0) return;
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
      this.checkoutForm.get('cardNumber')?.markAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';

    // Prepare order data
    const cardDigits = cardNumber.replace(/\s/g, '');
    const orderData: OrderData = {
      clientId: this.cartService.getClientId(),
      userId: this.authService.currentUser?.id,
      items: this.cartService.getCartItems(),
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
      payment: {
        method: this.checkoutForm.get('paymentMethod')?.value,
        last4: cardDigits.slice(-4)
      }
    };

    // Submit order via service
    this.checkoutService.submitOrder(orderData).subscribe({
      next: (response) => {
        this.saveCurrentAddress();
        this.handleOrderSuccess(response.order);
      },
      error: (error) => {
        this.handleOrderError(error);
      }
    });
  }

  /**
   * Handle successful order submission
   */
  private handleOrderSuccess(order: OrderDetails): void {
    this.isSubmitting = false;
    this.cartService.clearCart();
    this.router.navigate(['/order-confirmation', order.orderNumber], { state: { order } });
  }

  /**
   * Handle order submission error
   */
  private handleOrderError(error: any): void {
    console.error('Order submission failed:', error);
    this.isSubmitting = false;
    this.submitError = error?.name === 'TimeoutError'
      ? 'The order service did not respond. Please check that the backend and MongoDB are running.'
      : 'We could not place your order. Please check the backend connection and try again.';
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
