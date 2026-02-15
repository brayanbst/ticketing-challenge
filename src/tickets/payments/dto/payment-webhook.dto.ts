export class PaymentWebhookDto {
  orderId: string;
  provider: string;
  providerPaymentId: string;
  status: 'APPROVED' | 'REJECTED';
}
