import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

export interface CardDetails {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  paymentMethod: 'card' | 'debit';
}

export interface OrderData {
  shipping: ShippingInfo;
  card: CardDetails;
  total: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private apiUrl = 'http://localhost:3000/api'; // Update with your API endpoint

  constructor(private http: HttpClient) {}

  // Submit order to backend
  submitOrder(orderData: OrderData): Observable<any> {
    return this.http.post(`${this.apiUrl}/orders`, orderData);
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
