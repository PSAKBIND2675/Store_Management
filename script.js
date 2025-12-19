// -------------------- GLOBAL DATA --------------------
const products = {}; // Store medicines
const sales = [];

// -------------------- TAB HANDLING --------------------
function showTab(tab) {
  document.querySelectorAll("nav button").forEach(btn => btn.classList.remove("active"));
  document.querySelectorAll("section").forEach(sec => sec.classList.remove("active"));
  document.querySelector(`nav button[onclick="showTab('${tab}')"]`).classList.add("active");
  document.getElementById(tab).classList.add("active");
}


// -------------------- ADD MEDICINE --------------------
function addProduct() {
  const name = document.getElementById("addName").value.trim();
  const price = parseFloat(document.getElementById("addPrice").value);
  const qty = parseInt(document.getElementById("addQty").value);

  if (!name || isNaN(price) || isNaN(qty)) {
    return alert("Fill all fields correctly.");
  }

  const now = new Date().toLocaleString();

  if (!products[name]) {
    products[name] = { price, qty, lastUpdated: now };
  } else {
    products[name].price = price;
    products[name].qty += qty;
    products[name].lastUpdated = now;
  }

  // Clear inputs
  document.getElementById("addName").value = "";
  document.getElementById("addPrice").value = "";
  document.getElementById("addQty").value = "";

  // Show toast message
  showToast(`Added: Medicine Name: ${name}, ₹${price} per unit, Qty.: ${qty}`);

  // 🔥 Always return focus to medicine name box
  document.getElementById("addName").focus();
  updateStock(); // refresh stock table immediately
}


// -------------------- AUTOCOMPLETE --------------------
let currentIndex = -1;

function showMatchingProducts() {
  const input = document.getElementById("addName").value.trim().toLowerCase();
  const dropdown = document.getElementById("matchList");
  dropdown.innerHTML = "";
  currentIndex = -1;

  if (input === "") {
    dropdown.style.display = "none";
    return;
  }

  const matches = Object.keys(products).filter(name =>
    name.toLowerCase().includes(input)
  );

  if (matches.length === 0) {
    dropdown.style.display = "none";
    return;
  }

  matches.forEach(name => {
    const option = document.createElement("div");
    option.classList.add("dropdown-item");
    option.textContent = `${name} (₹${products[name].price}) — ${products[name].qty} in stock`;
    option.dataset.value = name;

    option.addEventListener("mouseover", () => {
      clearActive(dropdown);
      option.classList.add("active");
      currentIndex = Array.from(dropdown.children).indexOf(option);
    });

    option.addEventListener("click", (e) => {
  e.stopPropagation(); // ✅ prevents global click handler from firing first
  document.getElementById("addName").value = name;
  dropdown.style.display = "none";
  });
    // ✅ Mouse click selects medicine
    option.addEventListener("mousedown", (e) => {
      e.preventDefault();
      document.getElementById("addName").value = option.dataset.value;
      dropdown.style.display = "none";
    });
    dropdown.appendChild(option);
  });

  dropdown.style.display = "block";
  positionDropdown("addName", "matchList");
}

function positionDropdown(inputId, dropdownId) {
  const input = document.getElementById(inputId);
  const dropdown = document.getElementById(dropdownId);

  dropdown.style.width = input.offsetWidth + "px";
  const rect = input.getBoundingClientRect();
  dropdown.style.position = "absolute";
  dropdown.style.left = rect.left + "px";
  dropdown.style.top = rect.bottom + window.scrollY + "px";
}

function clearActive(dropdown) {
  Array.from(dropdown.children).forEach(opt => opt.classList.remove("active"));
}
//---------KEYBOARD NAVIGATION-------
document.getElementById("addName").addEventListener("keydown", (e) => {
  const dropdown = document.getElementById("matchList");
  const options = Array.from(dropdown.children);

  if (dropdown.style.display === "none") return;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    currentIndex = (currentIndex + 1) % options.length;
    clearActive(dropdown);
    options[currentIndex].classList.add("active");
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    currentIndex = (currentIndex - 1 + options.length) % options.length;
    clearActive(dropdown);
    options[currentIndex].classList.add("active");
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (currentIndex >= 0) {
      document.getElementById("addName").value = options[currentIndex].dataset.value;
      dropdown.style.display = "none";
    }
  }
});
//   Hide dropdown when input loses focus (e.g. pressing Enter to move next)
document.getElementById("addName").addEventListener("blur", () => {
  const dropdown = document.getElementById("matchList");
  dropdown.style.display = "none";
});
//   Hide dropdown when clicking anywhere outside input or dropdown
document.addEventListener("click", function(e) {
  const input = document.getElementById("addName");
  const dropdown = document.getElementById("matchList");

  // If dropdown is open and click is outside both input and dropdown → hide it
  if (dropdown.style.display === "block" &&
      !input.contains(e.target) &&
      !dropdown.contains(e.target)) {
    dropdown.style.display = "none";
  }
});


