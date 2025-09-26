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
      image: 'https://placeholder-image-service.onrender.com/image/300x300?prompt=Premium+wireless+headphones+with+modern+design+and+noise+cancellation&id=headphones-1',
      category: 'Electronics',
      inStock: true,
      rating: 4.5
    },
    {
      id: 2,
      name: 'Smartphone',
      price: 699.99,
      description: 'Latest smartphone with advanced features',
      image: 'https://placeholder-image-service.onrender.com/image/300x300?prompt=Modern+smartphone+with+sleek+design+and+large+display&id=phone-1',
      category: 'Electronics',
      inStock: true,
      rating: 4.8
    },
    {
      id: 3,
      name: 'Running Shoes',
      price: 129.99,
      description: 'Comfortable running shoes for athletes',
      image: 'https://placeholder-image-service.onrender.com/image/300x300?prompt=Professional+running+shoes+with+cushioned+sole+and+breathable+material&id=shoes-1',
      category: 'Sports',
      inStock: true,
      rating: 4.3
    },
    {
      id: 4,
      name: 'Laptop',
      price: 1299.99,
      description: 'Powerful laptop for work and gaming',
      image: 'https://placeholder-image-service.onrender.com/image/300x300?prompt=Modern+laptop+with+slim+design+and+high+resolution+display&id=laptop-1',
      category: 'Electronics',
      inStock: true,
      rating: 4.7
    },
    {
      id: 5,
      name: 'Coffee Maker',
      price: 89.99,
      description: 'Automatic coffee maker with programmable settings',
      image: 'https://placeholder-image-service.onrender.com/image/300x300?prompt=Modern+coffee+maker+with+stainless+steel+finish+and+digital+display&id=coffee-1',
      category: 'Home',
      inStock: true,
      rating: 4.2
    },
    {
      id: 6,
      name: 'Fitness Watch',
      price: 199.99,
      description: 'Smartwatch with fitness tracking features',
      image: 'https://placeholder-image-service.onrender.com/image/300x300?prompt=Fitness+smartwatch+with+color+display+and+health+tracking+features&id=watch-1',
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