import { Body, Controller, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';

@Controller()
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post('/payments/webhook')
  webhook(@Body() dto: PaymentWebhookDto) {
    return this.payments.webhook(dto);
  }
}
