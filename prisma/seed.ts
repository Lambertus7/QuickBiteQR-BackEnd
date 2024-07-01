import { PrismaClient } from "@prisma/client";
import categories from "./data/categories.json";
import items from "./data/items.json";
import locations from "./data/locations.json";
import orderItems from "./data/orderItems.json";
import orders from "./data/orders.json";
import table from "./data/tables.json";

const prisma = new PrismaClient();

const seed = async () => {
  console.log("Seeding Locations...");

  for (let i = 0; i < locations.length; i++) {
    const locationData = locations[i];
    if (locationData) await prisma.location.create({ data: locationData });
  }

  console.log("Seeding Categories...");

  for (let i = 0; i < categories.length; i++) {
    const categoryData = categories[i];
    if (categoryData) await prisma.category.create({ data: categoryData });
  }
  console.log("Seeding Tables...");

  for (let i = 0; i < table.length; i++) {
    const tableData = table[i];
    if (tableData) await prisma.table.create({ data: tableData });
  }
  console.log("Seeding Items...");

  for (let i = 0; i < items.length; i++) {
    const itemData = items[i];
    if (itemData) await prisma.item.create({ data: itemData });
  }
  console.log("Seeding Orders...");

  for (let i = 0; i < orders.length; i++) {
    const orderData = orders[i];
    if (orderData) await prisma.order.create({ data: orderData });
  }
  console.log("Seeding Order-Items...");

  for (let i = 0; i < orderItems.length; i++) {
    const orderItemData = orderItems[i];
    if (orderItemData) await prisma.order_Items.create({ data: orderItemData });
  }

  console.log("Seeding Complete!");
};
seed();
