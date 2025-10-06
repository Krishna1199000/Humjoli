# Invoice Generator - Humjoli Wedding Events

## Overview

The Invoice Generator is a comprehensive feature that allows administrators to create professional invoices for wedding events. It includes a form-based interface for data entry and generates PDF invoices that match the exact format of your uploaded invoice images.

## Features

### ✅ Form Interface
- **Customer Details**: Name, Address, Telephone, State, State Code, GSTIN, Reference Name
- **Event Details**: Booking Date, Event Date, Start Time, End Time, Manager
- **Item Management**: Dynamic addition/removal of items with automatic calculation
- **Financial Details**: Advance Amount, Balance Amount, Remarks
- **Real-time Calculations**: Automatic total calculation and amount in words

### ✅ PDF Generation
- **Exact Layout Match**: Replicates your uploaded invoice format precisely
- **Professional Design**: Clean, bordered layout with proper spacing
- **Complete Information**: All form data included in the PDF
- **Terms & Conditions**: Standard terms included as per your template
- **Signature Areas**: Customer and authorized signatory sections

### ✅ Auto-incrementing Quotation Numbers
- **Sequential Numbers**: Starts from 00001 and increments automatically
- **Database Storage**: Counter persists across sessions
- **Unique Identifiers**: Each invoice gets a unique quotation number

### ✅ Invoice Management
- **View All Invoices**: Complete list with search functionality
- **Download PDFs**: One-click PDF download for any invoice
- **Search & Filter**: Find invoices by quotation number, customer name, or phone
- **Invoice Details**: View amounts, dates, and item counts

## Technical Implementation

### Database Schema
```sql
-- Invoice Management
model Invoice {
  id            String   @id @default(cuid())
  quotationNo   String   @unique
  customerName  String
  customerAddress String
  customerTel   String
  customerState String
  customerStateCode String
  customerGSTIN String?
  refName       String?
  bookingDate   DateTime
  eventDate     DateTime
  startTime     String
  endTime       String
  manager       String?
  advanceAmount Float    @default(0)
  balanceAmount Float    @default(0)
  remarks       String?
  totalAmount   Float    @default(0)
  cgstAmount    Float    @default(0)
  sgstAmount    Float    @default(0)
  taxableAmount Float    @default(0)
  sacCode       String   @default("00440035")
  invoiceValueInWords String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  items InvoiceItem[]
}

model InvoiceItem {
  id        String   @id @default(cuid())
  invoiceId String
  srl       Int
  particular String
  quantity  Int
  rent      Float
  amount    Float
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  invoice Invoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
}

model InvoiceCounter {
  id    String @id @default(cuid())
  currentNumber Int @default(1)
  updatedAt DateTime @updatedAt
}
```

### File Structure
```
├── components/
│   └── InvoiceForm.tsx          # Main invoice form component
├── app/
│   ├── invoice/
│   │   └── page.tsx             # Invoice generation page
│   ├── admin/
│   │   └── invoices/
│   │       └── page.tsx         # Invoice management page
│   └── api/
│       └── invoices/
│           ├── route.ts         # Invoice CRUD operations
│           └── [id]/
│               └── download/
│                   └── route.ts # PDF download endpoint
├── utils/
│   └── InvoiceTemplate.ts       # PDF generation logic
└── prisma/
    └── schema.prisma            # Database schema
```

### API Endpoints

#### POST /api/invoices
Creates a new invoice with auto-incrementing quotation number.

**Request Body:**
```json
{
  "customerName": "John Doe",
  "customerAddress": "123 Main St, City",
  "customerTel": "9876543210",
  "customerState": "Maharashtra",
  "customerStateCode": "27",
  "customerGSTIN": "27ADOPA7853Q1ZR",
  "refName": "Reference",
  "bookingDate": "2025-01-15",
  "eventDate": "2025-02-15",
  "startTime": "19:30",
  "endTime": "23:00",
  "manager": "Manager Name",
  "advanceAmount": 5000,
  "balanceAmount": 5000,
  "remarks": "Special instructions",
  "totalAmount": 10000,
  "cgstAmount": 0,
  "sgstAmount": 0,
  "taxableAmount": 10000,
  "sacCode": "00440035",
  "invoiceValueInWords": "Rupees Ten Thousand Only",
  "items": [
    {
      "srl": 1,
      "particular": "DOLI 20",
      "quantity": 1,
      "rent": 10000,
      "amount": 10000
    }
  ]
}
```

#### GET /api/invoices
Fetches all invoices with optional search parameters.

**Query Parameters:**
- `search`: Search by quotation number, customer name, or phone
- `customerName`: Filter by customer name
- `startDate`: Filter by start date
- `endDate`: Filter by end date

#### GET /api/invoices/[id]/download
Downloads the PDF for a specific invoice.

## Usage

### For Administrators

1. **Generate Invoice**
   - Navigate to `/invoice` or click "Generate Invoice" in admin navbar
   - Fill in customer details, event information, and items
   - Click "Generate Invoice" to create and save the invoice
   - Click "Download PDF" to get the PDF file

2. **Manage Invoices**
   - Navigate to `/admin/invoices` or click "View Invoices" in admin navbar
   - Search for specific invoices using the search bar
   - Download PDFs for any invoice using the download button
   - View invoice details including amounts and dates

### Navigation
- **Generate Invoice**: `/invoice`
- **View All Invoices**: `/admin/invoices`
- **Admin Inventory**: `/admin/inventory`

## PDF Format

The generated PDF includes:

1. **Header**: State, State Code, GSTIN
2. **Customer Details** (Left): Name, Address, Tel, State, State Code, GSTIN, Ref Name
3. **Booking Details** (Right): Quotation No, Booking Date, Event Date, Start/End Time, Manager
4. **Items Table**: Serial, Particular, Quantity, Rent, Amount with totals
5. **Taxation**: SAC Code, Taxable Amount, CGST, SGST, Total
6. **Financial Summary**: Advance, Balance, Remarks
7. **Invoice Value**: Amount in words
8. **Terms & Conditions**: Standard business terms
9. **Signature Areas**: Customer and authorized signatory sections

## Dependencies

- **pdfkit**: PDF generation library
- **@types/pdfkit**: TypeScript definitions for pdfkit
- **Prisma**: Database ORM
- **NextAuth.js**: Authentication
- **Framer Motion**: Animations
- **React Hot Toast**: Notifications

## Installation

1. Install dependencies:
```bash
npm install pdfkit @types/pdfkit
```

2. Run database migration:
```bash
npx prisma migrate dev --name add_invoice_models
```

3. Generate Prisma client:
```bash
npx prisma generate
```

## Security

- **Admin Only**: Invoice generation and management restricted to admin users
- **Authentication**: All endpoints require valid session
- **Authorization**: Role-based access control (ADMIN role required)
- **Input Validation**: Server-side validation for all form data

## Future Enhancements

- [ ] Email invoice functionality
- [ ] Invoice templates customization
- [ ] Bulk invoice generation
- [ ] Invoice status tracking (Draft, Sent, Paid)
- [ ] Payment integration
- [ ] Invoice analytics and reporting
- [ ] Customer invoice history
- [ ] Invoice editing capabilities

## Support

For technical support or feature requests, please contact the development team. 