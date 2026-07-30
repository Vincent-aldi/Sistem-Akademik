import { INotifier } from "../interfaces/INotifier";
export class WhatsappNotifier implements INotifier {
  send(recipient: string, message: string): void {
    console.log(`[WHATSAPP] Ke: ${recipient} | Pesan: ${message}`);
  }
}
