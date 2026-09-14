import { useState, useEffect } from "react";

export default function Home() {
  const [invoiceNumber, setInvoiceNumber] = useState("INV-001");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("Unpaid");
  const [fromName, setFromName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [toName, setToName] = useState("");
  const [toEmail, setToEmail] = useState("");
  const [items, setItems] = useState([
    { id: 1, description: "", quantity: 1, price: 0 }
  ]);
  const [taxRate, setTaxRate] = useState(0);
  const [notes, setNotes] = useState("Thank you for your business.");
  const [currency, setCurrency] = useState("USD");
  const [darkMode, setDarkMode] = useState(false);
  const [logo, setLogo] = useState(null);
  const [savedInvoices, setSavedInvoices] = useState([]);
  const [showSaved, setShowSaved] = useState(false);

  const currencies = ["USD", "NGN", "EUR", "GBP", "CAD", "AUD"];

  useEffect(() => {
    const draft = localStorage.getItem("invoice-draft");
    const saved = localStorage.getItem("saved-invoices");
    const savedLogo = localStorage.getItem("invoice-logo");
    const lastNumber = localStorage.getItem("last-invoice-number");

    if (draft) {
      try {
        const data = JSON.parse(draft);
        setInvoiceNumber(data.invoiceNumber || getNextInvoiceNumber(lastNumber));
        setDate(data.date || new Date().toISOString().slice(0, 10));
        setDueDate(data.dueDate || "");
        setStatus(data.status || "Unpaid");
        setFromName(data.fromName || "");
        setFromEmail(data.fromEmail || "");
        setToName(data.toName || "");
        setToEmail(data.toEmail || "");
        setItems(data.items || [{ id: 1, description: "", quantity: 1, price: 0 }]);
        setTaxRate(data.taxRate || 0);
        setNotes(data.notes || "Thank you for your business.");
        setCurrency(data.currency || "USD");
        setDarkMode(data.darkMode || false);
      } catch (e) {}
    } else if (lastNumber) {
      setInvoiceNumber(getNextInvoiceNumber(lastNumber));
    }

    if (saved) {
      try {
        setSavedInvoices(JSON.parse(saved));
      } catch (e) {}
    }

    if (savedLogo) setLogo(savedLogo);
  }, []);

  useEffect(() => {
    const data = {
      invoiceNumber, date, dueDate, status, fromName, fromEmail,
      toName, toEmail, items, taxRate, notes, currency, darkMode
    };
    localStorage.setItem("invoice-draft", JSON.stringify(data));
  }, [invoiceNumber, date, dueDate, status, fromName, fromEmail, toName, toEmail, items, taxRate, notes, currency, darkMode]);

  useEffect(() => {
    localStorage.setItem("saved-invoices", JSON.stringify(savedInvoices));
  }, [savedInvoices]);

  // Auto status: Overdue if unpaid and past due date
  useEffect(() => {
    if (status === "Paid") return;
    if (!dueDate) {
      if (status === "Overdue") setStatus("Unpaid");
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    if (dueDate < today && status !== "Overdue") {
      setStatus("Overdue");
    } else if (dueDate >= today && status === "Overdue") {
      setStatus("Unpaid");
    }
  }, [dueDate, status]);

  function getNextInvoiceNumber(last = null) {
    if (!last) return "INV-001";
    const num = parseInt(String(last).replace(/\D/g, ""), 10);
    if (isNaN(num)) return "INV-001";
    return "INV-" + String(num + 1).padStart(3, "0");
  }

  function addItem() {
    setItems([...items, { id: Date.now(), description: "", quantity: 1, price: 0 }]);
  }

  function updateItem(id, field, value) {
    setItems(items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  }

  function removeItem(id) {
    if (items.length === 1) return;
    setItems(items.filter(item => item.id !== id));
  }

  const subtotal = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.price)), 0);
  const taxAmount = subtotal * (Number(taxRate) / 100);
  const total = subtotal + taxAmount;

  function handlePrint() {
    window.print();
  }

  function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setLogo(reader.result);
      localStorage.setItem("invoice-logo", reader.result);
    };
    reader.readAsDataURL(file);
  }

  function removeLogo() {
    setLogo(null);
    localStorage.removeItem("invoice-logo");
  }

  function saveInvoice() {
    const invoice = {
      id: Date.now(),
      invoiceNumber,
      date,
      dueDate,
      status,
      fromName,
      fromEmail,
      toName,
      toEmail,
      items,
      taxRate,
      notes,
      currency,
      subtotal,
      taxAmount,
      total,
      logo
    };
    setSavedInvoices([invoice, ...savedInvoices]);
    localStorage.setItem("last-invoice-number", invoiceNumber);
    alert("Invoice saved successfully");
  }

  function loadInvoice(invoice) {
    setInvoiceNumber(invoice.invoiceNumber);
    setDate(invoice.date);
    setDueDate(invoice.dueDate || "");
    setStatus(invoice.status || "Unpaid");
    setFromName(invoice.fromName);
    setFromEmail(invoice.fromEmail);
    setToName(invoice.toName);
    setToEmail(invoice.toEmail);
    setItems(invoice.items);
    setTaxRate(invoice.taxRate);
    setNotes(invoice.notes);
    setCurrency(invoice.currency);
    if (invoice.logo) setLogo(invoice.logo);
    setShowSaved(false);
  }

  function deleteSavedInvoice(id) {
    if (!confirm("Delete this saved invoice?")) return;
    setSavedInvoices(savedInvoices.filter(inv => inv.id !== id));
  }

  function clearInvoice() {
    if (!confirm("Clear this invoice?")) return;
    const lastNumber = localStorage.getItem("last-invoice-number");
    setInvoiceNumber(getNextInvoiceNumber(lastNumber || invoiceNumber));
    setDate(new Date().toISOString().slice(0, 10));
    setDueDate("");
    setStatus("Unpaid");
    setFromName("");
    setFromEmail("");
    setToName("");
    setToEmail("");
    setItems([{ id: 1, description: "", quantity: 1, price: 0 }]);
    setTaxRate(0);
    setNotes("Thank you for your business.");
  }

  const bg = darkMode ? "#0b1220" : "#f8fafc";
  const card = darkMode ? "#111827" : "#ffffff";
  const text = darkMode ? "#f8fafc" : "#0f172a";
  const muted = darkMode ? "#94a3b8" : "#64748b";
  const border = darkMode ? "#1f2937" : "#e2e8f0";
  const inputBg = darkMode ? "#0b1220" : "#ffffff";

  const statusColor =
    status === "Paid" ? "#16a34a" :
    status === "Overdue" ? "#ea580c" :
    "#dc2626";

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: bg,
      color: text,
      fontFamily: "system-ui, -apple-system, sans-serif",
      padding: "20px 16px"
    }}>
      <div style={{ maxWidth: "880px", margin: "0 auto" }}>
        
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          gap: "10px",
          flexWrap: "wrap"
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "26px", fontWeight: "700" }}>Invoice Generator</h1>
            <p style={{ margin: "4px 0 0 0", color: muted, fontSize: "14px" }}>Create clean invoices in seconds</p>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              padding: "8px 14px",
              borderRadius: "999px",
              border: `1px solid ${border}`,
              background: card,
              color: text,
              cursor: "pointer"
            }}
          >
            {darkMode ? "Light" : "Dark"}
          </button>
        </div>

        <div style={{ display: "flex", gap: "10px", marginBottom: "18px", flexWrap: "wrap" }}>
          <button onClick={handlePrint} style={btnPrimary}>Print / Save PDF</button>
          <button onClick={saveInvoice} style={btnSuccess}>Save Invoice</button>
          <button onClick={() => setShowSaved(!showSaved)} style={{...btnSecondary, background: card, color: text, border: `1px solid ${border}`}}>
            {showSaved ? "Hide Saved" : "Saved Invoices"}
          </button>
          <button onClick={clearInvoice} style={btnDanger}>Clear</button>
        </div>

        {showSaved && (
          <div style={{
            backgroundColor: card,
            borderRadius: "14px",
            padding: "16px",
            marginBottom: "18px",
            border: `1px solid ${border}`
          }}>
            <h3 style={{ marginTop: 0 }}>Saved Invoices</h3>
            {savedInvoices.length === 0 ? (
              <p style={{ color: muted }}>No saved invoices yet</p>
            ) : (
              savedInvoices.map(inv => (
                <div key={inv.id} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom: `1px solid ${border}`,
                  gap: "10px",
                  flexWrap: "wrap"
                }}>
                  <div>
                    <strong>{inv.invoiceNumber}</strong> — {inv.toName || "No client"} — {inv.currency} {Number(inv.total).toFixed(2)}
                    <div style={{ fontSize: "12px", color: muted }}>{inv.status || "Unpaid"}</div>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => loadInvoice(inv)} style={{...btnSmall, background: "#2563eb", color: "white"}}>Load</button>
                    <button onClick={() => deleteSavedInvoice(inv.id)} style={{...btnSmall, background: "#dc2626", color: "white"}}>Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <div className="invoice-print" style={{
          backgroundColor: card,
          borderRadius: "18px",
          padding: "28px",
          border: `1px solid ${border}`,
          marginBottom: "24px",
          boxShadow: darkMode ? "none" : "0 8px 24px rgba(15, 23, 42, 0.04)"
        }}>
          
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "20px",
            marginBottom: "28px",
            flexWrap: "wrap"
          }}>
            <div>
              {logo ? (
                <div>
                  <img src={logo} alt="Logo" style={{ maxHeight: "70px", maxWidth: "180px", objectFit: "contain" }} />
                  <div>
                    <button onClick={removeLogo} className="no-print" style={{ marginTop: "6px", fontSize: "12px", color: "#dc2626", background: "none", border: "none", cursor: "pointer" }}>
                      Remove logo
                    </button>
                  </div>
                </div>
              ) : (
                <label className="no-print" style={{
                  display: "inline-block",
                  padding: "22px",
                  border: `2px dashed ${border}`,
                  borderRadius: "12px",
                  cursor: "pointer",
                  color: muted,
                  fontSize: "14px"
                }}>
                  Upload Logo
                  <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: "none" }} />
                </label>
              )}
            </div>

            <div style={{ minWidth: "220px" }}>
              <Field label="Invoice Number" muted={muted}>
                <input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} style={inputStyle(inputBg, border, text)} />
              </Field>
              <Field label="Date" muted={muted}>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle(inputBg, border, text)} />
              </Field>
              <Field label="Due Date" muted={muted}>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={inputStyle(inputBg, border, text)} />
              </Field>
              <Field label="Currency" muted={muted}>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} style={inputStyle(inputBg, border, text)}>
                  {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Status" muted={muted}>
                <select value={status} onChange={(e) => setStatus(e.target.value)} style={inputStyle(inputBg, border, text)}>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </Field>
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <span style={{
              display: "inline-block",
              padding: "6px 12px",
              borderRadius: "999px",
              backgroundColor:
                status === "Paid" ? "rgba(22,163,74,0.12)" :
                status === "Overdue" ? "rgba(234,88,12,0.12)" :
                "rgba(220,38,38,0.12)",
              color: statusColor,
              fontSize: "13px",
              fontWeight: "600"
            }}>
              {status}
            </span>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            marginBottom: "28px"
          }}>
            <div>
              <h3 style={{ margin: "0 0 10px 0", fontSize: "15px" }}>From</h3>
              <input placeholder="Your name / Business" value={fromName} onChange={(e) => setFromName(e.target.value)} style={{...inputStyle(inputBg, border, text), marginBottom: "8px"}} />
              <input placeholder="Your email" value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} style={inputStyle(inputBg, border, text)} />
            </div>
            <div>
              <h3 style={{ margin: "0 0 10px 0", fontSize: "15px" }}>Bill To</h3>
              <input placeholder="Client name / Business" value={toName} onChange={(e) => setToName(e.target.value)} style={{...inputStyle(inputBg, border, text), marginBottom: "8px"}} />
              <input placeholder="Client email" value={toEmail} onChange={(e) => setToEmail(e.target.value)} style={inputStyle(inputBg, border, text)} />
            </div>
          </div>

          <h3 style={{ margin: "0 0 12px 0", fontSize: "15px" }}>Items</h3>
          
          {items.map((item) => (
            <div key={item.id} style={{
              display: "grid",
              gridTemplateColumns: "2fr 0.7fr 0.9fr auto",
              gap: "8px",
              marginBottom: "10px",
              alignItems: "center"
            }}>
              <input placeholder="Description" value={item.description} onChange={(e) => updateItem(item.id, "description", e.target.value)} style={inputStyle(inputBg, border, text)} />
              <input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(item.id, "quantity", e.target.value)} style={inputStyle(inputBg, border, text)} />
              <input type="number" placeholder="Price" value={item.price} onChange={(e) => updateItem(item.id, "price", e.target.value)} style={inputStyle(inputBg, border, text)} />
              <button onClick={() => removeItem(item.id)} className="no-print" style={{
                padding: "8px 10px",
                backgroundColor: darkMode ? "#450a0a" : "#fef2f2",
                color: "#dc2626",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer"
              }}>X</button>
            </div>
          ))}

          <button onClick={addItem} className="no-print" style={{
            marginTop: "8px",
            marginBottom: "24px",
            padding: "10px 14px",
            backgroundColor: darkMode ? "#1e3a5f" : "#eff6ff",
            color: "#2563eb",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "500"
          }}>+ Add Item</button>

          <div style={{
            borderTop: `1px solid ${border}`,
            paddingTop: "16px",
            maxWidth: "280px",
            marginLeft: "auto"
          }}>
            <Row label="Subtotal" value={`${currency} ${subtotal.toFixed(2)}`} muted={muted} />
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", alignItems: "center" }}>
              <span style={{ color: muted }}>Tax %</span>
              <input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                style={{
                  width: "70px",
                  padding: "6px",
                  borderRadius: "6px",
                  border: `1px solid ${border}`,
                  background: inputBg,
                  color: text,
                  textAlign: "right"
                }}
              />
            </div>
            <Row label="Tax Amount" value={`${currency} ${taxAmount.toFixed(2)}`} muted={muted} />
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              fontWeight: "700",
              fontSize: "20px",
              marginTop: "12px"
            }}>
              <span>Total</span>
              <span>{currency} {total.toFixed(2)}</span>
            </div>
          </div>

          <div style={{ marginTop: "28px" }}>
            <label style={{ fontSize: "13px", color: muted }}>Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              style={{
                width: "100%",
                padding: "12px",
                marginTop: "6px",
                borderRadius: "10px",
                border: `1px solid ${border}`,
                background: inputBg,
                color: text,
                boxSizing: "border-box",
                resize: "vertical"
              }}
            />
          </div>
        </div>

        <p className="no-print" style={{ textAlign: "center", color: muted, fontSize: "13px" }}>
          Drafts and saved invoices are stored in this browser.
        </p>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .invoice-print, .invoice-print * { visibility: visible; }
          .invoice-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}

function Field({ label, muted, children }) {
  return (
    <div style={{ marginBottom: "10px" }}>
      <label style={{ fontSize: "13px", color: muted }}>{label}</label>
      <div style={{ marginTop: "4px" }}>{children}</div>
    </div>
  );
}

function Row({ label, value, muted }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
      <span style={{ color: muted }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function inputStyle(inputBg, border, text) {
  return {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: `1px solid ${border}`,
    background: inputBg,
    color: text,
    boxSizing: "border-box"
  };
}

const btnPrimary = {
  padding: "10px 16px",
  backgroundColor: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "10px",
  fontWeight: "600",
  cursor: "pointer"
};

const btnSuccess = {
  padding: "10px 16px",
  backgroundColor: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: "10px",
  fontWeight: "600",
  cursor: "pointer"
};

const btnSecondary = {
  padding: "10px 16px",
  borderRadius: "10px",
  fontWeight: "500",
  cursor: "pointer"
};

const btnDanger = {
  padding: "10px 16px",
  backgroundColor: "#fef2f2",
  color: "#dc2626",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer"
};

const btnSmall = {
  padding: "6px 10px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "13px"
};
