import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
  Card,
  CardHeader,
  CardBody,
  Text,
  Heading
} from '@chakra-ui/react';

interface Transaction {
  Date: string;
  Client: string;
  Deposit: number;
}

export default function MakePayment() {
  const toast = useToast();
  const [transaction, setTransaction] = useState<Transaction>({
    Date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD
    Client: '',
    Deposit: 0
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTransaction(prev => ({
      ...prev,
      [name]: name === 'Deposit' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3002/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transaction),
      });

      if (!response.ok) throw new Error('Failed to create transaction');

      toast({
        title: 'Payment Recorded',
        description: 'The transaction has been successfully saved.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Reset form
      setTransaction({
        Date: new Date().toISOString().split('T')[0],
        Client: '',
        Deposit: 0
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save transaction',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <Card>
        <CardHeader>
          <Heading size='md'>Make Payment</Heading>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Date</FormLabel>
                <Input
                  type="date"
                  name="Date"
                  value={transaction.Date}
                  onChange={handleInputChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Client Name</FormLabel>
                <Input
                  type="text"
                  name="Client"
                  value={transaction.Client}
                  onChange={handleInputChange}
                  placeholder="Enter client name"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Deposit Amount</FormLabel>
                <Input
                  type="number"
                  name="Deposit"
                  value={transaction.Deposit}
                  onChange={handleInputChange}
                  placeholder="Enter deposit amount"
                  min={0}
                  step={0.01}
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                width="full"
              >
                Submit Payment
              </Button>
            </VStack>
          </form>
        </CardBody>
      </Card>
    </Box>
  );
}
