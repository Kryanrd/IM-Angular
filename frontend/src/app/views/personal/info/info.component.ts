import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from 'src/app/shared/services/user.service';
import { DefaultResponseType } from 'src/types/default-response.type';
import { DeliveryType } from 'src/types/delivery.type';
import { PaymantType } from 'src/types/payment.type';
import { UserType } from 'src/types/user.type';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss']
})
export class InfoComponent implements OnInit {

  userInfoForm = this.fb.group({
    firstName: [''],
    lastName: [''],
    fatherName: [''],
    phone: [''],
    paymentType: [PaymantType.cashToCourier],
    email: ['', Validators.required],
    street: [''],
    house: [''],
    entrance: [''],
    apartment: ['']
  });

  deliveryType: DeliveryType = DeliveryType.delivery;
  deliveryTypes = DeliveryType;
  paymantTypes = PaymantType;

  constructor(private fb: FormBuilder, private userService: UserService, private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.userService.getUserInfo()
      .subscribe((data: UserType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }

        const userInfo = data as UserType;
        const paramsToUpdate = {
          firstName: userInfo.firstName ? userInfo.firstName : '',
          lastName: userInfo.lastName ? userInfo.lastName : '',
          fatherName: userInfo.fatherName ? userInfo.fatherName : '',
          phone: userInfo.phone ? userInfo.phone : '',
          paymentType: userInfo.paymentType ? userInfo.paymentType : PaymantType.cashToCourier,
          email: userInfo.email ? userInfo.email : '',
          street: userInfo.street ? userInfo.street : '',
          house: userInfo.house ? userInfo.house : '',
          entrance: userInfo.entrance ? userInfo.entrance : '',
          apartment: userInfo.apartment ? userInfo.apartment : ''
        }
        this.userInfoForm.setValue(paramsToUpdate);
        if(userInfo.deliveryType) {
          this.deliveryType = userInfo.deliveryType;
        }
      });
  }

  changeDeliveryType(type: DeliveryType) {
    this.deliveryType = type;
    this.userInfoForm.markAsDirty();
  }

  updateUserInfo() {
    if (this.userInfoForm.valid) {

      const paramObject: UserType = {
        email: this.userInfoForm.value.email ? this.userInfoForm.value.email : '',
        deliveryType: this.deliveryType,
        paymentType: this.userInfoForm.value.paymentType ? this.userInfoForm.value.paymentType : PaymantType.cashToCourier,
      }

      if (this.userInfoForm.value.lastName) {
        paramObject.lastName = this.userInfoForm.value.lastName;
      }

      if (this.userInfoForm.value.fatherName) {
        paramObject.fatherName = this.userInfoForm.value.fatherName;
      }

      if (this.userInfoForm.value.phone) {
        paramObject.phone = this.userInfoForm.value.phone;
      }

      if (this.userInfoForm.value.street) {
        paramObject.street = this.userInfoForm.value.street;
      }

      if (this.userInfoForm.value.house) {
        paramObject.house = this.userInfoForm.value.house;
      }

      if (this.userInfoForm.value.entrance) {
        paramObject.entrance = this.userInfoForm.value.entrance;
      }

      if (this.userInfoForm.value.apartment) {
        paramObject.apartment = this.userInfoForm.value.apartment;
      }

      this.userService.updateUserInfo(paramObject)
        .subscribe({
          next: (data: DefaultResponseType) => {
            if (data.error) {
              this._snackBar.open(data.message);
              throw new Error(data.message);
            }

            this._snackBar.open('Данные успешно сохранены');
            this.userInfoForm.markAsPristine();
          },
          error: (errorResponse: HttpErrorResponse) => {
            if (errorResponse.error && errorResponse.error.message) {
              this._snackBar.open(errorResponse.error.message);
            } else {
              this._snackBar.open('Ошибка сохранения');
            }
          }
        });

    }
  }

}
