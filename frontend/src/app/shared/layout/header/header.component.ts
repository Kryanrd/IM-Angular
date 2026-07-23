import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth/auth.service';
import { CategoryWithTypeType } from 'src/types/category-witht-type.type';
import { CategoryType } from 'src/types/category.type';
import { DefaultResponseType } from 'src/types/default-response.type';
import { CartService } from '../../services/cart.service';
import { CartType } from 'src/types/cart.type';
import { ProductService } from '../../services/product.service';
import { ProductType } from 'src/types/product.type';
import { environment } from 'src/environments/environment';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  searchValue: string = '';
  count: number = 0;
  isLogged: boolean = false;
  products: ProductType[] = [];
  showedSearch: boolean = false;
  searchField = new FormControl();
  serverStaticPath = environment.serverStaticPath;
  @Input() categories: CategoryWithTypeType[] = [];
  constructor(private authService: AuthService, private _snackBar: MatSnackBar,
    private router: Router, private cartService: CartService,
    private productService: ProductService) {
    this.isLogged = this.authService.getIsLoggedIn();
  }

  ngOnInit(): void {
    this.searchField.valueChanges
      .pipe(
        debounceTime(500)
      )
      .subscribe(value => {
        if (value && value.length > 2) {
          this.productService.searchtProducts(value)
            .subscribe((data: ProductType[]) => {
              this.products = data;
              this.showedSearch = true;
            })
        } else {
          this.products = [];
        }
      })

    this.isLogged = this.authService.getIsLoggedIn();

    if (this.isLogged) {
      this.cartService.getCartCount().subscribe({
        next: (data) => {
          console.log('Initial cart count', data);
        }
      });
    }

    this.authService.isLogged$.subscribe((isLoggedIn: boolean) => {
      this.isLogged = isLoggedIn;

      if (isLoggedIn) {
        this.cartService.getCartCount().subscribe();
      } else {
        this.cartService.setCount(0);
      }
    });

    this.cartService.countObservable.subscribe(count => {
      this.count = count;
    });
  }

  logout() {
    this.authService.logout()
      .subscribe({
        next: () => {
          this.doLogOut();

        },
        error: () => {
          this.doLogOut();
        }
      })
  }

  doLogOut() {
    this.authService.removeTokens();
    this.authService.userId = null;
    this._snackBar.open('Вы вышли из системы');
    this.router.navigate(['/']);
  }

  // changedSearchValue(newValue: string) {
  //   this.searchValue = newValue;
  //   if (this.searchValue && this.searchValue.length > 2) {
  //     this.productService.searchtProducts(this.searchValue)
  //       .subscribe((data: ProductType[]) => {
  //         this.products = data;
  //         this.showedSearch = true;
  //       })
  //   } else {
  //     this.products = [];
  //   }
  // }

  selectProduct(url: string) {
    this.router.navigate(['/product/' + url]);
    this.searchField.setValue('');
    this.products = [];
  }

  @HostListener('document:click', ['$event'])
  click(event: Event) {
    if (this.showedSearch && (event.target as HTMLElement).className.indexOf('search-product') === -1) {
      this.showedSearch = false;
    }
  }
}
