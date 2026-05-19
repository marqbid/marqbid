// app/listings/[id]/page.tsx
import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/layout/Navbar';
import { notFound } from 'next/navigation';
import {
  Bed, Bath, Ruler, Clock, Shield, MapPin, AlertTriangle,
  Star, TrendingDown, CheckCircle, Calendar
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { getStateDisclosure } from '@/lib/state-disclosures';

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: listing } = await supabase
    .from('listings')
    .select(`
      *,
      profile:profiles(id, full_name, avg_rating, total_sales),
      bids(
        id, bid_type, commission_pct, commission_usd, status, created_at,
        profile:profiles(id, full_name, avg_rating, total_sales, brokerage, license_state, bio)
      )
    `)
    .eq('id', id)
    .single();

  if (!listing) notFound();

  const isOwner = user?.id === listing.owner_id;
  const disclosure = getStateDisclosure(listing.state);
  const pendingBids = (listing.bids || [])
    .filter((b: any) => b.status === 'pending')
    .sort((a: any, b: any) => a.commission_usd - b.commission_usd);

  const standardSavings3 = Math.round(listing.reference_price * 0.03);
  const lowestBidUsd = pendingBids[0]?.commission_usd || 0;
  const potentialSavings = lowestBidUsd > 0 ? standardSavings3 - lowestBidUsd : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                listing.status === 'active' ? 'bg-brand-50 text-brand-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                {listing.status === 'active' ? '● Accepting bids' : listing.status}
              </span>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">{listing.address}</h1>
            <div className="text-gray-500 flex items-center gap-1 mt-1">
              <MapPin size={14} />
              {listing.city}, {listing.state} {listing.zip}
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-brand-600">
              ${listing.reference_price.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400 mt-0.5">Reference price</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left — main listing info */}
          <div className="lg:col-span-2 space-y-5">

            {/* Property stats */}
            <div className="card">
              <h3 className="mb-4">Property details</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {listing.bedrooms && (
                  <div className="stat-card text-center items-center">
                    <Bed size={18} className="text-brand-400" />
                    <div className="text-lg font-bold">{listing.bedrooms}</div>
                    <div className="text-xs text-gray-500">Bedrooms</div>
                  </div>
                )}
                {listing.bathrooms && (
                  <div className="stat-card text-center items-center">
                    <Bath size={18} className="text-brand-400" />
                    <div className="text-lg font-bold">{listing.bathrooms}</div>
                    <div className="text-xs text-gray-500">Bathrooms</div>
                  </div>
                )}
                {listing.sqft && (
                  <div className="stat-card text-center items-center">
                    <Ruler size={18} className="text-brand-400" />
                    <div className="text-lg font-bold">{listing.sqft.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Sq ft</div>
                  </div>
                )}
                {listing.year_built && (
                  <div className="stat-card text-center items-center">
                    <Calendar size={18} className="text-brand-400" />
                    <div className="text-lg font-bold">{listing.year_built}</div>
                    <div className="text-xs text-gray-500">Year built</div>
                  </div>
                )}
              </div>

              {listing.description && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    From the homeowner
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{listing.description}</p>
                </div>
              )}
            </div>

            {/* State disclosure */}
            {disclosure?.restriction_type === 'attorney_state' && (
              <div className="disclosure-banner">
                <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-amber-800 text-sm mb-1">Attorney closing state</div>
                  <p className="text-xs text-amber-700">{disclosure.notes}</p>
                </div>
              </div>
            )}

            {/* Bids list */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3>{pendingBids.length} bid{pendingBids.length !== 1 ? 's' : ''} received</h3>
                {potentialSavings > 0 && (
                  <span className="badge-green">
                    <TrendingDown size={11} />
                    Save up to ${potentialSavings.toLocaleString()} vs 3%
                  </span>
                )}
              </div>

              {pendingBids.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No bids yet — be the first realtor to bid on this listing.
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingBids.map((bid: any, i: number) => {
                    const initials = bid.profile?.full_name
                      ?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '??';
                    return (
                      <div
                        key={bid.id}
                        className={`p-4 rounded-xl ${
                          i === 0 ? 'bg-brand-50 border border-brand-100' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                              i === 0 ? 'bg-brand-400 text-white' : 'bg-gray-200 text-gray-600'
                            }`}>
                              {initials}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{bid.profile?.full_name}</span>
                                {i === 0 && <span className="badge-green text-xs">Lowest bid</span>}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                {bid.profile?.brokerage && <span>{bid.profile.brokerage}</span>}
                                {bid.profile?.license_state && <span>License: {bid.profile.license_state}</span>}
                                {bid.profile?.avg_rating > 0 && (
                                  <span className="flex items-center gap-0.5">
                                    <Star size={10} className="text-amber-400" />
                                    {bid.profile.avg_rating.toFixed(1)}
                                  </span>
                                )}
                                {bid.profile?.total_sales > 0 && (
                                  <span>{bid.profile.total_sales} sales</span>
                                )}
                              </div>
                              {bid.cover_letter && (
                                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                                  {bid.cover_letter}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className={`text-xl font-bold ${i === 0 ? 'text-brand-600' : 'text-gray-800'}`}>
                              {bid.commission_pct ? `${bid.commission_pct}%` : `$${bid.commission_usd.toLocaleString()}`}
                            </div>
                            <div className="text-xs text-gray-400">
                              = ${bid.commission_usd.toLocaleString()}
                            </div>
                            {isOwner && listing.status === 'active' && (
                              <form action="/api/bids" method="post">
                                <input type="hidden" name="bid_id" value={bid.id} />
                                <input type="hidden" name="listing_id" value={listing.id} />
                                <button
                                  className={`mt-2 text-xs px-3 py-1.5 rounded-lg font-medium ${
                                    i === 0
                                      ? 'bg-brand-400 text-white hover:bg-brand-600'
                                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  Accept bid
                                </button>
                              </form>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Min commission box */}
            <div className="card bg-brand-50 border-brand-100">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={16} className="text-brand-600" />
                <span className="text-sm font-medium text-brand-800">Commission floor</span>
              </div>
              <div className="text-2xl font-bold text-brand-700">
                ${listing.min_commission_usd.toLocaleString()}
              </div>
              <div className="text-xs text-brand-600 mt-1">
                {listing.min_commission_pct}% of ${listing.reference_price.toLocaleString()} reference price
              </div>
              <div className="text-xs text-brand-500 mt-2">
                No bid below this amount will be accepted.
              </div>
            </div>

            {/* Bidding timeline */}
            <div className="card">
              <h3 className="mb-3">Bidding timeline</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle size={14} className="text-brand-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-medium">Listed</div>
                    <div className="text-xs text-gray-400">
                      {format(new Date(listing.created_at), 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock size={14} className={`flex-shrink-0 mt-0.5 ${
                    listing.status === 'active' ? 'text-amber-400' : 'text-gray-300'
                  }`} />
                  <div>
                    <div className="text-xs font-medium">Bidding closes</div>
                    <div className="text-xs text-gray-400">
                      {format(new Date(listing.bid_deadline), 'MMM d, yyyy')}
                      {' — '}{formatDistanceToNow(new Date(listing.bid_deadline), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA for realtors */}
            {!isOwner && listing.status === 'active' && (
              <div className="card text-center">
                <TrendingDown size={20} className="text-brand-400 mx-auto mb-2" />
                <p className="text-sm font-medium mb-1">Want this listing?</p>
                <p className="text-xs text-gray-500 mb-3">
                  Submit your commission bid and a cover letter to the homeowner.
                </p>
                <a href="/realtor" className="btn-primary w-full justify-center text-sm">
                  Place a bid
                </a>
              </div>
            )}

            {/* Savings comparison */}
            <div className="card">
              <h3 className="text-sm mb-3">Commission comparison</h3>
              <div className="space-y-2">
                {[
                  { label: 'Standard 3%', usd: Math.round(listing.reference_price * 3 / 100), muted: true },
                  { label: 'Standard 2.5%', usd: Math.round(listing.reference_price * 2.5 / 100), muted: true },
                  { label: `Floor (${listing.min_commission_pct}%)`, usd: listing.min_commission_usd, green: true },
                  ...(lowestBidUsd > 0 ? [{ label: 'Best current bid', usd: lowestBidUsd, bold: true }] : []),
                ].map(row => (
                  <div key={row.label} className={`flex justify-between text-xs py-1.5 px-2 rounded-lg ${
                    (row as any).bold ? 'bg-brand-50 font-medium' : ''
                  }`}>
                    <span className={(row as any).muted ? 'text-gray-400 line-through' : 'text-gray-600'}>
                      {row.label}
                    </span>
                    <span className={
                      (row as any).bold ? 'text-brand-600 font-semibold' :
                      (row as any).green ? 'text-brand-500' :
                      'text-gray-300'
                    }>
                      ${row.usd.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
