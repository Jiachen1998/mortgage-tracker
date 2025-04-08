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
  Heading,
  Select,
  InputGroup,
  InputLeftAddon
} from '@chakra-ui/react';

// Add this enum before the Transaction interface
enum ClientNames {
  JIACHEN_LU = "Jiachen",
  JIALIN_LU = "Jialin",
  // Add more clients here
}

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
          <Heading size='md'>Log Payment</Heading>
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
                <Select
                  name="Client"
                  value={transaction.Client}
                  onChange={handleInputChange}
                  placeholder="Select client"
                  sx={{
                    '& option[value=""]': {
                      display: 'none'
                    }
                  }}
                >
                  {Object.values(ClientNames).map((clientName) => (
                    <option key={clientName} value={clientName}>
                      {clientName}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Deposit Amount</FormLabel>
                <InputGroup>
                  <InputLeftAddon children="$" />
                  <Input
                    type="number"
                    name="Deposit"
                    value={transaction.Deposit.toFixed(2)}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min={0}
                    step={0.01}
                    textAlign="right"
                  />
                </InputGroup>
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
