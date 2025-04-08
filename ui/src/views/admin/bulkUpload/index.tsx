// Chakra imports
import { Box, Button, Flex, Text, useColorModeValue, useToast } from '@chakra-ui/react';
// Custom components
import Card from 'components/card/Card';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';

export default function BulkUpload() {
	const [isUploading, setIsUploading] = useState(false);
	const toast = useToast();
	
	// Chakra Color Mode
	const textColor = useColorModeValue('secondaryGray.900', 'white');
	const textColorSecondary = useColorModeValue('secondaryGray.600', 'white');
	const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
	
	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		accept: {
			'text/csv': ['.csv']
		},
		maxFiles: 1,
		onDrop: async (acceptedFiles) => {
			if (acceptedFiles.length === 0) return;
			
			const file = acceptedFiles[0];
			const formData = new FormData();
			formData.append('file', file);
			
			try {
				setIsUploading(true);
				const response = await fetch('http://localhost:3002/api/transactions/bulk', {
					method: 'POST',
					body: formData
				});
				
				if (!response.ok) {
					throw new Error('Upload failed');
				}
				
				const result = await response.json();
				
				toast({
					title: 'Upload successful',
					description: `Successfully processed ${result.processed} transactions`,
					status: 'success',
					duration: 5000,
					isClosable: true
				});
			} catch (error) {
				toast({
					title: 'Upload failed',
					description: 'There was an error processing your file',
					status: 'error',
					duration: 5000,
					isClosable: true
				});
			} finally {
				setIsUploading(false);
			}
		}
	});
	
	return (
		<Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
			<Card p='20px'>
				<Flex direction='column' w='100%'>
					<Text color={textColor} fontSize='2xl' fontWeight='700' mb='20px'>
						Bulk Upload Transactions
					</Text>
					<Text color={textColorSecondary} fontSize='md' fontWeight='400' mb='20px'>
						Upload a CSV file containing transaction data. The file should have the following columns:
						Date, Client, Deposit
					</Text>
					
					<Box
						{...getRootProps()}
						border='2px dashed'
						borderColor={isDragActive ? 'brand.500' : 'gray.200'}
						borderRadius='lg'
						p='40px'
						textAlign='center'
						cursor='pointer'
						_hover={{ borderColor: 'brand.500' }}
						bg={isDragActive ? 'brand.50' : 'transparent'}
					>
						<input {...getInputProps()} />
						{isUploading ? (
							<Text>Uploading...</Text>
						) : isDragActive ? (
							<Text>Drop the CSV file here...</Text>
						) : (
							<Text>Drag and drop a CSV file here, or click to select a file</Text>
						)}
					</Box>
					
					<Button
						mt='20px'
						variant='brand'
						onClick={() => {
							const input = document.querySelector('input[type="file"]') as HTMLInputElement;
							if (input) {
								input.click();
							}
						}}
						isLoading={isUploading}
					>
						Select File
					</Button>
				</Flex>
			</Card>
		</Box>
	);
} 