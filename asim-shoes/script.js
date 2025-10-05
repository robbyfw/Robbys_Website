// Supabase credentials
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
      <p>${product.description}</p>
      <p class="price">$${product.price}</p>
      <button onclick="addToCart('${product.name}')">Buy This</button>
    `;
    container.appendChild(div);
  });
}

// Add product to cart
function addToCart(name) {
  const textarea = document.getElementById("buyerOrder");
  if(textarea.value){
    textarea.value += `, ${name}`;
  } else {
    textarea.value = name;
  }
  alert(`${name} added to your order!`);
}

// Place order and WhatsApp
document.getElementById("buyBtn").addEventListener("click", async () => {
  const buyerName = document.getElementById("buyerName").value.trim();
  const buyerOrder = document.getElementById("buyerOrder").value.trim();
  const buyerContact = document.getElementById("buyerContact").value.trim();

  if(!buyerName || !buyerOrder || !buyerContact){
    alert("Please fill all your details!");
    return;
  }

  // Save order in Supabase
  const { error } = await supabase.from('orders').insert([
    { product_name: buyerOrder, buyer_name: buyerName, buyer_contact: buyerContact }
  ]);

  if(error){
    console.error(error);
    alert("Something went wrong while saving order!");
    return;
  }

  // Open WhatsApp link
  const message = `Hello, I want to order: ${buyerOrder}\nName: ${buyerName}\nContact: ${buyerContact}`;
  const whatsappLink = `https://wa.me/YOUR_NUMBER?text=${encodeURIComponent(message)}`;
  window.open(whatsappLink, "_blank");
});

// Load products on page load
loadProducts();