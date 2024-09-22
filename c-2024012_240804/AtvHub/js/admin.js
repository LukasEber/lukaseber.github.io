import { validateAdminPassword, addProduct, deleteProduct, getProducts, updateProductData, getOrders, updateOrderStatus, updateOrderPayment, getCategories } from './api.js';
import { state } from './state.js';
import { OverlayLoadingIndicator } from './components/loadingIndicator.js';
import { HeaderComponent } from './components/headerComponent.js';

document.addEventListener('DOMContentLoaded', async () => {
    const mainSection = document.querySelector('main');
    const loadingIndicator = new OverlayLoadingIndicator(mainSection);
    state.subscribe(() => {
        const { overlayLoading } = state.getState();
        if (overlayLoading) {
            loadingIndicator.show();
        } else {
            loadingIndicator.hide();
        }
    });
    await initializeAdminPage();
    await initializeCategories();
});

async function initializeCategories() {
    const categoryDatalist = document.getElementById('categories');
    const categories = await getCategories();
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        categoryDatalist.appendChild(option);
    });
}

async function initializeAdminPage() {
    const body = document.querySelector('body');
    const header = new HeaderComponent();
    body.prepend(header.element);

    const isAdminLoggedIn = localStorage.getItem('adminLoggedIn');
    const loginTimestamp = localStorage.getItem('loginTimestamp');

    
    if (isAdminLoggedIn && (Date.now() - loginTimestamp < 1800000)) {
        document.getElementById('admin-login').classList.add('hidden');
        document.getElementById('admin-panel').classList.remove('hidden');
        document.getElementById('tab-bar').classList.add('visible');
        document.body.classList.remove('no-scroll');

        await loadProductsAndOrders();
    } else {
        document.getElementById('admin-login').classList.remove('hidden');
        document.getElementById('admin-panel').classList.add('hidden');
        document.getElementById('tab-bar').classList.remove('visible');
    }

    setupCookieBanner();
    await setupLoginLogic();
    setupTabs();
    setupProductDialogHandlers();
    setupImagePreviewHandler();

    state.setState({ overlayLoading: false });
}

async function setupLoginLogic() {
    const loginButton = document.getElementById('admin-login-button');
    if (!loginButton) return;

    loginButton.addEventListener('click', async () => {
        const username = document.getElementById('admin-username').value;
        const password = document.getElementById('admin-password').value;

        state.setState({ overlayLoading: true }); 
        try {
            const isValid = await validateAdminPassword(username, password);
            if (isValid) {
                await handleLoginSuccess();
            } else {
                state.setState({ overlayLoading: false }); 
                alert('Ungültiges Passwort. Bitte versuchen Sie es erneut.');
            }
        } catch (error) {
            state.setState({ overlayLoading: false }); 
            alert('Login fehlgeschlagen. Bitte versuchen Sie es erneut.');
        } finally {
            
        }
    });
}

async function handleLoginSuccess() {
    localStorage.setItem('adminLoggedIn', 'true');
    localStorage.setItem('loginTimestamp', Date.now().toString());
    document.getElementById('admin-login').classList.add('hidden');
    document.getElementById('admin-panel').classList.remove('hidden');
    document.getElementById('tab-bar').classList.add('visible');
    document.body.classList.remove('no-scroll');

    await loadProductsAndOrders();
    state.setState({ overlayLoading: false });
}

async function loadProductsAndOrders() {
    try {
        state.setState({ overlayLoading: true }); 
        const [products, orders] = await Promise.all([getProducts(), getOrders()]);
        state.setState({ products, orders });
        render(); 
    } catch (error) {
        console.error('Fehler beim Laden von Produkten und Bestellungen:', error);
    } finally {
    }
}

function setupCookieBanner() {
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptCookiesButton = document.getElementById('accept-cookies');

    if (!localStorage.getItem('cookiesAccepted')) {
        cookieBanner.classList.remove('hidden');
    }
    acceptCookiesButton?.addEventListener('click', () => {
        localStorage.setItem('cookiesAccepted', 'true');
        cookieBanner.classList.add('hidden');
    });
}

function setupTabs() {
    const tabProductsButton = document.getElementById('tab-products');
    const tabOrdersButton = document.getElementById('tab-orders');

    tabProductsButton?.addEventListener('click', () => switchTab('products'));
    tabOrdersButton?.addEventListener('click', () => switchTab('orders'));

    setInterval(() => checkLoginTimeout(), 60000);
}

function switchTab(tab) {
    const productsTab = document.getElementById('products-tab');
    const ordersTab = document.getElementById('orders-tab');
    const tabProductsButton = document.getElementById('tab-products');
    const tabOrdersButton = document.getElementById('tab-orders');

    if (tab === 'products') {
        productsTab.classList.add('active');
        ordersTab.classList.remove('active');
        tabProductsButton.classList.add('active');
        tabOrdersButton.classList.remove('active');
    } else if (tab === 'orders') {
        productsTab.classList.remove('active');
        ordersTab.classList.add('active');
        tabProductsButton.classList.remove('active');
        tabOrdersButton.classList.add('active');
    }
}


