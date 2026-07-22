import { Component, OnInit } from '@angular/core';
import { FavoriteService } from 'src/app/shared/services/favorite.service';
import { CartService } from 'src/app/shared/services/cart.service';
import { environment } from 'src/environments/environment';
import { DefaultResponseType } from 'src/types/default-response.type';
import { FavoriteType } from 'src/types/favorite.type';
import { CartType } from 'src/types/cart.type';

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.scss']
})
export class FavoriteComponent implements OnInit {

  products: FavoriteType[] = [];
  serverStaticPath = environment.serverStaticPath;
  cartItems: { [productId: string]: number } = {};

  constructor(
    private favoriteService: FavoriteService,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    this.favoriteService.getFavorites()
      .subscribe((data: FavoriteType[] | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          const error = (data as DefaultResponseType).message;
          throw new Error(error);
        }
        this.products = data as FavoriteType[];
        this.loadCart();
      });
  }

  private loadCart(): void {
    this.cartService.getCart().subscribe((data: CartType | DefaultResponseType) => {
      if ((data as DefaultResponseType).error !== undefined) {
        // Ошибка (например, не авторизован) — просто считаем корзину пустой
        this.cartItems = {};
        return;
      }
      const cartData = data as CartType;
      this.cartItems = {};
      cartData.items.forEach(item => {
        this.cartItems[item.product.id] = item.quantity;
      });
    });
  }

  getCount(productId: string): number {
    return this.cartItems[productId] || 0;
  }

  addToCart(product: FavoriteType): void {
    this.cartService.updateCart(product.id, 1)
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        this.cartItems[product.id] = 1;
      });
  }

  updateCount(product: FavoriteType, newCount: number): void {
    if (newCount < 0) return;
    this.cartService.updateCart(product.id, newCount)
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        if (newCount > 0) {
          this.cartItems[product.id] = newCount;
        } else {
          delete this.cartItems[product.id];
        }
      });
  }

  removeFromCart(product: FavoriteType): void {
    this.cartService.updateCart(product.id, 0)
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        delete this.cartItems[product.id];
      });
  }

  removeFromFavorites(id: string): void {
    this.favoriteService.removeFavorite(id)
      .subscribe((data: DefaultResponseType) => {
        if (data.error) {
          throw new Error(data.message);
        }
        this.products = this.products.filter(item => item.id !== id);
      });
  }
}