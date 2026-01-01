import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, Video, MapPin, Plus, X, Edit2, Trash2, Users } from 'lucide-react';
import './CalendarView.css';

function CalendarView({ username }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [selectedDay, setSelectedDay] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        startTime: '09:00',
        endTime: '10:00',
        type: 'meeting',
        color: '#5B5FC7'
    });

    const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const colors = [
        { value: '#5B5FC7', name: 'Purple' },
        { value: '#4CAF50', name: 'Green' },
        { value: '#FF9800', name: 'Orange' },
        { value: '#E91E63', name: 'Pink' },
        { value: '#2196F3', name: 'Blue' },
        { value: '#00BCD4', name: 'Cyan' }
    ];

    const baseUrl = window.location.hostname === "localhost" && window.location.port === "5173"
        ? "http://localhost:3001"
        : "";

    // Fetch events
    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await fetch(`${baseUrl}/api/events?username=${username}`);
            if (res.ok) {
                const data = await res.json();
                setEvents(data);
            }
        } catch (err) {
            console.error('Failed to fetch events:', err);
        }
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysCount = new Date(year, month + 1, 0).getDate();
        return { firstDay, daysCount };
    };

    const { firstDay, daysCount } = getDaysInMonth(currentDate);
    const today = new Date();

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const getEventsForDay = (day) => {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return events.filter(e => e.date === dateStr);
    };

    const getTodaysEvents = () => {
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        return events.filter(e => e.date === todayStr);
    };

    const getUpcomingEvents = () => {
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        return events.filter(e => e.date > todayStr).slice(0, 5);
    };

    const handleDayClick = (day) => {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setSelectedDay(day);
        setFormData(prev => ({ ...prev, date: dateStr }));
        setEditingEvent(null);
        setShowModal(true);
    };

    const handleEditEvent = (event) => {
        setFormData({
            title: event.title,
            description: event.description || '',
            date: event.date,
            startTime: event.startTime,
            endTime: event.endTime,
            type: event.type,
            color: event.color
        });
        setEditingEvent(event);
        setShowModal(true);
    };

    const handleDeleteEvent = async (eventId) => {
        if (!confirm('Are you sure you want to delete this event?')) return;

        try {
            const res = await fetch(`${baseUrl}/api/events/${eventId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setEvents(events.filter(e => e.id !== eventId));
            }
        } catch (err) {
            console.error('Failed to delete event:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const method = editingEvent ? 'PUT' : 'POST';
            const url = editingEvent
                ? `${baseUrl}/api/events/${editingEvent.id}`
                : `${baseUrl}/api/events`;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    createdBy: username
                })
            });

            if (res.ok) {
                fetchEvents();
                closeModal();
            }
        } catch (err) {
            console.error('Failed to save event:', err);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingEvent(null);
        setFormData({
            title: '',
            description: '',
            date: '',
            startTime: '09:00',
            endTime: '10:00',
            type: 'meeting',
            color: '#5B5FC7'
        });
    };

    const formatTime = (time) => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const todaysEvents = getTodaysEvents();
    const upcomingEvents = getUpcomingEvents();

    return (
        <div className="calendar-view">
            <div className="calendar-sidebar">
                <div className="calendar-header">
                    <button className="nav-btn" onClick={prevMonth}>
                        <ChevronLeft size={20} />
                    </button>
                    <h2>{months[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                    <button className="nav-btn" onClick={nextMonth}>
                        <ChevronRight size={20} />
                    </button>
                </div>

                <div className="calendar-grid">
                    <div className="calendar-days-header">
                        {days.map(day => (
                            <div key={day} className="day-header">{day}</div>
                        ))}
                    </div>
                    <div className="calendar-days">
                        {[...Array(firstDay)].map((_, i) => (
                            <div key={`empty-${i}`} className="day-cell empty"></div>
                        ))}
                        {[...Array(daysCount)].map((_, i) => {
                            const dayNum = i + 1;
                            const isToday = dayNum === today.getDate() &&
                                currentDate.getMonth() === today.getMonth() &&
                                currentDate.getFullYear() === today.getFullYear();
                            const dayEvents = getEventsForDay(dayNum);
                            const hasEvents = dayEvents.length > 0;

                            return (
                                <div
                                    key={dayNum}
                                    className={`day-cell ${isToday ? 'today' : ''} ${hasEvents ? 'has-events' : ''}`}
                                    onClick={() => handleDayClick(dayNum)}
                                    title={hasEvents ? `${dayEvents.length} event(s)` : 'Click to add event'}
                                >
                                    <span>{dayNum}</span>
                                    {hasEvents && (
                                        <div className="event-dots">
                                            {dayEvents.slice(0, 3).map((event, idx) => (
                                                <div
                                                    key={idx}
                                                    className="event-dot"
                                                    style={{ backgroundColor: event.color }}
                                                ></div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <button className="add-event-btn" onClick={() => {
                    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                    setFormData(prev => ({ ...prev, date: todayStr }));
                    setShowModal(true);
                }}>
                    <Plus size={18} />
                    <span>New Event</span>
                </button>
            </div>

            <div className="calendar-events">
                <h3>📅 Today's Schedule</h3>
                <p className="date-subtitle">{today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>

                {todaysEvents.length === 0 ? (
                    <div className="no-events">
                        <p>No meetings scheduled for today!</p>
                        <span>Enjoy your free time 🎉</span>
                    </div>
                ) : (
                    <div className="events-list">
                        {todaysEvents.map(event => (
                            <div key={event.id} className="event-card" style={{ borderLeftColor: event.color }}>
                                <div className="event-card-header">
                                    <div className="event-title">{event.title}</div>
                                    <div className="event-actions">
                                        <button className="event-action-btn" onClick={() => handleEditEvent(event)}>
                                            <Edit2 size={14} />
                                        </button>
                                        <button className="event-action-btn delete" onClick={() => handleDeleteEvent(event.id)}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                <div className="event-details">
                                    <span><Clock size={14} /> {formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                                    {event.type === 'video' && <span><Video size={14} /> Video Call</span>}
                                </div>
                                {event.description && (
                                    <div className="event-description">{event.description}</div>
                                )}
                                <button className="join-btn" style={{ backgroundColor: event.color }}>
                                    Join
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <h4>Upcoming</h4>
                <div className="upcoming-list">
                    {upcomingEvents.length === 0 ? (
                        <p className="no-upcoming">No upcoming events</p>
                    ) : (
                        upcomingEvents.map(event => (
                            <div key={event.id} className="upcoming-item" onClick={() => handleEditEvent(event)}>
                                <div className="upcoming-day" style={{ backgroundColor: event.color }}>
                                    {formatDate(event.date)}
                                </div>
                                <div className="upcoming-info">
                                    <div className="upcoming-title">{event.title}</div>
                                    <div className="upcoming-time">{formatTime(event.startTime)} - {formatTime(event.endTime)}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Event Modal */}
            {showModal && (
                <div className="event-modal-overlay" onClick={closeModal}>
                    <div className="event-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingEvent ? 'Edit Event' : 'Create New Event'}</h3>
                            <button className="close-btn" onClick={closeModal}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Event title"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Add description (optional)"
                                    rows={3}
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Date</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="meeting">Meeting</option>
                                        <option value="video">Video Call</option>
                                        <option value="reminder">Reminder</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Start Time</label>
                                    <input
                                        type="time"
                                        value={formData.startTime}
                                        onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>End Time</label>
                                    <input
                                        type="time"
                                        value={formData.endTime}
                                        onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Color</label>
                                <div className="color-picker">
                                    {colors.map(color => (
                                        <div
                                            key={color.value}
                                            className={`color-option ${formData.color === color.value ? 'selected' : ''}`}
                                            style={{ backgroundColor: color.value }}
                                            onClick={() => setFormData({ ...formData, color: color.value })}
                                            title={color.name}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
                                {editingEvent && (
                                    <button
                                        type="button"
                                        className="delete-btn"
                                        onClick={async () => {
                                            await handleDeleteEvent(editingEvent.id);
                                            closeModal();
                                        }}
                                        style={{ backgroundColor: '#FFEBEE', color: '#D32F2F', marginRight: 'auto' }}
                                    >
                                        Delete
                                    </button>
                                )}
                                <div style={{ display: 'flex', gap: '8px', marginLeft: editingEvent ? '0' : 'auto' }}>
                                    <button type="button" className="cancel-btn" onClick={closeModal}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="save-btn">
                                        {editingEvent ? 'Save Changes' : 'Create Event'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CalendarView;
