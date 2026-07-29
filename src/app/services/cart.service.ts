import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../models/product';
import { AuthService } from './auth-service';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private readonly storageKeyPrefix = 'eshop_cart';
  private readonly clientIdKeyPrefix = 'eshop_client_id';
  private activeScope = 'guest';
  private readonly apiUrl = 'http://localhost:5001/api';
  private readonly cartItemsSubject = new BehaviorSubject<CartItem[]>([]);

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private http: HttpClient,
    private authService: AuthService,
  ) {
    this.authService.user$.subscribe((user) => {
      this.activeScope = user?.id || 'guest';
      this.cartItems = this.readCart();
      this.notifyCartChanged();
      this.loadCartFromDatabase();
    });
  }

  addToCart(product: Product, quantity: number = 1): void {
    const existingItem = this.cartItems.find(item => item.product.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cartItems.push({ product, quantity });
    }
    this.saveCart();
    this.notifyCartChanged();
  }

  removeFromCart(productId: number): void {
    this.cartItems = this.cartItems.filter(item => item.product.id !== productId);
    this.saveCart();
    this.notifyCartChanged();
  }

  updateQuantity(productId: number, quantity: number): void {
    const item = this.cartItems.find(item => item.product.id === productId);
    if (item) {
      item.quantity = quantity;
      this.saveCart();
      this.notifyCartChanged();
    }
  }

  getCartItems(): CartItem[] {
    return this.cartItems;
  }

  getTotalPrice(): number {
    return this.cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }

  clearCart(): void {
    this.cartItems = [];
    this.saveCart();
    this.notifyCartChanged();
  }

  getCartCount(): number {
    return this.cartItems.reduce((count, item) => count + item.quantity, 0);
  }

  cartUpdates(): Observable<CartItem[]> {
    return this.cartItemsSubject.asObservable();
  }

  private readCart(): CartItem[] {
    if (!isPlatformBrowser(this.platformId)) return [];

    try {
    const savedCart = localStorage.getItem(this.storageKey());
      const parsedCart = savedCart ? JSON.parse(savedCart) : [];
      return Array.isArray(parsedCart) ? parsedCart : [];
    } catch {
      return [];
    }
  }

  private saveCart(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem(this.storageKey(), JSON.stringify(this.cartItems));
    this.http.put(`${this.apiUrl}/carts/${this.getClientId()}`, { items: this.cartItems }).subscribe({
      error: () => console.warn('Cart saved locally; MongoDB sync is unavailable.'),
    });
  }

  getClientId(): string {
    if (!isPlatformBrowser(this.platformId)) return this.activeScope;
    const clientIdKey = `${this.clientIdKeyPrefix}_${this.activeScope}`;
    const existingId = localStorage.getItem(clientIdKey);
    if (existingId) return existingId;

    const clientId = crypto.randomUUID();
    localStorage.setItem(clientIdKey, clientId);
    return clientId;
  }

  private loadCartFromDatabase(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const scopeAtRequest = this.activeScope;
    this.http.get<{ items?: CartItem[] }>(`${this.apiUrl}/carts/${this.getClientId()}`).subscribe({
      next: (savedCart) => {
        if (scopeAtRequest !== this.activeScope || this.cartItems.length || !Array.isArray(savedCart.items) || !savedCart.items.length) return;
        this.cartItems = savedCart.items;
        localStorage.setItem(this.storageKey(), JSON.stringify(this.cartItems));
        this.notifyCartChanged();
      },
      error: () => console.warn('Cart loaded from local storage; MongoDB sync is unavailable.'),
    });
  }

  private notifyCartChanged(): void {
    this.cartItemsSubject.next([...this.cartItems]);
  }

  private storageKey(): string {
    return `${this.storageKeyPrefix}_${this.activeScope}`;
  }
}
