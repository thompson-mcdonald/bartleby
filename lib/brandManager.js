const inquirer = require("inquirer")
const { getBrands, addBrand } = require("./dataManager")
const { validateRequired } = require("./validators")
const fs = require("fs")
const path = require("path")

async function selectOrCreateBrand() {
  const brands = getBrands()

  if (brands.length === 0) {
    console.log("\nNo brands found. Let's add your first brand.\n")
    return await addNewBrand()
  }

  const choices = [
    ...brands.map((b) => ({
      name: b.name,
      value: b,
    })),
    { name: "+ Add new brand", value: "new" },
  ]

  const { brand } = await inquirer.prompt([
    {
      type: "list",
      name: "brand",
      message: "Select a brand for this invoice:",
      choices,
    },
  ])

  if (brand === "new") {
    return await addNewBrand()
  }

  return brand
}

async function addNewBrand() {
  console.log("\n--- Add New Brand ---\n")

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: "Brand name:",
      validate: validateRequired,
    },
    {
      type: "input",
      name: "businessName",
      message: "Business name (for invoice header):",
      validate: validateRequired,
    },
    {
      type: "input",
      name: "address",
      message: "Address:",
    },
    {
      type: "input",
      name: "email",
      message: "Email:",
    },
    {
      type: "input",
      name: "phone",
      message: "Phone:",
    },
    {
      type: "input",
      name: "logoPath",
      message: "Logo file path (SVG or PNG, optional):",
      validate: (input) => {
        if (!input) return true
        if (!fs.existsSync(input)) {
          return "File does not exist"
        }
        const ext = path.extname(input).toLowerCase()
        if (![".svg", ".png", ".jpg", ".jpeg"].includes(ext)) {
          return "Please provide an SVG, PNG, or JPG file"
        }
        return true
      },
    },
  ])

  const brand = addBrand(answers)
  console.log("\n✓ Brand added successfully!\n")
  return brand
}

async function manageBrands() {
  const brands = getBrands()

  if (brands.length === 0) {
    console.log("\nNo brands found.\n")
    return
  }

  console.log("\n--- Brands ---\n")
  brands.forEach((brand, index) => {
    console.log(`${index + 1}. ${brand.name}`)
    console.log(`   Business Name: ${brand.businessName}`)
    if (brand.logoPath) {
      console.log(`   Logo: ${brand.logoPath}`)
    }
    console.log("")
  })
}

module.exports = {
  selectOrCreateBrand,
  addNewBrand,
  manageBrands,
}
