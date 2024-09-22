import { HeaderComponent } from './components/headerComponent.js';
import { getCategories } from './api.js';
import { state } from './state.js';

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
    const toggleSidebarButton = document.getElementById('toggle-sidebar-index');
    const categoryAside = document.getElementById('category-aside-index');
    const mainContent = document.getElementById('index-main-content');

    toggleSidebarButton.addEventListener('click', () => {
        if (window.innerWidth <= 767) { // Überprüfen, ob die Breite im mobilen Bereich ist
            categoryAside.classList.toggle('visible'); // Toggle die Klasse für mobiles Einblenden
        } else {
            categoryAside.classList.toggle('hidden');
            mainContent.classList.toggle('with-sidebar');

            if (categoryAside.classList.contains('hidden')) {
                mainContent.style.width = '100%'; // Volle Breite, wenn Sidebar ausgeblendet ist
                mainContent.style.marginLeft = '40px'; // Kein Abstand links
            } else {
                mainContent.style.width = 'calc(100% - 240px)'; // Dynamische Breite
                mainContent.style.marginRight = '240px !important'
                mainContent.style.marginLeft = '0'; // Kein Abstand links

            }
        }
    });



    // Kategorien-Weiterleitung
    const categoryItems = document.querySelectorAll('#category-aside-index ul li');
    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            const category = item.getAttribute('data-category');
            if (category) {
                window.location.href = `products.html?category=${category}`;
            }
        });
    });

    // Kategorien laden und anzeigen
    loadCategories();
});

async function loadCategories() {
    const categories = await getCategories();
    renderCategoryMenu(categories, 'category-list-index');
}

function renderCategoryMenu(categories, elementId) {
    const categoryListElement = document.getElementById(elementId);
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

        categoryItem.addEventListener('click', () => {
            window.location.href = `products.html?category=${category}`;
        });

        categoryListElement.appendChild(categoryItem);
    });
}