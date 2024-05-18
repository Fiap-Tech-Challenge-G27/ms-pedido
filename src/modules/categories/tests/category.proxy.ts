import { randomEntityDates, randomId } from "@shared/tests/random";
import { CategoryEntity } from "../core/category.entity";

export class CategoryProxy extends CategoryEntity {
  public constructor(name: string, description: string) {
    super(name, name + " (slug)", description);

    this.id = randomId();

    const { createdAt, updatedAt } = randomEntityDates();
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;

    this.products = [];
  }
}
