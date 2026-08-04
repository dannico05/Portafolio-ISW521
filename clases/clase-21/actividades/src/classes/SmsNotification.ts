import {BaseNotification} from "./BaseNotification";

export class SmsNotification extends BaseNotification {
    public send(): void {
        this.logNotification("SMS");
        console.log(`Número de teléfono: ${this.recipient}`);
        console.log(`Mensaje: ${this.message}`);
    }
}