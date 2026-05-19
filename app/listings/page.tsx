// app/listings/page.tsx
'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Bed, Bath, Ruler, Clock, TrendingDown, MapPin, Search, SlidersHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Listing } from '@/types';

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (stateFilter) params.set('state', stateFilter);
        const res = await fetch(`/api/listings?${params}`);
        const data = await res.json();
        setListings(data.listings || []);
      } catch {
        console.error('Failed to load listings');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [stateFilter]);

  const filtered = listings.filter(l =>
    !search ||
    l.address.toLowerCase().includes(search.toLowerCase()) ||
    l.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Open listings</h1>
            <p className="text-gray-500 text-sm mt-1">
              Homeowners waiting for realtor bids
            </p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="input pl-8 w-48"
                placeholder="Search city or address…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="input w-36"
              value={stateFilter}
              onChange={e => setStateFilter(e.target.value)}
            >
              <option value="">All states</option>
              {['CA','CO','FL','GA','IL','NY','NC','OH','TX','WA'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-32 bg-gray-100 rounded-lg mb-4" />
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <MapPin size={32} className="mx-auto mb-3 opacity-30" />
            <p>No active listings found</p>
            <p className="text-sm mt-1">Check back soon or adjust your filters</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ListingCard({ listing }: { listing: Listing }) {
  const daysLeft = formatDistanceToNow(new Date(listing.bid_deadline), { addSuffix: true });
  const isUrgent = new Date(listing.bid_deadline).getTime() - Date.now() < 48 * 3600 * 1000;

  return (
    <div className="card hover:shadow-md transition-shadow cursor-pointer group">
      {/* Property image placeholder */}
      <div className="h-36 bg-gradient-to-br from-brand-50 to-brand-100 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
        <span className="text-brand-400 text-5xl opacity-30">⌂</span>
        <div className="absolute top-2 left-2">
          <span className="badge-green text-xs">Accepting bids</span>
        </div>
        {isUrgent && (
          <div className="absolute top-2 right-2">
            <span className="badge-red text-xs">Closes soon</span>
          </div>
        )}
      </div>

      <div className="mb-1 font-medium text-gray-900 text-sm">{listing.address}</div>
      <div className="text-xs text-gray-500 mb-3 flex items-center gap-1">
        <MapPin size={11} />
        {listing.city}, {listing.state} {listing.zip}
      </div>

      <div className="text-xl font-bold text-brand-600 mb-2">
        ${listing.reference_price.toLocaleString()}
        <span className="text-xs font-normal text-gray-400 ml-1">ref. price</span>
      </div>

      <div className="flex gap-3 text-xs text-gray-500 mb-4">
        {listing.bedrooms && <span className="flex items-center gap-1"><Bed size={12} />{listing.bedrooms} bed</span>}
        {listing.bathrooms && <span className="flex items-center gap-1"><Bath size={12} />{listing.bathrooms} bath</span>}
        {listing.sqft && <span className="flex items-center gap-1"><Ruler size={12} />{listing.sqft.toLocaleString()} sqft</span>}
      </div>

      <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
        <div className="text-xs text-gray-500 flex items-center gap-1">
          <Clock size={11} />
          Closes {daysLeft}
        </div>
        <div className="flex items-center gap-1">
          <TrendingDown size={11} className="text-brand-400" />
          <span className="text-xs font-medium text-brand-600">
            {listing.bid_count || 0} bids
          </span>
        </div>
      </div>

      <div className="mt-3 text-xs bg-brand-50 text-brand-700 rounded-lg px-3 py-2">
        Min commission: ${listing.min_commission_usd.toLocaleString()} ({listing.min_commission_pct}%)
      </div>

      <a
        href={`/listings/${listing.id}`}
        className="btn-primary w-full justify-center mt-3 text-sm"
      >
        View & bid on this listing
      </a>
    </div>
  );
}
