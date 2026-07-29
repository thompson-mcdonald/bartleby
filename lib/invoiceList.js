const inquirer = require("inquirer")
const {
  getInvoices,
  getClients,
  getConfig,
  getPaymentMethods,
  getBrands,
} = require("./dataManager")
const { generatePDF } = require("./pdfGenerator")

async function listRecentInvoices(limit = 10) {
  const invoices = getInvoices()
  const clients = getClients()

  if (invoices.length === 0) {
    console.log("\nNo invoices found.\n")
    return
  }

  const clientMap = {}
  clients.forEach((client) => {
    clientMap[client.id] = client
  })

  const sortedInvoices = invoices
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit)

  console.log("\n--- Recent Invoices ---\n")

  sortedInvoices.forEach((invoice, index) => {
    const client = clientMap[invoice.clientId] || { name: "Unknown Client" }
    const date = new Date(invoice.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })

    console.log(`${index + 1}. ${invoice.number} - ${client.name}`)
    console.log(`   Date: ${date}`)
    console.log(`   Total: £${invoice.total.toFixed(2)}`)
    console.log(`   Items: ${invoice.items.length}`)
    console.log("")
  })

  if (invoices.length > limit) {
    console.log(`Showing ${limit} of ${invoices.length} total invoices.\n`)
  }

  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices: [
        { name: "Regenerate a PDF", value: "regenerate" },
        { name: "Back to main menu", value: "back" },
      ],
    },
  ])

  if (action === "regenerate") {
    const { selectedInvoice } = await inquirer.prompt([
      {
        type: "list",
        name: "selectedInvoice",
        message: "Select an invoice to regenerate:",
        choices: sortedInvoices.map((invoice, index) => {
          const client = clientMap[invoice.clientId] || {
            name: "Unknown Client",
          }
          return {
            name: `${invoice.number} - ${client.name} - £${invoice.total.toFixed(2)}`,
            value: index,
          }
        }),
      },
    ])

    const invoice = sortedInvoices[selectedInvoice]
    const client = clientMap[invoice.clientId]

    // Look up brand for this invoice
    const brands = getBrands()
    const brand = brands.find((b) => b.id === invoice.brandId) || {
      businessName: getConfig().businessName,
      address: getConfig().address,
      email: getConfig().email,
      phone: getConfig().phone,
    }

    // Look up current payment method details by name to get latest account info
    const paymentMethods = getPaymentMethods()
    const currentPaymentMethod = paymentMethods.find(
      (pm) => pm.name === invoice.paymentMethod.name,
    )

    // Merge current payment method details with invoice data
    if (currentPaymentMethod) {
      invoice.paymentMethod = {
        ...invoice.paymentMethod,
        accountName: currentPaymentMethod.accountName,
        accountNumber: currentPaymentMethod.accountNumber,
        sortCode: currentPaymentMethod.sortCode,
        details: currentPaymentMethod.details,
        terms: currentPaymentMethod.terms || invoice.paymentMethod.terms,
      }
    }

    console.log("\n--- Regenerating PDF ---\n")

    try {
      const pdfPath = await generatePDF(invoice, client, brand)
      console.log(`\n✓ Invoice PDF regenerated successfully!`)
      console.log(`📄 Saved to: ${pdfPath}\n`)
    } catch (error) {
      console.error(`\n✗ Error regenerating PDF: ${error.message}\n`)
    }
  }
}

module.exports = {
  listRecentInvoices,
}
