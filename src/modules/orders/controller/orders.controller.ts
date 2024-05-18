import { AuthGuard } from "@common/auth/auth.guard";
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CreateOrderDto } from "@orders/dtos/create-order.dto";
import { FindOrderUseCase } from "../use-cases/find-order.usecase";
import { CreateOrderUseCase } from "./../use-cases/create-order.usecase";
import { FindAllOrdersUseCase } from "./../use-cases/find-all-orders.usecase";

@ApiTags("orders")
@Controller("orders")
export class OrdersController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly findAllOrdersUseCase: FindAllOrdersUseCase,
    private readonly findOrderUseCase: FindOrderUseCase,
  ) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async create(@Body() createOrdersDto: CreateOrderDto, @Request() req) {
    return await this.createOrderUseCase.execute(
      createOrdersDto,
      req.customer.data.id,
    );
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  findAll(@Request() req) {
    return this.findAllOrdersUseCase.execute(req.customer.data.id);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.findOrderUseCase.execute(id);
  }
}
