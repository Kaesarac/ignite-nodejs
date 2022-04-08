const { request } = require("express");
const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();
const port = 3000;

const customers = [];

function verifyCPFexists(req, res, next) {
  const { cpf } = req.headers;

  const customer = customers.find((customer) => customer.cpf === cpf);

  if (!customer) {
    return res.status(400).json({ error: "Customer not found!" });
  }

  req.customer = customer;

  return next();
}

app.listen(port); //starts app
app.use(express.json());

app.get("/", (req, res) => {
  return res.send("Hello caraio").json;
});
app.post("/account", (req, res) => {
  const { cpf } = req.body;
  const { name } = req.body;

  const customerAlreadyExists = customers.some(
    (customer) => customer.cpf === cpf
  );

  if (customerAlreadyExists) {
    return res.status(400).json({ error: "Customer already exists!" });
  }

  const id = uuidv4();

  customers.push({
    cpf,
    name,
    id,
    statement: [],
  });

  return res.status(201).send();
});
app.use(verifyCPFexists);
app.get("/statement", (req, res) => {
  const { customer } = req;
  return res.json(customer.statement);
});
app.post("/deposit", (req, res) => {
  const { description, amount } = req.body;
  const { customer } = req;

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: "credit",
  };

  customer.statement.push(statementOperation);

  return res.status(201).send();
});
app.post("/withdraw", (req, res) => {
  const { amount } = req.body;
  const { customer } = req;

  const balance = getBalance(customer.statement);

  if (balance < amount) {
    return res.status(400).json({ error: "Insufficient funds!" });
  }

  const statementOperation = {
    amount,
    created_at: new Date(),
    type: "debit",
  };

  customer.statement.push(statementOperation);

  return res.status(201).send();
});
app.get("/statement/date", (req, res) => {
  const { customer } = req;
  const { date } = req.query;

  const dateFormat = new Date(date + "00:00");
  const statement = customer.statement.filter(
    (statement) =>
      statement.created_at.toDateString() ===
      new Date(dateFormat).toDateString()
  );
  return res.json(statement);
});
console.log(`Listening on PORT ${port}`);
