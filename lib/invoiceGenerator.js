const inquirer = require("inquirer")
const { getConfig, getLastInvoiceNumber, addInvoice } = require("./dataManager")
const { selectOrCreateClient } = require("./clientManager")
const { selectOrCreatePaymentMethod } = require("./paymentManager")
const { selectOrCreateBrand } = require("./brandManager")
const {
  validateRequired,
  validateNumber,
  validatePositiveInteger,
  validateDate,
} = require("./validators")
const { generatePDF } = require("./pdfGenerator")

async function generateInvoice() {
  console.log("\n=== Generate Invoice ===\n")

  const brand = await selectOrCreateBrand()
  const client = await selectOrCreateClient()

  const config = getConfig()
  let invoiceDetails = await getInvoiceDetails(client, config)

  const items = await getLineItems()

  const paymentMethod = await selectOrCreatePaymentMethod()

  // Final review before generating
  const confirmed = await reviewAndConfirm(
    client,
    invoiceDetails,
    items,
    config,
    paymentMethod,
  )

  if (!confirmed) {
    console.log("\n✗ Invoice cancelled\n")
    return null
  }

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
  const taxRate = config.taxRate || 0
  const tax = subtotal * (taxRate / 100)
  const total = subtotal + tax

  const invoice = {
    clientId: client.id,
    brandId: brand.id,
    number: invoiceDetails.customNumber,
    date: invoiceDetails.date,
    items,
    subtotal,
    taxRate,
    tax,
    total,
    paymentMethod: {
      name: paymentMethod.name,
      details: paymentMethod.details,
      terms: paymentMethod.terms,
      accountName: paymentMethod.accountName,
      accountNumber: paymentMethod.accountNumber,
      sortCode: paymentMethod.sortCode,
    },
  }

  const savedInvoice = addInvoice(invoice)

  console.log("\n--- Generating PDF ---\n")

  const pdfPath = await generatePDF(savedInvoice, client, brand)

  console.log(`\n✓ Invoice generated successfully!`)
  console.log(`📄 Saved to: ${pdfPath}\n`)

  return savedInvoice
}

async function getInvoiceDetails(client, config) {
  const suggestedNumber = getLastInvoiceNumber(client.id)
  // Use client-specific prefix if available, otherwise fall back to global config prefix
  const prefix = client.invoicePrefix || config.invoicePrefix
  const invoiceNumber = `${prefix}${suggestedNumber.toString().padStart(4, "0")}`
  const today = new Date().toISOString().split("T")[0]

  let confirmed = false
  let details = {}

  while (!confirmed) {
    details = await inquirer.prompt([
      {
        type: "input",
        name: "date",
        message: "Invoice date (YYYY-MM-DD):",
        default: details.date || today,
        validate: validateDate,
      },
      {
        type: "input",
        name: "customNumber",
        message: "Invoice number:",
        default: details.customNumber || invoiceNumber,
        validate: validateRequired,
      },
    ])

    console.log("\n--- Invoice Details ---")
    console.log(`Date: ${details.date}`)
    console.log(`Number: ${details.customNumber}\n`)

    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: [
          { name: "Continue to line items", value: "continue" },
          { name: "Edit these details", value: "edit" },
        ],
      },
    ])

    if (action === "continue") {
      confirmed = true
    }
  }

  return details
}