// -------------------- ENTER KEY DEFAULT --------------------
document.addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    const focusable = Array.from(document.querySelectorAll(
      "input, button, select, textarea"
    )).filter(el => !el.disabled && el.offsetParent !== null);

    const index = focusable.indexOf(document.activeElement);

    if (index > -1) {
      e.preventDefault(); // prevent default submit
      const current = document.activeElement;
      const next = focusable[index + 1];

      // 🔥 Special restriction: if current is Add or Sell button
      if (current.tagName === "BUTTON" &&
          (current.textContent.includes("Add") || current.classList.contains("add-btn"))) {
        current.click(); // run add logic
        // After add, refocus back to medicine name
        if (document.getElementById("addName")) {
          document.getElementById("addName").focus();
        }
        if (document.getElementById("sellSearch")) {
          document.getElementById("sellSearch").focus();
        }
        return; // stop here so it doesn’t just move forward
      }

      // Normal case: move to next field
      if (next) {
        next.focus();
      } else if (current.tagName === "BUTTON") {
        current.click();
      }
    }
  }
});


// -------------------- TOAST --------------------
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, 3000);
}

// --------------SALE SECTION--------------
let sellCurrentIndex = -1;
// ✅ Show dropdown matches when typing in search box
function showMatchingSellProducts() {
  const input = document.getElementById("sellSearch").value.trim().toLowerCase();
  const dropdown = document.getElementById("sellMatchList");
  dropdown.innerHTML = "";   // Clear old results
  sellCurrentIndex = -1;
  if (!input) {
    dropdown.style.display = "none";
    return;
  }

  const matches = Object.keys(products).filter(name =>
    name.toLowerCase().includes(input)
  );

  if (matches.length === 0) {
    dropdown.style.display = "none";
    return;
  }

  matches.forEach(name => {
    const option = document.createElement("div");
    option.className = "dropdown-item";
    option.textContent = `${name} (₹${products[name].price}) — ${products[name].qty} in stock`;
    option.dataset.value = name;

    // ✅ Mouse click selects medicine and adds to cart
    option.addEventListener("mousedown", (e) => {
      e.preventDefault();
      document.getElementById("sellSearch").value = option.dataset.value;
      dropdown.style.display = "none";
    });

    dropdown.appendChild(option);
  });

  // Show dropdown and position it correctly
  dropdown.style.display = "block";
  positionDropdown("sellSearch", "sellMatchList");
}

// ✅ Remove active highlight from dropdown items
function clearActive(dropdown) {
  Array.from(dropdown.children).forEach(opt => opt.classList.remove("active"));
}

// ✅ Keyboard navigation for dropdown
document.getElementById("sellSearch").addEventListener("keydown", (e) => {
  const dropdown = document.getElementById("sellMatchList");
  const options = Array.from(dropdown.children);

  if (dropdown.style.display === "none") return;

  if (e.key === "ArrowDown") {
    // Move highlight down
    e.preventDefault();
    sellCurrentIndex = (sellCurrentIndex + 1) % options.length;
    clearActive(dropdown);
    options[sellCurrentIndex].classList.add("active");
  } else if (e.key === "ArrowUp") {
    // Move highlight up
    e.preventDefault();
    sellCurrentIndex = (sellCurrentIndex - 1 + options.length) % options.length;
    clearActive(dropdown);
    options[sellCurrentIndex].classList.add("active");
  } else if (e.key === "Enter") {
    // Select highlighted item or first item
    e.preventDefault();
    if (sellCurrentIndex >= 0) {
      selected = options[sellCurrentIndex].dataset.value;
    } else if (options.length > 0) {
      // default to select first item
      selected = options[0].dataset.value;
    }
    if (selected) {
      document.getElementById("sellSearch").value = selected;
    
    }
    dropdown.style.display = "none";
  }
});
//   Hide dropdown when input loses focus (e.g. pressing Enter to move next)
document.getElementById("addName").addEventListener("blur", () => {
  const dropdown = document.getElementById("matchList");
  dropdown.style.display = "none";
});

