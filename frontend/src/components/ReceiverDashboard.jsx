import React, { useCallback, useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { donationRequestService, itemService, notificationService } from '../services/api';
import { Bell, MapPin, Package, RefreshCw, Send } from 'lucide-react';

const ReceiverDashboard = () => {
  const { receiver } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState({});
  const [pickupTimes, setPickupTimes] = useState({});
  const [pickupLocations, setPickupLocations] = useState({});
  const [busyId, setBusyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setError('');
    try {
      const [availableItems, myRequests, myNotifications] = await Promise.all([
        itemService.getAvailableDonations({ category, location }),
        donationRequestService.getMine(),
        notificationService.getMine(),
      ]);
      setItems(availableItems);
      setRequests(myRequests);
      setNotifications(myNotifications);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load receiver dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [category, location]);

  useEffect(() => {
    refresh();
    const intervalId = window.setInterval(refresh, 30000);
    return () => window.clearInterval(intervalId);
  }, [refresh]);

  const submitRequest = async (itemId) => {
    setBusyId(itemId);
    setError('');
    try {
      await donationRequestService.create(itemId, notes[itemId] || '');
      setNotes(current => ({ ...current, [itemId]: '' }));
      await refresh();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not submit your donation request.');
    } finally {
      setBusyId(null);
    }
  };

  const schedulePickup = async (requestId) => {
    setBusyId(requestId);
    setError('');
    try {
      await donationRequestService.schedulePickup(
        requestId,
        pickupTimes[requestId],
        pickupLocations[requestId] || ''
      );
      await refresh();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not schedule pickup.');
    } finally {
      setBusyId(null);
    }
  };

  const markPickedUp = async (requestId) => {
    setBusyId(requestId);
    setError('');
    try {
      await donationRequestService.markPickedUp(requestId);
      await refresh();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not update pickup status.');
    } finally {
      setBusyId(null);
    }
  };

  const markNotificationRead = async (notificationId) => {
    try {
      await notificationService.markRead(notificationId);
      setNotifications(current => current.map(notification => (
        notification.id === notificationId ? { ...notification, read: true } : notification
      )));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not mark notification as read.');
    }
  };

  const categories = [...new Set(items.map(item => item.category).filter(Boolean))];
  const cardStyle = { marginBottom: '1.5rem', padding: '1.5rem' };
  const titleStyle = { color: '#fff', fontSize: '1.25rem', marginBottom: '1rem' };

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '1100px', margin: '2rem auto' }}>
      <section className="glass-panel" style={cardStyle}>
        <h1 style={{ color: '#fff', marginBottom: '0.4rem' }}>
          Receiver / NGO Dashboard
        </h1>
        <p style={{ color: '#9ca3af' }}>
          Welcome, <strong style={{ color: '#34d399' }}>{receiver?.organizationName || receiver?.name}</strong>
          {receiver?.location ? ` · ${receiver.location}` : ''}
        </p>
      </section>

      {error && (
        <div role="alert" style={{ ...cardStyle, color: '#fca5a5', background: 'rgba(239,68,68,0.1)' }}>
          {error}
        </div>
      )}

      <section className="glass-panel" style={cardStyle}>
        <h2 style={titleStyle}><Bell size={20} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />Request notifications</h2>
        {notifications.length === 0 ? (
          <p style={{ color: '#9ca3af' }}>No request updates yet. This list refreshes automatically.</p>
        ) : notifications.map(notification => (
          <div key={notification.id} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            gap: '1rem', padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.07)',
            color: notification.read ? '#9ca3af' : '#e5e7eb',
          }}>
            <span>{notification.message}</span>
            {!notification.read && (
              <button className="btn-secondary" onClick={() => markNotificationRead(notification.id)}>
                Mark read
              </button>
            )}
          </div>
        ))}
      </section>

      <section className="glass-panel" style={cardStyle}>
        <h2 style={titleStyle}>Browse available donations</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
          <label style={{ color: '#9ca3af' }}>
            Category
            <select className="form-control" value={category} onChange={event => setCategory(event.target.value)}>
              <option value="">All categories</option>
              {categories.map(value => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label style={{ color: '#9ca3af' }}>
            Location
            <input
              className="form-control"
              value={location}
              onChange={event => setLocation(event.target.value)}
              placeholder="Filter by city or area"
            />
          </label>
          <button className="btn-secondary" onClick={refresh} style={{ alignSelf: 'end' }}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {loading ? <p style={{ color: '#9ca3af' }}>Loading donations...</p> : items.length === 0 ? (
          <p style={{ color: '#9ca3af' }}>No donations currently match these filters.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '1rem' }}>
            {items.map(item => (
              <article key={item.itemId} className="glass-card" style={{ padding: '1.25rem' }}>
                {item.imagePath && (
                  <img
                    src={`http://localhost:8080${item.imagePath}`}
                    alt={item.name}
                    style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '10px', marginBottom: '0.8rem' }}
                  />
                )}
                <h3 style={{ color: '#fff' }}>{item.name}</h3>
                <p style={{ color: '#9ca3af', margin: '0.4rem 0' }}>{item.description || 'No description provided.'}</p>
                <p style={{ color: '#d1d5db' }}>
                  {item.category} · Quantity: {item.quantity}
                </p>
                <p style={{ color: '#9ca3af' }}>
                  Condition: {item.condition || 'Not specified'}{item.priority ? ` · ${item.priority} priority` : ''}
                </p>
                <p style={{ color: '#9ca3af' }}>
                  <MapPin size={15} style={{ verticalAlign: 'middle' }} /> {item.location}
                </p>
                <p style={{ color: '#9ca3af' }}>
                  Donor: {item.donorName}{item.donorEmail ? ` · ${item.donorEmail}` : ''}
                  {item.donorPhone ? ` · ${item.donorPhone}` : ''}
                  {item.donorLocation ? ` · ${item.donorLocation}` : ''}
                </p>
                <label style={{ display: 'block', color: '#9ca3af', margin: '0.75rem 0' }}>
                  Note to donor (optional)
                  <textarea
                    className="form-control"
                    rows="2"
                    maxLength="1000"
                    value={notes[item.itemId] || ''}
                    onChange={event => setNotes(current => ({ ...current, [item.itemId]: event.target.value }))}
                  />
                </label>
                <button
                  className="btn-primary"
                  onClick={() => submitRequest(item.itemId)}
                  disabled={busyId === item.itemId}
                >
                  <Send size={16} /> {busyId === item.itemId ? 'Requesting...' : 'Request donation'}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="glass-panel" style={cardStyle}>
        <h2 style={titleStyle}><Package size={20} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />My donation requests</h2>
        {requests.length === 0 ? <p style={{ color: '#9ca3af' }}>You have not requested any donations yet.</p> : (
          <div style={{ display: 'grid', gap: '0.9rem' }}>
            {requests.map(request => (
              <article key={request.id} className="glass-card" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div>
                    <h3 style={{ color: '#fff' }}>{request.itemName}</h3>
                    <p style={{ color: '#9ca3af' }}>
                      {request.category} · {request.quantity} · {request.condition || 'Condition not specified'}
                    </p>
                    <p style={{ color: '#9ca3af' }}>Donor: {request.donorName} · {request.itemLocation}</p>
                    {request.note && <p style={{ color: '#9ca3af' }}>Your note: {request.note}</p>}
                    {request.pickupScheduledAt && (
                      <p style={{ color: '#a7f3d0' }}>Pickup: {request.pickupScheduledAt.replace('T', ' ')} · {request.pickupLocation}</p>
                    )}
                  </div>
                  <strong style={{ color: '#34d399' }}>{request.status.replaceAll('_', ' ')}</strong>
                </div>
                {request.status === 'ACCEPTED' && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.75rem' }}>
                    <input
                      aria-label="Pickup date and time"
                      type="datetime-local"
                      className="form-control"
                      value={pickupTimes[request.id] || ''}
                      onChange={event => setPickupTimes(current => ({ ...current, [request.id]: event.target.value }))}
                    />
                    <input
                      aria-label="Pickup location"
                      className="form-control"
                      placeholder="Pickup location (defaults to item location)"
                      value={pickupLocations[request.id] || ''}
                      onChange={event => setPickupLocations(current => ({ ...current, [request.id]: event.target.value }))}
                    />
                    <button
                      className="btn-secondary"
                      disabled={busyId === request.id || !pickupTimes[request.id]}
                      onClick={() => schedulePickup(request.id)}
                    >
                      Coordinate pickup
                    </button>
                  </div>
                )}
                {request.status === 'PICKUP_SCHEDULED' && (
                  <button className="btn-secondary" disabled={busyId === request.id} onClick={() => markPickedUp(request.id)}>
                    Mark as picked up
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ReceiverDashboard;
