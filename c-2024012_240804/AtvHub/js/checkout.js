import { addOrder, getPromoCodes } from './api.js';
import { HeaderComponent } from './components/headerComponent.js';

document.addEventListener('DOMContentLoaded', async () => {
    const body = document.querySelector('body');
    const header = new HeaderComponent();
    body.prepend(header.element);

    renderCartSummary();

    document.getElementById('billing-address-toggle').addEventListener('change', toggleBillingAddress);
    document.getElementsByName('payment-method').forEach(radio => {
        radio.addEventListener('change', togglePaymentMethod);
    });
    document.getElementById('checkout-form').addEventListener('submit', handleCheckout);
    document.getElementById('apply-promo-code').addEventListener('click', handleApplyPromoCode);
});

let currentPromoCode = null;

async function handleApplyPromoCode() {
    const promoCodeInput = document.getElementById('promo-code').value.trim();
    const promoMessage = document.getElementById('promo-message');
    promoMessage.classList.add('hidden');

    if (!promoCodeInput) {
        promoMessage.classList.remove('hidden');
        return;
    }

    try {
        const promoCodes = await getPromoCodes();
        const matchedPromo = promoCodes.find(promo => promo.code === promoCodeInput);

        if (matchedPromo) {
            currentPromoCode = matchedPromo;
            promoMessage.classList.remove('text-red-500');
            promoMessage.classList.add('text-green-500');
            promoMessage.textContent = `Promo-Code angewendet! ${matchedPromo.discount}% Rabatt wurde hinzugefügt.`;
            promoMessage.classList.remove('hidden');
            renderCartSummary();
        } else {
            promoMessage.classList.remove('text-green-500');
            promoMessage.classList.add('text-red-500');
            promoMessage.textContent = "Ungültiger Promo-Code.";
            promoMessage.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Fehler beim Abrufen der Promo-Codes:', error);
        promoMessage.textContent = "Fehler beim Überprüfen des Promo-Codes. Bitte versuchen Sie es erneut.";
        promoMessage.classList.remove('hidden');
    }
}

let isPayPalButtonRendered = false;

function togglePaymentMethod() {
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
    const bankInfo = document.getElementById('bank-info');
    const paypalButtonContainer = document.getElementById('paypal-button-container');
    const orderButton = document.getElementById('order-button');
    const addressFields = document.getElementById('address-fields');

    if (paymentMethod === 'bank') {
        bankInfo.innerHTML = `<p>Nach der Bestätigung Ihrer Bestellung erhalten Sie alle Details zur Überweisung.</p>`;
        bankInfo.classList.remove('hidden');
        paypalButtonContainer.classList.add('hidden');
        orderButton.classList.remove('hidden');
        addressFields.classList.remove('hidden');
        setBankFieldRequired(true);
    } else if (paymentMethod === 'paypal') {
        bankInfo.classList.add('hidden');
        paypalButtonContainer.classList.remove('hidden');
        orderButton.classList.add('hidden');
        addressFields.classList.add('hidden');
        setBankFieldRequired(false);

        if (!isPayPalButtonRendered) {
            renderPaypalButton();
            isPayPalButtonRendered = true;
        }
    }
}

function renderPaypalButton() {
    const buttonContainer = document.getElementById('paypal-button-container');

    if (!buttonContainer) {
        console.error('PayPal button container not found.');
        return;
    }

    paypal.Buttons({
        fundingSource: paypal.FUNDING.PAYPAL,

        createOrder: function (data, actions) {
            const totalAmount = calculateTotalAmount();

            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: totalAmount.toFixed(2)
                    }
                }]
            });
        },

        onApprove: function (data, actions) {
            return actions.order.capture().then(function (details) {
                const shippingAddress = details.purchase_units[0].shipping.address;
                const payerInfo = details.payer;

                const customerName = `${payerInfo.name.given_name} ${payerInfo.name.surname}`;
                const streetAddress = shippingAddress.address_line_1 || '';
                const postalCodeCity = `${shippingAddress.postal_code} ${shippingAddress.admin_area_2}`;
                const gender = payerInfo.gender || '';
                const emailAddress = payerInfo.email_address;

                const paymentStatus = 'paid';

                saveOrder(paymentStatus, 'pending', 'paypal', {
                    customerName,
                    gender,
                    emailAddress,
                    streetAddress,
                    postalCodeCity,
                }).then((order) => {
                    showOrderConfirmation(order.id);
                });
            });
        },

        onError: function (err) {
            console.error('Error during PayPal payment:', err);
            alert('An error occurred during payment. Please try again.');
        }

    }).render('#paypal-button-container');
}

