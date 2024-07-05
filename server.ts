import { PrismaClient } from "@prisma/client";
import express, { json } from "express";
import cors from "cors";
import { z } from "zod";
import { AuthMiddleware, AuthRequest } from "./auth/middleware";
import { toToken } from "./auth/jwt";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

const port = 3001;

app.use(json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello Menu App!");
});

app.get("/greetings", (req, res) => {
  const messageFromEnv = process.env.MESSAGE;
  res.send(messageFromEnv);
});

const registryValidator = z
  .object({
    name: z
      .string()
      .nonempty({ message: "Please fill in the name of your location!" }),
    email: z.string().nonempty({ message: "Field cannot be empty!" }).email(),
    password: z
      .string()
      .min(10, {
        message: "Password must have at least have 10 character.",
      })
      .nonempty({ message: "Field cannot be empty!" }),
  })
  .strict();

//---Register Endpoint---//
app.post("/register", async (req: AuthRequest, res) => {
  const bodyFromRequest = req.body;

  const validated = registryValidator.safeParse(bodyFromRequest);
  if (validated.success) {
    try {
      const newLocation = await prisma.location.create({
        data: {
          name: bodyFromRequest.name,
          email: bodyFromRequest.email,
          password: bodyFromRequest.password,
        },
      });
      res.status(201).send({ message: "Welcome to the QuickBite Team!" });
    } catch (error) {
      res
        .status(500)
        .send({ message: "Something went wrong, try again later!" });
    }
  } else {
    res.status(400).send(validated.error.flatten());
  }
});

//---Login Endpoint---//
app.post("/login", async (req: AuthRequest, res) => {
  const bodyFromRequest = req.body;
  if ("email" in bodyFromRequest && "password" in bodyFromRequest) {
    try {
      //Let's find the Location first:
      const userToLogin = await prisma.location.findUnique({
        where: {
          email: bodyFromRequest.email,
        },
      });
      if (userToLogin && userToLogin.password === bodyFromRequest.password) {
        const token = toToken({ userId: userToLogin.id });
        res.status(200).send({ token: token });
        return;
      } //---//
      res.status(400).send({ message: "Failed to Log in, please try again" });
      return;
    } catch (error) {
      res
        .status(500)
        .send({ message: "Something went poorly, please try again later" });
    }
  } else {
    res.status(400).send({
      message: "'email' and 'password' are required to be filled in",
    });
  }
});

//---Items Endpoint---//
app.get("/locations/:id/items", async (req, res) => {
  const locationId = Number(req.params.id);
  const allItems = await prisma.item.findMany({
    include: {
      category: true,
    },
    where: {
      locationId: locationId,
    },
  });
  res.send(allItems);
});

// app.get("/locations/:id/items/:id", async (req, res) => {
//   const itemId = Number(req.params.id);
//   if (isNaN(itemId)) {
//     res.status(400).send();
//     return;
//   }
//   const item = await prisma.item.findUnique({
//     where: {
//       id: itemId,
//       // locationId: locationId,
//     },
//   });
//   if (item === null) {
//     res
//       .status(404)
//       .send({ message: "This meal does not exist, maybe inform the Chef" });
//     return;
//   }
//   res.send(item);
// });

//---Dashboard Endpoint---//
app.get("/my-tables", AuthMiddleware, async (req: AuthRequest, res) => {
  if (!req.userId) {
    res.status(500).send({ message: "Login to see your dashboard" });
  }
  const myTables = await prisma.order.findMany({
    where: { locationId: req.userId },
  });
  res.send(myTables);
});

//---Table Endpoint---//

// app.post("locations/:id/table/:id", async (req, res) => {
//   const bodyFromRequest = req.body;

//   try {
//     const listOfOrders = await prisma.table.findMany({
//       data: {
//         locationId: bodyFromRequest.locationId,
//         tableId: bodyFromRequest.tableId,
//       },
//     });
//     res.status(201).send(listOfOrders);
//   } catch (error) {
//     console.log(error);
//     res
//       .status(500)
//       .send({ message: "Something went poorly, try again later." });
//   }
//   {
//     res.status(400).send({ Message: "Bad request!" });
//   }
// });

//---Order Endpoint---//
// app.post("/order", async (req, res) => {
//   const bodyFromRequest = req.body;

//   const newOrder = await prisma.order.create({
//     data: {
//       locationId: bodyFromRequest.locationId,
//       tableId: bodyFromRequest.tableId,
//       // order: bodyFromRequest.order,
//     },
//   });
// });

// Tell the server to start listening, we provide the port here as the first argument.
// The second argument is a function that runs as soon as the server starts. We use it to log the port number.
app.listen(port, () => console.log(`⚡ Listening on port: ${port}`));
