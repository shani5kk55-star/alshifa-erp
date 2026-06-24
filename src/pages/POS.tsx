import { useState, useRef, useEffect } from "react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  X,
  UserPlus,
  ShoppingCart,
  Stethoscope,
} from "lucide-react";

interface CartItem {
  productId: number;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  stock: number;
  prescription?: {
    odSph?: string;
    odCyl?: string;
    odAxis?: number;
    odAdd?: string;
    osSph?: string;
    osCyl?: string;
    osAxis?: number;
    osAdd?: string;
    pd?: string;
    lensType?: "single_vision" | "bifocal" | "progressive";
  };
}

export default function POS() {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  // Search states
  const [patientSearch, setPatientSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [showPatientResults, setShowPatientResults] = useState(false);
  const [showProductResults, setShowProductResults] = useState(false);

  // Selection states
  const [selectedPatient, setSelectedPatient] = useState<{ id: number; name: string; phone: string } | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Prescription state
  const [showRxModal, setShowRxModal] = useState(false);
  const [rxItemIndex, setRxItemIndex] = useState<number | null>(null);
  const [rxForm, setRxForm] = useState({
    odSph: "", odCyl: "", odAxis: "", odAdd: "",
    osSph: "", osCyl: "", osAxis: "", osAdd: "",
    pd: "", lensType: "single_vision" as const,
  });

  // Checkout state
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [paymentMode, setPaymentMode] = useState<"cash" | "card" | "online_transfer">("cash");
  const [amountPaid, setAmountPaid] = useState(0);
  const [notes, setNotes] = useState("");

  // New patient modal
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [newPatientForm, setNewPatientForm] = useState({ name: "", phone: "", age: "", gender: "male" as const, address: "" });

  // Queries
  const { data: patientResults } = trpc.patient.search.useQuery(
    { query: patientSearch },
    { enabled: patientSearch.length > 2 }
  );
  const { data: productResults } = trpc.product.list.useQuery(
    { search: productSearch, limit: 10 },
    { enabled: productSearch.length > 1 }
  );

  // Mutations
  const createSale = trpc.sale.create.useMutation({
    onSuccess: () => {
      utils.dashboard.getStats.invalidate();
      utils.sale.getTodaySales.invalidate();
      setCart([]);
      setSelectedPatient(null);
      setDiscountValue(0);
      setTaxRate(0);
      setAmountPaid(0);
      setNotes("");
      alert("Sale completed successfully!");
    },
  });

  const createPatient = trpc.patient.create.useMutation({
    onSuccess: (data) => {
      if (data) {
        setSelectedPatient({ id: data.insertId || 0, name: newPatientForm.name, phone: newPatientForm.phone });
        setShowNewPatient(false);
        setNewPatientForm({ name: "", phone: "", age: "", gender: "male", address: "" });
      }
    },
  });

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = discountType === "percentage" ? (subtotal * discountValue) / 100 : discountValue;
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = (afterDiscount * taxRate) / 100;
  const grandTotal = afterDiscount + taxAmount;

  const addToCart = (product: { id: number; name: string; sku: string; sellingPrice: string | number; quantity: number }) => {
    const price = typeof product.sellingPrice === "string" ? parseFloat(product.sellingPrice) : product.sellingPrice;
    const existing = cart.find((item) => item.productId === product.id);
    if (existing) {
      if (existing.quantity < product.quantity) {
        setCart(cart.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ));
      }
    } else {
      setCart([...cart, { productId: product.id, name: product.name, sku: product.sku, price, quantity: 1, stock: product.quantity }]);
    }
    setProductSearch("");
    setShowProductResults(false);
  };

  const updateQty = (index: number, delta: number) => {
    setCart(cart.map((item, i) => {
      if (i !== index) return item;
      const newQty = Math.max(1, Math.min(item.stock, item.quantity + delta));
      return { ...item, quantity: newQty };
    }));
  };

  const removeItem = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const openRxModal = (index: number) => {
    setRxItemIndex(index);
    const existing = cart[index].prescription;
    if (existing) {
      setRxForm({
        odSph: existing.odSph || "", odCyl: existing.odCyl || "", odAxis: existing.odAxis?.toString() || "", odAdd: existing.odAdd || "",
        osSph: existing.osSph || "", osCyl: existing.osCyl || "", osAxis: existing.osAxis?.toString() || "", osAdd: existing.osAdd || "",
        pd: existing.pd || "", lensType: existing.lensType || "single_vision",
      });
    } else {
      setRxForm({ odSph: "", odCyl: "", odAxis: "", odAdd: "", osSph: "", osCyl: "", osAxis: "", osAdd: "", pd: "", lensType: "single_vision" });
    }
    setShowRxModal(true);
  };

  const saveRx = () => {
    if (rxItemIndex === null) return;
    setCart(cart.map((item, i) =>
      i === rxItemIndex ? {
        ...item,
        prescription: {
          odSph: rxForm.odSph || undefined,
          odCyl: rxForm.odCyl || undefined,
          odAxis: rxForm.odAxis ? parseInt(rxForm.odAxis) : undefined,
          odAdd: rxForm.odAdd || undefined,
          osSph: rxForm.osSph || undefined,
          osCyl: rxForm.osCyl || undefined,
          osAxis: rxForm.osAxis ? parseInt(rxForm.osAxis) : undefined,
          osAdd: rxForm.osAdd || undefined,
          pd: rxForm.pd || undefined,
          lensType: rxForm.lensType,
        },
      } : item
    ));
    setShowRxModal(false);
    setRxItemIndex(null);
  };

  const completeSale = () => {
    if (cart.length === 0) return;
    createSale.mutate({
      patientId: selectedPatient?.id,
      items: cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.price,
        prescription: item.prescription,
      })),
      discountType: discountValue > 0 ? discountType : undefined,
      discountValue,
      taxRate,
      paymentMode,
      amountPaid: amountPaid || grandTotal,
      notes: notes || undefined,
    });
  };

  return (
    <div className="h-full">
      <h1 className="text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>Point of Sale</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4" style={{ height: "calc(100vh - 140px)" }}>
        {/* Left - Patient Selection */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="card-dark">
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>Patient</h3>
            {selectedPatient ? (
              <div className="p-3 rounded-lg" style={{ background: "var(--surface-secondary)" }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{selectedPatient.name}</div>
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>{selectedPatient.phone}</div>
                  </div>
                  <button onClick={() => setSelectedPatient(null)} className="p-1 rounded hover:bg-white/5">
                    <X className="w-3 h-3" style={{ color: "var(--text-muted)" }} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
                <input
                  type="text"
                  value={patientSearch}
                  onChange={(e) => { setPatientSearch(e.target.value); setShowPatientResults(true); }}
                  placeholder="Search patient by name or phone"
                  className="form-input pl-9"
                />
                {showPatientResults && patientResults && patientResults.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 rounded-lg overflow-hidden" style={{ background: "var(--surface-elevated)", border: "1px solid var(--border-subtle)" }}>
                    {patientResults.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => { setSelectedPatient({ id: p.id, name: p.name, phone: p.phone }); setPatientSearch(""); setShowPatientResults(false); }}
                        className="w-full text-left px-3 py-2 hover:bg-white/5 transition-colors"
                      >
                        <div className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{p.name}</div>
                        <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>{p.phone} | {p.patientCode}</div>
                      </button>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => setShowNewPatient(true)}
                  className="btn-secondary w-full mt-2 btn-sm"
                >
                  <UserPlus className="w-3 h-3" /> New Patient
                </button>
              </div>
            )}
          </div>

          {/* Product Search */}
          <div className="card-dark flex-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>Add Products</h3>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => { setProductSearch(e.target.value); setShowProductResults(true); }}
                placeholder="Search by name, SKU, or scan barcode"
                className="form-input pl-9"
              />
              {showProductResults && productResults?.items && productResults.items.length > 0 && (
                <div className="absolute z-20 w-full mt-1 rounded-lg overflow-hidden max-h-60 overflow-y-auto" style={{ background: "var(--surface-elevated)", border: "1px solid var(--border-subtle)" }}>
                  {productResults.items.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => addToCart(p)}
                      className="w-full text-left px-3 py-2 hover:bg-white/5 transition-colors flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{p.name}</div>
                        <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>{p.sku} | Stock: {p.quantity}</div>
                      </div>
                      <div className="text-xs font-semibold" style={{ color: "var(--accent-gold)" }}>Rs. {Number(p.sellingPrice).toLocaleString()}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick category buttons */}
            <div className="flex flex-wrap gap-1">
              {["Frames", "Lenses", "Solutions", "Accessories"].map((cat) => (
                <button key={cat} className="btn-secondary btn-sm" style={{ fontSize: 10, padding: "2px 8px" }}>{cat}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Center - Cart */}
        <div className="lg:col-span-5 card-dark flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Cart ({cart.length} items)
            </h3>
            {cart.length > 0 && (
              <button onClick={() => setCart([])} className="text-xs" style={{ color: "var(--status-danger)" }}>
                Clear All
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48">
                <ShoppingCart className="w-10 h-10 mb-2" style={{ color: "var(--text-muted)" }} />
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Cart is empty</p>
                <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Search and add products</p>
              </div>
            ) : (
              <div className="space-y-2">
                {cart.map((item, index) => (
                  <div key={index} className="p-3 rounded-lg" style={{ background: "var(--surface-secondary)" }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>{item.name}</div>
                        <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>{item.sku}</div>
                      </div>
                      <div className="text-xs font-semibold" style={{ color: "var(--accent-gold)" }}>
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQty(index, -1)} className="w-6 h-6 rounded flex items-center justify-center" style={{ background: "var(--border-subtle)" }}>
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQty(index, 1)} className="w-6 h-6 rounded flex items-center justify-center" style={{ background: "var(--border-subtle)" }}>
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openRxModal(index)}
                          className="btn-sm btn-secondary"
                          style={item.prescription ? { borderColor: "var(--accent-gold)", color: "var(--accent-gold)" } : {}}
                        >
                          <Stethoscope className="w-3 h-3" /> Rx
                        </button>
                        <button onClick={() => removeItem(index)} className="p-1 rounded hover:bg-red-500/10">
                          <Trash2 className="w-3 h-3" style={{ color: "var(--status-danger)" }} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Totals */}
          {cart.length > 0 && (
            <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: "var(--text-secondary)" }}>Subtotal</span>
                <span style={{ color: "var(--text-primary)" }}>Rs. {subtotal.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: "var(--text-secondary)" }}>Discount</span>
                  <span style={{ color: "var(--status-success)" }}>-Rs. {discountAmount.toLocaleString()}</span>
                </div>
              )}
              {taxAmount > 0 && (
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: "var(--text-secondary)" }}>Tax ({taxRate}%)</span>
                  <span style={{ color: "var(--text-primary)" }}>+Rs. {taxAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold mt-2 pt-2" style={{ borderTop: "1px solid var(--border-subtle)", color: "var(--accent-gold)" }}>
                <span>Grand Total</span>
                <span>Rs. {grandTotal.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right - Checkout */}
        <div className="lg:col-span-4 card-dark">
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>Checkout</h3>

          {/* Discount */}
          <div className="mb-4">
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Discount</label>
            <div className="flex gap-2">
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as "percentage" | "fixed")}
                className="form-input"
                style={{ width: 100 }}
              >
                <option value="percentage">%</option>
                <option value="fixed">Fixed</option>
              </select>
              <input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                className="form-input flex-1"
                placeholder="0"
                min={0}
              />
            </div>
          </div>

          {/* Tax */}
          <div className="mb-4">
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>GST / Tax (%)</label>
            <input
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
              className="form-input"
              placeholder="0"
              min={0}
            />
          </div>

          {/* Payment Mode */}
          <div className="mb-4">
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Payment Mode</label>
            <div className="grid grid-cols-3 gap-2">
              {(["cash", "card", "online_transfer"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setPaymentMode(mode)}
                  className={`py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                    paymentMode === mode ? "btn-primary" : "btn-secondary"
                  }`}
                >
                  {mode.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Amount Paid */}
          <div className="mb-4">
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Amount Paid (Rs.)</label>
            <input
              type="number"
              value={amountPaid || ""}
              onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
              className="form-input"
              placeholder={grandTotal.toString()}
            />
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="form-input"
              style={{ minHeight: 60, padding: 8 }}
              placeholder="Optional notes..."
            />
          </div>

          {/* Grand Total Display */}
          <div className="p-4 rounded-lg mb-4 text-center" style={{ background: "var(--accent-gold-muted)" }}>
            <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Grand Total</div>
            <div className="text-2xl font-bold" style={{ color: "var(--accent-gold)" }}>Rs. {grandTotal.toLocaleString()}</div>
            {amountPaid > 0 && amountPaid !== grandTotal && (
              <div className="text-xs mt-1" style={{ color: amountPaid >= grandTotal ? "var(--status-success)" : "var(--status-warning)" }}>
                Change: Rs. {(amountPaid - grandTotal).toLocaleString()}
              </div>
            )}
          </div>

          {/* Complete Sale */}
          <button
            onClick={completeSale}
            disabled={cart.length === 0 || createSale.isPending}
            className="btn-primary w-full h-11 text-sm"
          >
            {createSale.isPending ? "Processing..." : (
              <>
                <Printer className="w-4 h-4" /> Complete Sale & Print
              </>
            )}
          </button>
        </div>
      </div>

      {/* Rx Modal */}
      {showRxModal && rxItemIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="card-dark w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Prescription - {cart[rxItemIndex]?.name}
              </h3>
              <button onClick={() => setShowRxModal(false)}><X className="w-4 h-4" style={{ color: "var(--text-muted)" }} /></button>
            </div>

            {/* OD */}
            <div className="mb-4">
              <h4 className="text-xs font-semibold mb-2" style={{ color: "var(--accent-gold)" }}>Right Eye (OD)</h4>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-[10px] mb-1" style={{ color: "var(--text-muted)" }}>SPH</label>
                  <input value={rxForm.odSph} onChange={(e) => setRxForm({ ...rxForm, odSph: e.target.value })} className="form-input" placeholder="-2.50" />
                </div>
                <div>
                  <label className="block text-[10px] mb-1" style={{ color: "var(--text-muted)" }}>CYL</label>
                  <input value={rxForm.odCyl} onChange={(e) => setRxForm({ ...rxForm, odCyl: e.target.value })} className="form-input" placeholder="-0.75" />
                </div>
                <div>
                  <label className="block text-[10px] mb-1" style={{ color: "var(--text-muted)" }}>Axis</label>
                  <input value={rxForm.odAxis} onChange={(e) => setRxForm({ ...rxForm, odAxis: e.target.value })} className="form-input" placeholder="180" />
                </div>
                <div>
                  <label className="block text-[10px] mb-1" style={{ color: "var(--text-muted)" }}>ADD</label>
                  <input value={rxForm.odAdd} onChange={(e) => setRxForm({ ...rxForm, odAdd: e.target.value })} className="form-input" placeholder="+2.00" />
                </div>
              </div>
            </div>

            {/* OS */}
            <div className="mb-4">
              <h4 className="text-xs font-semibold mb-2" style={{ color: "var(--accent-gold)" }}>Left Eye (OS)</h4>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-[10px] mb-1" style={{ color: "var(--text-muted)" }}>SPH</label>
                  <input value={rxForm.osSph} onChange={(e) => setRxForm({ ...rxForm, osSph: e.target.value })} className="form-input" placeholder="-2.25" />
                </div>
                <div>
                  <label className="block text-[10px] mb-1" style={{ color: "var(--text-muted)" }}>CYL</label>
                  <input value={rxForm.osCyl} onChange={(e) => setRxForm({ ...rxForm, osCyl: e.target.value })} className="form-input" placeholder="-1.00" />
                </div>
                <div>
                  <label className="block text-[10px] mb-1" style={{ color: "var(--text-muted)" }}>Axis</label>
                  <input value={rxForm.osAxis} onChange={(e) => setRxForm({ ...rxForm, osAxis: e.target.value })} className="form-input" placeholder="170" />
                </div>
                <div>
                  <label className="block text-[10px] mb-1" style={{ color: "var(--text-muted)" }}>ADD</label>
                  <input value={rxForm.osAdd} onChange={(e) => setRxForm({ ...rxForm, osAdd: e.target.value })} className="form-input" placeholder="+2.00" />
                </div>
              </div>
            </div>

            {/* PD & Lens Type */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs mb-1" style={{ color: "var(--text-secondary)" }}>PD (mm)</label>
                <input value={rxForm.pd} onChange={(e) => setRxForm({ ...rxForm, pd: e.target.value })} className="form-input" placeholder="62" />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "var(--text-secondary)" }}>Lens Type</label>
                <select value={rxForm.lensType} onChange={(e) => setRxForm({ ...rxForm, lensType: e.target.value as "single_vision" | "bifocal" | "progressive" })} className="form-input">
                  <option value="single_vision">Single Vision</option>
                  <option value="bifocal">Bifocal</option>
                  <option value="progressive">Progressive</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowRxModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={saveRx} className="btn-primary">Save Prescription</button>
            </div>
          </div>
        </div>
      )}

      {/* New Patient Modal */}
      {showNewPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="card-dark w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>New Patient</h3>
              <button onClick={() => setShowNewPatient(false)}><X className="w-4 h-4" style={{ color: "var(--text-muted)" }} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Name *</label>
                <input value={newPatientForm.name} onChange={(e) => setNewPatientForm({ ...newPatientForm, name: e.target.value })} className="form-input" placeholder="Full name" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Phone *</label>
                <input value={newPatientForm.phone} onChange={(e) => setNewPatientForm({ ...newPatientForm, phone: e.target.value })} className="form-input" placeholder="03XXXXXXXXX" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Age</label>
                  <input value={newPatientForm.age} onChange={(e) => setNewPatientForm({ ...newPatientForm, age: e.target.value })} className="form-input" type="number" placeholder="Age" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Gender</label>
                  <select value={newPatientForm.gender} onChange={(e) => setNewPatientForm({ ...newPatientForm, gender: e.target.value as "male" | "female" | "other" })} className="form-input">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Address</label>
                <textarea value={newPatientForm.address} onChange={(e) => setNewPatientForm({ ...newPatientForm, address: e.target.value })} className="form-input" style={{ minHeight: 60, padding: 8 }} placeholder="Address" />
              </div>
              <button
                onClick={() => createPatient.mutate(newPatientForm)}
                disabled={!newPatientForm.name || !newPatientForm.phone || createPatient.isPending}
                className="btn-primary w-full"
              >
                {createPatient.isPending ? "Creating..." : "Create Patient"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
