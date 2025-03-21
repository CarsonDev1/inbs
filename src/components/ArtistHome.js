import React, { useEffect, useState } from 'react';
import { Calendar, Palette, Store, HelpCircle, HourglassIcon, LogOut } from 'lucide-react';
import '../css/ArtistHome.css';
import { useNavigate } from 'react-router-dom';

const AppointmentsCalendar = () => {
	const [searchTerm, setSearchTerm] = useState('');
	const [currentDate, setCurrentDate] = useState(new Date(2025, 2, 22)); // March 22, 2025
	const [selectedDate, setSelectedDate] = useState(new Date(2025, 0, 2)); // Jan 2, 2025
	const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
	const [mobileNavOpen, setMobileNavOpen] = useState(false);
	const navigate = useNavigate();
	const [bookings, setBookings] = useState([]);

	// Status enum
	const bookingStatus = {
		CANCELED: -1,
		WAITING: 0,
		CONFIRMED: 1,
		SERVING: 2,
		COMPLETED: 3,
	};

	const fetchBookings = async () => {
		try {
			// Using the API endpoint for bookings with status 1
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

	const requestSort = (key) => {
		let direction = 'ascending';
		if (sortConfig.key === key && sortConfig.direction === 'ascending') {
			direction = 'descending';
		}
		setSortConfig({ key, direction });
	};

	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'short',
			day: '2-digit',
		}).format(date);
	};

	// Get status label and color based on status code
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

	useEffect(() => {
		fetchBookings();
	}, []);

	// Get current month and year for display
	const monthNames = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December',
	];
	const currentMonth = monthNames[currentDate.getMonth()];
	const currentYear = currentDate.getFullYear();

	const toggleMobileNav = () => {
		setMobileNavOpen(!mobileNavOpen);
	};

	// Generate calendar days
	const generateCalendarDays = () => {
		const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
		const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

		// Get last days of previous month
		const daysInPrevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
		const prevMonthDays = [];
		for (let i = firstDayOfMonth - 1; i >= 0; i--) {
			prevMonthDays.push(daysInPrevMonth - i);
		}

		// Current month days
		const currentMonthDays = [];
		for (let i = 1; i <= daysInMonth; i++) {
			currentMonthDays.push(i);
		}

		// Next month days
		const nextMonthDays = [];
		const remainingCells = 42 - (prevMonthDays.length + currentMonthDays.length);
		for (let i = 1; i <= remainingCells; i++) {
			nextMonthDays.push(i);
		}

		return { prevMonthDays, currentMonthDays, nextMonthDays };
	};

	const { prevMonthDays, currentMonthDays, nextMonthDays } = generateCalendarDays();

	const prevMonth = () => {
		setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
	};

	const nextMonth = () => {
		setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
	};

	// Check if a day is the current day
	const isCurrentDay = (day) => {
		return day === 22 && currentDate.getMonth() === 2 && currentDate.getFullYear() === 2025;
	};

	// Check if a day is selected
	const isSelectedDay = (day) => {
		return day === 3 && currentDate.getMonth() === 2 && currentDate.getFullYear() === 2025;
	};
	const handleLogout = () => {
		// Logic for logout (e.g., clearing tokens, session data)
		navigate('/');
	};

	return (
		<div>
			<nav className='artist-nav'>
				<div className='nav-brand'>
					<h1>Artist Dashboard</h1>
				</div>
				<div className={`nav-links ${mobileNavOpen ? 'show' : ''}`}>
					<a href='#profile'>Profile</a>
					<a href='#works'>My Works</a>
					<a href='#settings'>Settings</a>
					<button onClick={handleLogout} className='logout-btn'>
						Logout
					</button>
				</div>
				<div className='nav-toggle' onClick={toggleMobileNav}>
					<span></span>
					<span></span>
					<span></span>
				</div>
			</nav>

			<div className='app-container'>
				<div className='appointments-wrapper'>
					{/* Header */}
					<div className='app-header'>
						<div className='icon-container'>
							<Calendar className='calendar-icon' size={24} />
						</div>
						<div>
							<h1 className='app-title'>Appointments Calendar</h1>
							<p className='app-subtitle'>Manage your daily appointments and schedules</p>
						</div>
					</div>

					{/* Main content */}
					<div className='main-content-artist'>
						{/* Calendar picker */}
						<div className='calendar-picker'>
							<div className='calendar-icon-container'>
								<Calendar className='calendar-icon' size={24} />
							</div>
							<h2 className='section-title'>Select Appointment Date</h2>
							<p className='appointment-count'>5 appointments scheduled</p>

							{/* Month navigation */}
							<div className='month-navigation'>
								<button onClick={prevMonth} className='nav-button'>
									«
								</button>
								<div className='month-display'>
									<h3 className='month-name'>{currentMonth}</h3>
									<p className='year-display'>{currentYear}</p>
								</div>
								<button onClick={nextMonth} className='nav-button'>
									»
								</button>
							</div>

							{/* Calendar */}
							<div className='calendar'>
								{/* Weekday headers */}
								<div className='weekday-header'>
									{['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day, idx) => (
										<div key={idx} className='weekday'>
											{day}
										</div>
									))}
								</div>

								{/* Calendar grid */}
								<div className='calendar-grid'>
									{/* Previous month days */}
									{prevMonthDays.map((day, idx) => (
										<div key={`prev-${idx}`} className='day prev-month-day'>
											{day}
										</div>
									))}

									{/* Current month days */}
									{currentMonthDays.map((day, idx) => (
										<div
											key={`current-${idx}`}
											className={`day ${isCurrentDay(day) ? 'current-day' : ''} ${
												isSelectedDay(day) ? 'selected-day' : ''
											}`}
										>
											{day}
										</div>
									))}

									{/* Next month days */}
									{nextMonthDays.map((day, idx) => (
										<div key={`next-${idx}`} className='day next-month-day'>
											{day}
										</div>
									))}
								</div>
							</div>
						</div>

						{/* Appointments display */}
						<div className='appointments-display'>
							<div className='date-header'>
								<div className='selected-date'>
									<span className='date-indicator'>✦</span>
									<h2 className='date-title'>Thursday, January 2, 2025</h2>
								</div>
								<div className='filter-container'>
									<span className='filter-label'>Filter by Store:</span>
									<select className='store-filter'>
										<option>All Stores</option>
									</select>
								</div>
							</div>

							<div className='empty-state'>
								<p>0 appointments scheduled</p>
							</div>
						</div>
					</div>
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

					{bookings.length === 0 ? (
						<div
							style={{
								display: 'flex',
								justifyContent: 'center',
								padding: '40px 0',
								color: '#666',
								fontSize: '18px',
							}}
						>
							{searchTerm ? 'No appointments match your search' : 'Loading appointment data...'}
						</div>
					) : (
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
					)}
				</div>
			</div>
		</div>
	);
};

export default AppointmentsCalendar;