async function getLineItems() {
  const items = []
  let addingItems = true

  console.log("\n--- Add Line Items ---\n")

  while (addingItems) {
    const item = await inquirer.prompt([
      {
        type: "input",
        name: "description",
        message: "Item description:",
        validate: validateRequired,
      },
      {
        type: "input",
        name: "quantity",
        message: "Quantity:",
        default: "1",
        validate: validatePositiveInteger,
        filter: (input) => parseInt(input),
      },
      {
        type: "input",
        name: "rate",
        message: "Rate/Price per unit:",
        validate: validateNumber,
        filter: (input) => parseFloat(input),
      },
    ])

    item.amount = item.quantity * item.rate
    items.push(item)

    console.log(`\n✓ Added: ${item.description} - £${item.amount.toFixed(2)}\n`)

    // Show current items list
    if (items.length > 0) {
      console.log("Current items:")
      items.forEach((item, index) => {
        console.log(
          `  ${index + 1}. ${item.description} - Qty: ${item.quantity} @ £${item.rate.toFixed(2)} = £${item.amount.toFixed(2)}`,
        )
      })
      console.log("")
    }

    const choices = [
      { name: "Add another item", value: "add" },
      { name: "Edit an item", value: "edit" },
      { name: "Remove an item", value: "remove" },
      { name: "Continue to payment", value: "continue" },
    ]

    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices,
      },
    ])

    if (action === "edit" && items.length > 0) {
      const { itemToEdit } = await inquirer.prompt([
        {
          type: "list",
          name: "itemToEdit",
          message: "Which item would you like to edit?",
          choices: items.map((item, index) => ({
            name: `${item.description} - Qty: ${item.quantity} - £${item.amount.toFixed(2)}`,
            value: index,
          })),
        },
      ])

      const editedItem = await inquirer.prompt([
        {
          type: "input",
          name: "description",
          message: "Item description:",
          default: items[itemToEdit].description,
          validate: validateRequired,
        },
        {
          type: "input",
          name: "quantity",
          message: "Quantity:",
          default: items[itemToEdit].quantity.toString(),
          validate: validatePositiveInteger,
          filter: (input) => parseInt(input),
        },
        {
          type: "input",
          name: "rate",
          message: "Rate/Price per unit:",
          default: items[itemToEdit].rate.toString(),
          validate: validateNumber,
          filter: (input) => parseFloat(input),
        },
      ])

      editedItem.amount = editedItem.quantity * editedItem.rate
      items[itemToEdit] = editedItem
      console.log(
        `\n✓ Updated: ${editedItem.description} - £${editedItem.amount.toFixed(2)}\n`,
      )
    } else if (action === "remove" && items.length > 0) {
      const { itemToRemove } = await inquirer.prompt([
        {
          type: "list",
          name: "itemToRemove",
          message: "Which item would you like to remove?",
          choices: items.map((item, index) => ({
            name: `${item.description} - Qty: ${item.quantity} - £${item.amount.toFixed(2)}`,
            value: index,
          })),
        },
      ])

      const removed = items.splice(itemToRemove, 1)[0]
      console.log(`\n✗ Removed: ${removed.description}\n`)

      if (items.length === 0) {
        console.log("No items remaining. Please add at least one item.\n")
      }
    } else if (action === "continue") {
      if (items.length === 0) {
        console.log("\nYou must add at least one item to continue.\n")
      } else {
        addingItems = false
      }
    }
  }

  return items
}

async function reviewAndConfirm(
  client,
  invoiceDetails,
  items,
  config,
  paymentMethod,
) {
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
  const taxRate = config.taxRate || 0
  const tax = subtotal * (taxRate / 100)
  const total = subtotal + tax

  let reviewing = true

  while (reviewing) {
    console.log("\n=== Final Invoice Review ===\n")
    console.log(`Client: ${client.name}`)
    console.log(`Invoice #: ${invoiceDetails.customNumber}`)
    console.log(`Date: ${invoiceDetails.date}\n`)

    console.log("Line Items:")
    items.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.description}`)
      console.log(
        `     Qty: ${item.quantity} @ £${item.rate.toFixed(2)} = £${item.amount.toFixed(2)}`,
      )
    })

    console.log(`\nSubtotal: £${subtotal.toFixed(2)}`)
    console.log(`VAT (${taxRate}%): £${tax.toFixed(2)}`)
    console.log(`Total: £${total.toFixed(2)}`)
    console.log(`\nPayment Method: ${paymentMethod.name}\n`)

    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: [
          { name: "Generate invoice PDF", value: "generate" },
          { name: "Cancel and exit", value: "cancel" },
        ],
      },
    ])

    if (action === "generate") {
      return true
    } else if (action === "cancel") {
      return false
    }
  }
}

module.exports = {
  generateInvoice,
}
