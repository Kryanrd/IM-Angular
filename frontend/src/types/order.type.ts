import { DeliveryType } from "./delivery.type"
import { PaymantType } from "./payment.type"
import { StatusesType } from "./statuses.type"

export type OrderType = {
    deliveryType: DeliveryType,
    firstName: string,
    lastName: string,
    fatherName?: string,
    phone: string,
    paymentType: PaymantType,
    email: string,
    street?: string,
    house?: string,
    entrance?: string,
    apartment?: string,
    comment?: string,

    items?: {
        id: string,
        quantity: number, 
        name: string,
        price: number,
        total: number
    }[],

    totalAmount?: number,
    status?: StatusesType,
    statusRus?: string, 
    color?: string
}