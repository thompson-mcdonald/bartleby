const PDFDocument = require("pdfkit")
const SVGtoPDF = require("svg-to-pdfkit")
const fs = require("fs")
const path = require("path")
const { ensureOutputDir } = require("./dataManager")

async function generatePDF(invoice, client, brand) {
  const baseOutputDir = ensureOutputDir()

  // Extract year from invoice date
  const invoiceYear = new Date(invoice.date).getFullYear()

  // Create client/year directory structure
  // Use company name if name is empty
  const clientDisplayName = client.name || client.company || "Unknown"
  const clientDirName = clientDisplayName.replace(/[^a-zA-Z0-9-]/g, "_")
  const clientYearDir = path.join(
    baseOutputDir,
    clientDirName,
    invoiceYear.toString()
  )

  // Ensure the nested directory exists
  if (!fs.existsSync(clientYearDir)) {
    fs.mkdirSync(clientYearDir, { recursive: true })
  }

  const filename = `${invoice.number.replace(/[^a-zA-Z0-9-]/g, "_")}.pdf`
  const filepath = path.join(clientYearDir, filename)

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: "A4" })
      const stream = fs.createWriteStream(filepath)

      doc.pipe(stream)

      const pageWidth = doc.page.width
      const margin = 50
      const contentWidth = pageWidth - margin * 2

      let yPosition = 50

      // Add logo if available
      if (brand.logoPath && fs.existsSync(brand.logoPath)) {
        const ext = path.extname(brand.logoPath).toLowerCase()

        if (ext === ".svg") {
          const svgContent = fs.readFileSync(brand.logoPath, "utf8")
          SVGtoPDF(doc, svgContent, margin, yPosition, {
            width: 150,
            height: 60,
            preserveAspectRatio: "xMidYMid meet",
          })
          yPosition += 70
        } else if ([".png", ".jpg", ".jpeg"].includes(ext)) {
          doc.image(brand.logoPath, margin, yPosition, {
            width: 150,
            height: 60,
            fit: [150, 60],
          })
          yPosition += 70
        }
      } else {
        // No logo, use text header
        doc
          .fontSize(24)
          .font("Helvetica-Bold")
          .text(brand.businessName || "Your Business", margin, yPosition)
        yPosition += 50
      }

      // Business details below logo/header
      doc
        .fontSize(10)
        .font("Helvetica")
        .text(brand.address || "", margin, yPosition)
        .text(brand.email || "", margin, yPosition + 15)
        .text(brand.phone || "", margin, yPosition + 30)

      yPosition += 55

      doc.fontSize(36).font("Helvetica-Bold").text("INVOICE", margin, yPosition)
      yPosition += 50

      doc
        .fontSize(10)
        .font("Helvetica")
        .text(`Invoice #: ${invoice.number}`, margin, yPosition)
        .text(`Date: ${formatDate(invoice.date)}`, margin, yPosition + 15)

      yPosition += 45

      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("BILL TO:", margin, yPosition)
      yPosition += 20
      const clientName = client.name || client.company
      if (clientName) {
        doc.fontSize(10).font("Helvetica").text(clientName, margin, yPosition)
        yPosition += 15
      }

      if (client.company && client.name) {
        doc.text(client.company, margin, yPosition)
        yPosition += 15
      }

      doc.text(client.email, margin, yPosition)
      yPosition += 15

      if (client.address) {
        doc.text(client.address, margin, yPosition)
        yPosition += 15
      }

      yPosition += 30

      const tableTop = yPosition
      const col1X = margin
      const col2X = margin + contentWidth * 0.5
      const col3X = margin + contentWidth * 0.7
      const col4X = margin + contentWidth * 0.85

      doc.fontSize(10).font("Helvetica-Bold")

      doc
        .text("Description", col1X, tableTop)
        .text("Qty", col2X, tableTop)
        .text("Rate", col3X, tableTop)
        .text("Amount", col4X, tableTop)

      doc
        .moveTo(margin, tableTop + 15)
        .lineTo(pageWidth - margin, tableTop + 15)
        .stroke()

      yPosition = tableTop + 25

      doc.font("Helvetica")
      invoice.items.forEach((item) => {
        const descriptionLines = doc.heightOfString(item.description, {
          width: contentWidth * 0.48,
        })

        doc.text(item.description, col1X, yPosition, {
          width: contentWidth * 0.48,
        })
        doc.text(item.quantity.toString(), col2X, yPosition)
        doc.text(`£${item.rate.toFixed(2)}`, col3X, yPosition)
        doc.text(`£${item.amount.toFixed(2)}`, col4X, yPosition)

        yPosition += Math.max(descriptionLines, 15) + 10
      })

      yPosition += 10
      doc
        .moveTo(margin, yPosition)
        .lineTo(pageWidth - margin, yPosition)
        .stroke()

      yPosition += 20

      const summaryX = col3X - 50
      const amountX = col4X

      doc
        .font("Helvetica")
        .text("Subtotal:", summaryX, yPosition)
        .text(`£${invoice.subtotal.toFixed(2)}`, amountX, yPosition)

      if (invoice.taxRate) {
        yPosition += 20
        doc
          .text(`VAT (${invoice.taxRate}%):`, summaryX, yPosition)
          .text(`£${(invoice.tax || 0).toFixed(2)}`, amountX, yPosition)
      }

      yPosition += 20
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("Total:", summaryX, yPosition)
        .text(`£${invoice.total.toFixed(2)}`, amountX, yPosition)

      yPosition += 40

      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("Payment Method:", margin, yPosition)

      yPosition += 15
      doc.font("Helvetica").text(invoice.paymentMethod.name, margin, yPosition)

      if (invoice.paymentMethod.accountName) {
        yPosition += 15
        doc.text(
          `Account Name: ${invoice.paymentMethod.accountName}`,
          margin,
          yPosition
        )
      }

      if (invoice.paymentMethod.accountNumber) {
        yPosition += 15
        doc.text(
          `Account Number: ${invoice.paymentMethod.accountNumber}`,
          margin,
          yPosition
        )
      }

      if (invoice.paymentMethod.sortCode) {
        yPosition += 15
        doc.text(
          `Sort Code: ${invoice.paymentMethod.sortCode}`,
          margin,
          yPosition
        )
      }

      if (invoice.paymentMethod.details) {
        yPosition += 15
        doc.text(invoice.paymentMethod.details, margin, yPosition)
      }

      if (invoice.paymentMethod.terms) {
        yPosition += 15
        doc.text(`Terms: ${invoice.paymentMethod.terms}`, margin, yPosition)
      }

      const footerY = doc.page.height - 80
      doc
        .fontSize(8)
        .font("Helvetica")
        .text("Thank you for your business!", margin, footerY, {
          align: "center",
          width: contentWidth,
        })

      doc.end()

      stream.on("finish", () => {
        resolve(filepath)
      })

      stream.on("error", (error) => {
        reject(error)
      })
    } catch (error) {
      reject(error)
    }
  })
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

module.exports = {
  generatePDF,
}