function checkLoginTimeout() {
    const loginTimestamp = localStorage.getItem('loginTimestamp');
    if (loginTimestamp && (Date.now() - parseInt(loginTimestamp)) > 1800000) {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('loginTimestamp');
        document.getElementById('admin-login').classList.remove('hidden');
        document.getElementById('admin-panel').classList.add('hidden');
        document.getElementById('tab-bar').classList.remove('visible');
    }
}


function setupProductDialogHandlers() {
    const openAddProductDialogButton = document.getElementById('open-add-product-dialog');
    const closeAddProductDialogButton = document.getElementById('close-add-product-dialog');
    const cancelAddProductButton = document.getElementById('dialog-cancel-button');

    openAddProductDialogButton?.addEventListener('click', openAddProductDialog);
    closeAddProductDialogButton?.addEventListener('click', () => {
        document.getElementById('add-product-dialog').classList.add('hidden');
    });
    cancelAddProductButton?.addEventListener('click', () => {
        clearProductDialogFields();
        document.getElementById('add-product-dialog').classList.add('hidden');
    });
}


function setupImagePreviewHandler() {
    const imageFileInput = document.getElementById('dialog-product-image-file');
    const imagePreviewsContainer = document.getElementById('image-previews');
    let dataTransfer = new DataTransfer();

    imageFileInput.addEventListener('change', () => {
        imagePreviewsContainer.classList.remove('hidden');
        const newFiles = Array.from(imageFileInput.files);

        if (dataTransfer.files.length + newFiles.length > 3) {
            alert("Es können maximal 3 Bilder hinzugefügt werden.");
            return;
        }
        newFiles.forEach(file => {
            dataTransfer.items.add(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.alt = 'Image Preview';
                img.classList.add('w-32', 'h-32', 'object-cover', 'rounded');
                imagePreviewsContainer.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
        imageFileInput.files = dataTransfer.files;
    });
}

function openAddProductDialog() {
    clearProductDialogFields();
    const addProductButton = document.getElementById('dialog-add-product-button');
    const addProductHeader = document.getElementById('dialog-add-product-header');

    addProductButton.textContent = 'Produkt hinzufügen';
    addProductHeader.textContent = 'Neues Produkt hinzufügen';

    const newButton = addProductButton.cloneNode(true);
    addProductButton.replaceWith(newButton);
    newButton.addEventListener('click', addNewProduct);

    document.getElementById('add-product-dialog').classList.remove('hidden');
}


async function addNewProduct() {
    const productName = document.getElementById('dialog-product-name').value;
    const productPrice = parseFloat(document.getElementById('dialog-product-price').value);
    const productQuantity = parseInt(document.getElementById('dialog-product-quantity').value, 10);
    const productCategory = document.getElementById('dialog-product-category').value;
    const productDescription = document.getElementById('dialog-product-description').value;
    const productShippingCost = parseFloat(document.getElementById('dialog-product-shipping-cost').value);
    const productImageFiles = document.getElementById('dialog-product-image-file').files;

    if (isValidProductData(productName, productPrice, productQuantity, productCategory, productDescription)) {
        const newProduct = {
            name: productName,
            price: productPrice,
            quantity: productQuantity,
            category: productCategory,
            description: productDescription,
            shippingCost: productShippingCost,
            imageFiles: Array.from(productImageFiles)
        };

        state.setState({ overlayLoading: true });
        try {
            await addProduct(newProduct);
            await loadProductsAndOrders();
            document.getElementById('add-product-dialog').classList.add('hidden');
            clearProductDialogFields();
        } catch (error) {
            alert('Fehler beim Hinzufügen des Produkts.');
        } finally {
            state.setState({ overlayLoading: false });
        }
    } else {
        alert('Bitte füllen Sie alle Felder korrekt aus.');
    }
}


window.editProductHandler = (productId) => {
    const product = state.getState().products.find(product => product.id === productId);
    if (!product) {
        alert('Produkt nicht gefunden.');
        return;
    }

    
    document.getElementById('dialog-product-name').value = product.name;
    document.getElementById('dialog-product-price').value = product.price;
    document.getElementById('dialog-product-quantity').value = product.quantity;
    document.getElementById('dialog-product-category').value = product.category;
    document.getElementById('dialog-product-description').value = product.description;
    document.getElementById('dialog-product-shipping-cost').value = product.shippingCost;

    const imagePreviewsContainer = document.getElementById('image-previews');
    imagePreviewsContainer.innerHTML = '';
    imagePreviewsContainer.classList.remove('hidden');
    product.imageUrls.forEach(imageUrl => {
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = 'Product Image';
        img.classList.add('w-32', 'h-32', 'object-cover', 'rounded');
        imagePreviewsContainer.appendChild(img);
    });

    
    const addProductButton = document.getElementById('dialog-add-product-button');
    const addProductHeader = document.getElementById('dialog-add-product-header');
    addProductButton.textContent = 'Änderungen speichern';
    addProductHeader.textContent = 'Produkt bearbeiten';

    const newButton = addProductButton.cloneNode(true);
    addProductButton.replaceWith(newButton);
    newButton.addEventListener('click', () => updateProduct(productId));

    document.getElementById('add-product-dialog').classList.remove('hidden');
}


async function updateProduct(productId) {
    const productName = document.getElementById('dialog-product-name').value;
    const productPrice = parseFloat(document.getElementById('dialog-product-price').value);
    const productQuantity = parseInt(document.getElementById('dialog-product-quantity').value, 10);
    const productCategory = document.getElementById('dialog-product-category').value;
    const productDescription = document.getElementById('dialog-product-description').value;
    const productShippingCost = parseFloat(document.getElementById('dialog-product-shipping-cost').value);
    const productImageFiles = document.getElementById('dialog-product-image-file').files;

    if (isValidProductData(productName, productPrice, productQuantity, productCategory, productDescription)) {
        const updatedProduct = {
            name: productName,
            price: productPrice,
            quantity: productQuantity,
            category: productCategory,
            description: productDescription,
            shippingCost: productShippingCost,
            imageFiles: Array.from(productImageFiles)
        };

        state.setState({ overlayLoading: true });
        try {
            await updateProductData(productId, updatedProduct);
            await loadProductsAndOrders();
            document.getElementById('add-product-dialog').classList.add('hidden');
            clearProductDialogFields();
        } catch (error) {
            alert('Fehler beim Aktualisieren des Produkts.');
        } finally {
            state.setState({ overlayLoading: false });
        }
    } else {
        alert('Bitte füllen Sie alle Felder korrekt aus.');
    }
}


function isValidProductData(productName, productPrice, productQuantity, productCategory, productDescription) {
    if (productName.length > 45) {
        alert('Der Produktname darf maximal 45 Zeichen lang sein.');
        return false;
    }

    if (productCategory.length > 25) {
        alert('Die Kategorie darf maximal 25 Zeichen lang sein.');
        return false;
    }

    if (!productName || productPrice <= 0 || productQuantity <= 0 || !productCategory || !productDescription) {
        return false;
    }

    return true;
}


function clearProductDialogFields() {
    document.getElementById('dialog-product-name').value = '';
    document.getElementById('dialog-product-price').value = '';
    document.getElementById('dialog-product-quantity').value = '';
    document.getElementById('dialog-product-category').value = '';
    document.getElementById('dialog-product-description').value = '';
    document.getElementById('dialog-product-shipping-cost').value = '';
    document.getElementById('dialog-product-image-file').value = '';
    document.getElementById('image-previews').innerHTML = '';
    document.getElementById('image-previews').classList.add('hidden');
}


window.deleteProductHandler = async (productId) => {
    state.setState({ overlayLoading: true });
    try {
        await deleteProduct(productId);
        await loadProductsAndOrders(); 
    } catch (error) {
        alert('Fehler beim Löschen des Produkts.');
    } finally {
        state.setState({ overlayLoading: false });
    }
};


window.updateOrderStatus = async (orderId) => {
    state.setState({ overlayLoading: true });
    const order = state.getState().orders.find(order => order.id === orderId);
    if (!order) return;

    let newStatus;
    switch (order.orderStatus) {
        case 'pending':
            newStatus = 'in progress';
            break;
        case 'in progress':
            newStatus = 'shipped';
            break;
        case 'shipped':
            newStatus = 'pending';
            break;
    }

    try {
        await updateOrderStatus(orderId, newStatus);
        await loadProductsAndOrders();
    } catch (error) {
        alert('Fehler beim Aktualisieren des Bestellstatus.');
    } finally {
        state.setState({ overlayLoading: false });
    }
};


window.updateOrderPayment = async (orderId) => {
    state.setState({ overlayLoading: true });
    const order = state.getState().orders.find(order => order.id === orderId);
    if (!order) return;

    const newPaymentStatus = order.paymentStatus === 'pending' ? 'paid' : 'pending';

    try {
        await updateOrderPayment(orderId, newPaymentStatus);
        await loadProductsAndOrders();
    } catch (error) {
        alert('Fehler beim Aktualisieren des Zahlungsstatus.');
    } finally {
        state.setState({ overlayLoading: false });
    }
};


function render() {
    const adminProductListElement = document.getElementById('admin-product-list');
    const adminOrderListElement = document.getElementById('admin-order-list');

    if (adminProductListElement) {
        adminProductListElement.innerHTML = '';
        const products = state.getState().products;

        products.forEach(product => {
            const mainImage = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : 'path/to/default-image.jpg';
            const shortDescription = product.description.length > 100 ? product.description.substring(0, 100) + '...' : product.description;

            const productElement = document.createElement('li');
            productElement.classList.add('admin-product-item');
            productElement.innerHTML = `
                <div class="flex items-center">
                    <img src="${mainImage}" alt="${product.name}" class="w-20 h-20 object-cover mr-4 rounded hidden-mobile">
                    <div>
                        <span class="font-bold">${product.name}</span> - ${product.price.toFixed(2)} € - <span class="text-gray-600">${product.quantity} Stück</span>
                        <div class="text-gray-600 hidden-mobile">${product.category}</div>
                        <div class="text-gray-600">${shortDescription}</div>
                        <div class="text-gray-600">Versandkosten: ${product.shippingCost.toFixed(2)} €</div>
                    </div>
                </div>
                <div>
                    <button class="edit-button" onclick="editProductHandler('${product.id}')">
                        <i class="fas fa-edit edit-icon"></i>
                    </button>
                    <button class="delete-button" onclick="deleteProductHandler('${product.id}')">
                        <i class="fas fa-trash delete-icon"></i>
                    </button>
                </div>
            `;
            adminProductListElement.appendChild(productElement);
        });
    }

    if (adminOrderListElement) {
        const orders = state.getState().orders;
        orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        adminOrderListElement.innerHTML = orders.map(order => {
            let orderStatusIcon = '';
            switch (order.orderStatus) {
                case 'pending':
                    orderStatusIcon = `<i class="material-icons status-icon text-yellow-500">hourglass_empty</i>`;
                    break;
                case 'in progress':
                    orderStatusIcon = `<i class="material-icons status-icon text-blue-500">autorenew</i>`;
                    break;
                case 'shipped':
                    orderStatusIcon = `<i class="material-icons status-icon text-green-500">local_shipping</i>`;
                    break;
            }

            const paymentIcon = order.paymentStatus === 'paid'
                ? `<i class="material-icons payment-icon text-green-500">paid</i>`
                : `<i class="material-icons payment-icon text-red-500">credit_card</i>`;

            const totalBeforeDiscount = order.items.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
            const totalAfterDiscount = order.promoCode ? (order.totalPrice).toFixed(2) : totalBeforeDiscount;

            return `
                <div class="order">
                    <div class="order-header grid grid-cols-2 gap-4">
                        <div class="col-span-2">
                            <div><strong>Lieferadresse:</strong><br>${order.shippingAddress.streetAddress}, ${order.shippingAddress.postalCodeCity}</div>
                            ${order.billingAddress ? `
                            <div><strong>Rechnungsadresse:</strong><br>${order.billingAddress.streetAddress}, ${order.billingAddress.postalCodeCity}</div>` : ''}
                            <div><strong>Bezahlmethode:</strong><br>${order.paymentMethod}</div>
                            <div class="mt-2"><strong>Besondere Infos:</strong><br>${order.specialInstructions || 'Keine besonderen Infos'}</div>
                        </div>
                        <div>
                            <div><strong>Kunde:</strong> ${order.customerName}</div>
                            <div><strong>Bestellnummer:</strong> ${order.id}</div>
                            <div><strong>Erstellt am:</strong> ${new Date(order.createdAt).toLocaleString('de-DE')}</div>
                        </div>

                        <div class="order-actions col-span-2 mt-4 admin-mobile-row">
                            <button class="status-button" onclick="updateOrderStatus('${order.id}')">
                                ${orderStatusIcon}
                            </button>
                            <button class="payment-button" onclick="updateOrderPayment('${order.id}')">
                                ${paymentIcon}
                            </button>
                        </div>
                    </div>
                    <table class="nested-table w-full text-left mt-4">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Einzelpreis</th>
                                <th>Anzahl</th>
                                <th>Gesamtpreis</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${item.price.toFixed(2)} €</td>
                                    <td>${item.quantity}</td>
                                    <td>${(item.price * item.quantity).toFixed(2)} €</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div class="order-footer mt-4">
                        <div class="order-footer-row">
                            <div class="label"><strong>Gesamtpreis:</strong></div>
                            <div class="value">${totalBeforeDiscount} €</div>
                        </div>
                        ${order.promoCode ? `
                            <div class="order-footer-row">
                                <div class="label"><strong>Rabatt (${order.promoCode}):</strong></div>
                                <div class="value">${order.discount}%</div>
                            </div>
                            <div class="order-footer-row">
                                <div class="label"><strong>Gesamtpreis nach Rabatt:</strong></div>
                                <div class="value">${totalAfterDiscount} €</div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }
}
