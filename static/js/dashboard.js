/**
 * Dashboard JavaScript for the home page
 */

// DOM Elements
const totalIncomeElement = document.getElementById('total-income');
const totalExpenseElement = document.getElementById('total-expense');
const balanceElement = document.getElementById('balance');
const recentTransactionsElement = document.getElementById('recent-transactions');

// Global state
let transactions = [];

// Fetch all transactions
const fetchTransactions = async () => {
  try {
    transactions = await fetchAPI('/transactions');
    updateDashboard();
  } catch (error) {
    showError(error.message);
  }
};

// Calculate summary metrics
const calculateSummaryMetrics = () => {
  const metrics = {
    totalIncome: 0,
    totalExpense: 0,
    balance: 0
  };
  
  transactions.forEach(transaction => {
    if (transaction.type === 'income') {
      metrics.totalIncome += transaction.amount;
    } else {
      metrics.totalExpense += transaction.amount;
    }
  });
  
  metrics.balance = metrics.totalIncome - metrics.totalExpense;
  
  return metrics;
};

// Update dashboard with latest data
const updateDashboard = () => {
  // Calculate metrics
  const metrics = calculateSummaryMetrics();
  
  // Update summary cards
  totalIncomeElement.textContent = formatCurrency(metrics.totalIncome);
  totalExpenseElement.textContent = formatCurrency(metrics.totalExpense);
  balanceElement.textContent = formatCurrency(metrics.balance);
  
  // Update recent transactions
  updateRecentTransactions();
};

// Update the recent transactions section
const updateRecentTransactions = () => {
  // Clear existing transactions
  recentTransactionsElement.innerHTML = '';
  
  // Get the 5 most recent transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);
  
  // If there are no transactions, show empty state
  if (recentTransactions.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.innerHTML = `
      <i class="fas fa-receipt"></i>
      <p>No transactions yet</p>
      <a href="/transactions" class="btn btn-primary">Add Transaction</a>
    `;
    recentTransactionsElement.appendChild(emptyState);
    return;
  }
  
  // Create elements for each transaction
  recentTransactions.forEach(transaction => {
    const transactionElement = createTransactionElement(transaction);
    recentTransactionsElement.appendChild(transactionElement);
  });
};

// Function to handle opening the edit modal (redirects to transactions page)
const openEditModal = (transaction) => {
  window.location.href = `/transactions?edit=${transaction.id}`;
};

// Function to handle opening the delete modal (redirects to transactions page)
const openDeleteModal = (transaction) => {
  window.location.href = `/transactions?delete=${transaction.id}`;
};

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
  fetchTransactions();
}); 