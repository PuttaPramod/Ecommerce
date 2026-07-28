import { Injectable } from '@angular/core';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private products: Product[] = [
    {
      id: 1,
      name: 'Wireless Headphones',
      price: 99.99,
      description: 'High-quality wireless headphones with noise cancellation',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80',
      category: 'Electronics',
      inStock: true,
      rating: 4.5
    },
    {
      id: 2,
      name: 'Smartphone',
      price: 699.99,
      description: 'Latest smartphone with advanced features',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=700&q=80',
      category: 'Electronics',
      inStock: true,
      rating: 4.8
    },
    {
      id: 3,
      name: 'Running Shoes',
      price: 129.99,
      description: 'Comfortable running shoes for athletes',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80',
      category: 'Sports',
      inStock: true,
      rating: 4.3
    },
    {
      id: 4,
      name: 'Laptop',
      price: 1299.99,
      description: 'Powerful laptop for work and gaming',
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=700&q=80',
      category: 'Electronics',
      inStock: true,
      rating: 4.7
    },
    {
      id: 5,
      name: 'Coffee Maker',
      price: 89.99,
      description: 'Automatic coffee maker with programmable settings',
      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=700&q=80',
      category: 'Home Products',
      inStock: true,
      rating: 4.2
    },
    {
      id: 6,
      name: 'Fitness Watch',
      price: 199.99,
      description: 'Smartwatch with fitness tracking features',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80',
      category: 'Electronics',
      inStock: true,
      rating: 4.6
    },
    {
      id: 7,
      name: 'Fitness Watch',
      price: 199.99,
      description: 'Smartwatch with fitness tracking features',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80',
      category: 'Electronics',
      inStock: true,
      rating: 4.6
    }
  ];

  getAllProducts(): Product[] {
    return this.products;
  }

  getProductById(id: number): Product | undefined {
    return this.products.find(product => product.id === id);
  }

  getProductsByCategory(category: string): Product[] {
    return this.products.filter(product => product.category === category);
  }

  getCategories(): string[] {
    return [...new Set(this.products.map(p => p.category))];
  }
}
