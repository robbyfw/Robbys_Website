// Replace with your Supabase project credentials
const SUPABASE_URL = "https://whqdidslbwkljaygfsvt.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndocWRpZHNsYndrbGpheWdmc3Z0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NzM3NTYsImV4cCI6MjA3NTI0OTc1Nn0.L3_Np0jQXUF_t3HjHs7CsOOM_MHXb0mItmq4-FSafr8";

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let cart = [];

// Load products from Supabase
async function loadProducts() {
  const { data: products, error } = await supabase
    .from('products')
    .select('*');

  if (error) {
    console.error(error);
    return;
  }

  const container = document.getElementById('products-container');
  container.innerHTML = '';

  products.forEach(product => {
    const div = document.createElement('div');
    div.classList.add('product');
    div.innerHTML = `
      <img src="${product.image_url}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p>$${product.price}</p>
      <button onclick="addToCart(${product.id}, '${product.name}', ${product.price})">Add to Cart</button>
    `;
    container.appendChild(div);
  });
}

// Add product to cart
function addToCart(id, name, price) {
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id, name, price, quantity: 1 });
  }
  alert(`${name} added to cart!`);
}

// Place order and send WhatsApp message
async function placeOrder() {
  const buyerName = document.getElementById('buyerName').value.trim();
  const buyerContact = document.getElementById('buyerContact').value.trim();

  if (!buyerName || !buyerContact) {
    alert("Please enter your name and WhatsApp number.");
    return;
  }

  for (let item of cart) {
    await supabase.from('orders').insert([
      {
        product_id: item.id,
        quantity: item.quantity,
        buyer_name: buyerName,
        buyer_contact: buyerContact
      }
    ]);
  }

  const message = `Hello, I want to order:\n${cart.map(i => `${i.name} x${i.quantity}`).join('\n')}\nName: ${buyerName}\nContact: ${buyerContact}`;
  const whatsappLink = `https://wa.me/YOUR_NUMBER?text=${encodeURIComponent(message)}`;
  window.open(whatsappLink, '_blank');
}

// Event listener for Buy button
document.getElementById('buyBtn').addEventListener('click', placeOrder);

// Load products on page load
loadProducts();