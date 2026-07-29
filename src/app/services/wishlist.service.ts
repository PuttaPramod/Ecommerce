import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../models/product';
import { AuthService } from './auth-service';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly storageKeyPrefix = 'eshop_wishlist';
  private activeScope = 'guest';
  private items: Product[];
  private readonly itemsSubject: BehaviorSubject<Product[]>;
  readonly items$;

  constructor(@Inject(PLATFORM_ID) private platformId: object, private authService: AuthService) {
    this.items = [];
    this.itemsSubject = new BehaviorSubject<Product[]>([]);
    this.items$ = this.itemsSubject.asObservable();
    this.authService.user$.subscribe((user) => {
      this.activeScope = user?.id || 'guest';
      this.items = this.readItems();
      this.itemsSubject.next([...this.items]);
    });
  }

  toggle(product: Product): boolean {
    const exists = this.has(product.id);
    this.items = exists ? this.items.filter((item) => item.id !== product.id) : [...this.items, product];
    this.persist();
    return !exists;
  }

  has(productId: number): boolean { return this.items.some((item) => item.id === productId); }
  get count(): number { return this.items.length; }

  private readItems(): Product[] {
    if (!isPlatformBrowser(this.platformId)) return [];
    try {
      const items = JSON.parse(localStorage.getItem(this.storageKey()) || '[]');
      return Array.isArray(items) ? items : [];
    } catch { return []; }
  }

  private persist(): void {
    if (isPlatformBrowser(this.platformId)) localStorage.setItem(this.storageKey(), JSON.stringify(this.items));
    this.itemsSubject.next([...this.items]);
  }

  private storageKey(): string { return `${this.storageKeyPrefix}_${this.activeScope}`; }
}
