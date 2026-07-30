import { INotifier } from "../interfaces/INotifier";
export class EmailNotifier implements INotifier {
  send(recipient: string, message: string): void {
    console.log(`[EMAIL] Ke: ${recipient} | Pesan: ${message}`);
  }
}