// ✅ Hide dropdown when clicking outside
document.addEventListener("click", function(e) {
  const input = document.getElementById("sellSearch");
  const dropdown = document.getElementById("sellMatchList");

  if (dropdown.style.display === "block" &&
      !input.contains(e.target) &&
      !dropdown.contains(e.target)) {
    dropdown.style.display = "none";
  }
});

let cart = [];

function addToCart() {
  const name = document.getElementById("sellSearch").value.trim(); // from the search input
  const qty = parseInt(document.getElementById("sellQty").value);

  if (!name || isNaN(qty) || qty <= 0) {
    return alert("❌ Enter valid Medicine Name and Quantity.");
  }

  if (!products[name]) {
    return alert("❌ Medicine not found.");
  }

  const available = products[name].qty;

  // Check if already in cart
  const existing = cart.find(item => item.name === name);
  const alreadyInCart = existing ? existing.qty : 0;
  const remainingStock = available - alreadyInCart;

  if (qty > remainingStock) {
    return alert(`❌ Not enough stock for "${name}". Available: ${remainingStock} (after cart deduction)`);
  }

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ name, qty });
  }
  // Clear inputs
  document.getElementById("sellSearch").value = "";
  document.getElementById("sellQty").value = "";
  //----Always focus to enter medicine name----
  document.getElementById("sellSearch").focus();
  renderCart();
}


function renderCart() {
  const table = document.getElementById("cartTable");
  table.innerHTML = "<tr><th>Sr.No.</th><th>Medicine Name</th><th>Qty.</th><th>Price/Qty.</th><th>Total</th><th>Remove</th></tr>";
  let total = 0;
  cart.forEach((item, i) => {
    const price = products[item.name].price;
    const row = table.insertRow();
        // ✅ Sr.No. starts at 1 and increases
    row.insertCell().textContent = i + 1;
    // medicine details
    row.insertCell().textContent = item.name;
    row.insertCell().textContent = item.qty;
    row.insertCell().textContent = `₹${price}`;
    row.insertCell().textContent = `₹${price * item.qty}`;
    const del = document.createElement("button");
    del.textContent = "❌";
    del.onclick = () => { cart.splice(i, 1); renderCart(); };
    row.insertCell().appendChild(del);
    total += price * item.qty;
  });
  document.getElementById("cartTotal").textContent = total;
}
// --------- Finalize Sale ---------
function finalizeSale() {
  const name = document.getElementById("custName").value.trim();
  const age = parseInt(document.getElementById("custAge").value);
  const gender = document.getElementById("custGender").value;
  const receiptNo = document.getElementById("receiptNo").value.trim();
  const discountValueInput = parseFloat(document.getElementById("discountValue").value);
  const discountPercentInput = parseFloat(document.getElementById("discountPercent").value);
  const paymentMethod = document.getElementById("paymentMethod").value;

  if (!name || isNaN(age) || !receiptNo) return showToast("❌ Enter customer details.", "#f44336");
  if (cart.length === 0) return showToast("❌ Cart is empty.", "#f44336");

  let total = 0;
  const time = new Date().toLocaleString();
  const tempItems = [];

  for (let item of cart) {
    const product = products[item.name];
    const price = Number(product.price);
    const lineTotal = item.qty * price;
    total += lineTotal;
    tempItems.push({ name: item.name, qty: item.qty, price });
  }

 // 🔹 Discount calculation
let discount = 0;
let discountPercent = 0;

if (!isNaN(discountPercentInput) && discountPercentInput > 0) {
  discount = Math.round((discountPercentInput / 100) * total);

  if (discount > total) {
    showToast("Discount exceeds the subtotal");
    discount = 0;
    discountPercent = 0;
  } else {
    discountPercent = discountPercentInput;
  }

} else if (!isNaN(discountValueInput) && discountValueInput > 0) {
  if (discountValueInput > total) {
    showToast("Discount exceeds the subtotal");
    discount = 0;
    discountPercent = 0;
  } else {
    discount = discountValueInput;
    discountPercent = Math.round((discount / total) * 100);
  }
}

  const finalTotal = total - discount;

  // Payment confirmation
  if (paymentMethod === "Cash") {
    const confirmed = confirm("Cash collected?");
    if (!confirmed) {
      showToast("❌ Transaction cancelled. Returning to cart.", "#f44336");
      return;
    }
  }

  if (paymentMethod === "Online") {
    if (!window.saleContext) {
      window.saleContext = { name, age, gender, receiptNo, discount, discountPercent, finalTotal, time, tempItems: [...tempItems] };
      showQrPopup(finalTotal);
    }
    return;
  }

  // Save sale record
  sales.unshift({ receiptNo, customer: { name, age, gender }, time, items: tempItems, discount, total: finalTotal, paymentMode: paymentMethod });
  if (sales.length > 100) sales.length = 100;
  // 🔹 Deduct sold quantities from stock
for (let item of tempItems) {
  if (products[item.name]) {
    products[item.name].qty = Number(products[item.name].qty) - item.qty; // ensure numeric subtraction
    products[item.name].lastUpdated = new Date().toLocaleString();
  }
}

  buildReceipt(receiptNo, name, age, gender, time, tempItems, total, discount, discountPercent, finalTotal, paymentMethod);

  updateStock();
  updateRecent();

  cart = [];
  renderCart();
  document.getElementById("custName").value = "";
  document.getElementById("custAge").value = "";
  document.getElementById("receiptNo").value = "";
  document.getElementById("discountValue").value = "";
  document.getElementById("discountPercent").value = "";
}

