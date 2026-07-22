import { DeliveryType } from "./delivery.type"
import { PaymantType } from "./payment.type"

export type UserType = {
    deliveryType?: DeliveryType,
    firstName?: string,
    lastName?: string,
    fatherName?: string,
    phone?: string,
    paymentType?: PaymantType,
    email: string,
    street?: string,
    house?: string,
    entrance?: string,
    apartment?: string
}