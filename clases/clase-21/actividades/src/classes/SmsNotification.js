"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsNotification = void 0;
const BaseNotification_1 = require("./BaseNotification");
class SmsNotification extends BaseNotification_1.BaseNotification {
    send() {
        this.logNotification("SMS");
        console.log(`Número de teléfono: ${this.recipient}`);
        console.log(`Mensaje: ${this.message}`);
    }
}
exports.SmsNotification = SmsNotification;
//# sourceMappingURL=SmsNotification.js.map