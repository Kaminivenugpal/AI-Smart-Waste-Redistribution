import React, { useCallback, useEffect, useState } from 'react';
import { donationRequestService } from '../services/api';
import { Bell, Check, RefreshCw, X } from 'lucide-react';

const DonorRequestsPanel = () => {
  const [requests, setRequests] = useState([]);
  const [pickupTimes, setPickupTimes] = useState({});
  const [pickupLocations, setPickupLocations] = useState({});
  const [busyId, setBusyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setError('');
    try {
      setRequests(await donationRequestService.getMine());
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load incoming donation requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const intervalId = window.setInterval(refresh, 30000);
    return () => window.clearInterval(intervalId);
  }, [refresh]);

  const decide = async (requestId, decision) => {
    setBusyId(requestId);
    setError('');
    try {
      await donationRequestService.decide(requestId, decision);
      await refresh();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not update the donation request.');
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

  return (
    <section className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <h2 style={{ color: '#fff', fontSize: '1.3rem' }}>
          <Bell size={20} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
          Incoming donation requests
        </h2>
        <button className="btn-secondary" onClick={refresh} style={{ padding: '0.4rem 0.8rem' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>
      {error && <p role="alert" style={{ color: '#fca5a5', marginTop: '0.75rem' }}>{error}</p>}
      {loading ? (
        <p style={{ color: '#9ca3af', marginTop: '1rem' }}>Loading requests...</p>
      ) : requests.length === 0 ? (
        <p style={{ color: '#9ca3af', marginTop: '1rem' }}>No incoming requests. New requests appear automatically.</p>
      ) : (
        <div style={{ display: 'grid', gap: '0.9rem', marginTop: '1rem' }}>
          {requests.map(request => (
            <article key={request.id} className="glass-card" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <h3 style={{ color: '#fff' }}>{request.itemName} · {request.quantity}</h3>
                  <p style={{ color: '#9ca3af' }}>
                    {request.category} · {request.condition || 'Condition not specified'} · {request.itemLocation}
                  </p>
                  <p style={{ color: '#d1d5db' }}>
                    Requester: {request.receiverOrganization || request.receiverName}
                    {request.receiverOrganization ? ` (${request.receiverName})` : ''}
                    {request.receiverEmail ? ` · ${request.receiverEmail}` : ''}
                    {request.receiverPhone ? ` · ${request.receiverPhone}` : ''}
                  </p>
                  {request.note && <p style={{ color: '#9ca3af' }}>Message: {request.note}</p>}
                  {request.pickupScheduledAt && (
                    <p style={{ color: '#a7f3d0' }}>Pickup: {request.pickupScheduledAt.replace('T', ' ')} · {request.pickupLocation}</p>
                  )}
                </div>
                <strong style={{ color: '#34d399' }}>{request.status.replaceAll('_', ' ')}</strong>
              </div>

              {request.status === 'REQUESTED' && (
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
                  <button
                    className="btn-primary"
                    disabled={busyId === request.id}
                    onClick={() => decide(request.id, 'ACCEPTED')}
                  >
                    <Check size={16} /> Accept
                  </button>
                  <button
                    className="btn-secondary"
                    disabled={busyId === request.id}
                    onClick={() => decide(request.id, 'REJECTED')}
                  >
                    <X size={16} /> Reject
                  </button>
                </div>
              )}

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
                <button
                  className="btn-secondary"
                  disabled={busyId === request.id}
                  onClick={() => markPickedUp(request.id)}
                  style={{ marginTop: '0.75rem' }}
                >
                  Mark as picked up
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default DonorRequestsPanel;
