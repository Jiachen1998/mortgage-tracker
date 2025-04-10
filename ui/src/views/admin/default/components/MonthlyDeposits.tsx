// Chakra imports
import { Box, Button, Flex, Icon, Text, useColorModeValue, Spinner, Select } from '@chakra-ui/react';
import Card from 'components/card/Card';
// Custom components
import BarChart from 'components/charts/BarChart';
import React, { useEffect, useState } from 'react';
import { MdBarChart } from 'react-icons/md';
import { ChartSeries, fetchTransactions, processTransactionData, createBarChartSeries, filterTransactionsByDateRange, getDateRangeOptions } from 'utils/transactionUtils';

// Static chart options
const defaultChartOptions = {
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
    plotOptions: {
        bar: {
            borderRadius: 4,
            columnWidth: '70%'
        }
    },
    colors: ['#4318FF', '#39B8FF', '#FF5733', '#33FF57', '#5733FF', '#33FFEC'],
    tooltip: {
        theme: 'dark'
    },
    dataLabels: {
        enabled: false
    },
    xaxis: {
        type: 'category',
        categories: [] as string[],
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
    }
};

export default function MonthlyDeposits(props: { [x: string]: any }) {
    const { ...rest } = props;
    const [chartData, setChartData] = useState<ChartSeries[]>([]);
    const [chartOptions, setChartOptions] = useState<any>(defaultChartOptions);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('6'); // Default to 6 months
    const [allTransactions, setAllTransactions] = useState<any[]>([]);

    // Chakra Color Mode
    const textColor = useColorModeValue('secondaryGray.900', 'white');
    const iconColor = useColorModeValue('brand.500', 'white');
    const bgButton = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
    const bgHover = useColorModeValue({ bg: 'secondaryGray.400' }, { bg: 'whiteAlpha.50' });
    const bgFocus = useColorModeValue({ bg: 'secondaryGray.300' }, { bg: 'whiteAlpha.100' });

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const transactions = await fetchTransactions();
                setAllTransactions(transactions);
                updateChartData(transactions, parseInt(dateRange));
            } catch (error) {
                console.error('Error fetching transactions:', error);
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const updateChartData = (transactions: any[], months: number) => {
        console.log('Updating chart data:', { transactionsCount: transactions.length, months });
        const filteredTransactions = filterTransactionsByDateRange(transactions, months);
        const { clientData, months: processedMonths } = processTransactionData(filteredTransactions, months);
        const series = createBarChartSeries(clientData, processedMonths);
        console.log('Processed chart data:', { 
            seriesCount: series.length,
            processedMonths,
            firstSeries: series[0]
        });

        setChartData(series);
        setChartOptions({
            ...chartOptions,
            xaxis: {
                ...chartOptions.xaxis,
                categories: processedMonths
            }
        });
        setLoading(false);
    };

    const handleDateRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newRange = e.target.value;
        console.log('Date range changed:', { newRange, currentRange: dateRange });
        setDateRange(newRange);
        updateChartData(allTransactions, parseInt(newRange));
    };

    return (
        <Card alignItems='center' flexDirection='column' w='100%' h='100%' {...rest}>
            <Flex align='center' justify='center' w='100%' px='15px' py='10px' position='relative'>
                <Text color={textColor} fontSize='2xl' fontWeight='700' lineHeight='100%' textAlign='center'>
                    Monthly Deposits by Client
                </Text>
                <Select
                    position='absolute'
                    right='60px'
                    w='120px'
                    size='sm'
                    value={dateRange}
                    onChange={handleDateRangeChange}
                    bg={bgButton}
                    color={textColor}
                    borderColor={bgButton}
                    _hover={{ borderColor: bgHover.bg }}
                    _focus={{ borderColor: bgFocus.bg }}
                >
                    {getDateRangeOptions().map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </Select>
                <Button
                    position='absolute'
                    right='15px'
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

            <Box h='100%' w='100%' mt='auto' px='10px'>
                {loading ? (
                    <Flex justifyContent="center" alignItems="center" height="100%">
                        <Spinner size="xl" color={iconColor} />
                    </Flex>
                ) : chartData.length === 0 ? (
                    <Flex justifyContent="center" alignItems="center" height="100%">
                        <Text color={textColor}>No transaction data available</Text>
                    </Flex>
                ) : (
                    <BarChart key={`monthly-${dateRange}`} chartData={chartData} chartOptions={chartOptions} />
                )}
            </Box>
        </Card>
    );
} 