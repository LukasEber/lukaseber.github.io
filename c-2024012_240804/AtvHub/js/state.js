class State {
    constructor() {
        this.state = {
            products: [],  
            orders: [],    
            loading: false,
            overlayLoading: false,
        };
        this.listeners = [];
    }

    getState() {
        return this.state;
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.listeners.forEach(listener => listener());
    }

    setProducts(products) {
        // Setze die Produkte im state-Objekt
        this.setState({ products });
    }

    subscribe(listener) {
        this.listeners.push(listener);
    }

    searchProducts(keyword) {
        // Suche in den Produkten im state-Objekt
        return this.state.products.filter(product =>
            product.name.toLowerCase().includes(keyword.toLowerCase())
        );
    }
}

export const state = new State();
