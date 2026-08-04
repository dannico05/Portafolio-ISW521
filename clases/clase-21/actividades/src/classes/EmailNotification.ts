import {BaseNotification} from "./BaseNotification";

export class EmailNotification extends BaseNotification {
    constructor(recipient: string, message: string, public readonly subject: string) {
        super(recipient, message);
    }
    
    public send(): void {
        this.logNotification("Email");
        console.log(`Enviando Email a: ${this.recipient}`);
        console.log(`Asunto: ${this.subject}`);
        console.log(`Mensaje: ${this.message}`);
    }
}