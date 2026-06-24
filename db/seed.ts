import { getDb } from "../api/queries/connection";
import * as schema from "./schema";
import bcrypt from "bcryptjs";

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  // ─── Users ───────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("admin123", 10);
  const receptionistHash = await bcrypt.hash("staff123", 10);
  const labTechHash = await bcrypt.hash("lab123", 10);

  await db.insert(schema.users).values([
    { name: "Administrator", email: "admin@alshifa.com", passwordHash, role: "admin", phone: "03087937614" },
    { name: "Fatima Khan", email: "reception@alshifa.com", passwordHash: receptionistHash, role: "receptionist", phone: "03001234567" },
    { name: "Dr. Ahmed Hassan", email: "lab@alshifa.com", passwordHash: labTechHash, role: "lab_tech", phone: "03009876543" },
  ]);
  console.log("Users seeded");

  // ─── Categories ──────────────────────────────────────────────
  await db.insert(schema.categories).values([
    { name: "Frames", description: "Eyeglass frames of all styles and brands" },
    { name: "Lenses", description: "Prescription lenses (single vision, bifocal, progressive)" },
    { name: "Solutions", description: "Lens cleaning solutions and care products" },
    { name: "Accessories", description: "Cases, cloths, chains, and other accessories" },
    { name: "Internal Use", description: "Staff consumables and trial equipment", isInternal: true },
  ]);
  console.log("Categories seeded");

  // ─── Brands ──────────────────────────────────────────────────
  await db.insert(schema.brands).values([
    { name: "Ray-Ban" },
    { name: "Oakley" },
    { name: "Gucci" },
    { name: "Prada" },
    { name: "Essilor" },
    { name: "Zeiss" },
    { name: "Johnson & Johnson" },
    { name: "Bausch & Lomb" },
    { name: "Safilo" },
    { name: "Hoya" },
  ]);
  console.log("Brands seeded");

  // ─── Suppliers ───────────────────────────────────────────────
  await db.insert(schema.suppliers).values([
    { name: "Vision World Traders", contactPerson: "Ali Raza", phone: "03001112223", email: "ali@visionworld.com", address: "Main Market, Lahore", totalPayable: "125000" },
    { name: "OptiCare Distributors", contactPerson: "Sara Ahmed", phone: "03002223334", email: "sara@opticare.com", address: "Gulberg, Lahore", totalPayable: "85000" },
    { name: "Lens Master Pakistan", contactPerson: "Kamran Shah", phone: "03003334445", email: "kamran@lensmaster.pk", address: "Ferozepur Road, Lahore", totalPayable: "200000" },
    { name: "Premium Eyewear Co.", contactPerson: "Nadia Hussain", phone: "03004445556", email: "nadia@premiumeyewear.com", address: "Model Town, Lahore", totalPayable: "45000" },
    { name: "MediVision Supplies", contactPerson: "Tariq Mehmood", phone: "03005556667", email: "tariq@medivision.com", address: "DHA Phase 5, Lahore", totalPayable: "75000" },
  ]);
  console.log("Suppliers seeded");

  // ─── Products ────────────────────────────────────────────────
  const productsData = [
    // Frames
    { sku: "FR-RB-001", name: "Ray-Ban Aviator Gold", categoryId: 1, brandId: 1, supplierId: 1, color: "Gold", size: "58-14-135", frameType: "full_rim" as const, material: "Metal", quantity: 12, reorderLevel: 5, reorderQty: 20, location: "shop" as const, purchasePrice: "4500", sellingPrice: "8500", barcode: "8901234567890" },
    { sku: "FR-RB-002", name: "Ray-Ban Wayfarer Black", categoryId: 1, brandId: 1, supplierId: 1, color: "Black", size: "54-18-145", frameType: "full_rim" as const, material: "Acetate", quantity: 8, reorderLevel: 5, reorderQty: 15, location: "shop" as const, purchasePrice: "4200", sellingPrice: "7900", barcode: "8901234567891" },
    { sku: "FR-OK-001", name: "Oakley Holbrook Matte Black", categoryId: 1, brandId: 2, supplierId: 1, color: "Matte Black", size: "57-17-138", frameType: "full_rim" as const, material: "O Matter", quantity: 6, reorderLevel: 3, reorderQty: 12, location: "shop" as const, purchasePrice: "5500", sellingPrice: "10500", barcode: "8901234567892" },
    { sku: "FR-GC-001", name: "Gucci GG006 Tortoise", categoryId: 1, brandId: 3, supplierId: 4, color: "Tortoise", size: "52-19-140", frameType: "full_rim" as const, material: "Acetate", quantity: 4, reorderLevel: 2, reorderQty: 8, location: "shop" as const, purchasePrice: "12000", sellingPrice: "22000", barcode: "8901234567893" },
    { sku: "FR-PR-001", name: "Prada PR16 Black", categoryId: 1, brandId: 4, supplierId: 4, color: "Black", size: "55-17-140", frameType: "half_rim" as const, material: "Acetate/Metal", quantity: 3, reorderLevel: 2, reorderQty: 6, location: "shop" as const, purchasePrice: "15000", sellingPrice: "28000", barcode: "8901234567894" },
    { sku: "FR-SF-001", name: "Safilo Classic Silver", categoryId: 1, brandId: 9, supplierId: 2, color: "Silver", size: "53-16-140", frameType: "rimless" as const, material: "Titanium", quantity: 15, reorderLevel: 5, reorderQty: 20, location: "shop" as const, purchasePrice: "3200", sellingPrice: "6000", barcode: "8901234567895" },
    { sku: "FR-SF-002", name: "Safilo Kids Flexible Blue", categoryId: 1, brandId: 9, supplierId: 2, color: "Blue", size: "45-14-125", frameType: "full_rim" as const, material: "TR90", quantity: 10, reorderLevel: 5, reorderQty: 15, location: "shop" as const, purchasePrice: "1800", sellingPrice: "3500", barcode: "8901234567896" },
    { sku: "FR-RB-003", name: "Ray-Ban Clubmaster Brown", categoryId: 1, brandId: 1, supplierId: 1, color: "Brown", size: "51-21-145", frameType: "full_rim" as const, material: "Acetate/Metal", quantity: 7, reorderLevel: 4, reorderQty: 10, location: "shop" as const, purchasePrice: "4800", sellingPrice: "9200", barcode: "8901234567897" },
    // Lenses
    { sku: "LN-ES-001", name: "Essilor Crizal UV Single Vision 1.56", categoryId: 2, brandId: 5, supplierId: 3, lensType: "single_vision" as const, sphMin: "-6.00", sphMax: "6.00", cylMin: "-4.00", cylMax: "4.00", axisValues: "all", quantity: 50, reorderLevel: 20, reorderQty: 50, location: "godown" as const, purchasePrice: "1200", sellingPrice: "2500", barcode: "8901234567900" },
    { sku: "LN-ES-002", name: "Essilor Crizal UV Bifocal 1.50", categoryId: 2, brandId: 5, supplierId: 3, lensType: "bifocal" as const, sphMin: "-8.00", sphMax: "8.00", cylMin: "-4.00", cylMax: "4.00", addMin: "0.75", addMax: "3.50", axisValues: "all", quantity: 30, reorderLevel: 15, reorderQty: 40, location: "godown" as const, purchasePrice: "1800", sellingPrice: "3800", barcode: "8901234567901" },
    { sku: "LN-ZS-001", name: "Zeiss SmartLife Progressive 1.60", categoryId: 2, brandId: 6, supplierId: 3, lensType: "progressive" as const, sphMin: "-10.00", sphMax: "8.00", cylMin: "-6.00", cylMax: "6.00", addMin: "0.75", addMax: "3.50", axisValues: "all", quantity: 20, reorderLevel: 10, reorderQty: 30, location: "godown" as const, purchasePrice: "3500", sellingPrice: "7500", barcode: "8901234567902" },
    { sku: "LN-ZS-002", name: "Zeiss DuraVision BlueProtect 1.67", categoryId: 2, brandId: 6, supplierId: 3, lensType: "single_vision" as const, sphMin: "-12.00", sphMax: "8.00", cylMin: "-6.00", cylMax: "6.00", axisValues: "all", quantity: 15, reorderLevel: 8, reorderQty: 25, location: "godown" as const, purchasePrice: "2800", sellingPrice: "5800", barcode: "8901234567903" },
    { sku: "LN-HY-001", name: "Hoya Sync III Office Lens 1.60", categoryId: 2, brandId: 10, supplierId: 3, lensType: "progressive" as const, sphMin: "-6.00", sphMax: "6.00", cylMin: "-4.00", cylMax: "4.00", addMin: "0.50", addMax: "3.00", axisValues: "all", quantity: 18, reorderLevel: 8, reorderQty: 20, location: "godown" as const, purchasePrice: "2500", sellingPrice: "5200", barcode: "8901234567904" },
    // Solutions
    { sku: "SL-JJ-001", name: "J&J Acuvue RevitaLens 300ml", categoryId: 3, brandId: 7, supplierId: 5, quantity: 24, reorderLevel: 10, reorderQty: 30, location: "shop" as const, purchasePrice: "450", sellingPrice: "850", barcode: "8901234567910" },
    { sku: "SL-BL-001", name: "Bausch+Lomb Renu Fresh 355ml", categoryId: 3, brandId: 8, supplierId: 5, quantity: 18, reorderLevel: 8, reorderQty: 24, location: "shop" as const, purchasePrice: "400", sellingPrice: "750", barcode: "8901234567911" },
    { sku: "SL-BL-002", name: "Bausch+Lomb BioTrue 300ml", categoryId: 3, brandId: 8, supplierId: 5, quantity: 12, reorderLevel: 6, reorderQty: 18, location: "shop" as const, purchasePrice: "500", sellingPrice: "950", barcode: "8901234567912" },
    { sku: "SL-GN-001", name: "Generic Lens Cleaning Spray 100ml", categoryId: 3, supplierId: 2, quantity: 30, reorderLevel: 10, reorderQty: 30, location: "shop" as const, purchasePrice: "80", sellingPrice: "200", barcode: "8901234567913" },
    // Accessories
    { sku: "AC-GN-001", name: "Hard Shell Glasses Case Black", categoryId: 4, supplierId: 2, color: "Black", quantity: 40, reorderLevel: 15, reorderQty: 30, location: "shop" as const, purchasePrice: "120", sellingPrice: "300", barcode: "8901234567920" },
    { sku: "AC-GN-002", name: "Microfiber Cleaning Cloth (Pack of 3)", categoryId: 4, supplierId: 2, quantity: 35, reorderLevel: 15, reorderQty: 30, location: "shop" as const, purchasePrice: "60", sellingPrice: "150", barcode: "8901234567921" },
    { sku: "AC-GN-003", name: "Silicone Nose Pads (Pack of 10)", categoryId: 4, supplierId: 2, quantity: 20, reorderLevel: 10, reorderQty: 20, location: "shop" as const, purchasePrice: "40", sellingPrice: "120", barcode: "8901234567922" },
    { sku: "AC-GN-004", name: "Eyeglass Chain Silver", categoryId: 4, supplierId: 2, color: "Silver", quantity: 15, reorderLevel: 8, reorderQty: 15, location: "shop" as const, purchasePrice: "150", sellingPrice: "400", barcode: "8901234567923" },
    { sku: "AC-GN-005", name: "Screwdriver Repair Kit", categoryId: 4, supplierId: 2, quantity: 12, reorderLevel: 5, reorderQty: 10, location: "shop" as const, purchasePrice: "100", sellingPrice: "250", barcode: "8901234567924" },
    // Internal Use
    { sku: "IU-TL-001", name: "Trial Lens Set - Spherical", categoryId: 5, supplierId: 3, quantity: 5, reorderLevel: 2, reorderQty: 3, location: "shop" as const, purchasePrice: "15000", sellingPrice: "0", barcode: "8901234567930" },
    { sku: "IU-TL-002", name: "Trial Frame Adjustable", categoryId: 5, supplierId: 3, quantity: 8, reorderLevel: 3, reorderQty: 5, location: "shop" as const, purchasePrice: "1200", sellingPrice: "0", barcode: "8901234567931" },
    { sku: "IU-ST-001", name: "Cleaning Solution (Staff Use)", categoryId: 5, supplierId: 5, quantity: 10, reorderLevel: 5, reorderQty: 10, location: "shop" as const, purchasePrice: "80", sellingPrice: "0", barcode: "8901234567932" },
    { sku: "IU-PD-001", name: "PD Ruler (Digital)", categoryId: 5, supplierId: 2, quantity: 3, reorderLevel: 2, reorderQty: 2, location: "shop" as const, purchasePrice: "2500", sellingPrice: "0", barcode: "8901234567933" },
  ];

  for (const product of productsData) {
    await db.insert(schema.products).values(product);
  }
  console.log("Products seeded");

  // ─── Patients ────────────────────────────────────────────────
  const patientsData = [
    { patientCode: "P-00001", name: "Muhammad Ali", phone: "03011234567", age: 45, gender: "male" as const, address: "Gaggoo Mandi, Bahawalpur", medicalHistory: "Myopia since age 20" },
    { patientCode: "P-00002", name: "Ayesha Siddiqua", phone: "03029876543", age: 32, gender: "female" as const, address: "Model Town A, Bahawalpur", allergies: "Nickel sensitivity", medicalHistory: "Astigmatism" },
    { patientCode: "P-00003", name: "Ahmad Hassan", phone: "03035432109", age: 28, gender: "male" as const, address: "University Road, Bahawalpur" },
    { patientCode: "P-00004", name: "Fatima Bibi", phone: "03048765432", age: 55, gender: "female" as const, address: "Civil Lines, Bahawalpur", medicalHistory: "Presbyopia", medications: "BP medication" },
    { patientCode: "P-00005", name: "Imran Khan", phone: "03051234500", age: 40, gender: "male" as const, address: "Satellite Town, Bahawalpur", medicalHistory: "Hyperopia" },
    { patientCode: "P-00006", name: "Sana Malik", phone: "03066789012", age: 22, gender: "female" as const, address: "Gulshan-e-Iqbal, Bahawalpur" },
    { patientCode: "P-00007", name: "Bilal Ahmed", phone: "03072345678", age: 35, gender: "male" as const, address: "Cantt Area, Bahawalpur", medicalHistory: "Computer vision syndrome" },
    { patientCode: "P-00008", name: "Rabia Kausar", phone: "03088765432", age: 60, gender: "female" as const, address: "Near Railway Station, Bahawalpur", medicalHistory: "Cataract surgery 2024", medications: "Eye drops" },
    { patientCode: "P-00009", name: "Usman Ghani", phone: "03093456789", age: 18, gender: "male" as const, address: "FC College Road, Bahawalpur" },
    { patientCode: "P-00010", name: "Noreen Akhtar", phone: "03109876543", age: 42, gender: "female" as const, address: "Defence Road, Bahawalpur", allergies: "Latex", medicalHistory: "Dry eye syndrome" },
    { patientCode: "P-00011", name: "Kashif Mehmood", phone: "03115678901", age: 50, gender: "male" as const, address: "Airport Road, Bahawalpur", medicalHistory: "Diabetic retinopathy" },
    { patientCode: "P-00012", name: "Hina Tariq", phone: "03128765432", age: 29, gender: "female" as const, address: "Model Town B, Bahawalpur" },
    { patientCode: "P-00013", name: "Tariq Jameel", phone: "03133456789", age: 65, gender: "male" as const, address: "Old City, Bahawalpur", medicalHistory: "Glaucoma", medications: "Timolol drops" },
    { patientCode: "P-00014", name: "Maria Iqbal", phone: "03149876543", age: 24, gender: "female" as const, address: "Hasilpur Road, Bahawalpur" },
    { patientCode: "P-00015", name: "Shahid Afridi", phone: "03155678901", age: 38, gender: "male" as const, address: "Zahir Pir Road, Bahawalpur" },
  ];

  for (const patient of patientsData) {
    await db.insert(schema.patients).values(patient);
  }
  console.log("Patients seeded");

  // ─── Prescriptions ───────────────────────────────────────────
  await db.insert(schema.prescriptions).values([
    { patientId: 1, odSph: "-2.50", odCyl: "-0.75", odAxis: 180, osSph: "-2.25", osCyl: "-1.00", osAxis: 170, pd: "62.0", lensType: "single_vision" as const, remarks: "First time glasses", followUpDate: new Date("2026-07-10") },
    { patientId: 2, odSph: "-3.00", odCyl: "-1.25", odAxis: 90, osSph: "-2.75", osCyl: "-1.50", osAxis: 85, pd: "58.0", lensType: "single_vision" as const, remarks: "Anti-glare coating recommended", followUpDate: new Date("2026-07-15") },
    { patientId: 4, odSph: "+1.50", odCyl: "-0.50", odAxis: 180, odAdd: "+2.00", osSph: "+1.75", osCyl: "-0.75", osAxis: 175, osAdd: "+2.00", pd: "60.0", lensType: "bifocal" as const, remarks: "Progressive recommended next time", followUpDate: new Date("2026-07-20") },
    { patientId: 5, odSph: "+2.00", odCyl: "-0.25", odAxis: 90, osSph: "+2.25", osCyl: "-0.50", osAxis: 85, pd: "64.0", lensType: "single_vision" as const, followUpDate: new Date("2026-07-12") },
    { patientId: 8, odSph: "-1.00", odCyl: "-0.50", odAxis: 180, osSph: "-1.25", osCyl: "-0.75", osAxis: 170, pd: "59.0", lensType: "single_vision" as const, remarks: "Post-cataract refraction", followUpDate: new Date("2026-08-01") },
    { patientId: 10, odSph: "-1.75", odCyl: "-0.25", odAxis: 90, osSph: "-1.50", osCyl: "-0.50", osAxis: 80, pd: "61.0", lensType: "single_vision" as const, remarks: "Computer glasses with blue filter", followUpDate: new Date("2026-07-18") },
    { patientId: 13, odSph: "-4.00", odCyl: "-1.50", odAxis: 45, osSph: "-4.25", osCyl: "-1.75", osAxis: 135, pd: "63.0", lensType: "single_vision" as const, remarks: "High index lenses required", followUpDate: new Date("2026-07-25") },
    { patientId: 3, odSph: "-0.50", osSph: "-0.75", pd: "65.0", lensType: "single_vision" as const, remarks: "Mild correction for driving", followUpDate: new Date("2026-08-05") },
  ]);
  console.log("Prescriptions seeded");

  // ─── Appointments ────────────────────────────────────────────
  const today = new Date("2026-06-24");
  await db.insert(schema.appointments).values([
    { patientId: 1, appointmentDate: today, appointmentTime: "09:30:00", type: "follow_up" as const, status: "scheduled" as const, notes: "1-month follow-up" },
    { patientId: 4, appointmentDate: today, appointmentTime: "11:00:00", type: "eye_test" as const, status: "scheduled" as const, notes: "Annual checkup" },
    { patientId: 7, appointmentDate: today, appointmentTime: "14:00:00", type: "consultation" as const, status: "scheduled" as const, notes: "Digital eye strain" },
    { patientId: 12, appointmentDate: today, appointmentTime: "16:30:00", type: "frame_fitting" as const, status: "scheduled" as const },
    { patientId: 9, appointmentDate: new Date(today.getTime() + 86400000), appointmentTime: "10:00:00", type: "eye_test" as const, status: "scheduled" as const },
    { patientId: 6, appointmentDate: new Date(today.getTime() + 86400000), appointmentTime: "12:00:00", type: "lens_fitting" as const, status: "scheduled" as const },
    { patientId: 11, appointmentDate: new Date(today.getTime() + 86400000), appointmentTime: "15:00:00", type: "follow_up" as const, status: "scheduled" as const, notes: "Diabetic eye check" },
  ]);
  console.log("Appointments seeded");

  // ─── Sales ───────────────────────────────────────────────────
  const salesData = [
    { invoiceNumber: "INV-202601-00001", patientId: 1, userId: 2, subtotal: "8500.00", grandTotal: "8500.00", paymentMode: "cash" as const, paymentStatus: "paid" as const, amountPaid: "8500.00", createdAt: new Date("2026-01-15") },
    { invoiceNumber: "INV-202601-00002", patientId: 2, userId: 2, subtotal: "10400.00", discountType: "percentage" as const, discountValue: "5", discountAmount: "520.00", grandTotal: "9880.00", paymentMode: "card" as const, paymentStatus: "paid" as const, amountPaid: "9880.00", createdAt: new Date("2026-01-18") },
    { invoiceNumber: "INV-202601-00003", patientId: 3, userId: 2, subtotal: "2500.00", grandTotal: "2500.00", paymentMode: "cash" as const, paymentStatus: "paid" as const, amountPaid: "2500.00", createdAt: new Date("2026-01-20") },
    { invoiceNumber: "INV-202602-00004", patientId: 4, userId: 2, subtotal: "30500.00", grandTotal: "30500.00", paymentMode: "online_transfer" as const, paymentStatus: "paid" as const, amountPaid: "30500.00", createdAt: new Date("2026-02-05") },
    { invoiceNumber: "INV-202602-00005", patientId: 5, userId: 2, subtotal: "6000.00", discountType: "fixed" as const, discountValue: "500", discountAmount: "500.00", grandTotal: "5500.00", paymentMode: "cash" as const, paymentStatus: "paid" as const, amountPaid: "5500.00", createdAt: new Date("2026-02-08") },
    { invoiceNumber: "INV-202603-00006", userId: 2, subtotal: "950.00", grandTotal: "950.00", paymentMode: "cash" as const, paymentStatus: "paid" as const, amountPaid: "950.00", createdAt: new Date("2026-03-10") },
    { invoiceNumber: "INV-202603-00007", patientId: 6, userId: 2, subtotal: "9200.00", grandTotal: "9200.00", paymentMode: "card" as const, paymentStatus: "paid" as const, amountPaid: "9200.00", createdAt: new Date("2026-03-15") },
    { invoiceNumber: "INV-202604-00008", patientId: 7, userId: 2, subtotal: "5800.00", grandTotal: "5800.00", paymentMode: "cash" as const, paymentStatus: "paid" as const, amountPaid: "5800.00", createdAt: new Date("2026-04-02") },
    { invoiceNumber: "INV-202604-00009", patientId: 8, userId: 2, subtotal: "2500.00", grandTotal: "2500.00", paymentMode: "online_transfer" as const, paymentStatus: "paid" as const, amountPaid: "2500.00", createdAt: new Date("2026-04-10") },
    { invoiceNumber: "INV-202605-00010", patientId: 9, userId: 2, subtotal: "3500.00", grandTotal: "3500.00", paymentMode: "cash" as const, paymentStatus: "paid" as const, amountPaid: "3500.00", createdAt: new Date("2026-05-05") },
    { invoiceNumber: "INV-202605-00011", patientId: 10, userId: 2, subtotal: "8300.00", grandTotal: "8300.00", paymentMode: "card" as const, paymentStatus: "paid" as const, amountPaid: "8300.00", createdAt: new Date("2026-05-12") },
    { invoiceNumber: "INV-202606-00012", patientId: 11, userId: 2, subtotal: "10500.00", grandTotal: "10500.00", paymentMode: "cash" as const, paymentStatus: "paid" as const, amountPaid: "10500.00", createdAt: new Date("2026-06-05") },
    { invoiceNumber: "INV-202606-00013", patientId: 12, userId: 2, subtotal: "7200.00", taxRate: "18", taxAmount: "1296.00", grandTotal: "8496.00", paymentMode: "online_transfer" as const, paymentStatus: "paid" as const, amountPaid: "8496.00", createdAt: new Date("2026-06-15") },
    { invoiceNumber: "INV-202606-00014", patientId: 13, userId: 2, subtotal: "5800.00", grandTotal: "5800.00", paymentMode: "cash" as const, paymentStatus: "paid" as const, amountPaid: "5800.00", createdAt: new Date("2026-06-20") },
    { invoiceNumber: "INV-202606-00015", patientId: 14, userId: 2, subtotal: "3500.00", grandTotal: "3500.00", paymentMode: "cash" as const, paymentStatus: "paid" as const, amountPaid: "3500.00", createdAt: new Date("2026-06-22") },
    { invoiceNumber: "INV-202606-00016", patientId: 15, userId: 2, subtotal: "8500.00", discountType: "percentage" as const, discountValue: "10", discountAmount: "850.00", grandTotal: "7650.00", paymentMode: "card" as const, paymentStatus: "paid" as const, amountPaid: "7650.00", createdAt: new Date("2026-06-23") },
    { invoiceNumber: "INV-202606-00017", userId: 2, subtotal: "1200.00", grandTotal: "1200.00", paymentMode: "cash" as const, paymentStatus: "paid" as const, amountPaid: "1200.00", createdAt: new Date("2026-06-23") },
    { invoiceNumber: "INV-202606-00018", patientId: 1, userId: 2, subtotal: "2500.00", grandTotal: "2500.00", paymentMode: "cash" as const, paymentStatus: "paid" as const, amountPaid: "2500.00", createdAt: new Date("2026-06-24") },
  ];

  for (const sale of salesData) {
    await db.insert(schema.sales).values(sale);
  }
  console.log("Sales seeded");

  // ─── Sale Items ──────────────────────────────────────────────
  const saleItemsData = [
    { saleId: 1, productId: 2, quantity: 1, unitPrice: "7900.00", totalPrice: "7900.00" },
    { saleId: 1, productId: 15, quantity: 2, unitPrice: "300.00", totalPrice: "600.00" },
    { saleId: 2, productId: 6, quantity: 1, unitPrice: "6000.00", totalPrice: "6000.00" },
    { saleId: 2, productId: 13, quantity: 1, unitPrice: "2500.00", totalPrice: "2500.00" },
    { saleId: 2, productId: 17, quantity: 1, unitPrice: "400.00", totalPrice: "400.00" },
    { saleId: 3, productId: 10, quantity: 1, unitPrice: "2500.00", totalPrice: "2500.00" },
    { saleId: 4, productId: 4, quantity: 1, unitPrice: "22000.00", totalPrice: "22000.00" },
    { saleId: 4, productId: 11, quantity: 1, unitPrice: "5800.00", totalPrice: "5800.00" },
    { saleId: 4, productId: 17, quantity: 3, unitPrice: "400.00", totalPrice: "1200.00" },
    { saleId: 4, productId: 15, quantity: 5, unitPrice: "300.00", totalPrice: "1500.00" },
    { saleId: 5, productId: 8, quantity: 1, unitPrice: "9200.00", totalPrice: "9200.00" },
    { saleId: 5, productId: 13, quantity: 2, unitPrice: "2500.00", totalPrice: "5000.00" },
    { saleId: 6, productId: 16, quantity: 1, unitPrice: "950.00", totalPrice: "950.00" },
    { saleId: 7, productId: 3, quantity: 1, unitPrice: "10500.00", totalPrice: "10500.00" },
    { saleId: 7, productId: 17, quantity: 2, unitPrice: "400.00", totalPrice: "800.00" },
    { saleId: 8, productId: 6, quantity: 1, unitPrice: "6000.00", totalPrice: "6000.00" },
    { saleId: 8, productId: 15, quantity: 2, unitPrice: "300.00", totalPrice: "600.00" },
    { saleId: 9, productId: 10, quantity: 1, unitPrice: "2500.00", totalPrice: "2500.00" },
    { saleId: 10, productId: 7, quantity: 1, unitPrice: "3500.00", totalPrice: "3500.00" },
    { saleId: 11, productId: 2, quantity: 1, unitPrice: "7900.00", totalPrice: "7900.00" },
    { saleId: 11, productId: 15, quantity: 1, unitPrice: "300.00", totalPrice: "300.00" },
    { saleId: 12, productId: 1, quantity: 1, unitPrice: "8500.00", totalPrice: "8500.00" },
    { saleId: 12, productId: 14, quantity: 5, unitPrice: "400.00", totalPrice: "2000.00" },
    { saleId: 13, productId: 5, quantity: 1, unitPrice: "28000.00", totalPrice: "28000.00" },
    { saleId: 13, productId: 12, quantity: 1, unitPrice: "7500.00", totalPrice: "7500.00" },
    { saleId: 13, productId: 17, quantity: 3, unitPrice: "400.00", totalPrice: "1200.00" },
    { saleId: 14, productId: 6, quantity: 1, unitPrice: "6000.00", totalPrice: "6000.00" },
    { saleId: 15, productId: 7, quantity: 1, unitPrice: "3500.00", totalPrice: "3500.00" },
    { saleId: 16, productId: 4, quantity: 1, unitPrice: "22000.00", totalPrice: "22000.00" },
    { saleId: 16, productId: 15, quantity: 5, unitPrice: "300.00", totalPrice: "1500.00" },
    { saleId: 17, productId: 13, quantity: 2, unitPrice: "2500.00", totalPrice: "5000.00" },
    { saleId: 17, productId: 15, quantity: 2, unitPrice: "300.00", totalPrice: "600.00" },
    { saleId: 18, productId: 10, quantity: 1, unitPrice: "2500.00", totalPrice: "2500.00" },
  ];

  for (const item of saleItemsData) {
    await db.insert(schema.saleItems).values(item);
  }
  console.log("Sale items seeded");

  // ─── Internal Use Records ────────────────────────────────────
  await db.insert(schema.internalUse).values([
    { userId: 3, productId: 29, quantity: 1, reason: "Patient eye testing", date: new Date("2026-06-20") },
    { userId: 3, productId: 30, quantity: 1, reason: "Daily trial use", date: new Date("2026-06-21") },
    { userId: 3, productId: 32, quantity: 1, reason: "PD measurement", date: new Date("2026-06-22") },
    { userId: 2, productId: 31, quantity: 2, reason: "General cleaning", date: new Date("2026-06-23") },
  ]);
  console.log("Internal use records seeded");

  // ─── Supplier Payments ───────────────────────────────────────
  await db.insert(schema.supplierPayments).values([
    { supplierId: 1, amount: "50000.00", paymentMode: "online_transfer" as const, referenceNo: "TRX-202601-001", paidBy: 1 },
    { supplierId: 2, amount: "30000.00", paymentMode: "cash" as const, paidBy: 1 },
    { supplierId: 3, amount: "100000.00", paymentMode: "online_transfer" as const, referenceNo: "TRX-202602-001", paidBy: 1 },
  ]);
  console.log("Supplier payments seeded");

  console.log("Seeding complete!");
  process.exit(0);
}

seed();
