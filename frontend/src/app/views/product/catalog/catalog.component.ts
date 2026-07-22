import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime } from 'rxjs';
import { AuthService } from 'src/app/core/auth/auth.service';
import { CartService } from 'src/app/shared/services/cart.service';
import { CategoryService } from 'src/app/shared/services/category.service';
import { FavoriteService } from 'src/app/shared/services/favorite.service';
import { ProductService } from 'src/app/shared/services/product.service';
import { ActiveParamsUtil } from 'src/app/shared/utils/active-params.util';
import { ActiveParamsType } from 'src/types/active-pamams.type';
import { AppliedFilterType } from 'src/types/applied-filter.type';
import { CartType } from 'src/types/cart.type';
import { CategoryWithTypeType } from 'src/types/category-witht-type.type';
import { DefaultResponseType } from 'src/types/default-response.type';
import { FavoriteType } from 'src/types/favorite.type';
import { ProductType } from 'src/types/product.type';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
})
export class CatalogComponent implements OnInit {

  products: ProductType[] = [];
  categoriesWithTypes: CategoryWithTypeType[] = [];
  activePamams: ActiveParamsType = { types: [] };
  appliedFilters: AppliedFilterType[] = [];
  sortingOpen = false;
  sortingOptions: { name: string, value: string }[] = [
    { name: 'От А до Я', value: 'az-asc' },
    { name: 'От Я до А', value: 'az-desc' },
    { name: 'По возрастанию цены', value: 'price-asc' },
    { name: 'По убыванию цены', value: 'price-desc' },
  ];

  pages: number[] = [];
  cart: CartType | null = null;

  constructor(private productService: ProductService, private categoryService: CategoryService,
    private activatedRoute: ActivatedRoute, private router: Router, private cartService: CartService,
    private favoriteService: FavoriteService, private authService: AuthService) { }


  favoriteProducts: FavoriteType[] | null = null;
  ngOnInit(): void {
    this.cartService.getCart()
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        this.cart = data as CartType;

        if (this.authService.getIsLoggedIn()) {
          this.favoriteService.getFavorites()
            .subscribe(
              {
                next: (data: FavoriteType[] | DefaultResponseType) => {
                  if ((data as DefaultResponseType).error !== undefined) {
                    const error = (data as DefaultResponseType).message;
                    this.processCatalog();
                    throw new Error(error);
                  }

                  this.favoriteProducts = data as FavoriteType[];
                  this.processCatalog();
                },
                error: (error) => {
                  this.processCatalog();
                }
              }

            );
        } else {
          this.processCatalog();
        }


      });

  }

  processCatalog() {
    this.categoryService.getCategoriesWithTypes()
      .subscribe(data => {
        this.categoriesWithTypes = data;

        this.activatedRoute.queryParams
          .pipe(
            debounceTime(500)
          )
          .subscribe(params => {
            this.activePamams = ActiveParamsUtil.processParams(params);
            this.appliedFilters = [];
            this.activePamams.types.forEach(url => {

              for (let i = 0; i < this.categoriesWithTypes.length; i++) {
                const foundType = this.categoriesWithTypes[i].types.find(type => type.url === url);
                if (foundType) {
                  this.appliedFilters.push({
                    name: foundType.name,
                    urlParam: foundType.url
                  })
                }
              }
            });

            if (this.activePamams.heightFrom) {
              this.appliedFilters.push({
                name: 'Высота от ' + this.activePamams.heightFrom + ' см',
                urlParam: 'heightFrom'
              })
            }

            if (this.activePamams.heightTo) {
              this.appliedFilters.push({
                name: 'Высота: до ' + this.activePamams.heightTo + ' см',
                urlParam: 'heightTo'
              })
            }

            if (this.activePamams.diameterFrom) {
              this.appliedFilters.push({
                name: 'Диаметр: от ' + this.activePamams.diameterFrom + ' см',
                urlParam: 'diameterFrom'
              })
            }

            if (this.activePamams.diameterTo) {
              this.appliedFilters.push({
                name: 'Диаметр: до ' + this.activePamams.diameterTo + ' см',
                urlParam: 'diameterTo'
              })
            }

            this.productService.getProducts(this.activePamams)
              .subscribe(data => {
                this.pages = [];
                for (let i = 1; i <= data.pages; i++) {
                  this.pages.push(i);
                }

                if (this.cart && this.cart.items.length > 0) {
                  this.products = data.items.map(product => {
                    if (this.cart) {
                      const productInCart = this.cart.items.find(item => item.product.id === product.id);
                      if (productInCart) {
                        product.countInCart = productInCart.quantity;
                      }
                    }

                    return product;
                  })
                } else {
                  this.products = data.items;
                }

                if (this.favoriteProducts) {
                  this.products = this.products.map(product => {
                    const productInFavorite = this.favoriteProducts?.find(item => item.id === product.id);
                    if (productInFavorite) {
                      product.isInFavorite = true;
                    }
                    return product;
                  })
                }
              })

          });
      });
  }

  removeAppliedFilter(appliedFilter: AppliedFilterType) {
    if (appliedFilter.urlParam === 'heightFrom' || appliedFilter.urlParam === 'heightTo' ||
      appliedFilter.urlParam === 'diameterFrom' || appliedFilter.urlParam === 'diameterTo') {
      delete this.activePamams[appliedFilter.urlParam];
    } else {
      this.activePamams.types = this.activePamams.types.filter(item => item !== appliedFilter.urlParam);
    }

    this.activePamams.page = 1;
    this.router.navigate(['/catalog'], {
      queryParams: this.activePamams
    });
  }

  toggleSorting() {
    this.sortingOpen = !this.sortingOpen;
  }

  sort(value: string) {
    this.activePamams.sort = value;
    this.router.navigate(['/catalog'], {
      queryParams: this.activePamams
    });
  }

  openPage(page: number) {
    this.activePamams.page = page;
    this.router.navigate(['/catalog'], {
      queryParams: this.activePamams
    });
  }

  openPrevPage() {
    if (this.activePamams.page && this.activePamams.page > 1) {
      this.activePamams.page--;
      this.router.navigate(['/catalog'], {
        queryParams: this.activePamams
      });
    }
  }

  openNextPage() {
    if (this.activePamams.page && this.activePamams.page < this.pages.length) {
      this.activePamams.page++;
      this.router.navigate(['/catalog'], {
        queryParams: this.activePamams
      });
    }
  }

}
