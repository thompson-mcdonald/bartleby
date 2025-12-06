```

     ...     ..                                    s          ..                  ..
  .=*8888x <"?88h.                                :8    x .d88"             . uW8"        ..
 X>  '8888H> '8888                  .u    .      .88     5888R              `t888        @L
'88h. `8888   8888         u      .d88B :@8c    :888ooo  '888R        .u     8888   .   9888i   .dL
'8888 '8888    "88>     us888u.  ="8888f8888r -*8888888   888R     ud8888.   9888.z88N  `Y888k:*888.
 `888 '8888.xH888x.  .@88 "8888"   4888>'88"    8888      888R   :888'8888.  9888  888E   888E  888I
   X" :88*~  `*8888> 9888  9888    4888> '      8888      888R   d888 '88%"  9888  888E   888E  888I
 ~"   !"`      "888> 9888  9888    4888>        8888      888R   8888.+"     9888  888E   888E  888I
  .H8888h.      ?88  9888  9888   .d888L .+    .8888Lu=   888R   8888L       9888  888E   888E  888I
 :"^"88888h.    '!   9888  9888   ^"8888*"     ^%888*    .888B . '8888c. .+ .8888  888"  x888N><888'
 ^    "88888hx.+"    "888*""888"     "Y"         'Y"     ^*888%   "88888%    `%888*%"     "88"  888
        ^"**""        ^Y"   ^Y'                            "%       "YP'        "`              88F
                                                                                               98"
                                                                                             ./"
                                                                                            ~`
```

# Bartleby Invoice Generator

A professional CLI tool for generating PDF invoices, completely offline, even when you'd prefer not to.

## Features

- Interactive CLI interface
- Generate professional PDF invoices
- Manage clients and payment methods
- Configure business details
- Auto-increment invoice numbers per client
- Customizable tax rates
- All data stored locally as JSON files
- Completely customisable

## Installation

### Global Installation

```bash
npm install -g .
bartleby
```

### Local Usage

```bash
npm install
npx bartleby
```

## Usage

### Main Menu

Run `bartleby` or `npx bartleby` to open the interactive menu:

```bash
bartleby
```

Options:

- Generate invoice
- Add client
- Add payment method
- Configure business details
- View recent invoices
- View all clients
- View payment methods

### CLI Commands

#### List Recent Invoices

```bash
bartleby list
```

#### View/Update Configuration

```bash
bartleby config
```

#### Generate Invoice Directly

```bash
bartleby generate
```

## Data Storage

All data is stored in `~/.bartleby/`:

- `clients.json` - Client information
- `invoices.json` - Invoice records
- `paymentMethods.json` - Payment method templates
- `config.json` - Business configuration

## PDF Output

Generated invoices are saved to `~/Documents/invoices/` by default (configurable).

Filename format: `INV-0001_ClientName.pdf`

## Configuration

On first run, you'll be prompted to configure:

- Business name
- Business address
- Business email
- Business phone
- Tax rate (%)
- Invoice number prefix
- Output directory path

## Invoice Generation Flow

1. Select or create a client
2. Enter invoice date (defaults to today)
3. Review auto-suggested invoice number
4. Add line items (description, quantity, rate)
5. Review subtotal, tax, and total
6. Select payment method
7. Generate PDF

## Requirements

- Node.js 14.0.0 or higher

## License

MIT
