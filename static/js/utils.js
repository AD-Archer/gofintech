/**
 * Shared utility functions for the application
 */

// Format currency with 2 decimal places
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

// Create a transaction element
const createTransactionElement = (transaction) => {
    const element = document.createElement('div');
    element.className = `transaction-card ${transaction.type}`;
    
    // Format date
    const date = new Date(transaction.date);
    const formattedDate = date.toLocaleDateString();
    
    // Format amount with currency
    const formattedAmount = formatCurrency(transaction.amount);
    
    element.innerHTML = `
        <div class="transaction-header">
            <div class="transaction-info">
                <h3>${transaction.description}</h3>
                <span class="category">${transaction.category}</span>
                <span class="roommate">Added by: ${transaction.createdBy}</span>
            </div>
            <div class="transaction-amount ${transaction.type}">
                ${transaction.type === 'expense' ? '-' : '+'}${formattedAmount}
            </div>
        </div>
        <div class="transaction-footer">
            <span class="date">${formattedDate}</span>
            <div class="transaction-actions">
                <button class="btn btn-icon edit-btn" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-icon delete-btn" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    
    return element;
};

// Setup modal functionality
const setupModal = (modalId, closeBtnId, cancelBtnId) => {
    const modal = document.getElementById(modalId);
    const closeBtn = document.getElementById(closeBtnId);
    const cancelBtn = document.getElementById(cancelBtnId);
    
    const closeModal = () => {
        modal.style.display = 'none';
    };
    
    if (closeBtn) {
        closeBtn.onclick = closeModal;
    }
    
    if (cancelBtn) {
        cancelBtn.onclick = closeModal;
    }
    
    window.onclick = (event) => {
        if (event.target === modal) {
            closeModal();
        }
    };
    
    return modal;
};

// Show error message
const showError = (message) => {
    // You can implement this based on your UI needs
    console.error(message);
    alert(message);
};

// API helper functions
const fetchAPI = async (endpoint, options = {}) => {
    const response = await fetch(`/api${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'API request failed');
    }

    return response.json();
};

// Export functions
window.utils = {
    formatCurrency,
    createTransactionElement,
    setupModal,
    showError,
    fetchAPI
}; 