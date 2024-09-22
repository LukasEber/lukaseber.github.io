import { getProducts } from './api.js';
import { HeaderComponent } from './components/headerComponent.js';

document.addEventListener('DOMContentLoaded', async () => {
    const body = document.querySelector('body'); 
    const header = new HeaderComponent(); 
    body.prepend(header.element); 

    const cookieBanner = document.getElementById('cookie-banner');
    const acceptCookiesButton = document.getElementById('accept-cookies');

    if (!localStorage.getItem('cookiesAccepted')) {
        cookieBanner.classList.remove('hidden');
    }

    acceptCookiesButton?.addEventListener('click', () => {
        localStorage.setItem('cookiesAccepted', 'true');
        cookieBanner.classList.add('hidden');
    });
    await loadProductDetails();  
});

async function loadProductDetails() {
    const productId = new URLSearchParams(window.location.search).get('id'); 
    if (!productId) {
        alert('Kein Produkt ausgewählt.');
        return;
    }

    const products = await getProducts();
    const product = products.find(p => p.id === productId);

    if (!product) {
        alert('Produkt nicht gefunden.');
        return;
    }

    renderProductDetails(product);
}

function renderProductDetails(product) {
    const productDetailsSection = document.getElementById('product-details');

    
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProduct = cart.find(item => item.id === product.id);
    const currentCartQuantity = existingProduct ? existingProduct.cartQuantity : 0;
    let selectedQuantity = 0;
    const imageUrls = product.imageUrls || []; 

    productDetailsSection.innerHTML = `
        <!-- Produktname oben -->
        <h2 class="product-title">${product.name}</h2>

        <!-- Container für Bilder -->
        <div class="product-images-container">
            ${imageUrls.map(url => `<img src="${url}" alt="Produktbild" class="product-image">`).join('')}
        </div>

        <!-- Produktinformationen in einer Card -->
        <div class="product-info-card">
            <div class="product-info-item">
                <span class="product-info-label">Preis:</span>
                <span class="product-info-value">${product.price.toFixed(2)} €</span>
            </div>
            <div class="product-info-item">
                <span class="product-info-label">Versandkosten:</span>
                <span class="product-info-value">${product.shippingCost.toFixed(2)} €</span>
            </div>
            <div class="product-info-item">
                <span class="product-info-label">Verfügbarkeit:</span>
                <span class="product-info-value">${product.quantity} Stück verfügbar</span>
            </div>
            <div class="product-info-item">
                <span class="product-info-label">Kategorie:</span>
                <span class="product-info-value">${product.category}</span>
            </div>
            <p class="product-description">${product.description.replace(/\n/g, '<br>')}</p>

            <!-- Anzeige der ausgewählten Anzahl und Buttons zum Ändern der Anzahl -->
            <div class="product-action">
                <div class="quantity-control">
                    <button id="decrease-quantity" class="material-icons" ${selectedQuantity === 0 ? 'disabled' : ''}>remove</button>
                    <p class="text-xl font-bold" id="selected-quantity">${selectedQuantity}</p>
                    <button id="increase-quantity" class="material-icons" ${selectedQuantity + currentCartQuantity >= product.quantity ? 'disabled' : ''}>add</button>
                </div>

                <!-- Button, um das Produkt in den Warenkorb zu legen -->
                <button id="add-to-cart-btn-details" class="btn-primary default" ${selectedQuantity === 0 ? 'disabled' : ''}>
                    <span class="material-icons align-middle mr-2">add_shopping_cart</span>In den Warenkorb
                </button>
            </div>
        </div>
    `;

    
    document.getElementById('increase-quantity').addEventListener('click', () => {
        if (selectedQuantity + currentCartQuantity < product.quantity) {
            selectedQuantity++;
            updateSelectedQuantityDisplay(selectedQuantity, product.quantity, currentCartQuantity);
        }
    });

    document.getElementById('decrease-quantity').addEventListener('click', () => {
        if (selectedQuantity > 0) {
            selectedQuantity--;
            updateSelectedQuantityDisplay(selectedQuantity, product.quantity, currentCartQuantity);
        }
    });

    
    document.getElementById('add-to-cart-btn-details').addEventListener('click', () => {
        addToCart(product, selectedQuantity);
    });

    
    const galleryImages = document.querySelectorAll('.thumbnail-image');
    galleryImages.forEach((image, index) => {
        image.addEventListener('click', (e) => {
            
            document.getElementById('main-product-image').src = e.target.src;

            
            galleryImages.forEach(img => img.classList.remove('active'));
            e.target.classList.add('active');
        });
    });
}

function addToCart(product, quantity) {
    if (quantity === 0) return; 

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProduct = cart.find(item => item.id === product.id);
    const currentCartQuantity = existingProduct ? existingProduct.cartQuantity : 0;
    const totalQuantity = currentCartQuantity + quantity; 

    if (totalQuantity <= product.quantity) {
        if (existingProduct) {
            existingProduct.cartQuantity += quantity;
        } else {
            cart.push({ ...product, cartQuantity: quantity });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        localStorage.setItem('cartTimestamp', Date.now());

        alert(`Produkt "${product.name}" (${quantity} Stück) wurde zum Warenkorb hinzugefügt.`);
        updateCartDisplay(); 

        
        loadProductDetails();
    }
}

function updateSelectedQuantityDisplay(selectedQuantity, maxQuantity, currentCartQuantity) {
    
    document.getElementById('selected-quantity').textContent = selectedQuantity;
    document.getElementById('increase-quantity').disabled = selectedQuantity + currentCartQuantity >= maxQuantity;
    document.getElementById('decrease-quantity').disabled = selectedQuantity === 0;

    
    document.getElementById('add-to-cart-btn-details').disabled = selectedQuantity === 0;
}

function updateCartDisplay() {
    
    
}
