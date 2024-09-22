import { state } from '../state.js';
import { getProducts } from '../api.js';

export class HeaderComponent {
    constructor() {
        this.element = document.createElement('header');
        this.element.className = 'header p-4 bg-gray-800';
        this.element.innerHTML = `
            <div class="container-header flex justify-between items-center w-full px-5">
                <!-- Move ATV-Hub to the left -->
                <h1 class="text-3xl font-bold text-white" style="width: 280px;">ATV-Hub</h1>

                <!-- Suchleiste für Desktop -->
                <div class="searchbar hidden md:flex flex-col justify-center relative">
                    <input type="text" id="search-input" class="p-2 rounded w-full" placeholder="Suchen...">
                    <ul id="search-results" class="hidden"></ul>
                </div>

                <!-- Move the icons to the right -->
                <nav class="nav mt-2 flex items-center space-x-4 hidden md:flex">
                    <a href="index.html" class="nav-link">Startseite</a>
                    <a href="products.html" class="nav-link">Produkte</a>
                    <a href="cart.html" class="material-icons ml-4">shopping_cart</a>
                </nav>

                <button id="menu-toggle" class="menu-button md:hidden">
                    <span class="material-icons">menu</span>
                </button>
            </div>

            <!-- Zweiter Header nur für mobile -->
            <div class="second-header searchbar-container hidden md:hidden px-5">
                <div class="searchbar flex flex-col justify-center relative">
                    <input type="text" id="mobile-search-input" class="p-2 rounded w-full" placeholder="Suchen...">
                    <ul id="mobile-search-results" class="hidden"></ul>
                </div>
            </div>

            <div id="mobile-menu" class="mobile-menu hidden md:hidden">
                <a href="index.html" class="nav-link">Startseite</a>
                <a href="products.html" class="nav-link">Produkte</a>
                <a href="cart.html" class="nav-link">Warenkorb</a>
            </div>
        `;

        document.body.prepend(this.element);

        // Elemente referenzieren
        this.mobileMenuToggle = this.element.querySelector('#menu-toggle');
        this.mobileMenu = this.element.querySelector('#mobile-menu');
        this.desktopNav = this.element.querySelector('.nav');
        this.searchbarDesktop = this.element.querySelector('.searchbar');
        this.searchbarMobile = this.element.querySelector('.second-header');

        // Event Listener hinzufügen
        this.addEventListeners();
        this.adjustNavDisplay();
        window.addEventListener('resize', () => this.adjustNavDisplay());

        // Produkte laden und im state speichern
        this.loadProducts();
    }

    async loadProducts() {
        try {
            const products = await getProducts();
            state.setProducts(products);
        } catch (error) {
            console.error('Fehler beim Laden der Produkte:', error);
        }
    }

    addEventListeners() {
        this.mobileMenuToggle.addEventListener('click', () => {
            this.mobileMenu.classList.toggle('hidden');
        });

        // Event Listener für die Suchleiste (Desktop)
        const searchInput = this.element.querySelector('#search-input');
        searchInput.addEventListener('input', (event) => this.handleSearch(event, '#search-results'));

        // Event Listener für die Suchleiste (Mobile)
        const mobileSearchInput = this.element.querySelector('#mobile-search-input');
        mobileSearchInput.addEventListener('input', (event) => this.handleSearch(event, '#mobile-search-results'));

        // Klick außerhalb der Suchergebnisse (Desktop und Mobile)
        document.addEventListener('click', (event) => {
            const searchResults = this.element.querySelector('#search-results');
            const mobileSearchResults = this.element.querySelector('#mobile-search-results');
            const searchbar = this.element.querySelector('.searchbar');
            const mobileSearchbar = this.element.querySelector('.second-header');
            if (!searchbar.contains(event.target) && !mobileSearchbar.contains(event.target)) {
                searchResults.classList.add('hidden');
                mobileSearchResults.classList.add('hidden');
            }
        });
    }

    handleSearch(event, resultsSelector) {
        const keyword = event.target.value;
        const results = state.searchProducts(keyword);
        const resultsContainer = this.element.querySelector(resultsSelector);

        if (results.length > 0) {
            resultsContainer.innerHTML = results
                .map(product => `<li class="p-2 hover:bg-gray-200 cursor-pointer">
                                    <a href="/productDetail.html?id=${product.id}" class="block">${product.name}</a>
                                 </li>`)
                .join('');
            resultsContainer.classList.remove('hidden');
        } else {
            resultsContainer.classList.add('hidden');
        }

        if (keyword.trim() === '') {
            resultsContainer.classList.add('hidden');
        }
    }

    adjustNavDisplay() {
        if (window.innerWidth >= 768) {
            this.desktopNav.classList.remove('hidden');
            this.mobileMenu.classList.add('hidden');
            this.searchbarDesktop.classList.remove('hidden');
            this.searchbarMobile.classList.add('hidden');
        } else {
            this.desktopNav.classList.add('hidden');
            this.searchbarDesktop.classList.add('hidden');
            this.searchbarMobile.classList.remove('hidden');
        }
    }
}
