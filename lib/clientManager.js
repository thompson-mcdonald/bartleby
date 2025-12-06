const inquirer = require("inquirer")
const { getClients, addClient } = require("./dataManager")
const { validateRequired, validateEmail } = require("./validators")

async function selectOrCreateClient() {
  const clients = getClients()

  if (clients.length === 0) {
    console.log("\nNo clients found. Let's add your first client.\n")
    return await addNewClient()
  }

  const choices = [
    ...clients.map((c) => ({
      name: `${c.name}${c.company ? ` (${c.company})` : ""}`,
      value: c,
    })),
    { name: "+ Add new client", value: "new" },
  ]

  const { client } = await inquirer.prompt([
    {
      type: "list",
      name: "client",
      message: "Select a client:",
      choices,
    },
  ])

  if (client === "new") {
    return await addNewClient()
  }

  return client
}

async function addNewClient() {
  console.log("\n--- Add New Client ---\n")

  const { getConfig } = require("./dataManager")
  const config = getConfig()

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: "Client name:",
      validate: validateRequired,
    },
    {
      type: "input",
      name: "company",
      message: "Company (optional):",
    },
    {
      type: "input",
      name: "email",
      message: "Email:",
      validate: validateEmail,
    },
    {
      type: "input",
      name: "invoicePrefix",
      message: "Invoice prefix (leave blank to use default):",
      default: config.invoicePrefix,
    },
    {
      type: "input",
      name: "address",
      message: "Address (optional):",
    },
  ])

  const client = addClient(answers)
  console.log("\n✓ Client added successfully!\n")
  return client
}

async function listClients() {
  const clients = getClients()

  if (clients.length === 0) {
    console.log("\nNo clients found.\n")
    return
  }

  console.log("\n--- Clients ---\n")
  clients.forEach((client, index) => {
    console.log(
      `${index + 1}. ${client.name}${client.company ? ` (${client.company})` : ""}`
    )
    console.log(`   Email: ${client.email}`)
    if (client.address) {
      console.log(`   Address: ${client.address}`)
    }
    console.log("")
  })
}

module.exports = {
  selectOrCreateClient,
  addNewClient,
  listClients,
}
