// Chakra imports
import { Box, Button, Flex, Icon, Text, useColorModeValue, Spinner } from '@chakra-ui/react';
// Custom components
import Card from 'components/card/Card';
import LineChart from 'components/charts/LineChart';
import { IoCheckmarkCircle } from 'react-icons/io5';
import { MdBarChart, MdOutlineCalendarToday } from 'react-icons/md';
// Assets
import { RiArrowUpSFill } from 'react-icons/ri';
import { useEffect, useState } from 'react';
import axios from 'axios';

// Define transaction interface
interface Transaction {
	_id: string;
	Date: string;
	Client: string;
	Deposit: number;
}

// Define chart series interface
interface ChartSeries {
	name: string;
	data: number[];
}

export default function TotalSpent(props: { [x: string]: any }) {
	const { ...rest } = props;
	const [chartData, setChartData] = useState<ChartSeries[]>([]);
	const [chartOptions, setChartOptions] = useState<any>({});
	const [loading, setLoading] = useState(true);
	const [totalDeposit, setTotalDeposit] = useState(0);
	const [percentChange, setPercentChange] = useState(0);
	const [isUploading, setIsUploading] = useState(false);

	// Chakra Color Mode
	const textColor = useColorModeValue('secondaryGray.900', 'white');
	const textColorSecondary = useColorModeValue('secondaryGray.600', 'white');
	const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
	const iconColor = useColorModeValue('brand.500', 'white');
	const bgButton = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
	const bgHover = useColorModeValue({ bg: 'secondaryGray.400' }, { bg: 'whiteAlpha.50' });
	const bgFocus = useColorModeValue({ bg: 'secondaryGray.300' }, { bg: 'whiteAlpha.100' });

	useEffect(() => {
		const fetchTransactions = async () => {
			try {
				setLoading(true);
				const response = await axios.get<Transaction[]>('http://localhost:3002/api/transactions');
				const transactions = response.data;
				
				// Process the data to group by client and month
				const clientData: { [key: string]: { [key: string]: number } } = {};
				const months: string[] = [];
				
				// Calculate total deposit
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
				
				// Create chart data series
				const series = Object.keys(clientData).map(client => {
					const data = months.map(month => clientData[client][month] || 0);
					return {
						name: client,
						data
					};
				});
				
				// Calculate percentage change (mock data if not enough months)
				if (months.length >= 2) {
					const lastMonth = months[months.length - 1];
					const previousMonth = months[months.length - 2];
					
					let lastMonthTotal = 0;
					let previousMonthTotal = 0;
					
					Object.keys(clientData).forEach(client => {
						lastMonthTotal += clientData[client][lastMonth] || 0;
						previousMonthTotal += clientData[client][previousMonth] || 0;
					});
					
					const change = previousMonthTotal > 0 
						? ((lastMonthTotal - previousMonthTotal) / previousMonthTotal) * 100 
						: 0;
					
					setPercentChange(change);
				} else {
					setPercentChange(2.45); // Default value if not enough data
				}
				
				setTotalDeposit(total);
				setChartData(series);
				setChartOptions({
					chart: {
						toolbar: {
							show: false
						},
						dropShadow: {
							enabled: true,
							top: 13,
							left: 0,
							blur: 10,
							opacity: 0.1,
							color: '#4318FF'
						}
					},
					colors: ['#4318FF', '#39B8FF', '#FF5733', '#33FF57', '#5733FF', '#33FFEC'],
					markers: {
						size: 0,
						colors: 'white',
						strokeColors: '#7551FF',
						strokeWidth: 3,
						strokeOpacity: 0.9,
						strokeDashArray: 0,
						fillOpacity: 1,
						discrete: [],
						shape: 'circle',
						radius: 2,
						offsetX: 0,
						offsetY: 0,
						showNullDataPoints: true
					},
					tooltip: {
						theme: 'dark'
					},
					dataLabels: {
						enabled: false
					},
					stroke: {
						curve: 'smooth',
						type: 'line'
					},
					xaxis: {
						type: 'category',
						categories: months,
						labels: {
							style: {
								colors: '#A3AED0',
								fontSize: '12px',
								fontWeight: '500'
							}
						},
						axisBorder: {
							show: false
						},
						axisTicks: {
							show: false
						}
					},
					yaxis: {
						show: false
					},
					legend: {
						show: true
					},
					grid: {
						show: false
					},
					color: ['#7551FF', '#39B8FF']
				});
				
				setLoading(false);
			} catch (error) {
				console.error('Error fetching transactions:', error);
				setLoading(false);
			}
		};
		
		fetchTransactions();
	}, []);

	return (
		<Card justifyContent='center' alignItems='center' flexDirection='column' w='100%' mb='0px' {...rest}>
			<Flex align='center' justify='space-between' w='100%' pe='20px' pt='5px'>
				<Button bg={boxBg} fontSize='sm' fontWeight='500' color={textColorSecondary} borderRadius='7px'>
					<Icon as={MdOutlineCalendarToday} color={textColorSecondary} me='4px' />
					This month
				</Button>
				<Button
					ms='auto'
					alignItems='center'
					justifyContent='center'
					bg={bgButton}
					_hover={bgHover}
					_focus={bgFocus}
					_active={bgFocus}
					w='37px'
					h='37px'
					lineHeight='100%'
					borderRadius='10px'
					{...rest}>
					<Icon as={MdBarChart} color={iconColor} w='24px' h='24px' />
				</Button>
			</Flex>
			<Flex w='100%' flexDirection={{ base: 'column', lg: 'row' }}>
				<Flex flexDirection='column' me='20px' mt='28px'>
					<Text color={textColor} fontSize='34px' textAlign='start' fontWeight='700' lineHeight='100%'>
						${totalDeposit.toFixed(2)}
					</Text>
					<Flex align='center' mb='20px'>
						<Text color='secondaryGray.600' fontSize='sm' fontWeight='500' mt='4px' me='12px'>
							Total Deposits
						</Text>
						<Flex align='center'>
							<Icon as={percentChange >= 0 ? RiArrowUpSFill : RiArrowUpSFill} 
								  color={percentChange >= 0 ? 'green.500' : 'red.500'} 
								  me='2px' mt='2px' />
							<Text color={percentChange >= 0 ? 'green.500' : 'red.500'} fontSize='sm' fontWeight='700'>
								{percentChange >= 0 ? '+' : ''}{percentChange.toFixed(2)}%
							</Text>
						</Flex>
					</Flex>

					<Flex align='center'>
						<Icon as={IoCheckmarkCircle} color='green.500' me='4px' />
						<Text color='green.500' fontSize='md' fontWeight='700'>
							On track
						</Text>
					</Flex>
				</Flex>
				<Box minH='260px' minW='75%' mt='auto'>
					{loading ? (
						<Flex justifyContent="center" alignItems="center" height="260px">
							<Spinner size="xl" color={iconColor} />
						</Flex>
					) : chartData.length === 0 ? (
						<Flex justifyContent="center" alignItems="center" height="260px">
							<Text color={textColorSecondary}>No transaction data available</Text>
						</Flex>
					) : (
						<LineChart chartData={chartData} chartOptions={chartOptions} />
					)}
				</Box>
			</Flex>
			<Button
				mt='20px'
				variant='brand'
				onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
				isLoading={isUploading}
			>
				Select File
			</Button>
		</Card>
	);
}
