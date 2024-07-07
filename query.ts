import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const createOrder = async () => {
  const newOrder = await prisma.order.create({
    data: {
      tableId: 1,
      order_items: {
        create: [{ itemId: 2 }, { itemId: 3 }, { itemId: 6 }, { itemId: 2 }],
      },
    },
  });
  console.log(newOrder);
};

createOrder();
