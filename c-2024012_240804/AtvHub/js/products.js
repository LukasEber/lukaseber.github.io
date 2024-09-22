import { getProducts, getCategories } from './api.js';
import { state } from './state.js';
import { LoadingIndicator } from './components/loadingIndicator.js';
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

    const mainSection = document.querySelector('main');
    const aside = document.getElementById('category-aside');
    const toggle = document.getElementById('toggle-sidebar');
    const section = document.getElementById('product-section');
    mainSection.classList.add('main');  

    const loadingIndicator = new LoadingIndicator(mainSection);

    state.subscribe(() => {
        const { loading } = state.getState();
        if (loading) {
            loadingIndicator.show();
            toggle.style.display = 'none';
        } else {
            loadingIndicator.hide();
            mainSection.classList.remove('main');
            aside.style.display = '';
            toggle.style.display = '';
            section.style.display = '';
        }
    });

    state.subscribe(renderProducts);

    state.setState({ loading: true });
    const products = await getProducts();
    state.setState({ products, filteredProducts: products, loading: false });

    const categories = await getCategories();
    renderCategoryMenu(categories);

    const urlParams = new URLSearchParams(window.location.search);
    const selectedCategory = urlParams.get('category');
    if (selectedCategory) {
        filterProductsByCategory(selectedCategory);
    }
});

function renderCategoryMenu(categories) {
    const categoryListElement = document.getElementById('category-list');
    categoryListElement.innerHTML = '';

    categories.forEach(category => {
        const categoryItem = document.createElement('li');
        categoryItem.classList.add('cursor-pointer', 'p-2', 'hover:text-blue-900', 'flex', 'items-center');
        
        categoryItem.setAttribute('data-category', category);

        const iconElement = document.createElement('span');
        iconElement.classList.add('material-icons', 'mr-2');
        iconElement.textContent = 'label';

        categoryItem.appendChild(iconElement);
        categoryItem.appendChild(document.createTextNode(category));

        
        const urlParams = new URLSearchParams(window.location.search);
        const selectedCategory = urlParams.get('category');
        if (selectedCategory === category) {
            categoryItem.classList.add('active-category'); 
        }

        categoryItem.addEventListener('click', () => filterProductsByCategory(category));
        categoryListElement.appendChild(categoryItem);
    });

    
    const allItem = document.createElement('li');
    allItem.classList.add('cursor-pointer', 'p-2', 'hover:text-blue-900', 'flex', 'items-center');
    allItem.setAttribute('data-category', ''); 

    const allIconElement = document.createElement('span');
    allIconElement.classList.add('material-icons', 'mr-2');
    allIconElement.textContent = 'label';

    allItem.appendChild(allIconElement);
    allItem.appendChild(document.createTextNode('Alle'));

    const urlParams = new URLSearchParams(window.location.search);
    const selectedCategory = urlParams.get('category');
    if (!selectedCategory) {
        allItem.classList.add('active-category'); 
    }

    allItem.addEventListener('click', () => filterProductsByCategory(''));
    categoryListElement.prepend(allItem);
}

function filterProductsByCategory(category) {
    const allProducts = state.getState().products;
    const filteredProducts = category ? allProducts.filter(product => product.category === category) : allProducts;
    state.setState({ filteredProducts });

    
    const url = new URL(window.location);
    if (category) {
        url.searchParams.set('category', category);
    } else {
        url.searchParams.delete('category');
    }
    window.history.pushState({}, '', url);

    
    document.querySelectorAll('#category-list li').forEach(item => item.classList.remove('active-category'));

    
    const selectedCategoryItem = document.querySelector(`#category-list li[data-category="${category}"]`);
    if (selectedCategoryItem) {
        selectedCategoryItem.classList.add('active-category');
    }
}

function renderProducts() {
    const products = state.getState().filteredProducts;
    const productListElement = document.getElementById('product-list');
    productListElement.innerHTML = '';

    products?.forEach(product => {
        const productElement = document.createElement('div');
        productElement.classList.add('card', 'rounded', 'shadow-lg', 'overflow-hidden', 'flex', 'flex-col', 'justify-between', 'h-80.5', 'cursor-pointer', 'list-product-card');
        productElement.innerHTML = `
            <img src="${product.imageUrls[0]}" alt="${product.name}" class="w-full h-32 object-cover mb-4">
            <div class="flex flex-col justify-between flex-1 list-product-card-body p-2">
                <div>
                    <h3 class="text-lg font-semibold section-title">${product.name}</h3>
                    <p class="text-gray-500 mb-2">${product.category}</p>
                    <p class="text-xl mb-0-3 text-gray-800 font-bold">${product.price.toFixed(2)} €</p>
                    <p class="text-gray-500 mt-1">${product.quantity} verfügbar</p>
                </div>
                <button class="add-to-cart-btn material-icons self-end" data-id="${product.id}">add_shopping_cart</button>
            </div>
        `;
        productElement.addEventListener('click', () => {
            window.location.href = `productDetail.html?id=${product.id}`;
        });

        productElement.querySelector('.add-to-cart-btn').addEventListener('click', (event) => {
            event.stopPropagation(); 
            addToCart(event, product);
        });

        productListElement.appendChild(productElement);
    });
}

function addToCart(event, product) {
    const productId = event.target.getAttribute('data-id');
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProduct = cart.find(item => item.id === productId);
    const currentCartQuantity = existingProduct ? existingProduct.cartQuantity : 0;
    const desiredQuantity = currentCartQuantity + 1;

    if (desiredQuantity <= product.quantity) {
        if (existingProduct) {
            existingProduct.cartQuantity += 1;
        } else {
            cart.push({ ...product, cartQuantity: 1 });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        localStorage.setItem('cartTimestamp', Date.now());
        alert(`Produkt "${product.name}" wurde zum Warenkorb hinzugefügt.`);
    } else {
        alert(`Nur ${product.quantity} Stück verfügbar. Sie haben bereits ${currentCartQuantity} Stück im Warenkorb.`);
    }

    event.target.disabled = currentCartQuantity + 1 >= product.quantity;
}
