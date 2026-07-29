import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';
import { CartItem } from './cart.service';

export interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

export interface PaymentDetails {
  method: 'card' | 'debit';
  last4: string;
}

export interface SavedAddress extends ShippingInfo {
  _id?: string;
  label?: string;
  isDefault?: boolean;
}

export interface OrderData {
  clientId: string;
  userId?: string;
  items: CartItem[];
  shipping: ShippingInfo;
  payment: PaymentDetails;
}

export interface OrderResponse {
  status: string;
  order: OrderDetails;
}

export interface OrderDetails {
  orderNumber: string;
  items: Array<{ name: string; image: string; quantity: number; unitPrice: number }>;
  shipping: ShippingInfo;
  subtotal: number;
  shippingAmount: number;
  tax: number;
  total: number;
  status: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private apiUrl = 'http://localhost:5001/api';

  constructor(private http: HttpClient) {}

  // Submit order to backend
  submitOrder(orderData: OrderData): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${this.apiUrl}/orders`, orderData).pipe(timeout(12000));
  }

  getOrder(orderNumber: string): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${this.apiUrl}/orders/${orderNumber}`).pipe(timeout(5000));
  }

  getOrdersForUser(userId: string): Observable<{ status: string; orders: OrderDetails[] }> {
    return this.http.get<{ status: string; orders: OrderDetails[] }>(`${this.apiUrl}/users/${userId}/orders`).pipe(timeout(5000));
  }

  getAddresses(userId: string): Observable<{ status: string; addresses: SavedAddress[] }> {
    return this.http.get<{ status: string; addresses: SavedAddress[] }>(`${this.apiUrl}/users/${userId}/addresses`).pipe(timeout(5000));
  }

  saveAddress(userId: string, address: SavedAddress): Observable<{ status: string; addresses: SavedAddress[] }> {
    return this.http.post<{ status: string; addresses: SavedAddress[] }>(`${this.apiUrl}/users/${userId}/addresses`, { address }).pipe(timeout(5000));
  }

  // Validate card number using Luhn algorithm
  validateCardNumber(cardNumber: string): boolean {
    const digits = cardNumber.replace(/\s/g, '').replace(/[^0-9]/gi, '');
    if (digits.length !== 16) return false;

    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i], 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  // Validate email
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Format card number with spaces
  formatCardNumber(cardNumber: string): string {
    return cardNumber
      .replace(/\s+/g, '')
      .replace(/[^0-9]/gi, '')
      .replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  // Format expiry date
  formatExpiry(expiry: string): string {
    let value = expiry.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    return value;
  }

  // Generate unique order number
  generateOrderNumber(): string {
    return 'ORD-' + Date.now();
  }
}
