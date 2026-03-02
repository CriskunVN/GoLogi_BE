import { Body, Controller, Post } from '@nestjs/common';
import { OrderRequestDto } from './dto/order-req.dto';
import { OrdersService } from './orders.service';
import { OrderResponseDto } from './dto/order-res.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(
    @Body() orderData: OrderRequestDto,
  ): Promise<OrderResponseDto> {
    return this.ordersService.createOrderFromWebhook(orderData);
  }
}
