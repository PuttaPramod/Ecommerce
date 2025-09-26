import { Component, OnInit } from '@angular/core';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule,RouterModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: string[] = [];
  selectedCategory: string = '';

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.products = this.productService.getAllProducts();
    this.filteredProducts = this.products;
    this.categories = this.productService.getCategories();
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
    if (category) {
      this.filteredProducts = this.productService.getProductsByCategory(category);
    } else {
      this.filteredProducts = this.products;
    }
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product);
    // Show Bootstrap toast notification
    this.showToast('Product added to cart!');
  }

  private showToast(message: string): void {
    // This would typically use a toast service, but for simplicity:
    const toastElement = document.getElementById('liveToast');
    const toastBody = document.querySelector('.toast-body');
    if (toastBody) {
      toastBody.textContent = message;
    }
    const toast = new (window as any).bootstrap.Toast(toastElement);
    toast.show();
  }
}