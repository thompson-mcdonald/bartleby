const fs = require('fs');
const path = require('path');
const os = require('os');

const DATA_DIR = path.join(os.homedir(), '.bartleby');
const CLIENTS_FILE = path.join(DATA_DIR, 'clients.json');
const INVOICES_FILE = path.join(DATA_DIR, 'invoices.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
const PAYMENT_METHODS_FILE = path.join(DATA_DIR, 'paymentMethods.json');
const BRANDS_FILE = path.join(DATA_DIR, 'brands.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function ensureFile(filePath, defaultData = []) {
  ensureDataDir();
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
}

function readJSON(filePath, defaultData = []) {
  try {
    ensureFile(filePath, defaultData);
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return defaultData;
  }
}

function writeJSON(filePath, data) {
  try {
    ensureDataDir();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error.message);
    return false;
  }
}

function getClients() {
  return readJSON(CLIENTS_FILE, []);
}

function saveClients(clients) {
  return writeJSON(CLIENTS_FILE, clients);
}

function addClient(client) {
  const clients = getClients();
  const newClient = {
    id: Date.now().toString(),
    ...client,
    createdAt: new Date().toISOString()
  };
  clients.push(newClient);
  saveClients(clients);
  return newClient;
}

function getInvoices() {
  return readJSON(INVOICES_FILE, []);
}

function saveInvoices(invoices) {
  return writeJSON(INVOICES_FILE, invoices);
}

function addInvoice(invoice) {
  const invoices = getInvoices();
  const newInvoice = {
    id: Date.now().toString(),
    ...invoice,
    createdAt: new Date().toISOString()
  };
  invoices.push(newInvoice);
  saveInvoices(invoices);
  return newInvoice;
}

function getLastInvoiceNumber(clientId) {
  const invoices = getInvoices();
  const clientInvoices = invoices.filter(inv => inv.clientId === clientId);

  if (clientInvoices.length === 0) return 1;

  const numbers = clientInvoices.map(inv => {
    const match = inv.number.match(/\d+$/);
    return match ? parseInt(match[0]) : 0;
  });

  return Math.max(...numbers) + 1;
}

function getConfig() {
  const defaultConfig = {
    businessName: '',
    address: '',
    email: '',
    phone: '',
    taxRate: 0,
    invoicePrefix: 'INV-',
    outputPath: path.join(os.homedir(), 'Documents', 'invoices')
  };
  return readJSON(CONFIG_FILE, defaultConfig);
}

function saveConfig(config) {
  return writeJSON(CONFIG_FILE, config);
}

function getPaymentMethods() {
  return readJSON(PAYMENT_METHODS_FILE, []);
}

function savePaymentMethods(methods) {
  return writeJSON(PAYMENT_METHODS_FILE, methods);
}

function addPaymentMethod(method) {
  const methods = getPaymentMethods();
  const newMethod = {
    id: Date.now().toString(),
    ...method
  };
  methods.push(newMethod);
  savePaymentMethods(methods);
  return newMethod;
}

function getBrands() {
  return readJSON(BRANDS_FILE, []);
}

function saveBrands(brands) {
  return writeJSON(BRANDS_FILE, brands);
}

function addBrand(brand) {
  const brands = getBrands();
  const newBrand = {
    id: Date.now().toString(),
    ...brand
  };
  brands.push(newBrand);
  saveBrands(brands);
  return newBrand;
}

function ensureOutputDir() {
  const config = getConfig();
  if (!fs.existsSync(config.outputPath)) {
    fs.mkdirSync(config.outputPath, { recursive: true });
  }
  return config.outputPath;
}

module.exports = {
  getClients,
  saveClients,
  addClient,
  getInvoices,
  saveInvoices,
  addInvoice,
  getLastInvoiceNumber,
  getConfig,
  saveConfig,
  getPaymentMethods,
  savePaymentMethods,
  addPaymentMethod,
  getBrands,
  saveBrands,
  addBrand,
  ensureOutputDir,
  DATA_DIR
};
