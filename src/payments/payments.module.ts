import { Module } from "@nestjs/common";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";
import { OrdersModule } from "../orders/orders.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { S3Module } from "../s3/s3.module";

@Module({
  imports: [OrdersModule, NotificationsModule, S3Module],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
