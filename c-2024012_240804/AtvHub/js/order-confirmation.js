import { getOrderById } from './api.js';
import { HeaderComponent } from './components/headerComponent.js';
import { LoadingIndicator } from './components/loadingIndicator.js';

document.addEventListener('DOMContentLoaded', async () => {
    const body = document.querySelector('body');
    const header = new HeaderComponent();
    body.prepend(header.element);
    
    const mainContent = document.querySelector('main');
    const resultsView = document.getElementById('order-confirmation');
    const bankInfo = document.getElementById('bank-info');
    const successMessage = document.getElementById('success-message');

    const loadingIndicator = new LoadingIndicator(mainContent);

    const orderId = new URLSearchParams(window.location.search).get('orderId');
    if (orderId) {
        mainContent.classList.add('main');  
        loadingIndicator.show();
        resultsView.classList.add('hidden');

        try {
            const order = await getOrderById(orderId);
            loadingIndicator.hide();
            mainContent.classList.remove('main');
            resultsView.classList.remove('hidden');
            if(order.paymentMethod === 'bank') {
                bankInfo.classList.remove('hidden');
            }
            else {
                successMessage.innerHTML = '<p>Vielen Dank für Ihre Bestellung! Sie können nun zurückkehren.</p>'
            }

            if (order) {
                document.getElementById('success-message').classList.remove('hidden');
                document.getElementById('bank-reference').textContent = `${orderId};${order.customerName}`;
                document.getElementById('order-amount').textContent = `${order.totalPrice.toFixed(2)} €`;
            } else {
                document.getElementById('bank-info').innerHTML = '<p class="text-red-500">Bestellung nicht gefunden.</p>';
            }
        } catch (error) {
            console.error('Fehler beim Abrufen der Bestelldaten:', error);
            loadingIndicator.hide();
            mainContent.classList.remove('hidden');

            document.getElementById('bank-info').innerHTML = '<p class="text-red-500">Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.</p>';
        }
    } else {
        document.getElementById('bank-info').innerHTML = '<p class="text-red-500">Keine Bestellnummer angegeben.</p>';
    }
});