function setBankFieldRequired(isRequired) {
    const fields = ['customer-name', 'gender', 'street-address', 'postal-code-city'];
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            if (isRequired) {
                field.setAttribute('required', 'required');
            } else {
                field.removeAttribute('required');
            }
        }
    });
}

function calculateTotalAmount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    let totalAmount = 0;
    let maxShippingCost = 0;

    cart.forEach(product => {
        const totalPrice = product.price * product.cartQuantity;
        totalAmount += totalPrice;
        const productShippingCost = product.shippingCost * product.cartQuantity;

        if (productShippingCost > maxShippingCost) {
            maxShippingCost = productShippingCost;
        }
    });

    const shippingCost = totalAmount >= 150 ? 0 : maxShippingCost;

    if (currentPromoCode) {
        totalAmount -= totalAmount * (currentPromoCode.discount / 100);
    }

    return totalAmount + shippingCost;
}

function renderCartSummary() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartSummaryElement = document.getElementById('cart-summary');
    cartSummaryElement.innerHTML = '';

    if (cart.length === 0) {
        cartSummaryElement.innerHTML = '<p class="text-center">Ihr Warenkorb ist leer.</p>';
        return;
    }

    const container = document.createElement('div');
    container.classList.add('cart-summary-container', 'bg-white', 'rounded', 'shadow-md', 'p-4');

    let totalAmount = 0;
    let maxShippingCost = 0;

    cart.forEach((product, index) => {
        const totalPrice = product.price * product.cartQuantity;
        totalAmount += totalPrice;
        const productShippingCost = product.shippingCost * product.cartQuantity;

        if (productShippingCost > maxShippingCost) {
            maxShippingCost = productShippingCost;
        }

        const productRow = document.createElement('div');
        productRow.classList.add('cart-summary-row', 'py-4');

        const productTitle = document.createElement('div');
        productTitle.classList.add('flex', 'justify-between', 'items-center', 'mb-2');
        productTitle.innerHTML = `
            <span class="font-bold">${product.name}</span>
            <span class="text-gray-500">${product.category}</span>
        `;
        productRow.appendChild(productTitle);

        const priceQuantityTotal = document.createElement('div');
        priceQuantityTotal.classList.add('flex', 'justify-between', 'items-center', 'mb-2');

        const price = document.createElement('span');
        price.classList.add('text-gray-700');
        price.textContent = `${product.price.toFixed(2)} €`;

        const quantity = document.createElement('span');
        quantity.classList.add('text-gray-500');
        quantity.textContent = `${product.cartQuantity} Stück`;

        const total = document.createElement('span');
        total.classList.add('font-bold');
        total.textContent = `${totalPrice.toFixed(2)} €`;

        priceQuantityTotal.appendChild(price);
        priceQuantityTotal.appendChild(quantity);
        priceQuantityTotal.appendChild(total);
        productRow.appendChild(priceQuantityTotal);

        container.appendChild(productRow);

        if (index < cart.length - 1) {
            const divider = document.createElement('hr');
            divider.classList.add('border-gray-300', 'my-2');
            container.appendChild(divider);
        }
    });

    const shippingCost = totalAmount >= 150 ? 0 : maxShippingCost;

    const shippingRow = document.createElement('div');
    shippingRow.classList.add('cart-summary-row', 'summary-total-row', 'font-bold', 'py-4', 'flex', 'justify-between');
    shippingRow.innerHTML = `
        <span>+ Versand</span>
        <span class="text-right">${shippingCost.toFixed(2)} €</span>
    `;
    container.appendChild(shippingRow);
    
    let discountAmount = 0;
    if (currentPromoCode) {
        shippingRow.classList.remove('py-4');
        discountAmount = totalAmount * (currentPromoCode.discount / 100);
        const discountRow = document.createElement('div');
        discountRow.classList.add('cart-summary-row', 'summary-total-row', 'font-bold', 'py-4', 'flex', 'justify-between');
        discountRow.innerHTML = `
            <span>- Promo-Code (${currentPromoCode.discount}%)</span>
            <span class="text-right">- ${discountAmount.toFixed(2)} €</span>
        `;
        container.appendChild(discountRow);
    }

    const totalRow = document.createElement('div');
    totalRow.classList.add('cart-summary-row', 'summary-total-row', 'font-bold', 'py-4', 'border-t', 'border-gray-300', 'flex', 'justify-between');
    totalRow.innerHTML = `
    <span>Gesamtpreis</span>
    <span class="text-right">${(totalAmount + shippingCost - discountAmount).toFixed(2)} €</span>
`;
    container.appendChild(totalRow);

    cartSummaryElement.appendChild(container);
}