document.getElementById("discountPercent").addEventListener("input", () => {
  const percent = parseFloat(document.getElementById("discountPercent").value);
  const total = parseFloat(document.getElementById("cartTotal").textContent);

  if (!isNaN(percent) && total > 0) {
    const value = Math.round((percent / 100) * total);

    if (value > total) {
      showToast("Discount exceeds the subtotal");
      document.getElementById("discountPercent").value = "";
      document.getElementById("discountValue").value = "";
    } else {
      document.getElementById("discountValue").value = value;
    }
  }
});

document.getElementById("discountValue").addEventListener("input", () => {
  const value = parseFloat(document.getElementById("discountValue").value);
  const total = parseFloat(document.getElementById("cartTotal").textContent);

  if (!isNaN(value) && total > 0) {
    if (value > total) {
      showToast("Discount exceeds the subtotal");
      document.getElementById("discountValue").value = "";
      document.getElementById("discountPercent").value = "";
    } else {
      const percent = Math.round((value / total) * 100);
      document.getElementById("discountPercent").value = percent;
    }
  }
});

// ========== QR PAYMENT FLOW ==========
function showQrPopup(amount) {
  const upiId = "8115021226@ptsbi";
  const upiUrl = `upi://pay?pa=${upiId}&pn=MedicalStore&am=${amount}&cu=INR`;
  const qrApi = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(upiUrl)}&size=250x250`;

  const html = `
    <h2>Scan to Pay ₹${amount}</h2>
    <p>UPI ID: <strong>${upiId}</strong></p>
    <img src="${qrApi}" alt="UPI QR Code" />
    <p style="margin-top:20px;">After Payment, click "✅ Payment Done"</p>
  `;

  document.getElementById("qrPopupContent").innerHTML = html;
  document.getElementById("qrPopup").style.display = "block";
}

function closeQrPopup() {
  document.getElementById("qrPopup").style.display = "none";
  window.saleContext = null;
    showToast("❌ Transaction cancelled. Returning to cart.", "#f44336");
    return;
    
}

function confirmOnlinePayment() {
  document.getElementById("qrPopup").style.display = "none";
  proceedAfterPayment();
}

function proceedAfterPayment() {
  const ctx = window.saleContext;
  if (!ctx) return showToast("❌ Sale context missing. Cannot finalize.", "#f44336");

  const items = ctx.tempItems;
  sales.unshift({
    receiptNo: ctx.receiptNo,
    customer: { name: ctx.name, age: ctx.age, gender: ctx.gender },
    time: ctx.time,
    items,
    discount: ctx.discount,
    total: ctx.finalTotal,
    paymentMode: "Online"
  });
  if (sales.length > 100) sales.length = 100;
  // 🔹 Deduct sold quantities from stock
for (let item of items) {
  if (products[item.name]) {
    products[item.name].qty = Number(products[item.name].qty) - item.qty;
    products[item.name].lastUpdated = new Date().toLocaleString();
  }
}

  buildReceipt(ctx.receiptNo, ctx.name, ctx.age, ctx.gender, ctx.time, items,
               items.reduce((sum, i) => sum + i.price * i.qty, 0),
               ctx.discount, ctx.discountPercent, ctx.finalTotal, "Online");

  updateStock();
  updateRecent();

  cart = [];
  renderCart();
  document.getElementById("custName").value = "";
  document.getElementById("custAge").value = "";
  document.getElementById("receiptNo").value = "";
  document.getElementById("discountValue").value = "";
  document.getElementById("discountPercent").value = "";
  window.saleContext = null;
}

// ========== RECEIPT BUILDING & UTILITIES ==========

// 🔹 Shared function to generate receipt HTML
function generateReceiptHTML(sale) {
  // Calculate subtotal
  let subtotal = 0;
  sale.items.forEach(item => subtotal += item.price * item.qty);
  // 🔹 Add watermark background and logo banner
  let html = `
  <div>
      <!-- Logo banner at top -->
    <div style="width:100vm; height:auto; margin-bottom:15px;">
      <img src="logo.jpg.png" alt="Store Logo" 
           style="width:100%; height:auto; object-fit:cover; border:solid 5px black;">
    </div>
    <div style="position: relative; width: 100%; padding: 0;margin-bottom:15px;">

    <!-- Watermark image -->
    <img src="watermark.jpg.png" alt="" 
       style="position: absolute; 
              top: 50%; 
              left: 50%; 
              transform: translate(-50%, -50%); 
              width: 400px; 
              opacity: 0.3; 
              z-index: 0;" />

     <!-- Receipt content -->
    <div style="position: relative; z-index: 1;">
    <h2>🧾 Receipt No.: ${sale.receiptNo}</h2>`;
    html += `<!-- First line: Patient Name (left) and Date & Time (right) -->
