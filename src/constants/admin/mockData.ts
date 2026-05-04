// Customer Data
export const customerData = {
  name: "SK Bags",
  email: "info@skbags.com",
  phone: "+20 150 188 1005",
  street: "شارع الملك فهد، حي العليا، الرياض",
  totalProducts: 156,
  activeContracts: 3,
  usedLocations: 12,
  pendingShipments: 5,
};

// Invoices Data
export const invoicesData = [
  { id: "INV/2026/00007", amount: 2875.0, status: "pending" as const, date: "01/03/2026", dueDate: "01/03/2026" },
  { id: "INV/2026/00006", amount: 5200.0, status: "paid" as const, date: "15/02/2026", dueDate: "15/02/2026" },
  { id: "INV/2026/00005", amount: 3450.0, status: "paid" as const, date: "01/02/2026", dueDate: "01/02/2026" },
  { id: "INV/2026/00004", amount: 1890.0, status: "overdue" as const, date: "15/01/2026", dueDate: "15/01/2026" },
  { id: "INV/2026/00003", amount: 4100.0, status: "paid" as const, date: "01/01/2026", dueDate: "01/01/2026" },
];

// Contracts Data
export const contractsData = [
  {
    id: "CNT/2026/001",
    status: "active" as const,
    startDate: "01/03/2026",
    endDate: "01/03/2027",
    nextInvoiceDate: "02/03/2026",
    items: [{ description: "Medical Rack E-01 Lease", quantity: 1.0, priceUnit: 2500.0, discount: 0, subTotal: 2500.0, recurrence: "1 Month(s)", nextInvoice: "02/03/2026" }],
  },
  {
    id: "CNT/2026/002",
    status: "active" as const,
    startDate: "15/01/2026",
    endDate: "15/01/2027",
    nextInvoiceDate: "15/03/2026",
    items: [
      { description: "Storage Unit A-05", quantity: 2.0, priceUnit: 1500.0, discount: 10, subTotal: 2700.0, recurrence: "1 Month(s)", nextInvoice: "15/03/2026" },
      { description: "Pallet Space B-12", quantity: 5.0, priceUnit: 300.0, discount: 0, subTotal: 1500.0, recurrence: "1 Month(s)", nextInvoice: "15/03/2026" },
    ],
  },
  {
    id: "CNT/2025/015",
    status: "expired" as const,
    startDate: "01/06/2025",
    endDate: "01/12/2025",
    nextInvoiceDate: "-",
    items: [{ description: "Warehouse Section C", quantity: 1.0, priceUnit: 5000.0, discount: 5, subTotal: 4750.0, recurrence: "1 Month(s)", nextInvoice: "-" }],
  },
];

// Products Data
export const productsData = {
  stats: { totalProducts: 156, inStock: 142, lowStock: 10, outOfStock: 4 },
  operations: [
    { id: 1, type: "inbound" as const, product: "حليب مجفف", batchNumber: "LOT-2024-156", client: "شركة النور", quantity: 500, location: "A-01-R12", date: "2024-11-19", time: "10:30 ص" },
    { id: 2, type: "outbound" as const, product: "أدوية", batchNumber: "MED-2024-145", client: "مؤسسة الأمل", quantity: 200, location: "B-02-R08", date: "2024-11-19", time: "09:15 ص" },
    { id: 3, type: "inbound" as const, product: "مستحضرات تجميل", batchNumber: "COS-2024-189", client: "شركة الخليج", quantity: 300, location: "A-03-R15", date: "2024-11-19", time: "08:45 ص" },
    { id: 4, type: "outbound" as const, product: "ألعاب أطفال", batchNumber: "TOY-2024-067", client: "الأفق التجارية", quantity: 150, location: "C-01-R05", date: "2024-11-19", time: "08:20 ص" },
  ],
  inventory: [
    { id: 1, name: "حليب مجفف", sku: "MLK-001", category: "أغذية", quantity: 500, location: "A-01-R12", status: "in_stock" as const },
    { id: 2, name: "أدوية طبية", sku: "MED-002", category: "أدوية", quantity: 15, location: "B-02-R08", status: "low_stock" as const },
    { id: 3, name: "مستحضرات تجميل", sku: "COS-003", category: "تجميل", quantity: 300, location: "A-03-R15", status: "in_stock" as const },
    { id: 4, name: "ألعاب أطفال", sku: "TOY-004", category: "ألعاب", quantity: 0, location: "C-01-R05", status: "out_of_stock" as const },
    { id: 5, name: "إلكترونيات", sku: "ELC-005", category: "إلكترونيات", quantity: 85, location: "D-02-R10", status: "in_stock" as const },
  ],
};

// Warehouses Data
export const warehousesData = {
  current: {
    id: "WH-001",
    name: "المستودع ب",
    code: "MOS8 | MOS8",
    totalArea: "5 م²",
    temperature: "عادي",
    status: "نشط",
    usedLocations: 3,
    totalLocations: 10,
    plan: { name: "الخطة الأساسية", price: "2,500 SR/شهر", features: ["5 م² مساحة", "تخزين عادي", "دعم فني"] },
  },
  floors: [
    { id: "SF-001", name: "Stock Floor 001", status: "available" as const, locations: 5 },
    { id: "SF-002", name: "Stock Floor 002", status: "rented" as const, locations: 3 },
  ],
  others: [
    { id: "WH-002", name: "المستودع أ", location: "الرياض", status: "available" as const, area: "10 م²" },
    { id: "WH-003", name: "المستودع ج", location: "جدة", status: "available" as const, area: "15 م²" },
    { id: "WH-004", name: "المستودع د", location: "الدمام", status: "full" as const, area: "8 م²" },
  ],
};

// Recent Activity
export const recentActivity = [
  { id: 1, type: "inbound" as const, description: "استلام شحنة جديدة - 50 كرتون", date: "اليوم 10:30 ص", icon: "📦" },
  { id: 2, type: "outbound" as const, description: "إرسال طلب #1234", date: "أمس 03:15 م", icon: "🚚" },
  { id: 3, type: "contract" as const, description: "تجديد عقد المستودع A", date: "منذ 3 أيام", icon: "📄" },
  { id: 4, type: "inbound" as const, description: "استلام بضاعة من المورد", date: "منذ 5 أيام", icon: "📥" },
];

// Notifications
export const notifications = [
  { id: 1, title: "شحنة جديدة", message: "تم استلام شحنة جديدة في المستودع", time: "منذ 5 دقائق", read: false },
  { id: 2, title: "فاتورة مستحقة", message: "لديك فاتورة مستحقة الدفع", time: "منذ ساعة", read: false },
  { id: 3, title: "تجديد عقد", message: "يقترب موعد تجديد العقد", time: "منذ يوم", read: true },
];