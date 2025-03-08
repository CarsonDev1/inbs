import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Home.css';
import '../data.json';
import { PieChart, Pie, Cell, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

function Home() {
	const [bookings, setBookings] = useState([]);
	const [showSidebar, setShowSidebar] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
	const [filters, setFilters] = useState({
		service: '',
		store: '',
		price: '',
	});
	const [selectedImage, setSelectedImage] = useState(null);
	const [selectedMonth, setSelectedMonth] = useState('all');
	const navigate = useNavigate();

	useEffect(() => {
		fetchBookings();
	}, []);

	const fetchBookings = async () => {
		try {
			const response = await fetch('https://6772b9a7ee76b92dd49333cb.mockapi.io/Booking');
			const data = await response.json();
			// Ensure data is an array before setting state
			if (Array.isArray(data)) {
				setBookings(data);
			} else {
				setBookings([]); // Set empty array if data is not an array
				console.error('Fetched data is not an array:', data);
			}
		} catch (error) {
			console.error('Error fetching bookings:', error);
			setBookings([]); // Set empty array on error
		}
	};
	// const fetchBookings = async () => {
	//   try {
	//     const data = require('../data.json');
	//     // Ensure data is an array before setting state
	//     if (Array.isArray(data)) {
	//       setBookings(data);
	//     } else {
	//       setBookings([]); // Set empty array if data is not an array
	//       console.error('Fetched data is not an array:', data);
	//     }
	//   } catch (error) {
	//     console.error('Error fetching bookings:', error);
	//     setBookings([]); // Set empty array on error
	//   }
	// };

	const handleLogout = () => {
		navigate('/');
	};

	const handleStore = () => {
		navigate('/store');
	};

	const handleArtist = () => {
		navigate('/artist');
	};

	const handleAccessory = () => {
		navigate('/accessory');
	};

	const handleWaitlist = () => navigate('/waitlist');

	// Search function
	const handleSearch = (event) => {
		setSearchTerm(event.target.value);
	};

	// Sort function
	const requestSort = (key) => {
		let direction = 'ascending';
		if (sortConfig.key === key && sortConfig.direction === 'ascending') {
			direction = 'descending';
		}
		setSortConfig({ key, direction });
	};

	// Filter function
	const handleFilterChange = (event) => {
		const { name, value } = event.target;
		setFilters((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const getUniqueValues = (key) => {
		return [...new Set(bookings.map((booking) => booking[key]))];
	};

	// Helper function to filter bookings by month
	const filterBookingsByMonth = (bookings) => {
		if (selectedMonth === 'all') return bookings;

		return bookings.filter((booking) => {
			const bookingDate = new Date(booking.date);
			const bookingMonth = bookingDate.getMonth() + 1; // getMonth() returns 0-11
			return bookingMonth === parseInt(selectedMonth);
		});
	};

	// Get data for pie chart
	const getPieChartData = () => {
		const filteredBookings = filterBookingsByMonth(bookings);
		const serviceCount = {};
		filteredBookings.forEach((booking) => {
			serviceCount[booking.service] = (serviceCount[booking.service] || 0) + 1;
		});

		return Object.entries(serviceCount).map(([name, value]) => ({
			name,
			value,
		}));
	};

	// Get data for price bar chart
	const getPriceChartData = () => {
		const filteredBookings = filterBookingsByMonth(bookings);
		const priceRanges = {
			'200,000-250,000': 0,
			'250,001-500,000': 0,
			'500,001-1,000,000': 0,
			'1,000,001-2,000,000': 0,
			'2,000,000+': 0,
		};

		filteredBookings.forEach((booking) => {
			const price = Number(booking.price);
			if (price <= 250000) {
				priceRanges['200,000-250,000']++;
			} else if (price <= 500000) {
				priceRanges['250,001-500,000']++;
			} else if (price <= 1000000) {
				priceRanges['500,001-1,000,000']++;
			} else if (price <= 2000000) {
				priceRanges['1,000,001-2,000,000']++;
			} else {
				priceRanges['2,000,000+']++;
			}
		});

		return Object.entries(priceRanges).map(([range, count]) => ({
			range,
			count,
		}));
	};

	const getRevenueData = () => {
		const filteredBookings = filterBookingsByMonth(bookings);
		const storeRevenue = {};
		filteredBookings.forEach((booking) => {
			if (!storeRevenue[booking.store]) {
				storeRevenue[booking.store] = 0;
			}
			storeRevenue[booking.store] += Number(booking.price);
		});

		return Object.entries(storeRevenue).map(([name, value]) => ({
			name,
			value,
		}));
	};

	const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];

	const filteredAndSortedBookings = bookings
		.filter((booking) => {
			const matchesSearch = Object.values(booking).join(' ').toLowerCase().includes(searchTerm.toLowerCase());

			const matchesServiceFilter = filters.service === '' || booking.service === filters.service;
			const matchesStoreFilter = filters.store === '' || booking.store === filters.store;

			return matchesSearch && matchesServiceFilter && matchesStoreFilter;
		})
		.sort((a, b) => {
			if (!sortConfig.key) return 0;

			if (sortConfig.key === 'price') {
				return sortConfig.direction === 'ascending'
					? Number(a.price) - Number(b.price)
					: Number(b.price) - Number(a.price);
			}

			if (a[sortConfig.key] < b[sortConfig.key]) {
				return sortConfig.direction === 'ascending' ? -1 : 1;
			}
			if (a[sortConfig.key] > b[sortConfig.key]) {
				return sortConfig.direction === 'ascending' ? 1 : -1;
			}
			return 0;
		});

	return (
		<div className='layout'>
			<div
				className={`sidebar ${showSidebar ? 'expanded' : ''}`}
				onMouseEnter={() => setShowSidebar(true)}
				onMouseLeave={() => setShowSidebar(false)}
			>
				<div className='sidebar-header'>
					<h1 className='sidebar-title'>{showSidebar ? 'INBS' : 'IB'}</h1>
				</div>

				<div className='sidebar-buttons'>
					<button className='sidebar-button' onClick={handleStore}>
						<span
							className='sidebar-button-icon'
							style={{ marginRight: '12px', marginLeft: '-12px', fontSize: '20px' }}
						>
							📊
						</span>
						{showSidebar && 'Store'}
					</button>
					<button className='sidebar-button' onClick={handleAccessory}>
						<span
							className='sidebar-button-icon'
							style={{ marginRight: '12px', marginLeft: '-12px', fontSize: '20px' }}
						>
							A
						</span>
						{showSidebar && 'Accessory'}
					</button>
					<button className='sidebar-button' onClick={handleArtist}>
						<span
							className='sidebar-button-icon'
							style={{ marginRight: '12px', marginLeft: '-12px', fontSize: '20px' }}
						>
							🎨
						</span>
						{showSidebar && 'Artist'}
					</button>
					<button className='sidebar-button' onClick={handleWaitlist}>
						<span
							className='sidebar-button-icon'
							style={{ marginRight: '12px', marginLeft: '-12px', fontSize: '20px' }}
						>
							⏳
						</span>
						{showSidebar && 'Waitlist'}
					</button>
					<button className='sidebar-button' onClick={handleLogout}>
						<span
							className='sidebar-button-icon'
							style={{ marginRight: '12px', marginLeft: '-12px', fontSize: '20px' }}
						>
							⬅️
						</span>
						{showSidebar && 'Logout'}
					</button>
				</div>
			</div>

			<div className={`main-content ${showSidebar ? 'sidebar-expanded' : ''}`}>
				<div className='home-container' style={{ padding: '20px 40px' }}>
					<div
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							marginBottom: '25px',
							background: 'rgba(255,255,255,0.98)',
							padding: '25px 30px',
							boxShadow: '0 12px 35px rgba(0,0,0,0.1)',
							backdropFilter: 'blur(15px)',
							border: '1px solid rgba(255,255,255,0.3)',
							borderRadius: '20px',
						}}
					>
						<h1
							style={{
								color: '#1e3c72',
								fontSize: '36px',
								fontWeight: '800',
								margin: 0,
								textShadow: '2px 2px 4px rgba(0,0,0,0.12)',
								letterSpacing: '0.5px',
							}}
						>
							Booking Management
						</h1>
					</div>

					{/* Add Month Filter */}
					<div
						style={{
							background: 'rgba(255,255,255,0.98)',
							padding: '20px',
							borderRadius: '20px',
							marginBottom: '20px',
							boxShadow: '0 12px 35px rgba(0,0,0,0.1)',
							border: '1px solid rgba(255,255,255,0.3)',
						}}
					>
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: '15px',
							}}
						>
							<label
								style={{
									color: '#1e3c72',
									fontWeight: '600',
									fontSize: '16px',
								}}
							>
								Filter by Month:
							</label>
							<select
								value={selectedMonth}
								onChange={(e) => setSelectedMonth(e.target.value)}
								style={{
									padding: '10px 15px',
									borderRadius: '10px',
									border: '2px solid #eee',
									fontSize: '14px',
									fontWeight: '500',
									color: '#1e3c72',
									cursor: 'pointer',
									transition: 'all 0.3s ease',
									outline: 'none',
								}}
								onFocus={(e) => {
									e.target.style.borderColor = '#24BFDD';
									e.target.style.boxShadow = '0 0 0 3px rgba(36,191,221,0.2)';
								}}
								onBlur={(e) => {
									e.target.style.borderColor = '#eee';
									e.target.style.boxShadow = 'none';
								}}
							>
								<option value='all'>All Months</option>
								<option value='1'>January</option>
								<option value='2'>February</option>
								<option value='3'>March</option>
								<option value='4'>April</option>
								<option value='5'>May</option>
								<option value='6'>June</option>
								<option value='7'>July</option>
								<option value='8'>August</option>
								<option value='9'>September</option>
								<option value='10'>October</option>
								<option value='11'>November</option>
								<option value='12'>December</option>
							</select>
						</div>
					</div>

					{/* Analytics Section */}
					<div
						style={{
							display: 'grid',
							gridTemplateColumns: '1fr 1fr',
							gap: '20px',
							marginBottom: '20px',
						}}
					>
						{/* Service Distribution Chart */}
						<div
							style={{
								background: 'rgba(255,255,255,0.98)',
								padding: '25px',
								borderRadius: '20px',
								boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
								border: '1px solid rgba(255,255,255,0.3)',
								transition: 'transform 0.3s ease, box-shadow 0.3s ease',
								height: '100%',
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.transform = 'translateY(-5px)';
								e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.transform = 'translateY(0)';
								e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.1)';
							}}
						>
							<h2
								style={{
									color: '#1e3c72',
									marginBottom: '25px',
									fontSize: '26px',
									fontWeight: '700',
									letterSpacing: '0.5px',
									borderBottom: '4px solid #24BFDD',
									paddingBottom: '15px',
									display: 'inline-block',
								}}
							>
								Revenue by Store
							</h2>
							<div
								style={{
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
									padding: '25px',
								}}
							>
								<BarChart
									width={500}
									height={400}
									data={getRevenueData()}
									margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
								>
									<CartesianGrid strokeDasharray='3 3' stroke='rgba(0,0,0,0.1)' />
									<XAxis
										dataKey='name'
										tick={{ fill: '#1e3c72', fontSize: 12 }}
										tickLine={{ stroke: '#1e3c72' }}
									/>
									<YAxis tick={{ fill: '#1e3c72', fontSize: 12 }} tickLine={{ stroke: '#1e3c72' }} />
									<Tooltip
										contentStyle={{
											background: 'rgba(255,255,255,0.95)',
											border: '1px solid #24BFDD',
											borderRadius: '8px',
											boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
										}}
									/>
									<Bar dataKey='value' fill='#24BFDD' radius={[8, 8, 0, 0]} barSize={35}>
										{getRevenueData().map((entry, index) => (
											<Cell
												key={`cell-${index}`}
												fill={`rgba(36,191,221,${0.5 + index * 0.1})`}
											/>
										))}
									</Bar>
								</BarChart>
							</div>
						</div>
						<div
							style={{
								background: 'rgba(255,255,255,0.98)',
								padding: '25px',
								borderRadius: '20px',
								boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
								border: '1px solid rgba(255,255,255,0.3)',
								transition: 'transform 0.3s ease, box-shadow 0.3s ease',
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.transform = 'translateY(-5px)';
								e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.transform = 'translateY(0)';
								e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.1)';
							}}
						>
							<h2
								style={{
									color: '#1e3c72',
									marginBottom: '25px',
									fontSize: '26px',
									fontWeight: '700',
									letterSpacing: '0.5px',
									borderBottom: '4px solid #24BFDD',
									paddingBottom: '15px',
									display: 'inline-block',
								}}
							>
								Service Distribution
							</h2>
							<div
								style={{
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
									padding: '25px',
									position: 'relative',
								}}
							>
								<PieChart width={500} height={400}>
									<Pie
										data={getPieChartData()}
										cx={250}
										cy={180}
										innerRadius={100}
										outerRadius={140}
										fill='#8884d8'
										paddingAngle={8}
										dataKey='value'
										label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
										labelLine={false}
										labelStyle={{
											fill: '#fff',
											fontSize: '16px',
											fontWeight: 'bold',
											textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
										}}
									>
										{getPieChartData().map((entry, index) => (
											<Cell
												key={`cell-${index}`}
												fill={`rgba(36, 191, 221, ${1 - index * 0.15})`}
												stroke='#fff'
												strokeWidth={4}
												style={{
													filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.2))',
													cursor: 'pointer',
													transition: 'all 0.3s ease',
												}}
											/>
										))}
									</Pie>
									<Tooltip
										contentStyle={{
											background: 'rgba(255, 255, 255, 0.98)',
											border: 'none',
											borderRadius: '12px',
											boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
											padding: '12px 18px',
										}}
										itemStyle={{
											color: '#1e3c72',
											fontSize: '14px',
											fontWeight: '600',
											textTransform: 'capitalize',
										}}
									/>
									<Legend
										verticalAlign='bottom'
										height={50}
										iconType='circle'
										iconSize={12}
										layout='horizontal'
										formatter={(value, entry) => (
											<span
												style={{
													color: '#1e3c72',
													fontSize: '15px',
													fontWeight: '600',
													padding: '6px 12px',
													borderRadius: '20px',
													background: 'rgba(36, 191, 221, 0.1)',
													transition: 'all 0.3s ease',
													display: 'inline-block',
													margin: '0 4px',
												}}
											>
												{value}
											</span>
										)}
										wrapperStyle={{
											padding: '20px 0',
										}}
									/>
								</PieChart>
							</div>
						</div>

						{/* Price Distribution Chart */}
						<div
							style={{
								background: 'rgba(255,255,255,0.98)',
								padding: '25px',
								borderRadius: '20px',
								boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
								border: '1px solid rgba(255,255,255,0.3)',
								transition: 'transform 0.3s ease, box-shadow 0.3s ease',
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.transform = 'translateY(-5px)';
								e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.transform = 'translateY(0)';
								e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.1)';
							}}
						>
							<h2
								style={{
									color: '#1e3c72',
									marginBottom: '25px',
									fontSize: '26px',
									fontWeight: '700',
									letterSpacing: '0.5px',
									borderBottom: '4px solid #24BFDD',
									paddingBottom: '15px',
									display: 'inline-block',
								}}
							>
								Price Distribution
							</h2>
							<div
								style={{
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
									padding: '25px',
								}}
							>
								<BarChart width={500} height={400} data={getPriceChartData()}>
									<CartesianGrid strokeDasharray='3 3' stroke='rgba(0,0,0,0.1)' />
									<XAxis
										dataKey='range'
										tick={{
											fill: '#1e3c72',
											fontSize: 12,
											fontWeight: 600,
										}}
										tickLine={{ stroke: '#1e3c72' }}
									/>
									<YAxis
										tick={{
											fill: '#1e3c72',
											fontSize: 12,
											fontWeight: 600,
										}}
										tickLine={{ stroke: '#1e3c72' }}
									/>
									<Tooltip
										contentStyle={{
											background: 'rgba(255,255,255,0.98)',
											border: 'none',
											borderRadius: '12px',
											boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
											padding: '12px 18px',
										}}
										itemStyle={{
											color: '#1e3c72',
											fontSize: '14px',
											fontWeight: '600',
											textTransform: 'capitalize',
										}}
										cursor={{ fill: 'rgba(36, 191, 221, 0.1)' }}
									/>
									<Bar dataKey='count' radius={[8, 8, 0, 0]} barSize={35}>
										{getPriceChartData().map((entry, index) => (
											<Cell
												key={`cell-${index}`}
												fill={`rgba(36, 191, 221, ${0.7 + index * 0.1})`}
												stroke='rgba(255,255,255,0.8)'
												strokeWidth={1}
												style={{
													filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.1))',
													cursor: 'pointer',
													transition: 'all 0.3s ease',
												}}
											/>
										))}
									</Bar>
									<Legend
										verticalAlign='top'
										height={36}
										iconType='circle'
										iconSize={10}
										formatter={(value) => (
											<span
												style={{
													color: '#1e3c72',
													fontSize: '14px',
													fontWeight: '600',
													padding: '6px 12px',
													borderRadius: '20px',
													background: 'rgba(36, 191, 221, 0.1)',
													transition: 'all 0.3s ease',
												}}
											>
												Price Distribution
											</span>
										)}
									/>
								</BarChart>
							</div>
						</div>
					</div>

					{/* Search and Filter Controls */}
					<div
						style={{
							background: 'rgba(255,255,255,0.98)',
							padding: '25px',
							borderRadius: '20px',
							marginBottom: '25px',
							display: 'flex',
							gap: '25px',
							alignItems: 'center',
							flexWrap: 'wrap',
							boxShadow: '0 12px 35px rgba(0,0,0,0.1)',
							border: '1px solid rgba(255,255,255,0.3)',
						}}
					>
						<input
							type='text'
							placeholder='Search anything...'
							value={searchTerm}
							onChange={handleSearch}
							style={{
								padding: '12px 18px',
								borderRadius: '12px',
								border: '2px solid #eee',
								width: '280px',
								fontSize: '15px',
								transition: 'all 0.3s ease',
								outline: 'none',
							}}
							onFocus={(e) => {
								e.target.style.borderColor = '#24BFDD';
								e.target.style.boxShadow = '0 0 0 3px rgba(36,191,221,0.2)';
							}}
							onBlur={(e) => {
								e.target.style.borderColor = '#eee';
								e.target.style.boxShadow = 'none';
							}}
						/>

						<select
							name='service'
							value={filters.service}
							onChange={handleFilterChange}
							style={{
								padding: '12px 18px',
								borderRadius: '12px',
								border: '2px solid #eee',
								fontSize: '15px',
								cursor: 'pointer',
								transition: 'all 0.3s ease',
								outline: 'none',
							}}
							onFocus={(e) => {
								e.target.style.borderColor = '#24BFDD';
								e.target.style.boxShadow = '0 0 0 3px rgba(36,191,221,0.2)';
							}}
							onBlur={(e) => {
								e.target.style.borderColor = '#eee';
								e.target.style.boxShadow = 'none';
							}}
						>
							<option value=''>All Services</option>
							{getUniqueValues('service').map((service) => (
								<option key={service} value={service}>
									{service}
								</option>
							))}
						</select>

						<select
							name='store'
							value={filters.store}
							onChange={handleFilterChange}
							style={{
								padding: '12px 18px',
								borderRadius: '12px',
								border: '2px solid #eee',
								fontSize: '15px',
								cursor: 'pointer',
								transition: 'all 0.3s ease',
								outline: 'none',
							}}
							onFocus={(e) => {
								e.target.style.borderColor = '#24BFDD';
								e.target.style.boxShadow = '0 0 0 3px rgba(36,191,221,0.2)';
							}}
							onBlur={(e) => {
								e.target.style.borderColor = '#eee';
								e.target.style.boxShadow = 'none';
							}}
						>
							<option value=''>All Stores</option>
							{getUniqueValues('store').map((store) => (
								<option key={store} value={store}>
									{store}
								</option>
							))}
						</select>

						<select
							name='price'
							value={filters.price}
							onChange={handleFilterChange}
							style={{
								padding: '12px 18px',
								borderRadius: '12px',
								border: '2px solid #eee',
								fontSize: '15px',
								cursor: 'pointer',
								transition: 'all 0.3s ease',
								outline: 'none',
							}}
							onFocus={(e) => {
								e.target.style.borderColor = '#24BFDD';
								e.target.style.boxShadow = '0 0 0 3px rgba(36,191,221,0.2)';
							}}
							onBlur={(e) => {
								e.target.style.borderColor = '#eee';
								e.target.style.boxShadow = 'none';
							}}
						>
							<option value=''>All Prices</option>
							{getUniqueValues('price')
								.sort((a, b) => Number(a) - Number(b))
								.map((price) => (
									<option key={price} value={price}>
										{price}
									</option>
								))}
						</select>
					</div>

					<div
						className='booking-list'
						style={{
							background: 'rgba(255,255,255,0.98)',
							padding: '30px',
							borderRadius: '25px',
							boxShadow: '0 18px 45px rgba(0,0,0,0.1)',
							backdropFilter: 'blur(15px)',
							border: '1px solid rgba(255,255,255,0.3)',
						}}
					>
						<h2
							style={{
								color: '#1e3c72',
								fontSize: '32px',
								marginBottom: '35px',
								borderBottom: '4px solid #24BFDD',
								paddingBottom: '15px',
								display: 'inline-block',
								fontWeight: '800',
								letterSpacing: '0.5px',
							}}
						>
							Appointment List
						</h2>
						<table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 15px' }}>
							<thead>
								<tr style={{ background: 'rgba(248,249,250,0.9)' }}>
									<th
										onClick={() => requestSort('name')}
										style={{
											padding: '20px',
											color: '#1e3c72',
											fontWeight: '800',
											borderBottom: '2px solid #e9ecef',
											fontSize: '16px',
											cursor: 'pointer',
											transition: 'all 0.3s ease',
										}}
										onMouseOver={(e) => {
											e.currentTarget.style.color = '#24BFDD';
										}}
										onMouseOut={(e) => {
											e.currentTarget.style.color = '#1e3c72';
										}}
									>
										Customer Name{' '}
										{sortConfig.key === 'name' &&
											(sortConfig.direction === 'ascending' ? '↑' : '↓')}
									</th>
									<th
										style={{
											padding: '20px',
											color: '#1e3c72',
											fontWeight: '800',
											borderBottom: '2px solid #e9ecef',
											fontSize: '16px',
										}}
									>
										Phone Number
									</th>
									<th
										onClick={() => requestSort('date')}
										style={{
											padding: '20px',
											color: '#1e3c72',
											fontWeight: '800',
											borderBottom: '2px solid #e9ecef',
											fontSize: '16px',
											cursor: 'pointer',
											transition: 'all 0.3s ease',
										}}
										onMouseOver={(e) => {
											e.currentTarget.style.color = '#24BFDD';
										}}
										onMouseOut={(e) => {
											e.currentTarget.style.color = '#1e3c72';
										}}
									>
										Date{' '}
										{sortConfig.key === 'date' &&
											(sortConfig.direction === 'ascending' ? '↑' : '↓')}
									</th>
									<th
										style={{
											padding: '20px',
											color: '#1e3c72',
											fontWeight: '800',
											borderBottom: '2px solid #e9ecef',
											fontSize: '16px',
										}}
									>
										Time
									</th>
									<th
										style={{
											padding: '20px',
											color: '#1e3c72',
											fontWeight: '800',
											borderBottom: '2px solid #e9ecef',
											fontSize: '16px',
										}}
									>
										Service
									</th>
									<th
										onClick={() => requestSort('price')}
										style={{
											padding: '20px',
											color: '#1e3c72',
											fontWeight: '800',
											borderBottom: '2px solid #e9ecef',
											fontSize: '16px',
											cursor: 'pointer',
											transition: 'all 0.3s ease',
										}}
										onMouseOver={(e) => {
											e.currentTarget.style.color = '#24BFDD';
										}}
										onMouseOut={(e) => {
											e.currentTarget.style.color = '#1e3c72';
										}}
									>
										Price{' '}
										{sortConfig.key === 'price' &&
											(sortConfig.direction === 'ascending' ? '↑' : '↓')}
									</th>
									<th
										style={{
											padding: '20px',
											color: '#1e3c72',
											fontWeight: '800',
											borderBottom: '2px solid #e9ecef',
											fontSize: '16px',
										}}
									>
										Store Address
									</th>
									<th
										style={{
											padding: '20px',
											color: '#1e3c72',
											fontWeight: '800',
											borderBottom: '2px solid #e9ecef',
											fontSize: '16px',
										}}
									>
										Service Image
									</th>
								</tr>
							</thead>
							<tbody>
								{filteredAndSortedBookings.map((booking, index) => (
									<tr
										key={index}
										style={{
											background: 'white',
											transition: 'all 0.4s ease',
											borderRadius: '18px',
											boxShadow: '0 5px 18px rgba(0,0,0,0.04)',
											cursor: 'pointer',
										}}
										onMouseOver={(e) => {
											e.currentTarget.style.transform = 'translateY(-4px)';
											e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.12)';
										}}
										onMouseOut={(e) => {
											e.currentTarget.style.transform = 'translateY(0)';
											e.currentTarget.style.boxShadow = '0 5px 18px rgba(0,0,0,0.04)';
										}}
									>
										<td
											style={{
												padding: '25px',
												borderBottom: '1px solid #e9ecef',
												fontWeight: '600',
												color: '#1e3c72',
											}}
										>
											{booking.name}
										</td>
										<td
											style={{
												padding: '25px',
												borderBottom: '1px solid #e9ecef',
												color: '#666',
												fontWeight: '500',
											}}
										>
											{booking.phone}
										</td>
										<td
											style={{
												padding: '25px',
												borderBottom: '1px solid #e9ecef',
												color: '#666',
												fontWeight: '500',
											}}
										>
											{booking.date}
										</td>
										<td
											style={{
												padding: '25px',
												borderBottom: '1px solid #e9ecef',
												color: '#666',
												fontWeight: '500',
											}}
										>
											{booking.time} hours
										</td>
										<td
											style={{
												padding: '25px',
												borderBottom: '1px solid #e9ecef',
												fontWeight: '600',
												color: '#1e3c72',
											}}
										>
											{booking.service}
										</td>
										<td
											style={{
												padding: '25px',
												borderBottom: '1px solid #e9ecef',
												fontWeight: '700',
												color: '#24BFDD',
											}}
										>
											${booking.price}
										</td>
										<td
											style={{
												padding: '25px',
												borderBottom: '1px solid #e9ecef',
												fontWeight: '600',
												color: '#24BFDD',
											}}
										>
											{booking.store}
										</td>
										<td style={{ padding: '25px', borderBottom: '1px solid #e9ecef' }}>
											{booking.serviceImage && (
												<div>
													<img
														src={booking.serviceImage}
														alt={booking.service}
														onClick={() => setSelectedImage(booking)}
														style={{
															width: '130px',
															height: '130px',
															objectFit: 'cover',
															borderRadius: '18px',
															boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
															transition: 'all 0.4s ease',
															border: '3px solid rgba(255,255,255,0.3)',
															cursor: 'pointer',
														}}
														onMouseOver={(e) => {
															e.target.style.transform = 'scale(1.1)';
															e.target.style.boxShadow = '0 15px 35px rgba(0,0,0,0.18)';
														}}
														onMouseOut={(e) => {
															e.target.style.transform = 'scale(1)';
															e.target.style.boxShadow = '0 10px 25px rgba(0,0,0,0.12)';
														}}
													/>
												</div>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>

			{/* Image Modal */}
			{selectedImage && (
				<div
					style={{
						position: 'fixed',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundColor: 'rgba(0,0,0,0.9)',
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						zIndex: 1100,
						padding: '25px',
						backdropFilter: 'blur(10px)',
					}}
					onClick={() => setSelectedImage(null)}
				>
					<div
						style={{
							background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
							padding: '35px',
							borderRadius: '25px',
							maxWidth: '90%',
							maxHeight: '90%',
							overflow: 'auto',
							position: 'relative',
							boxShadow: '0 30px 60px -12px rgba(0,0,0,0.3)',
							border: '1px solid rgba(255,255,255,0.2)',
							animation: 'modalFadeIn 0.4s ease-out',
						}}
						onClick={(e) => e.stopPropagation()}
					>
						<img
							src={selectedImage.serviceImage}
							alt={selectedImage.service}
							style={{
								width: '100%',
								maxHeight: '75vh',
								objectFit: 'cover',
								borderRadius: '20px',
								marginBottom: '35px',
								boxShadow: '0 18px 40px rgba(0,0,0,0.25)',
								transition: 'all 0.4s ease',
								cursor: 'zoom-in',
								border: '3px solid rgba(255,255,255,0.3)',
							}}
							onMouseOver={(e) => {
								e.target.style.transform = 'scale(1.04)';
								e.target.style.boxShadow = '0 25px 50px rgba(0,0,0,0.3)';
							}}
							onMouseOut={(e) => {
								e.target.style.transform = 'scale(1)';
								e.target.style.boxShadow = '0 18px 40px rgba(0,0,0,0.25)';
							}}
						/>
						<div
							style={{
								textAlign: 'center',
								padding: '30px 35px',
								background: 'linear-gradient(135deg, #ffffff, #f8f9fa)',
								borderRadius: '18px',
								boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
								border: '1px solid rgba(255,255,255,0.5)',
							}}
						>
							<h3
								style={{
									color: '#005FA3',
									marginBottom: '25px',
									fontSize: '2.2rem',
									fontWeight: '800',
									textShadow: '2px 2px 4px rgba(0,0,0,0.12)',
									letterSpacing: '0.8px',
									marginBottom: '20px',
									fontSize: '2rem',
									fontWeight: '700',
									textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
									letterSpacing: '0.5px',
								}}
							>
								{selectedImage.service}
							</h3>
							<p
								style={{
									color: '#4a4a4a',
									margin: '12px 0',
									fontSize: '1.2rem',
									fontWeight: '500',
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
									gap: '8px',
								}}
							>
								Price:{' '}
								<span
									style={{
										color: '#00A5F5',
										background: 'rgba(0, 165, 245, 0.1)',
										padding: '4px 12px',
										borderRadius: '20px',
										fontWeight: '600',
									}}
								>
									${selectedImage.price}
								</span>
							</p>
							<p
								style={{
									color: '#4a4a4a',
									margin: '12px 0',
									fontSize: '1.2rem',
									fontWeight: '500',
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
									gap: '8px',
								}}
							>
								Duration:{' '}
								<span
									style={{
										color: '#24BFDD',
										background: 'rgba(36, 191, 221, 0.1)',
										padding: '4px 12px',
										borderRadius: '20px',
										fontWeight: '600',
									}}
								>
									{selectedImage.time} hours
								</span>
							</p>
							<p
								style={{
									color: '#4a4a4a',
									margin: '12px 0',
									fontSize: '1.2rem',
									fontWeight: '500',
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
									gap: '8px',
								}}
							>
								Store:{' '}
								<span
									style={{
										color: '#53CEF8',
										background: 'rgba(83, 206, 248, 0.1)',
										padding: '4px 12px',
										borderRadius: '20px',
										fontWeight: '600',
									}}
								>
									{selectedImage.store}
								</span>
							</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default Home;
