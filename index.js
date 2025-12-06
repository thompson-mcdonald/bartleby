#!/usr/bin/env node

const inquirer = require("inquirer")
const chalk = require("chalk")
const { generateInvoice } = require("./lib/invoiceGenerator")
const { addNewClient, listClients } = require("./lib/clientManager")
const {
  addNewPaymentMethod,
  managePaymentMethods,
} = require("./lib/paymentManager")
const { addNewBrand, manageBrands } = require("./lib/brandManager")
const {
  configureBusinessDetails,
  displayConfig,
  isConfigured,
} = require("./lib/configManager")
const { listRecentInvoices } = require("./lib/invoiceList")

const COMMANDS = {
  GENERATE: "generate",
  LIST: "list",
  CONFIG: "config",
  MENU: "menu",
}

async function showMainMenu() {
  console.log(
    "     ...     ..                                    s          ..                  ..                 "
  )
  console.log(
    '  .=*8888x <"?88h.                                :8    x .d88"             . uW8"        ..        '
  )
  console.log(
    " X>  '8888H> '8888                  .u    .      .88     5888R              `t888        @L          "
  )
  console.log(
    "'88h. `8888   8888         u      .d88B :@8c    :888ooo  '888R        .u     8888   .   9888i   .dL  "
  )
  console.log(
    "'8888 '8888    \"88>     us888u.  =\"8888f8888r -*8888888   888R     ud8888.   9888.z88N  `Y888k:*888. "
  )
  console.log(
    " `888 '8888.xH888x.  .@88 \"8888\"   4888>\'88\"    8888      888R   :888\'8888.  9888  888E   888E  888I "
  )
  console.log(
    `   X" :88*~  \`*8888> 9888  9888    4888> '      8888      888R   d888 '88%"  9888  888E   888E  888I `
  )
  console.log(
    ` ~"   !"\`      "888> 9888  9888    4888>        8888      888R   8888.+"     9888  888E   888E  888I `
  )
  console.log(
    `  .H8888h.      ?88  9888  9888   .d888L .+    .8888Lu=   888R   8888L       9888  888E   888E  888I `
  )
  console.log(
    ` :"^"88888h.    '!   9888  9888   ^"8888*"     ^%888*    .888B . '8888c. .+ .8888  888"  x888N><888' `
  )
  console.log(
    ' ^    "88888hx.+"    "888*""888"     "Y"         \'Y"     ^*888%   "88888%    `%888*%"     "88"  888  '
  )
  console.log(
    `        ^\"**""        ^Y"   ^Y'                            "%       "YP'        "\`              88F  `
  )
  console.log(
    '                                                                                               98"   '
  )
  console.log(
    '                                                                                             ./"     '
  )

  if (!isConfigured()) {
    console.log(
      chalk.yellow("⚠ Please configure your business details first.\n")
    )
    await configureBusinessDetails()
    return showMainMenu()
  }

  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices: [
        { name: "📄 Generate invoice", value: "invoice" },
        { name: "👤 Add client", value: "client" },
        { name: "💳 Add payment method", value: "payment" },
        { name: "🏷️ Add brand", value: "brand" },
        { name: "⚙️ Configure business details", value: "config" },
        { name: "📋 View recent invoices", value: "list" },
        { name: "👥 View all clients", value: "clients" },
        { name: "💰 View payment methods", value: "payments" },
        { name: "🎨 View brands", value: "brands" },
        { name: "🚪 Exit", value: "exit" },
      ],
    },
  ])

  switch (action) {
    case "invoice":
      await generateInvoice()
      break
    case "client":
      await addNewClient()
      break
    case "payment":
      await addNewPaymentMethod()
      break
    case "brand":
      await addNewBrand()
      break
    case "config":
      await configureBusinessDetails()
      break
    case "list":
      await listRecentInvoices(20)
      break
    case "clients":
      await listClients()
      break
    case "payments":
      await managePaymentMethods()
      break
    case "brands":
      await manageBrands()
      break
    case "exit":
      console.log(chalk.green("\nGoodbye!\n"))
      process.exit(0)
  }

  const { continueAction } = await inquirer.prompt([
    {
      type: "confirm",
      name: "continueAction",
      message: "Return to main menu?",
      default: true,
    },
  ])

  if (continueAction) {
    await showMainMenu()
  } else {
    console.log(chalk.green("\nGoodbye!\n"))
    process.exit(0)
  }
}

async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  // Track Ctrl+C presses
  let ctrlCCount = 0
  let ctrlCTimeout = null

  process.on("SIGINT", () => {
    ctrlCCount++

    if (ctrlCCount === 1) {
      console.log(chalk.yellow("\n\n⚠ Press Ctrl+C again to exit.\n"))

      // Reset counter after 2 seconds
      ctrlCTimeout = setTimeout(() => {
        ctrlCCount = 0
      }, 2000)
    } else if (ctrlCCount >= 2) {
      console.log(chalk.green("\n\nGoodbye!\n"))
      process.exit(0)
    }
  })

  try {
    switch (command) {
      case COMMANDS.LIST:
        await listRecentInvoices(20)
        break

      case COMMANDS.CONFIG:
        if (!isConfigured()) {
          console.log(
            chalk.yellow("\n⚠ No configuration found. Let's set it up.\n")
          )
        }
        await displayConfig()
        const { updateConfig } = await inquirer.prompt([
          {
            type: "confirm",
            name: "updateConfig",
            message: "Update configuration?",
            default: false,
          },
        ])
        if (updateConfig) {
          await configureBusinessDetails()
        }
        break

      case COMMANDS.GENERATE:
        if (!isConfigured()) {
          console.log(
            chalk.yellow("\n⚠ Please configure your business details first.\n")
          )
          await configureBusinessDetails()
        }
        await generateInvoice()
        break

      default:
        await showMainMenu()
    }
  } catch (error) {
    if (error.isTtyError) {
      console.error(
        chalk.red(
          "\nError: Prompt could not be rendered in this environment.\n"
        )
      )
    } else if (error.message && error.message.includes("User force closed")) {
      console.log(chalk.yellow("\n\nOperation cancelled.\n"))
      process.exit(0)
    } else {
      console.error(chalk.red("\nAn error occurred:"), error.message)
      console.error(chalk.gray("\nPlease try again or report this issue.\n"))
    }
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { main }
