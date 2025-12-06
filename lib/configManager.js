const inquirer = require("inquirer")
const { getConfig, saveConfig } = require("./dataManager")
const {
  validateRequired,
  validateEmail,
  validateNumber,
} = require("./validators")

async function configureBusinessDetails() {
  const currentConfig = getConfig()

  console.log("\n--- Configure Business Details ---\n")

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "businessName",
      message: "Business name:",
      default: currentConfig.businessName,
      validate: validateRequired,
    },
    {
      type: "input",
      name: "address",
      message: "Business address:",
      default: currentConfig.address,
    },
    {
      type: "input",
      name: "email",
      message: "Business email:",
      default: currentConfig.email,
      validate: validateEmail,
    },
    {
      type: "input",
      name: "phone",
      message: "Business phone:",
      default: currentConfig.phone,
    },
    {
      type: "input",
      name: "invoicePrefix",
      message: "Invoice number prefix:",
      default: currentConfig.invoicePrefix,
    },
    {
      type: "input",
      name: "outputPath",
      message: "Invoice output directory:",
      default: currentConfig.outputPath,
      validate: validateRequired,
    },
  ])

  const success = saveConfig(answers)

  if (success) {
    console.log("\n✓ Configuration saved successfully!\n")
  } else {
    console.log("\n✗ Failed to save configuration.\n")
  }
}

async function displayConfig() {
  const config = getConfig()

  console.log("\n--- Current Configuration ---\n")
  console.log(`Business Name: ${config.businessName || "Not set"}`)
  console.log(`Address: ${config.address || "Not set"}`)
  console.log(`Email: ${config.email || "Not set"}`)
  console.log(`Phone: ${config.phone || "Not set"}`)
  console.log(`Tax Rate: ${config.taxRate}%`)
  console.log(`Invoice Prefix: ${config.invoicePrefix}`)
  console.log(`Output Path: ${config.outputPath}`)
  console.log("")
}

function isConfigured() {
  const config = getConfig()
  return !!(config.businessName && config.email)
}

module.exports = {
  configureBusinessDetails,
  displayConfig,
  isConfigured,
}
