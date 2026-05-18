// app/dashboard/page.tsx
import Navbar from '@/components/layout/Navbar';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CheckCircle, Clock, TrendingDown, DollarSign, PlusCircle, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Listing, Bid } from '@/types';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  // Fetch user listings with bids
  const { data: listings } = await supabase
    .from('listings')
    .select(`
      *,
      bids(
        id, bid_type, commission_pct, commission_usd, cover_letter, status, created_at,
        profile:profiles(full_name, avg_rating, total_sales, brokerage, license_state)
      )
    `)
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  const activeListings = listings?.filter(l => l.status === 'active') || [];
  const allBids = listings?.flatMap(l => l.bids || []) || [];
  const pendingBids = allBids.filter(b => b.status === 'pending');
  const lowestBid = pendingBids.length > 0
    ? Math.min(...pendingBids.map(b => b.commission_usd))
    : 0;

  // Estimate savings vs 3%
  const referenceTotal = activeListings.reduce((sum, l) => sum + l.reference_price, 0);
  const standardCommission = referenceTotal * 0.03;
  const estimatedSavings = lowestBid > 0
    ? standardCommission - lowestBid
    : standardCommission * 0.3; // rough estimate

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold">Your dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">{user.email}</p>
          </div>
          <a href="/list" className="btn-primary">
            <PlusCircle size={15} />
            New listing
          </a>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="stat-card">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Active listings</div>
            <div className="text-2xl font-bold text-gray-900">{activeListings.length}</div>
          </div>
          <div className="stat-card">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Total bids received</div>
            <div className="text-2xl font-bold text-gray-900">{pendingBids.length}</div>
          </div>
          <div className="stat-card">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Lowest bid</div>
            <div className="text-2xl font-bold text-brand-600">
              {lowestBid > 0 ? `$${lowestBid.toLocaleString()}` : '—'}
            </div>
          </div>
          <div className="stat-card">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Est. savings</div>
            <div className="text-2xl font-bold text-green-600">
              {estimatedSavings > 0 ? `$${Math.round(estimatedSavings).toLocaleString()}` : '—'}
            </div>
          </div>
        </div>

        {/* Listings */}
        {listings?.length === 0 ? (
          <div className="card text-center py-12">
            <DollarSign size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-600 font-medium">No listings yet</p>
            <p className="text-gray-400 text-sm mt-1">List your home for $9.99 and start receiving bids today.</p>
            <a href="/list" className="btn-primary mt-4 inline-flex">
              <PlusCircle size={15} /> List my home
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {listings?.map(listing => (
              <ListingWithBids key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ListingWithBids({ listing }: { listing: Listing & { bids: (Bid & { profile: any })[] } }) {
  const bids = listing.bids || [];
  const pendingBids = bids.filter(b => b.status === 'pending')
    .sort((a, b) => a.commission_usd - b.commission_usd);

  const isActive = listing.status === 'active';
  const isClosed = listing.status === 'closed';

  return (
    <div className="card">
      {/* Listing header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5 pb-5 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold">{listing.address}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              isActive ? 'bg-brand-50 text-brand-700' :
              isClosed ? 'bg-blue-50 text-blue-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {listing.status}
            </span>
          </div>
          <div className="text-sm text-gray-500">{listing.city}, {listing.state} {listing.zip}</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-brand-600">${listing.reference_price.toLocaleString()}</div>
          <div className="text-xs text-gray-400">
            Floor: ${listing.min_commission_usd.toLocaleString()} ({listing.min_commission_pct}%)
          </div>
          {isActive && (
            <div className="text-xs text-gray-400 flex items-center gap-1 justify-end mt-1">
              <Clock size={11} />
              Closes {formatDistanceToNow(new Date(listing.bid_deadline), { addSuffix: true })}
            </div>
          )}
        </div>
      </div>

      {/* Bids */}
      {pendingBids.length === 0 ? (
        <div className="text-sm text-gray-400 text-center py-4">
          No bids yet — check back soon. Listing shared with licensed realtors in your area.
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700 mb-3">
            {pendingBids.length} bid{pendingBids.length !== 1 ? 's' : ''} received
            {pendingBids.length > 0 && (
              <span className="text-brand-600 ml-2">
                — best: ${pendingBids[0].commission_usd.toLocaleString()}
                {pendingBids[0].commission_pct ? ` (${pendingBids[0].commission_pct}%)` : ''}
              </span>
            )}
          </div>
          {pendingBids.slice(0, 5).map((bid, i) => (
            <BidRow key={bid.id} bid={bid} isBest={i === 0} listingId={listing.id} isActive={isActive} />
          ))}
          {pendingBids.length > 5 && (
            <p className="text-xs text-gray-400 text-center">
              +{pendingBids.length - 5} more bids
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function BidRow({
  bid, isBest, listingId, isActive
}: {
  bid: Bid & { profile: any };
  isBest: boolean;
  listingId: string;
  isActive: boolean;
}) {
  const initials = bid.profile?.full_name
    ?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '??';

  async function acceptBid() {
    const confirmed = confirm(`Accept bid from ${bid.profile?.full_name}?\n\nCommission: $${bid.commission_usd.toLocaleString()}${bid.commission_pct ? ` (${bid.commission_pct}%)` : ''}\n\nThis will close the listing and notify all other realtors.`);
    if (!confirmed) return;
    const res = await fetch('/api/bids', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bid_id: bid.id, listing_id: listingId }),
    });
    if (res.ok) window.location.reload();
  }

  return (
    <div className={`flex items-start justify-between gap-4 p-3 rounded-xl ${
      isBest ? 'bg-brand-50 border border-brand-100' : 'bg-gray-50'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
          isBest ? 'bg-brand-400 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          {initials}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{bid.profile?.full_name}</span>
            {isBest && <span className="badge-green text-xs">Best bid</span>}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
            {bid.profile?.brokerage && <span>{bid.profile.brokerage}</span>}
            {bid.profile?.avg_rating > 0 && (
              <span className="flex items-center gap-0.5">
                <Star size={10} className="text-amber-400" />
                {bid.profile.avg_rating.toFixed(1)}
              </span>
            )}
            {bid.profile?.total_sales > 0 && <span>{bid.profile.total_sales} sales</span>}
          </div>
          {bid.cover_letter && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{bid.cover_letter}</p>
          )}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className={`text-lg font-bold ${isBest ? 'text-brand-600' : 'text-gray-800'}`}>
          {bid.commission_pct ? `${bid.commission_pct}%` : `$${bid.commission_usd.toLocaleString()}`}
        </div>
        <div className="text-xs text-gray-400">
          = ${bid.commission_usd.toLocaleString()}
        </div>
        {isActive && (
          <button onClick={acceptBid} className={`mt-2 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
            isBest
              ? 'bg-brand-400 text-white hover:bg-brand-600'
              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}>
            Accept
          </button>
        )}
      </div>
    </div>
  );
}
