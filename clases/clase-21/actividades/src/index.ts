import {EmailNotification} from "./classes/EmailNotification";
import {SmsNotification} from "./classes/SmsNotification";
import {INotification} from "./interfaces/INotification";
import {NotificationService} from "./services/NotificationService";

const email = new EmailNotification("prueba@gmail.com", "este es un mensaje de prueba", "Empresa Pio Pio");

const sms = new SmsNotification("+506 8888888", "el código de seguridad es: 4999");

const queue: INotification[] = [email, sms];

const Service = new NotificationService();

Service.processNotifications(queue);

// Npx tsc
//Node dist/index.ts