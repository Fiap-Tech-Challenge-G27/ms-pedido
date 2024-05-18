import { Category } from "@modules/categories/infra/typeorm/entities/category";
import { Product } from "@modules/products/infra/typeorm/entities/product";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { OrdersController } from "../controller/orders.controller";
import { IPaymentGateway } from "../core/payment-gateway";
import { Order } from "../infra/typeorm/entities/order";
import { OrdersProductsAmounts } from "../infra/typeorm/entities/orders-products-amounts";
import { basicProductModuleMetadata } from "../orders.module";
import { customerMother } from "./customerId.mother";
import { orderMother } from "./order.mother";

describe("/orders", () => {
  let ordersController: OrdersController;
  let orderRepositoryMock: Repository<Order>;
  let orderProductsAmountsRepositoryMock: Repository<OrdersProductsAmounts>;

  let req;

  const moduleMetadata = { ...basicProductModuleMetadata };
  moduleMetadata.providers = [
    ...moduleMetadata.providers,
    {
      provide: getRepositoryToken(Category),
      useClass: Repository,
    },
    {
      provide: getRepositoryToken(Product),
      useClass: Repository,
    },
    {
      provide: getRepositoryToken(Order),
      useClass: Repository,
    },
    {
      provide: getRepositoryToken(OrdersProductsAmounts),
      useClass: Repository,
    },
    {
      provide: ConfigService,
      useValue: { get: jest.fn().mockResolvedValue("mock") },
    },
    {
      provide: JwtService,
      useValue: {
        verifyAsync: jest
          .fn()
          .mockResolvedValue({ data: customerMother.customer }),
      },
    },
    {
      provide: IPaymentGateway,
      useValue: {
        create: jest.fn(),
      },
    },
  ];

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule(moduleMetadata).compile();

    ordersController = module.get<OrdersController>(OrdersController);
    orderRepositoryMock = module.get<Repository<Order>>(
      getRepositoryToken(Order),
    );
    orderProductsAmountsRepositoryMock = module.get<
      Repository<OrdersProductsAmounts>
    >(getRepositoryToken(OrdersProductsAmounts));

    req = {
      customer: { data: customerMother.customer },
    };
  });

  it("should be defined", () => {
    expect(ordersController).toBeDefined();
  });

  describe("POST", () => {
    it("should create when ok", async () => {
      const order = orderMother.sugar_overdose;
      const createdOrder = order.withRandomId();

      jest
        .spyOn(orderRepositoryMock, "save")
        .mockResolvedValueOnce(createdOrder.withoutOrderProductsAmounts());

      for (const orderProduct of createdOrder.orderProductsAmounts) {
        jest
          .spyOn(orderProductsAmountsRepositoryMock, "save")
          .mockResolvedValueOnce(orderProduct);
      }

      const response = await ordersController.create(order.asCreateDTO(), req);

      expect(response).toEqual(createdOrder);
    });

    it("should error when empty", async () => {
      expect(
        async () =>
          await ordersController.create(
            orderMother.sugar_overdose
              .withoutOrderProductsAmounts()
              .asCreateDTO(),
            req,
          ),
      ).rejects.toThrow("Order products is empty");
    });
  });

  describe("GET", () => {
    it("should return all orders", async () => {
      const orders = Object.values(orderMother);

      jest.spyOn(orderRepositoryMock, "find").mockResolvedValueOnce(orders);

      const response = await ordersController.findAll(req);

      expect(response).toEqual([
        orderMother.lunch,
        orderMother.dinner,
        orderMother.sugar_overdose,
      ]);
    });
  });

  describe("GET /:id", () => {
    it("should return when exists", async () => {
      const order = orderMother.sugar_overdose;

      jest.spyOn(orderRepositoryMock, "findOne").mockResolvedValueOnce(order);

      const response = await ordersController.findOne(order.id);

      expect(response).toEqual(order);
    });
    it("should error when don't exists", async () => {
      jest.spyOn(orderRepositoryMock, "findOne").mockResolvedValueOnce(null);

      expect(
        async () =>
          await ordersController.findOne(orderMother.sugar_overdose.id),
      ).rejects.toThrow("Order not found");
    });
  });
});
