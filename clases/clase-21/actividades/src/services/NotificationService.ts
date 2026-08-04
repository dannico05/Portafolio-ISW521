import { INotification } from "../interfaces/INotification";


export class NotificationService{
    public processNotifications(notifications: INotification[]): void {
        console.log("...Iniciando proceso de bloques...");  
        
        for(const notification of notifications){
            notification.send;
        } 
        console.log ("...Finalización del proceso...\n\n"); 
    } 
}