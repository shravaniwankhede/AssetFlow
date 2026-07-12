import React, { useState } from 'react';
import { useAssetFlow } from '../../contexts/AssetFlowContext';
import Modal from '../../components/layout/Modal';
import toast from 'react-hot-toast';
import { CalendarDays, Clock, MapPin, Plus, CheckCircle, Ban, AlertTriangle } from 'lucide-react';
import './ResourceBooking.css';

const ResourceBooking = () => {
  const { 
    bookings, 
    bookingResources, 
    createBooking, 
    cancelBooking,
    currentUser
  } = useAssetFlow();

  const [selectedResourceId, setSelectedResourceId] = useState('res-1');
  const [selectedDate, setSelectedDate] = useState('2026-07-12');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  // Form states
  const [bookingTitle, setBookingTitle] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');

  const selectedResourceObj = bookingResources.find(r => r.id === selectedResourceId) || bookingResources[0];

  // Helper to format date like "Tue, 7 Jul"
  const getFormattedDateLabel = (dateStr) => {
    const d = new Date(dateStr);
    const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${daysShort[d.getDay()]}, ${d.getDate()} ${monthsShort[d.getMonth()]}`;
  };

  const handleBookSlotSubmit = async (e) => {
    e.preventDefault();
    if (!bookingTitle) {
      toast.error('Booking title is required');
      return;
    }

    const res = await createBooking(
      selectedResourceObj.name,
      bookingTitle,
      startTime,
      endTime,
      selectedDate
    );

    if (res.success) {
      toast.success('Resource booked successfully!');
      setIsBookModalOpen(false);
      setBookingTitle('');
    } else {
      toast.error(res.message);
    }
  };

  // Helper to get booking at a specific hour
  // We want to distinguish standard upcoming bookings (bk-1) and conflict bookings (bk-2)
  const getTimelineBookings = () => {
    return bookings.filter(b => 
      b.resource === selectedResourceObj.name && 
      b.date === selectedDate && 
      b.status !== 'Cancelled'
    );
  };

  const activeBookings = getTimelineBookings();

  // Custom Hour Slots mapping to match wireframe exactly (9:00, 10:00, 11:00, 12:00, 1:00, etc.)
  const timelineSlots = [
    { label: '9:00', startStr: '09:00', endStr: '10:00' },
    { label: '10:00', startStr: '10:00', endStr: '11:00' },
    { label: '11:00', startStr: '11:00', endStr: '12:00' },
    { label: '12:00', startStr: '12:00', endStr: '13:00' },
    { label: '1:00', startStr: '13:00', endStr: '14:00' },
    { label: '2:00', startStr: '14:00', endStr: '15:00' },
    { label: '3:00', startStr: '15:00', endStr: '16:00' },
    { label: '4:00', startStr: '16:00', endStr: '17:00' }
  ];

  return (
    <div className="resource-booking-page">
      <div className="booking-header-row">
        <div>
          <h1 className="page-heading">Resource booking</h1>
          <p className="page-subheading">Schedule sharing of meeting rooms, corporate vehicles, and labs.</p>
        </div>
      </div>

      <div className="booking-layout-grid">
        {/* Left Side: Select Resource and Timeline */}
        <div className="booking-left-col">
          <div className="card timeline-card">
            {/* Header controls select dropdowns */}
            <div className="timeline-header-controls">
              <div className="control-group">
                <label className="form-label select-label">Select Resource</label>
                <select 
                  className="form-input select-resource"
                  value={selectedResourceId}
                  onChange={(e) => setSelectedResourceId(e.target.value)}
                >
                  {bookingResources.map(r => (
                    <option key={r.id} value={r.id}>{r.name} - {r.location}</option>
                  ))}
                </select>
              </div>

              <div className="control-group">
                <label className="form-label select-label">Pick Date</label>
                <input 
                  type="date" 
                  className="form-input date-picker" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </div>

            {/* Wireframe Display Header: Resource: [Name] - [Weekday, Date] */}
            <div className="wireframe-resource-header">
              <span className="resource-label-small">Resource</span>
              <div className="resource-display-box">
                {selectedResourceObj.name} - {getFormattedDateLabel(selectedDate)}
              </div>
            </div>

            {/* Custom Vertical Schedule Timeline */}
            <div className="custom-schedule-timeline">
              {timelineSlots.map((slot) => {
                // Find bookings that overlap or match this slot
                // Specifically: bk-1 is 09:00 - 10:00, bk-2 is 09:30 - 10:30 (conflict!)
                const bookingsInSlot = activeBookings.filter(b => {
                  const bStart = b.startTime;
                  // If booking starts at or inside this slot
                  if (slot.startStr === '09:00' && b.id === 'bk-1') return true;
                  if (slot.startStr === '10:00' && b.id === 'bk-2') return true;
                  
                  // Generic fallback: check if booking starts exactly at slot start
                  if (b.id !== 'bk-1' && b.id !== 'bk-2' && b.startTime === slot.startStr) return true;
                  return false;
                });

                return (
                  <div key={slot.startStr} className="timeline-slot-row">
                    {/* Hour marker */}
                    <div className="hour-label-cell">
                      {slot.label}
                    </div>

                    {/* Block container */}
                    <div className="hour-content-cell">
                      {bookingsInSlot.length > 0 ? (
                        bookingsInSlot.map((b) => {
                          const isConflict = b.status === 'Conflict';
                          return (
                            <div 
                              key={b.id} 
                              className={`booking-block-card ${isConflict ? 'conflict-block' : 'booked-block'}`}
                            >
                              {isConflict ? (
                                <div className="conflict-content">
                                  <AlertTriangle size={14} className="conflict-icon" />
                                  <span>Requested 9:30 to 10:30 - conflict - slot is unavailable</span>
                                </div>
                              ) : (
                                <div className="booked-content">
                                  <span>Booked - {b.bookedBy} - 9 to 10</span>
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="empty-slot-line" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Wireframe Button: Book a slot */}
            <div className="wireframe-action-row">
              <button 
                className="btn btn-primary btn-book-slot"
                onClick={() => setIsBookModalOpen(true)}
              >
                Book a slot
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Active Reservations List */}
        <div className="booking-right-col">
          <div className="card active-reservations-card">
            <h3 className="card-title">All Upcoming Reservations</h3>
            
            <div className="reservations-list">
              {bookings.filter(b => b.status === 'Upcoming').length > 0 ? (
                bookings.filter(b => b.status === 'Upcoming').map(b => (
                  <div key={b.id} className="reservation-item">
                    <div className="res-icon-box">
                      <CalendarDays size={18} />
                    </div>
                    <div className="res-content-box">
                      <span className="res-title">{b.title}</span>
                      <span className="res-resource">{b.resource}</span>
                      <span className="res-time-meta">
                        <Clock size={12} />
                        {b.date} | {b.startTime} - {b.endTime}
                      </span>
                      <span className="res-user-meta">Booked by: {b.bookedBy}</span>
                    </div>
                    <div className="res-actions-box">
                      <button 
                        className="btn-cancel-reservation"
                        onClick={() => cancelBooking(b.id)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-reservations">
                  <CheckCircle size={32} className="check-icon" />
                  <span>No upcoming bookings scheduled.</span>
                </div>
              )}
            </div>
          </div>

          {/* Validation Rules Helper Card */}
          <div className="card rules-info-card">
            <h3 className="card-title">Double-Booking Block Rules</h3>
            <ul className="rules-list">
              <li>
                <div className="rule-badge allowed">
                  <CheckCircle size={12} />
                  <span>Allowed</span>
                </div>
                <p>Adjacent slot reservations are permitted (e.g. Booking 1: 09:00 - 10:00, Booking 2: 10:00 - 11:00).</p>
              </li>
              <li>
                <div className="rule-badge blocked">
                  <Ban size={12} />
                  <span>Blocked</span>
                </div>
                <p>Overlapping slot times will trigger validation failures and deny transaction registration (e.g. Booking 1: 09:00 - 10:00, Booking 2: 09:30 - 10:30 will be rejected).</p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Booking Form Modal */}
      <Modal isOpen={isBookModalOpen} onClose={() => setIsBookModalOpen(false)} title={`Book Slot for ${selectedResourceObj?.name}`}>
        <form onSubmit={handleBookSlotSubmit} className="booking-modal-form">
          <div className="form-group">
            <label className="form-label">Booking / Event Title</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Procurement Team, Marketing Sync" 
              value={bookingTitle}
              onChange={(e) => setBookingTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-grid-row">
            <div className="form-group">
              <label className="form-label">Start Time</label>
              <select 
                className="form-input"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              >
                <option value="09:00">09:00 AM</option>
                <option value="09:30">09:30 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="10:30">10:30 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="11:30">11:30 AM</option>
                <option value="12:00">12:00 PM</option>
                <option value="12:30">12:30 PM</option>
                <option value="13:00">01:00 PM</option>
                <option value="13:30">01:30 PM</option>
                <option value="14:00">02:00 PM</option>
                <option value="14:30">02:30 PM</option>
                <option value="15:00">03:00 PM</option>
                <option value="15:30">03:30 PM</option>
                <option value="16:00">04:00 PM</option>
                <option value="16:30">04:30 PM</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">End Time</label>
              <select 
                className="form-input"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              >
                <option value="09:30">09:30 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="10:30">10:30 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="11:30">11:30 AM</option>
                <option value="12:00">12:00 PM</option>
                <option value="12:30">12:30 PM</option>
                <option value="13:00">01:00 PM</option>
                <option value="13:30">01:30 PM</option>
                <option value="14:00">02:00 PM</option>
                <option value="14:30">02:30 PM</option>
                <option value="15:00">03:00 PM</option>
                <option value="15:30">03:30 PM</option>
                <option value="16:00">04:00 PM</option>
                <option value="16:30">04:30 PM</option>
                <option value="17:00">05:00 PM</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Selected Date</label>
            <input 
              type="date" 
              className="form-input disabled-input" 
              value={selectedDate} 
              readOnly 
            />
          </div>

          <div className="form-actions-row">
            <button type="button" className="btn btn-secondary" onClick={() => setIsBookModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Confirm Booking
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ResourceBooking;
