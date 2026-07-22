import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActiveParamsType } from 'src/types/active-pamams.type';
import { CategoryWithTypeType } from 'src/types/category-witht-type.type';
import { ActiveParamsUtil } from '../../utils/active-params.util';

@Component({
  selector: 'category-filter',
  templateUrl: './category-filter.component.html',
  styleUrls: ['./category-filter.component.scss']
})
export class CategoryFilterComponent implements OnInit {

  @Input() categoryWithTypes: CategoryWithTypeType | null = null;
  @Input() type: string | null = null;
  open = false;
  activePamams: ActiveParamsType = { types: [] };
  from: number | null = null;
  to: number | null = null;


  get title(): string {
    if (this.categoryWithTypes) {
      return this.categoryWithTypes.name;
    } else if (this.type) {
      if (this.type === 'height') {
        return 'Высота';
      } else if (this.type === 'diameter') {
        return 'Диаметр';
      }
    }

    return '';
  }

  constructor(private router: Router, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      this.activePamams = ActiveParamsUtil.processParams(params);

      if (this.type) {
        if (this.type === 'height') {
          this.open = !!(this.activePamams.heightFrom || this.activePamams.heightTo);
          this.from = this.activePamams.heightFrom ? +this.activePamams.heightFrom : null;
          this.to = this.activePamams.heightTo ? +this.activePamams.heightTo : null;
        } else if (this.type === 'diameter') {
          this.open = !!(this.activePamams.diameterFrom || this.activePamams.diameterTo);
          this.from = this.activePamams.diameterFrom ? +this.activePamams.diameterFrom : null;
          this.to = this.activePamams.diameterTo ? +this.activePamams.diameterTo : null;
        }
      } else {
        if (params['types']) {
          this.activePamams.types = Array.isArray(params['types']) ? params['types'] : [params['types']];

        }
        if (this.categoryWithTypes && this.categoryWithTypes.types && this.categoryWithTypes.types.length > 0 &&
          this.categoryWithTypes.types.some(type => this.activePamams.types.find(item => type.url === item))) {
          this.open = true;
        }
      }
    });
  }

  toggle() {
    this.open = !this.open;
  }

  updateFilterParam(url: string, checked: boolean) {
    if (this.activePamams.types && this.activePamams.types.length > 0) {
      const existingTypesInParams = this.activePamams.types.find(item => item === url);
      if (existingTypesInParams && !checked) {
        this.activePamams.types = this.activePamams.types.filter(item => item !== url)
      } else if (!existingTypesInParams && checked) {
        // this.activePamams.types.push(url);
        this.activePamams.types = [...this.activePamams.types, url];
      }
    } else if (checked) {
      this.activePamams.types = [url];
    }

    this.activePamams.page = 1;
    this.router.navigate(['/catalog'], {
      queryParams: this.activePamams
    });
  }

  updateFilterParamFromTo(param: string, value: string) {
    if (param === 'heightTo' || param === 'heightFrom' || param === 'diameterTo' || param === 'diameterFrom') {
      if (this.activePamams[param] && !value) {
        delete this.activePamams[param];
      } else {
        this.activePamams[param] = value;
      }

      this.activePamams.page = 1;
      this.router.navigate(['/catalog'], {
        queryParams: this.activePamams
      });

    }
  }
}
