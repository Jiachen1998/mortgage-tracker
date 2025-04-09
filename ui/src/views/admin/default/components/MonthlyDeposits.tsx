// Chakra imports
import { Box, Button, Flex, Icon, Text, useColorModeValue, Spinner } from '@chakra-ui/react';
import Card from 'components/card/Card';
// Custom components
import BarChart from 'components/charts/BarChart';
import React, { useEffect, useState } from 'react';
import { MdBarChart } from 'react-icons/md';
import { ChartSeries, fetchTransactions, processTransactionData, createBarChartSeries } from 'utils/transactionUtils';

export default function MonthlyDeposits(props: { [x: string]: any }) {
    const { ...rest } = props;
    const [chartData, setChartData] = useState<ChartSeries[]>([]);
    const [chartOptions, setChartOptions] = useState<any>({});
    const [loading, setLoading] = useState(true);

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
                const { clientData, months } = processTransactionData(transactions);
                const series = createBarChartSeries(clientData, months);

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
                    }
                });

                setLoading(false);
            } catch (error) {
                console.error('Error fetching transactions:', error);
                setLoading(false);
            }
        };

        loadData();
    }, []);

    return (
        <Card alignItems='center' flexDirection='column' w='100%' {...rest}>
            <Flex align='center' w='100%' px='15px' py='10px'>
                <Text me='auto' color={textColor} fontSize='xl' fontWeight='700' lineHeight='100%'>
                    Monthly Deposits by Client
                </Text>
                <Button
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

            <Box h='240px' mt='auto' w='100%'>
                {loading ? (
                    <Flex justifyContent="center" alignItems="center" height="240px">
                        <Spinner size="xl" color={iconColor} />
                    </Flex>
                ) : chartData.length === 0 ? (
                    <Flex justifyContent="center" alignItems="center" height="240px">
                        <Text color={textColor}>No transaction data available</Text>
                    </Flex>
                ) : (
                    <BarChart chartData={chartData} chartOptions={chartOptions} />
                )}
            </Box>
        </Card>
    );
} 