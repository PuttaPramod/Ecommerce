import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css'
})
export class ProductDetail implements OnInit {
  product?: Product;
  relatedProducts: Product[] = [];
  quantity = 1;
  addedToCart = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      this.product = this.productService.getProductById(id);
      this.quantity = 1;
      this.addedToCart = false;
      this.relatedProducts = this.product
        ? this.productService.getAllProducts().filter(item => item.id !== this.product?.id).slice(0, 4)
        : [];
    });
  }

  changeQuantity(amount: number): void {
    this.quantity = Math.max(1, this.quantity + amount);
  }

  addToCart(): void {
    if (!this.product || !this.product.inStock) return;
    this.cartService.addToCart(this.product, this.quantity);
    this.addedToCart = true;
  }

  buyNow(): void {
    this.addToCart();
    if (this.product?.inStock) this.router.navigate(['/cart']);
  }
}
