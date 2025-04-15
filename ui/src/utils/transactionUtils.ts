import axios from 'axios';

// Define transaction interface
export interface Transaction {
  _id: string;
  Date: string;
  Client: string;
  Deposit: number;
}

// Define chart series interface
export interface ChartSeries {
  name: string;
  data: number[];
}

export interface ProcessedTransactionData {
  clientData: { [key: string]: { [key: string]: number } };
  months: string[];
  total: number;
}

export const fetchTransactions = async (): Promise<Transaction[]> => {
  const response = await axios.get<Transaction[]>('http://localhost:3002/api/transactions');
  return response.data;
};

export const processTransactionData = (transactions: Transaction[], monthsToShow: number): ProcessedTransactionData => {
  const clientData: { [key: string]: { [key: string]: number } } = {};
  const months: string[] = [];
  let total = 0;

  // First, get all unique clients
  const uniqueClients = new Set(transactions.map(t => t.Client));

  // Generate all months in the range
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - (monthsToShow - 1)); // Get last N months including current

  // Generate all months in the range
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const monthYear = currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    if (!months.includes(monthYear)) {
      months.push(monthYear);
    }
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  // Sort months chronologically
  months.sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateA.getTime() - dateB.getTime();
  });

  // Initialize client data with all months set to 0
  uniqueClients.forEach(client => {
    clientData[client] = {};
    months.forEach(month => {
      clientData[client][month] = 0;
    });
  });

  // Process transactions
  transactions.forEach((transaction: Transaction) => {
    const date = new Date(transaction.Date);
    const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    if (clientData[transaction.Client] && clientData[transaction.Client][monthYear] !== undefined) {
      clientData[transaction.Client][monthYear] += transaction.Deposit;
      total += transaction.Deposit;
    }
  });

  return { clientData, months, total };
};

export const createBarChartSeries = (clientData: { [key: string]: { [key: string]: number } }, months: string[]): ChartSeries[] => {
  return Object.keys(clientData).map(client => {
    const data = months.map(month => clientData[client][month] || 0);
    return {
      name: client,
      data
    };
  });
};

export const filterTransactionsByDateRange = (transactions: Transaction[], months: number): Transaction[] => {
    const endDate = new Date(); // Current date
    const startDate = new Date();
    // Subtract months-1 to include the current month
    startDate.setMonth(startDate.getMonth() - (months - 1));
    // Set to first day of the month
    startDate.setDate(1);
    // Set to last day of the current month
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0);
    
    console.log('Filtering transactions:', {
        totalTransactions: transactions.length,
        months,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
    });
    
    const filtered = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.Date);
        return transactionDate >= startDate && transactionDate <= endDate;
    });
    
    console.log('Filtered transactions:', filtered.length);
    return filtered;
};

export const getDateRangeOptions = () => [
    { value: '3', label: '3 Months' },
    { value: '6', label: '6 Months' },
    { value: '12', label: '12 Months' }
]; 