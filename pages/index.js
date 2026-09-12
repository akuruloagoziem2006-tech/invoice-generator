import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [invoiceNumber, setInvoiceNumber] = useState("INV-001");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
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
  const printRef = useRef(null);

  const currencies = ["USD", "NGN", "EUR", "GBP", "CAD", "AUD"];

  useEffect(() => {
    const draft = localStorage.getItem("invoice-draft");
    const saved = localStorage.getItem("saved-invoices");
    const savedLogo = localStorage.getItem("invoice-logo");

    if (draft) {
      try {
        const data = JSON.parse(draft);
        setInvoiceNumber(data.invoiceNumber || "INV-001");
        setDate(data.date || new Date().toISOString().slice(0, 10));
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
      invoiceNumber, date, fromName, fromEmail,
      toName, toEmail, items, taxRate, notes, currency, darkMode
    };
    localStorage.setItem("invoice-draft", JSON.stringify(data));
  }, [invoiceNumber, date, fromName, fromEmail, toName, toEmail, items, taxRate, notes, currency, darkMode]);

  useEffect(() => {
    localStorage.setItem("saved-invoices", JSON.stringify(savedInvoices));
  }, [savedInvoices]);

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

  const subtotal = items.reduce((sum, item) => {
    return sum + (Number(item.quantity) * Number(item.price));
  }, 0);

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
    alert("Invoice saved successfully");
  }

  function loadInvoice(invoice) {
    setInvoiceNumber(invoice.invoiceNumber);
    setDate(invoice.date);
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
    setInvoiceNumber("INV-001");
    setDate(new Date().toISOString().slice(0, 10));
    setFromName("");
    setFromEmail("");
    setToName("");
    setToEmail("");
    setItems([{ id: 1, description: "", quantity: 1, price: 0 }]);
    setTaxRate(0);
    setNotes("Thank you for your business.");
  }

  const bg = darkMode ? "#0f172a" : "#f8fafc";
  const card = darkMode ? "#1e293b" : "#ffffff";
  const text = darkMode ? "#f1f5f9" : "#0f172a";
  const muted = darkMode ? "#94a3b8" : "#64748b";
  const border = darkMode ? "#334155" : "#e2e8f0";
  const inputBg = darkMode ? "#0f172a" : "#ffffff";

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: bg,
      color: text,
      fontFamily: "system-ui, -apple-system, sans-serif",
      padding: "20px 16px"
    }}>
      <div style={{ maxWidth: "850px", margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "10px"
        }}>
          <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "700" }}>
            Invoice Generator
          </h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: `1px solid ${border}`,
              background: card,
              color: text,
              cursor: "pointer"
            }}
          >
            {darkMode ? "Light" : "Dark"}
          </button>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
          <button onClick={handlePrint} style={btnPrimary}>Print / Save PDF</button>
          <button onClick={saveInvoice} style={btnSuccess}>Save Invoice</button>
          <button onClick={() => setShowSaved(!showSaved)} style={{...btnSecondary, background: card, color: text, border: `1px solid ${border}`}}>
            {showSaved ? "Hide Saved" : "Saved Invoices"}
          </button>
          <button onClick={clearInvoice} style={btnDanger}>Clear</button>
        </div>

        {/* Saved Invoices */}
        {showSaved && (
          <div style={{
            backgroundColor: card,
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "20px",
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
                  padding: "10px 0",
                  borderBottom: `1px solid ${border}`,
                  gap: "10px",
                  flexWrap: "wrap"
                }}>
                  <div>
                    <strong>{inv.invoiceNumber}</strong> — {inv.toName || "No client"} — {inv.currency} {Number(inv.total).toFixed(2)}
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

        {/* Invoice Card */}
        <div ref={printRef} className="invoice-print" style={{
          backgroundColor: card,
          borderRadius: "16px",
          padding: "24px",
          border: `1px solid ${border}`,
          marginBottom: "24px"
        }}>
          
          {/* Logo + Invoice Info */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "24px",
            gap: "16px",
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
                  padding: "20px",
                  border: `2px dashed ${border}`,
                  borderRadius: "10px",
                  cursor: "pointer",
                  color: muted,
                  fontSize: "14px"
                }}>
                  Upload Logo
                  <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: "none" }} />
                </label>
              )}
            </div>

            <div style={{ minWidth: "200px" }}>
              <div style={{ marginBottom: "10px" }}>
                <label style={{ fontSize: "13px", color: muted }}>Invoice Number</label>
                <input
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  style={inputStyle(inputBg, border, text)}
                />
              </div>
              <div style={{ marginBottom: "10px" }}>
                <label style={{ fontSize: "13px", color: muted }}>Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={inputStyle(inputBg, border, text)}
                />
              </div>
              <div>
                <label style={{ fontSize: "13px", color: muted }}>Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  style={inputStyle(inputBg, border, text)}
                >
                  {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* From / To */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            marginBottom: "24px"
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

          {/* Items */}
          <h3 style={{ margin: "0 0 12px 0", fontSize: "15px" }}>Items</h3>
          
          {items.map((item) => (
            <div key={item.id} style={{
              display: "grid",
              gridTemplateColumns: "2fr 0.7fr 0.9fr auto",
              gap: "8px",
              marginBottom: "10px",
              alignItems: "center"
            }}>
              <input
                placeholder="Description"
                value={item.description}
                onChange={(e) => updateItem(item.id, "description", e.target.value)}
                style={inputStyle(inputBg, border, text)}
              />
              <input
                type="number"
                placeholder="Qty"
                value={item.quantity}
                onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
                style={inputStyle(inputBg, border, text)}
              />
              <input
                type="number"
                placeholder="Price"
                value={item.price}
                onChange={(e) => updateItem(item.id, "price", e.target.value)}
                style={inputStyle(inputBg, border, text)}
              />
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

          {/* Totals */}
          <div style={{
            borderTop: `1px solid ${border}`,
            paddingTop: "16px",
            maxWidth: "280px",
            marginLeft: "auto"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ color: muted }}>Subtotal</span>
              <span>{currency} {subtotal.toFixed(2)}</span>
            </div>

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

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ color: muted }}>Tax Amount</span>
              <span>{currency} {taxAmount.toFixed(2)}</span>
            </div>

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              fontWeight: "700",
              fontSize: "18px",
              marginTop: "10px"
            }}>
              <span>Total</span>
              <span>{currency} {total.toFixed(2)}</span>
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginTop: "24px" }}>
            <label style={{ fontSize: "13px", color: muted }}>Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "4px",
                borderRadius: "8px",
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
          body * {
            visibility: hidden;
          }
          .invoice-print, .invoice-print * {
            visibility: visible;
          }
          .invoice-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
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
  borderRadius: "8px",
  fontWeight: "600",
  cursor: "pointer"
};

const btnSuccess = {
  padding: "10px 16px",
  backgroundColor: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontWeight: "600",
  cursor: "pointer"
};

const btnSecondary = {
  padding: "10px 16px",
  borderRadius: "8px",
  fontWeight: "500",
  cursor: "pointer"
};

const btnDanger = {
  padding: "10px 16px",
  backgroundColor: "#fef2f2",
  color: "#dc2626",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer"
};

const btnSmall = {
  padding: "6px 10px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "13px"
};
