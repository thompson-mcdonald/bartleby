const inquirer = require("inquirer")
const { getPaymentMethods, addPaymentMethod } = require("./dataManager")
const { validateRequired } = require("./validators")

async function selectOrCreatePaymentMethod() {
  const methods = getPaymentMethods()

  if (methods.length === 0) {
    console.log("\nNo payment methods found. Let's add one.\n")
    return await addNewPaymentMethod()
  }

  const choices = [
    ...methods.map((m) => ({
      name: m.name,
      value: m,
    })),
    { name: "+ Add new payment method", value: "new" },
  ]

  const { method } = await inquirer.prompt([
    {
      type: "list",
      name: "method",
      message: "Select payment method:",
      choices,
    },
  ])

  if (method === "new") {
    return await addNewPaymentMethod()
  }

  return method
}

async function addNewPaymentMethod() {
  console.log("\n--- Add New Payment Method ---\n")

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: 'Payment method name (e.g., "Bank Transfer", "PayPal"):',
      validate: validateRequired,
    },
    {
      type: "input",
      name: "accountName",
      message: "Name on the account:",
    },
    {
      type: "input",
      name: "accountNumber",
      message: "Account number:",
    },
    {
      type: "input",
      name: "sortCode",
      message: "Sort code:",
    },
    {
      type: "input",
      name: "terms",
      message: 'Payment terms (e.g., "Net 30", "Due on receipt"):',
      default: "Due on receipt",
    },
  ])

  const method = addPaymentMethod(answers)
  console.log("\n✓ Payment method added successfully!\n")
  return method
}

async function managePaymentMethods() {
  const methods = getPaymentMethods()

  if (methods.length === 0) {
    console.log("\nNo payment methods found.\n")
    return
  }

  console.log("\n--- Payment Methods ---\n")
  methods.forEach((method, index) => {
    console.log(`${index + 1}. ${method.name}`)
    if (method.details) {
      console.log(`   Details: ${method.details}`)
    }
    console.log(`   Terms: ${method.terms || "N/A"}`)
    console.log("")
  })
}

module.exports = {
  selectOrCreatePaymentMethod,
  addNewPaymentMethod,
  managePaymentMethods,
}
