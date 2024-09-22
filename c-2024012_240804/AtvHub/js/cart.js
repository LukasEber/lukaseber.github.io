
import { HeaderComponent } from './components/headerComponent.js';

document.addEventListener('DOMContentLoaded', () => {
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
    renderCart();

    document.getElementById('checkout-btn').addEventListener('click', () => {
        window.location.href = 'checkout.html';
    });
});

function renderCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartListElement = document.getElementById('cart-list');
    const checkoutBtn = document.getElementById('checkout-btn');
    cartListElement.innerHTML = '';

    if (cart.length === 0) {
        cartListElement.innerHTML = '<p class="text-center">Sie haben noch keine Elemente zu Ihrem Warenkorb hinzugefügt. </br> <a href="products.html" class="inline-block btn-primary default py-3 px-6 rounded mt-4">Zu den Produkten</a></p>';
        checkoutBtn.classList.add('hidden');
        return;
    } else {
        checkoutBtn.classList.remove('hidden');
    }

    
    const container = document.createElement('div');
    container.classList.add('cart-container-list', 'bg-white', 'rounded', 'shadow-md', 'p-4');

    cart.forEach((product, index) => {
        
        const productContainer = document.createElement('div');
        productContainer.classList.add('cart-product', 'flex', 'flex-col', 'justify-between', 'py-4');

        
        const productTitle = document.createElement('h3');
        productTitle.classList.add('text-lg', 'font-bold', 'mb-2');
        productTitle.textContent = product.name;
        productContainer.appendChild(productTitle);

        
        const priceQuantityContainer = document.createElement('div');
        priceQuantityContainer.classList.add('flex', 'justify-between', 'items-center', 'mb-2');
        
        const price = document.createElement('span');
        price.classList.add('text-gray-700');
        price.textContent = `${product.price.toFixed(2)} €`;
        
        const quantity = document.createElement('span');
        quantity.classList.add('text-gray-500');
        quantity.textContent = `${product.cartQuantity} Stück`;

        priceQuantityContainer.appendChild(price);
        priceQuantityContainer.appendChild(quantity);
        productContainer.appendChild(priceQuantityContainer);

        
        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('flex', 'justify-end', 'gap-4');

        const removeOneButton = document.createElement('button');
        removeOneButton.classList.add('remove-from-cart-btn-1', 'material-icons', 'text-gray-500', 'hover:text-gray-700', 'cursor-pointer');
        removeOneButton.textContent = 'remove_circle_outline';
        removeOneButton.setAttribute('data-id', product.id);

        const removeAllButton = document.createElement('button');
        removeAllButton.classList.add('remove-from-cart-btn', 'material-icons', 'text-red-500', 'hover:text-red-700', 'cursor-pointer');
        removeAllButton.textContent = 'remove_shopping_cart';
        removeAllButton.setAttribute('data-id', product.id);

        buttonContainer.appendChild(removeOneButton);
        buttonContainer.appendChild(removeAllButton);
        productContainer.appendChild(buttonContainer);

        removeOneButton.addEventListener('click', removeFromCart);
        removeAllButton.addEventListener('click', removeAllFromCart);

        container.appendChild(productContainer);

        if (index < cart.length - 1) {
            const divider = document.createElement('hr');
            divider.classList.add('border-gray-300', 'my-2');
            container.appendChild(divider);
        }
    });

    cartListElement.appendChild(container);
}


function removeFromCart(event) {
    const productId = event.target.getAttribute('data-id');
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const productIndex = cart.findIndex(product => product.id === productId);

    if (productIndex > -1) {
        cart[productIndex].cartQuantity -= 1;
        if (cart[productIndex].cartQuantity === 0) {
            cart.splice(productIndex, 1);
        }
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}

function removeAllFromCart(event) {
    const productId = event.target.getAttribute('data-id');
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const productIndex = cart.findIndex(product => product.id === productId);

    if (productIndex > -1) {
        cart.splice(productIndex, 1);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}
