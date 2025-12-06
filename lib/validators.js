function validateRequired(input) {
  if (!input || input.trim() === "") {
    return "This field is required"
  }
  return true
}

function validateEmail(input) {
  if (!input || input.trim() === "") {
    return "Email is required"
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(input)) {
    return "Please enter a valid email address"
  }
  return true
}

function validateNumber(input) {
  const stringInput = String(input).trim()
  if (!stringInput || stringInput === "") {
    return "This field is required"
  }
  if (isNaN(stringInput) || parseFloat(stringInput) < 0) {
    return "Please enter a valid positive number"
  }
  return true
}

function validatePositiveInteger(input) {
  const stringInput = String(input).trim()
  if (!stringInput || stringInput === "") {
    return "This field is required"
  }
  if (
    isNaN(stringInput) ||
    parseInt(stringInput) < 1 ||
    !Number.isInteger(parseFloat(stringInput))
  ) {
    return "Please enter a valid positive integer"
  }
  return true
}

function validateDate(input) {
  if (!input || input?.toString().trim() === "") {
    return true
  }
  const date = new Date(input)
  if (isNaN(date.getTime())) {
    return "Please enter a valid date (YYYY-MM-DD)"
  }
  return true
}

module.exports = {
  validateRequired,
  validateEmail,
  validateNumber,
  validatePositiveInteger,
  validateDate,
}
