"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseNotification = void 0;
class BaseNotification {
    recipient;
    message;
    constructor(recipient, message) {
        this.recipient = recipient;
        this.message = message;
    }
    logNotification(type) {
        console.log(`[Log - ${new Date().toISOString()}] Iniciando enviado ${type} a ${this.recipient}`);
    }
}
exports.BaseNotification = BaseNotification;
//# sourceMappingURL=BaseNotification.js.map