import { CategoryEntity } from "@categories/core/category.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IOrderRepository } from "@orders/core/order-repository.abstract";
import { OrderEntity, OrderProductEntity } from "@orders/core/order.entity";
import { ProductEntity } from "@products/core/product.entity";
import { Repository } from "typeorm";
import { Order } from "../entities/order";
import { OrdersProductsAmounts } from "../entities/orders-products-amounts";

@Injectable()
export class OrderRepository implements IOrderRepository {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrdersProductsAmounts)
    private readonly orderProductAmountRepository: Repository<OrdersProductsAmounts>,
  ) {}

  async create(order: OrderEntity): Promise<OrderEntity> {
    const orderModel = this.mapEntityToModel(order);

    const orderCreated = await this.orderRepository.save(orderModel);

    orderCreated.orderProductsAmounts = await Promise.all(
      order.orderProductsAmounts.map(async (orderProduct) => {
        return await this._saveOrderProductAmountModel(
          orderCreated,
          orderProduct.product,
          orderProduct.amount,
        );
      }),
    );

    return this.mapModelToEntity(orderCreated);
  }

  private async _saveOrderProductAmountModel(
    orderModel: Order,
    product: ProductEntity,
    amount: number,
  ) {
    const order_product_amount_model: OrdersProductsAmounts =
      new OrdersProductsAmounts();

    order_product_amount_model.order = orderModel;
    order_product_amount_model.amount = amount;
    order_product_amount_model.product = product;

    return this.orderProductAmountRepository.save(order_product_amount_model);
  }

  async findAll(): Promise<OrderEntity[]> {
    const orders = await this.orderRepository.find({
      relations: {
        orderProductsAmounts: {
          product: {
            category: true,
          },
        },
      },
    });

    return orders.map((order) => this.mapModelToEntity(order));
  }

  async findAllByCustomerId(customerId: string): Promise<OrderEntity[]> {
    const orders = await this.orderRepository.find({
      where: { customerId: customerId },
      relations: {
        orderProductsAmounts: {
          product: {
            category: true,
          },
        },
      },
    });

    return orders.map((order) => this.mapModelToEntity(order));
  }

  async findOne(id: string): Promise<OrderEntity> {
    try {
      const order = await this.orderRepository.findOne({
        where: { id },
        relations: {
          orderProductsAmounts: {
            product: {
              category: true,
            },
          },
        },
      });

      return this.mapModelToEntity(order);
    } catch (error) {
      /* istanbul ignore next */
      return null;
    }
  }

  async update(id: string, order: OrderEntity): Promise<OrderEntity> {
    return this.orderRepository.save(order);
  }

  mapModelToEntity(orderModel: Order): OrderEntity {
    if (!orderModel) return null;
    const order = new OrderEntity(
      orderModel.customerId,
      orderModel.orderProductsAmounts.map(function (item) {
        const productItem = item.product;
        const categoryItem = item.product.category;
        const product = new ProductEntity(
          productItem.name,
          productItem.description,

          productItem.price,
          productItem.quantity,
          productItem.status,
          new CategoryEntity(
            categoryItem.name,
            categoryItem.slug,
            categoryItem.description,
            categoryItem.id,
            categoryItem.createdAt,
            categoryItem.updatedAt,
            [],
          ),
          productItem.id,
          productItem.createdAt,
          productItem.updatedAt,
          productItem.deletedAt,
        );
        return new OrderProductEntity(product, item.amount);
      }),
      orderModel.state,
      orderModel.paymentState,
    );

    order.id = orderModel.id;
    order.createdAt = orderModel.createdAt;
    order.updatedAt = orderModel.updatedAt;

    return order;
  }

  mapEntityToModel(dataEntity: OrderEntity): Order {
    const orderModel = new Order();
    orderModel.state = dataEntity.state;
    orderModel.paymentState = dataEntity.paymentState;
    orderModel.customerId = dataEntity.customerId;

    return orderModel;
  }
}
