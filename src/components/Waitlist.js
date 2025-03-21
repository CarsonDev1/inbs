import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../css/Waitlist.css';

function Waitlist() {
	const [showSidebar, setShowSidebar] = useState(false);
	const [waitlist, setWaitlist] = useState([]);
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [selectedStartTime, setSelectedStartTime] = useState('');
	const [selectedEndTime, setSelectedEndTime] = useState('');
	const [isEditingTime, setIsEditingTime] = useState(null);
	const [selectedStore, setSelectedStore] = useState('all');
	const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
	const navigate = useNavigate();
	const [bookings, setBookings] = useState([]);

	const bookingStatus = {
		CANCELED: -1,
		WAITING: 0,
		CONFIRMED: 1,
		SERVING: 2,
		COMPLETED: 3,
	};

	const getStatusInfo = (status) => {
		switch (status) {
			case bookingStatus.CANCELED:
				return { label: 'Canceled', bgColor: 'rgba(255, 99, 132, 0.2)', textColor: '#e63946' };
			case bookingStatus.WAITING:
				return { label: 'Waiting', bgColor: 'rgba(255, 205, 86, 0.2)', textColor: '#ff9500' };
			case bookingStatus.CONFIRMED:
				return { label: 'Confirmed', bgColor: 'rgba(54, 162, 235, 0.2)', textColor: '#0077b6' };
			case bookingStatus.SERVING:
				return { label: 'Serving', bgColor: 'rgba(153, 102, 255, 0.2)', textColor: '#7209b7' };
			case bookingStatus.COMPLETED:
				return { label: 'Completed', bgColor: 'rgba(75, 192, 192, 0.2)', textColor: '#2a9d8f' };
			default:
				return { label: 'Unknown', bgColor: 'rgba(201, 203, 207, 0.2)', textColor: '#666666' };
		}
	};

	const fetchBookings = async () => {
		try {
			const response = await fetch(
				'https://inbsapi-d9hhfmhsapgabrcz.southeastasia-01.azurewebsites.net/odata/booking?$filter=status eq 1 &$select=id,serviceDate,startTime,predictEndTime,totalAmount,status,lastModifiedAt,customerSelectedId,artistStoreId'
			);

			if (!response.ok) {
				throw new Error(`API request failed with status ${response.status}`);
			}

			const data = await response.json();
			console.log('Fetched bookings data:', data); // For debugging

			// Ensure data.value is an array before setting state
			if (Array.isArray(data.value)) {
				// Process the data to match the expected format
				const processedBookings = data.value.map((booking) => ({
					// Use the API response field names
					ID: booking.ID,
					ServiceDate: booking.ServiceDate,
					StartTime: booking.StartTime,
					PredictEndTime: booking.PredictEndTime,
					TotalAmount: booking.TotalAmount,
					Status: booking.Status,
					LastModifiedAt: booking.LastModifiedAt,
					CustomerSelectedId: booking.CustomerSelectedId,
					ArtistStoreId: booking.ArtistStoreId,
					// Handle nested objects
					ArtistStore: booking.ArtistStore,
				}));

				setBookings(processedBookings);
			} else {
				setBookings([]); // Set empty array if data is not an array
				console.error('Fetched data is not an array:', data);
			}
		} catch (error) {
			console.error('Error fetching bookings:', error);
			setBookings([]); // Set empty array on error
		}
	};

	useEffect(() => {
		fetchWaitlist();
		fetchBookings();
	}, []);

	const fetchWaitlist = async () => {
		try {
			const response = await fetch('https://6772b9a7ee76b92dd49333cb.mockapi.io/Booking');
			const data = await response.json();
			if (Array.isArray(data)) {
				setWaitlist(data);
			} else {
				setWaitlist([]);
				console.error('Fetched data is not an array:', data);
			}
		} catch (error) {
			console.error('Error fetching waitlist:', error);
			setWaitlist([]);
		}
	};

	const handleDateChange = (date) => {
		setSelectedDate(date);
	};

	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'short',
			day: '2-digit',
		}).format(date);
	};

	const handleTimeChange = async (customerId, newStartTime, newEndTime) => {
		try {
			const response = await fetch(`https://6772b9a7ee76b92dd49333cb.mockapi.io/Booking/${customerId}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					startTime: newStartTime,
					endTime: newEndTime,
				}),
			});

			if (response.ok) {
				setWaitlist(
					waitlist.map((customer) =>
						customer.id === customerId
							? { ...customer, startTime: newStartTime, endTime: newEndTime }
							: customer
					)
				);
				setIsEditingTime(null);
			}
		} catch (error) {
			console.error('Error updating time:', error);
		}
	};

	const getUniqueStores = () => {
		const stores = waitlist.map((item) => item.store);
		return ['all', ...new Set(stores)];
	};

	const requestSort = (key) => {
		let direction = 'ascending';
		if (sortConfig.key === key && sortConfig.direction === 'ascending') {
			direction = 'descending';
		}
		setSortConfig({ key, direction });
	};

	const filteredWaitlist = waitlist.filter((customer) => {
		const customerDate = new Date(customer.date);
		const dateMatch = customerDate.toDateString() === selectedDate.toDateString();
		const storeMatch = selectedStore === 'all' || customer.store === selectedStore;
		return dateMatch && storeMatch;
	});

	const handleHome = () => navigate('/home');
	const handleStore = () => navigate('/store');
	const handleArtist = () => navigate('/artist');
	const handleLogout = () => navigate('/');

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
					<button className='sidebar-button' onClick={handleHome}>
						<span
							className='sidebar-button-icon'
							style={{ marginRight: '12px', marginLeft: '-12px', fontSize: '20px' }}
						>
							🏠
						</span>
						{showSidebar && 'Home'}
					</button>
					<button className='sidebar-button' onClick={handleStore}>
						<span
							className='sidebar-button-icon'
							style={{ marginRight: '12px', marginLeft: '-12px', fontSize: '20px' }}
						>
							📊
						</span>
						{showSidebar && 'Store'}
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
				<div className='header'>
					<div className='header-content'>
						<div className='date-icon'>
							<span className='calendar-date'>📅 </span>
						</div>
						<div>
							<h1 className='page-title'>Appointments Calendar</h1>
							<p className='page-subtitle'>Manage your daily appointments and schedules</p>
						</div>
					</div>
				</div>

				<div className='content-grid'>
					<div className='calendar-section'>
						<div className='section-header'>
							<div className='calendar-icon'>
								<span role='img' aria-label='calendar' style={{ fontSize: '24px' }}>
									📅
								</span>
							</div>
							<div className='section-info'>
								<h2 className='section-title'>Select Appointment Date</h2>
								<p className='appointment-count'>
									<span className='count' style={{ color: '#4a90e2', fontWeight: '600' }}>
										5
									</span>
									<span style={{ color: '#666' }}> appointments scheduled</span>
								</p>
							</div>
						</div>
						<Calendar
							onChange={handleDateChange}
							value={selectedDate}
							className='custom-calendar'
							view='month'
							tileClassName={({ date }) => {
								const hasAppointment = waitlist.some(
									(customer) => new Date(customer.date).toDateString() === date.toDateString()
								);
								return hasAppointment ? 'calendar-tile has-appointment' : 'calendar-tile';
							}}
							formatMonth={(locale, date) => {
								const month = date.toLocaleString('en-US', { month: 'long' });
								const year = date.getFullYear();
								return `${month}\n${year}`;
							}}
						/>
					</div>

					<div className='waitlist-table-container'>
						<div className='section-header'>
							<div className='header-controls'>
								<div className='date-header'>
									<span className='sparkle-icon'>✨</span>
									<h2 className='section-title'>Thursday, January 2, 2025</h2>
								</div>
								<div className='store-filter'>
									<label htmlFor='store-select'>Filter by Store:</label>
									<select
										id='store-select'
										value={selectedStore}
										onChange={(e) => setSelectedStore(e.target.value)}
										className='store-select'
									>
										{getUniqueStores().map((store) => (
											<option key={store} value={store}>
												{store === 'all' ? 'All Stores' : store}
											</option>
										))}
									</select>
								</div>
							</div>
							<p className='appointment-count'>{filteredWaitlist.length} appointments scheduled</p>
						</div>

						<div className='appointments-grid'>
							{filteredWaitlist.map((customer) => (
								<div key={customer.id} className='appointment-card'>
									<img src={customer.serviceImage} alt={customer.service} className='service-image' />
									<div className='appointment-details'>
										<h3 className='customer-name'>{customer.name}</h3>
										<div className='appointment-info'>
											<div className='time-service'>
												{isEditingTime === customer.id ? (
													<div className='time-edit'>
														<div className='time-inputs'>
															<input
																type='time'
																value={selectedStartTime}
																onChange={(e) => setSelectedStartTime(e.target.value)}
																className='time-input'
															/>
															<span className='time-separator'>-</span>
															<input
																type='time'
																value={selectedEndTime}
																onChange={(e) => setSelectedEndTime(e.target.value)}
																className='time-input'
															/>
														</div>
														<div className='time-buttons'>
															<button
																onClick={() =>
																	handleTimeChange(
																		customer.id,
																		selectedStartTime,
																		selectedEndTime
																	)
																}
																className='save-button'
															>
																Save
															</button>
															<button
																onClick={() => setIsEditingTime(null)}
																className='cancel-button'
															>
																Cancel
															</button>
														</div>
													</div>
												) : (
													<span
														className='time-slot'
														onClick={() => {
															setIsEditingTime(customer.id);
															setSelectedStartTime(customer.startTime || '');
															setSelectedEndTime(customer.endTime || '');
														}}
													>
														⏰ {customer.startTime} - {customer.endTime}
													</span>
												)}
												<span className='service-name'>💅 {customer.service}</span>
											</div>
											<div className='location'>
												<span className='store-location'>🏪 {customer.store}</span>
											</div>
										</div>
										<div className='appointment-footer'>
											<span className='price'>{customer.price}đ</span>
											<span className='booking-id'>{customer.id}</span>
										</div>
									</div>
								</div>
							))}
						</div>

						<table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 15px' }}>
							<thead>
								<tr style={{ background: 'rgba(248,249,250,0.9)' }}>
									<th
										onClick={() => requestSort('serviceDate')}
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
										{sortConfig.key === 'serviceDate' &&
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
										Start Time
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
										End Time
									</th>
									<th
										onClick={() => requestSort('totalAmount')}
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
										Amount{' '}
										{sortConfig.key === 'totalAmount' &&
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
										Status
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
								</tr>
							</thead>
							<tbody>
								{bookings.map((booking) => {
									const statusInfo = getStatusInfo(booking.Status);

									return (
										<tr
											key={booking.ID}
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
													color: '#666',
													fontWeight: '500',
												}}
											>
												{formatDate(booking.ServiceDate)}
											</td>
											<td
												style={{
													padding: '25px',
													borderBottom: '1px solid #e9ecef',
													color: '#666',
													fontWeight: '500',
												}}
											>
												{booking.StartTime ? booking.StartTime.substring(0, 5) : 'N/A'}
											</td>
											<td
												style={{
													padding: '25px',
													borderBottom: '1px solid #e9ecef',
													color: '#666',
													fontWeight: '500',
												}}
											>
												{booking.PredictEndTime
													? booking.PredictEndTime.substring(0, 5)
													: 'N/A'}
											</td>
											<td
												style={{
													padding: '25px',
													borderBottom: '1px solid #e9ecef',
													fontWeight: '700',
													color: '#24BFDD',
												}}
											>
												{booking.TotalAmount.toLocaleString()} VND
											</td>
											<td
												style={{
													padding: '25px',
													borderBottom: '1px solid #e9ecef',
													fontWeight: '600',
												}}
											>
												<span
													style={{
														padding: '6px 12px',
														borderRadius: '20px',
														background: statusInfo.bgColor,
														color: statusInfo.textColor,
														fontWeight: '600',
													}}
												>
													{statusInfo.label}
												</span>
											</td>
											<td
												style={{
													padding: '25px',
													borderBottom: '1px solid #e9ecef',
													fontWeight: '600',
													color: '#24BFDD',
												}}
											>
												{booking.ArtistStore && booking.ArtistStore.Store
													? booking.ArtistStore.Store.Address
													: 'N/A'}
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Waitlist;
