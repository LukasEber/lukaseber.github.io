export class LoadingIndicator {
    constructor(parentElement) {
        this.element = document.createElement('div');
        this.element.className = 'loading-indicator hidden';
        this.element.innerHTML = `
            <div class="loading-spinner"></div>
        `;
        parentElement.appendChild(this.element);
    }

    show() {
        this.element.classList.remove('hidden');
    }

    hide() {
        this.element.classList.add('hidden');
    }
}

export class OverlayLoadingIndicator {
    constructor(parentElement) {
        this.element = document.createElement('div');
        this.element.className = 'loading-overlay hidden';
        this.element.innerHTML = `
            <div class="loading-indicator">
                <div class="loading-spinner"></div>
            </div>
        `;
        parentElement.appendChild(this.element);
    }

    show() {
        this.element.classList.remove('hidden');
    }

    hide() {
        this.element.classList.add('hidden');
    }
}
