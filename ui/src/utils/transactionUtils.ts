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

export const processTransactionData = (transactions: Transaction[]): ProcessedTransactionData => {
  const clientData: { [key: string]: { [key: string]: number } } = {};
  const months: string[] = [];
  let total = 0;

  transactions.forEach((transaction: Transaction) => {
    const date = new Date(transaction.Date);
    const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    if (!months.includes(monthYear)) {
      months.push(monthYear);
    }
    
    if (!clientData[transaction.Client]) {
      clientData[transaction.Client] = {};
    }
    
    if (!clientData[transaction.Client][monthYear]) {
      clientData[transaction.Client][monthYear] = 0;
    }
    
    clientData[transaction.Client][monthYear] += transaction.Deposit;
    total += transaction.Deposit;
  });
  
  // Sort months chronologically
  months.sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateA.getTime() - dateB.getTime();
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
    startDate.setMonth(startDate.getMonth() - months);
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