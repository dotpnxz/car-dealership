import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useReactToPrint } from 'react-to-print';

const SalesReport = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    total_sales: 0,
    total_transactions: 0,
    most_sold_brand: null,
    highest_sales_amount: 0
  });
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  // Ref for the content to be printed
  const componentRef = useRef(null);

  // Determine API base URL based on environment
  const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost/car-dealership/api'
    : 'https://mjautolove.site/api';

  const fetchSales = async (month, year) => {
    try {
      setLoading(true);
      let url = `${API_BASE_URL}/get_sales.php`;
      const params = new URLSearchParams();

      if (month) {
        params.append('month', month);
      }
      if (year) {
        params.append('year', year);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Sales data received:', data); // Debug log

      if (data.success) {
        setSales(data.sales);
        setSummary(data.summary);
      } else {
        toast.error(data.message || 'Failed to fetch sales data');
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
      toast.error('An error occurred while fetching sales data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch data for the current month and year on initial load
    const currentDate = new Date();
    const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
    const currentYear = currentDate.getFullYear().toString();
    setSelectedMonth(currentMonth);
    setSelectedYear(currentYear);
    fetchSales(currentMonth, currentYear);
  }, []); // Empty dependency array means this runs once on mount

  // Fetch data when month or year selection changes
  useEffect(() => {
    if (selectedMonth && selectedYear) {
      fetchSales(selectedMonth, selectedYear);
    }
  }, [selectedMonth, selectedYear]);

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  // Use react-to-print hook
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Sales_Report_${new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' })}_${selectedYear}`,
    pageStyle: `
      @page {
        size: A4 landscape;
        margin: 20mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `,
    onBeforeGetContent: () => {
      toast.info('Preparing report for print...');
      return Promise.resolve();
    },
    onAfterPrint: () => {
      toast.success('Report ready or printed!');
    },
    onPrintError: (error) => {
      console.error('Error during printing:', error);
      toast.error('Failed to prepare report for printing.');
    }
  });

  // Wrapper function to add a slight delay before printing
  const handleGeneratePdfClick = async () => {
    if (!componentRef.current) {
      toast.error('Report content not available for printing.');
      return;
    }

    try {
      await handlePrint();
    } catch (error) {
      console.error('Error during printing:', error);
      toast.error('Failed to generate PDF report.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600 text-2xl">Loading...</div>
      </div>
    );
  }

  const months = Array.from({ length: 12 }, ( _, i) => {
    const monthDate = new Date(null, i);
    return {
      value: (i + 1).toString().padStart(2, '0'),
      label: monthDate.toLocaleString('default', { month: 'long' })
    };
  });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString()); // Last 5 years

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Filter Controls */}
          <div className="flex space-x-4 mb-6 print:hidden">
              <div>
                  <label htmlFor="month-select" className="block text-sm font-medium text-gray-700">Month</label>
                  <select
                      id="month-select"
                      value={selectedMonth}
                      onChange={handleMonthChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                      <option value="">Select Month</option>
                      {months.map(month => (
                          <option key={month.value} value={month.value}>{month.label}</option>
                      ))}
                  </select>
              </div>
              <div>
                   <label htmlFor="year-select" className="block text-sm font-medium text-gray-700">Year</label>
                   <select
                       id="year-select"
                       value={selectedYear}
                       onChange={handleYearChange}
                       className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                   >
                       <option value="">Select Year</option>
                       {years.map(year => (
                           <option key={year} value={year}>{year}</option>
                       ))}
                   </select>
               </div>
          </div>

          {/* Content to be printed */}
          <div ref={componentRef} className="print:block">
            <h1 className="text-3xl font-bold text-center mb-8">Sales Report</h1>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-blue-800 mb-2">Total Sales</h2>
                <p className="text-3xl font-bold text-blue-600">
                  ₱{(summary?.total_sales || 0).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-green-800 mb-2">Total Transactions</h2>
                <p className="text-3xl font-bold text-green-600">{summary?.total_transactions || 0}</p>
              </div>
               <div className="bg-purple-50 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold text-purple-800 mb-2">Most Sold Brand ({new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' })} {selectedYear})</h2>
                   <p className="text-2xl font-bold text-purple-600">
                      {summary?.most_sold_brand || 'N/A'} - ₱{(summary?.highest_sales_amount || 0).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                      })}
                   </p>
               </div>
            </div>

            {/* Sales Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sales.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                        No sales records found for the selected period
                      </td>
                    </tr>
                  ) : (
                    sales.map((sale) => (
                      <tr key={`${sale.transaction_type}-${sale.id}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(sale.transaction_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 capitalize">
                            {sale.transaction_type}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {sale.customer_name}
                          </div>
                        </td>
                         <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {sale.brand}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                           {sale.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            ₱{Number(sale.amount).toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* PDF Generation Button */}
          <div className="mt-8 text-center print:hidden">
            <button
              onClick={handleGeneratePdfClick}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Generate PDF Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesReport; 