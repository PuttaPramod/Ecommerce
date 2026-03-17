import { Component, OnInit } from '@angular/core';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // ✅ Needed for search bar [(ngModel)]

@Component({
  selector: 'app-product-list',
  standalone: true, // ✅ since we’re using imports array
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: string[] = [];
  selectedCategory: string = '';
  searchQuery: string = '';

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.products = this.productService.getAllProducts();
    this.filteredProducts = this.products;
    this.categories = this.productService.getCategories();
  }

  /** Filter products by category and search query */
  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  /** Apply category + search filters */
  applyFilters(): void {
    let result = this.selectedCategory
      ? this.productService.getProductsByCategory(this.selectedCategory)
      : this.products;

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    this.filteredProducts = result;
  }

  /** Sort products based on dropdown criteria */
  sortBy(criteria: string): void {
    if (criteria === 'priceAsc') {
      this.filteredProducts.sort((a, b) => a.price - b.price);
    } else if (criteria === 'priceDesc') {
      this.filteredProducts.sort((a, b) => b.price - a.price);
    } else if (criteria === 'ratingDesc') {
      this.filteredProducts.sort((a, b) => b.rating - a.rating);
    }
  }

  /** Add product to cart + show toast */
  addToCart(product: Product): void {
    this.cartService.addToCart(product);
    this.showToast('Product added to cart!');
  }

  /** Show Bootstrap toast */
  private showToast(message: string): void {
    const toastElement = document.getElementById('liveToast');
    const toastBody = document.querySelector('.toast-body');
    if (toastBody) {
      toastBody.textContent = message;
    }
    if (toastElement) {
      const toast = new (window as any).bootstrap.Toast(toastElement);
      toast.show();
    }
  }
}
