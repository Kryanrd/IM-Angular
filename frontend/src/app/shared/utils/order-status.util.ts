import { StatusesType } from "src/types/statuses.type";

export class OrderStatusUtil {
    static getStatusAndColor(status: StatusesType | undefined | null): { name: string, color: string } {
        let name = 'Новый';
        let color = '#456F49';

        switch (status) {
            case StatusesType.delivery:
                name = 'Доставка';
                break;
            case StatusesType.cancelled:
                name = 'Отменен';
                color = '#FF7575';
                break;
            case StatusesType.pending:
                name = 'Обработка';
                break;
            case StatusesType.success:
                name = 'Выполнен';
                color = '#B6D5B9'
                break;
        }

        return { name, color };
    }
}