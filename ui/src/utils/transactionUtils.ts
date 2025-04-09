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