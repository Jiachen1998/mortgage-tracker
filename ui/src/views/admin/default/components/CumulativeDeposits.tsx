// Chakra imports
import { Box, Button, Flex, Icon, Text, useColorModeValue, Spinner, Select } from '@chakra-ui/react';
// Custom components
import Card from 'components/card/Card';
import LineChart from 'components/charts/LineChart';
import { IoCheckmarkCircle } from 'react-icons/io5';
import { MdBarChart, MdOutlineCalendarToday } from 'react-icons/md';
// Assets
import { useEffect, useState } from 'react';
import { ChartSeries, fetchTransactions, processTransactionData, filterTransactionsByDateRange, getDateRangeOptions } from 'utils/transactionUtils';

const createCumulativeLineChartSeries = (clientData: { [key: string]: { [key: string]: number } }, months: string[]): ChartSeries[] => {
    return Object.keys(clientData).map(client => {
        let runningTotal = 0;
        const cumulativeData = months.map(month => {
            runningTotal += clientData[client][month] || 0;
            return runningTotal;
        });
        return {
            name: client,
            data: cumulativeData
        };
    });
};

export default function CumulativeDeposits(props: { [x: string]: any }) {
    const { ...rest } = props;
    const [chartData, setChartData] = useState<ChartSeries[]>([]);
    const [chartOptions, setChartOptions] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [totalDeposit, setTotalDeposit] = useState(0);
    const [dateRange, setDateRange] = useState('6'); // Default to 12 months
    const [allTransactions, setAllTransactions] = useState<any[]>([]);

    // Chakra Color Mode
    const textColor = useColorModeValue('secondaryGray.900', 'white');
    const textColorSecondary = useColorModeValue('secondaryGray.600', 'white');
    const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
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
        const { clientData, months: processedMonths, total } = processTransactionData(filteredTransactions);
        const series = createCumulativeLineChartSeries(clientData, processedMonths);
        console.log('Processed chart data:', { 
            seriesCount: series.length,
            processedMonths,
            firstSeries: series[0]
        });

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
                categories: processedMonths,
                labels: {
                    style: {
                        colors: '#A3AED0',
                        fontSize: '12px',
                        fontWeight: '500'
                    }
                },
                axisBorder: {
                    show: true,
                    color: '#A3AED0',
                    height: 1,
                    width: '100%',
                    offsetX: 0,
                    offsetY: 0
                },
                axisTicks: {
                    show: true,
                    color: '#A3AED0',
                    height: 6,
                    offsetX: 0,
                    offsetY: 0
                }
            },
            yaxis: {
                show: true,
                labels: {
                    style: {
                        colors: '#A3AED0',
                        fontSize: '12px',
                        fontWeight: '500'
                    },
                    formatter: function(value: number) {
                        return '$' + value.toLocaleString();
                    }
                },
                axisBorder: {
                    show: true,
                    color: '#A3AED0',
                    width: 1,
                    offsetX: 0,
                    offsetY: 0
                },
                axisTicks: {
                    show: true,
                    color: '#A3AED0',
                    width: 6,
                    offsetX: 0,
                    offsetY: 0
                }
            },
            legend: {
                show: true
            },
            grid: {
                show: true,
                borderColor: '#A3AED0',
                position: 'back',
                xaxis: {
                    lines: {
                        show: false
                    }
                },
                yaxis: {
                    lines: {
                        show: true,
                        style: {
                            colors: ['rgba(163, 174, 208, 0.2)'],
                            strokeWidth: 1
                        }
                    }
                },
                padding: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 15
                }
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
        <Card justifyContent='center' alignItems='center' flexDirection='column' w='100%' h='100%' mb='0px' {...rest}>
            <Flex align='center' justify='center' w='100%' px='15px' py='10px' position='relative'>
                <Text color={textColor} fontSize='2xl' fontWeight='700' lineHeight='100%' textAlign='center'>
                    Cumulative Deposits
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
            <Flex w='100%' h='100%' flexDirection={{ base: 'column', lg: 'row' }}>
                <Box h='100%' w='100%' mt='auto' px='10px'>
                    {loading ? (
                        <Flex justifyContent="center" alignItems="center" height="100%">
                            <Spinner size="xl" color={iconColor} />
                        </Flex>
                    ) : chartData.length === 0 ? (
                        <Flex justifyContent="center" alignItems="center" height="100%">
                            <Text color={textColorSecondary}>No transaction data available</Text>
                        </Flex>
                    ) : (
                        <LineChart key={`cumulative-${dateRange}`} chartData={chartData} chartOptions={chartOptions} />
                    )}
                </Box>
            </Flex>
        </Card>
    );
} 