function toggleBillingAddress() {
    const billingSection = document.getElementById('billing-address-section');
    if (this.checked) {
        billingSection.classList.remove('hidden');
    } else {
        billingSection.classList.add('hidden');
    }
}

function handleCheckout(event) {
    event.preventDefault();

    const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
    let paymentStatus = 'pending';
    let orderStatus = 'pending';

    saveOrder(paymentStatus, orderStatus, paymentMethod).then((order) => {
        const orderId = order.id;
        showOrderConfirmation(orderId);
    }).catch(error => {
        console.error('Fehler beim Erstellen der Bestellung:', error);
        alert('Es gab ein Problem bei der Bestellungsaufgabe. Bitte versuchen Sie es erneut.');
    });
}


function saveOrder(paymentStatus, orderStatus, paymentMethod, shippingInfo = null) {
    const customerName = shippingInfo ? shippingInfo.customerName : document.getElementById('customer-name').value;
    const gender = shippingInfo ? shippingInfo.gender : document.getElementById('gender').value;
    const streetAddress = shippingInfo ? shippingInfo.streetAddress : document.getElementById('street-address').value;
    const postalCodeCity = shippingInfo ? shippingInfo.postalCodeCity : document.getElementById('postal-code-city').value;
    const specialInstructions = document.getElementById('special-instructions').value;
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    let billingAddress = null;
    if (shippingInfo === null && document.getElementById('billing-address-toggle').checked) {
        billingAddress = {
            streetAddress: document.getElementById('billing-street-address').value,
            postalCodeCity: document.getElementById('billing-postal-code-city').value
        };
    }

    const orderItems = cart.map(product => ({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: product.cartQuantity,
        shippingCost: product.shippingCost
    }));

    const totalPrice = calculateTotalAmount();

    const order = {
        customerName,
        gender,
        paymentMethod,
        shippingAddress: {
            streetAddress,
            postalCodeCity
        },
        billingAddress: billingAddress || {
            streetAddress,
            postalCodeCity
        },
        items: orderItems,
        totalPrice,
        promoCode: currentPromoCode ? currentPromoCode.code : null,
        discount: currentPromoCode ? currentPromoCode.discount : 0,
        specialInstructions,
        paymentStatus,
        orderStatus,
        createdAt: new Date().toISOString()
    };

    return addOrder(order).then((createdOrder) => {
        return createdOrder;
    });
}

function showOrderConfirmation(orderId) {
    localStorage.removeItem('cart');
    window.location.href = 'order-confirmation.html?orderId=' + orderId;
}