<div style="display:flex; justify-content:space-between; width:100%;">
  <div><strong>Patient Name :</strong> ${sale.customer.name}</div>
  <div><strong>Date & Time :</strong> ${sale.time}</div>
</div>

<!-- Second line: Age (left) and Sex (right) -->
<div style="display:flex; justify-content:space-between; width:100%; margin-top:5px;">
  <div><strong>Age :</strong> ${sale.customer.age} Year</div>
  <div><strong>Sex :</strong> ${sale.customer.gender}</div>
</div>

           </p>`;
  
    // Medicine table
    html += `<table border="1" cellspacing="0" cellpadding="5" style="width:100%; border-collapse:collapse;">`;
    html += `<tr>
             <th style="text-align:center;">Sr.No.</th>
             <th style="text-align:center;">Medicine Name</th>
             <th style="text-align:center;">Qty.</th>
             <th style="text-align:center;">Total</th>
           </tr>`;
  
    sale.items.forEach((item, i) => {
    const lineTotal = item.price * item.qty;
    html += `<tr>
               <td style="text-align:left;">${i + 1}</td>
               <td style="text-align:left;">${item.name}</td>
               <td style="text-align:right;">${item.qty}</td>
               <td style="text-align:right;">₹${lineTotal}</td>
             </tr>`;
    });

     // Summary rows
    html += `
    <tr>
      <td rowspan="3" colspan="2" style="text-align:center; vertical-align:middle;">
        <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100%;">
          <div><strong>Payment Mode:</strong> ${sale.paymentMode || "—"}</div>
          <div><strong>Status:</strong> Done ✅</div>
        </div>
      </td>
      <td style="text-align:left;"><strong>Subtotal</strong></td>
      <td style="text-align:right;">₹${subtotal}</td>
    </tr>
    <tr>
      <td style="text-align:left;"><strong>Discount</strong></td>
      <td style="text-align:right;">₹${sale.discount || 0}</td>
    </tr>
    <tr>
      <td style="text-align:left;"><strong>Total Paid</strong></td>
      <td style="text-align:right;">₹${sale.total || 0}</td>
    </tr>
    </table>
    </div>
    </div>
    <div style="width:100%; text-align:center; font-family:algerian;font-size:20px;"><strong>Thanks</strong></div>
  </div>`;
  
  return html;
}

// 🔹 Show receipt in same page when bill is generated
function buildReceipt(receiptNo, name, age, gender, time, items, subtotal, discount, discountPercent, finalTotal, paymentMethod) {
  // Wrap parameters into a sale object
  const sale = { 
    receiptNo, 
    customer: { name, age, gender }, 
    time, 
    items, 
    discount, 
    total: finalTotal, 
    paymentMode: paymentMethod 
  };

  // Generate receipt HTML
  const html = generateReceiptHTML(sale);

  // Inject into receiptArea
  const receiptArea = document.getElementById("receiptArea");
  receiptArea.innerHTML = html;
  receiptArea.style.display = "block";

  // Show print button
  document.getElementById("printBtn").style.display = "inline-block";

  hasPrintedOnce = false; // reset flag
}
// Track if user has printed at least once
let hasPrintedOnce = false;
// 🔹 Print receipt by opening popup window
function printReceipt() {
  const receiptArea = document.getElementById("receiptArea");
  const html = receiptArea.innerHTML; // get receipt HTML

  // Open popup window
  const w = window.open("", "_blank", "width=auto,height=auto");
  w.document.write("<html><head><title>Receipt</title></head><body>");
  w.document.write(html);
  w.document.write("</body></html>");
  w.document.close();

  // Trigger print
  w.print();

  hasPrintedOnce = true; // mark printed
}

// --------- Clear Receipt when inputs change ---------
["custName","custAge","custGender","receiptNo","discountValue","discountPercent","sellSearch","sellQty"]
.forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("input", clearReceiptOnInput);
});

function clearReceiptOnInput() {
  // ✅ Only clear if user has printed once
  if (hasPrintedOnce) {
    const receiptArea = document.getElementById("receiptArea");
    receiptArea.innerHTML = "";
    receiptArea.style.display = "none"; // hide box
    document.getElementById("printBtn").style.display = "none";

    // Reset flag so next receipt can show again
    hasPrintedOnce = false;
  }
}



// ----------------- UPDATE STOCKS -----------------
function updateStock() {
  const table = document.getElementById("stockTable");
  table.innerHTML = "<tr><th>Sr.No.</th><th>Medicine Name</th><th>Price/Qty.</th><th>Qty.</th><th>Recent Update</th></tr>";

  let sr = 1; // start serial number from 1
  Object.entries(products).forEach(([name, product]) => {
    const row = table.insertRow();
     row.insertCell().textContent = sr++; // Sr No. column auto-increments
    row.insertCell().textContent = name;
    row.insertCell().textContent = `₹${product.price}`;
    row.insertCell().textContent = product.qty;
    row.insertCell().textContent = product.lastUpdated || "—";
  });
}

// ------------------ UPDATE RECENTS -----------------
function updateRecent() {
  const table = document.getElementById("recentTable");
  table.innerHTML = "<tr><th>Receipt No.</th><th>Patient Name</th><th>Date & Time</th><th>Subtotal</th><th>Discount</th><th>Total Paid</th><th>Payment Mode</th><th>View</th></tr>";

  sales.forEach((sale, i) => {
    const row = table.insertRow();
    row.insertCell().textContent = sale.receiptNo;
    row.insertCell().textContent = sale.customer.name;
    row.insertCell().textContent = sale.time;
    row.insertCell().textContent = `₹${sale.total+sale.discount}`;
    row.insertCell().textContent = `₹${sale.discount || 0}`;
    row.insertCell().textContent = `₹${sale.total || 0}`;
    row.insertCell().textContent = sale.paymentMode || "—";
    const btn = document.createElement("button");
    btn.textContent = "View";
    btn.onclick = () => showHistory(i);
    row.insertCell().appendChild(btn);
  });
}

// 🔹 Show receipt in popup window when viewing history
function showHistory(index) {
  const sale = sales[index]; // get sale object
  const html = generateReceiptHTML(sale); // generate receipt HTML

  // Open popup window
  const w = window.open("", "_blank", "width=700,height=600");
  w.document.write("<html><head><title>Sale History</title></head><body>");
  w.document.write(html);
  w.document.write("</body></html>");
  w.document.close();
}