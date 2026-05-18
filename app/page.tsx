// app/page.tsx
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import {
  ArrowRight, TrendingDown, Shield, Star, CheckCircle,
  DollarSign, Clock, Users, AlertTriangle
} from 'lucide-react';
import { getRestrictedStates, getAttorneyStates } from '@/lib/state-disclosures';

export default function HomePage() {
  const restrictedStates = getRestrictedStates();
  const attorneyStates = getAttorneyStates();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16">
        <div className="max-w-3xl">
          <div className="badge-green mb-6 w-fit">
            <TrendingDown size={12} />
            Post-NAR settlement — commission rates are negotiable
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-4">
            Mark it. Bid it.{' '}
            <span className="text-brand-400">Sell it.</span>
          </h1>
          <p className="text-xl text-gray-400 mb-3 font-medium tracking-wide">
            Let licensed realtors compete for your listing.
          </p>

          <p className="text-lg text-gray-500 mb-8 leading-relaxed">
            Post your home for just $9.99. Realtors bid on what commission they'll charge.
            You pick the best combination of price and experience.
            Save thousands vs. the standard 2.5–3% rate.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/list" className="btn-primary text-base px-6 py-3">
              List my home — $9.99
              <ArrowRight size={16} />
            </Link>
            <Link href="/listings" className="btn-outline text-base px-6 py-3">
              Browse open listings
            </Link>
          </div>

          <p className="text-xs text-gray-400 mt-4">
            One-time listing fee. No subscription. Pay nothing if you don't find the right agent.
          </p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-brand-400 text-white py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-2 sm:grid-cols-4 gap-8">
          {[
            { label: 'Average savings', value: '$9,200', sub: 'vs. standard 3%' },
            { label: 'Average bids per listing', value: '6.4', sub: 'realtors compete' },
            { label: 'Listing fee', value: '$9.99', sub: 'flat, one-time' },
            { label: 'Commission floor', value: '1.2%', sub: 'configurable minimum' },
          ].map(stat => (
            <div key={stat.label}>
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="text-sm text-brand-100 mt-1">{stat.label}</div>
              <div className="text-xs text-brand-200">{stat.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <h2 className="text-center mb-12">How it works</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: <DollarSign className="text-brand-400" size={24} />,
              step: '1',
              title: 'Pay the listing fee',
              desc: 'A one-time $9.99 fee activates your listing and lets realtors start bidding.',
            },
            {
              icon: <Users className="text-brand-400" size={24} />,
              step: '2',
              title: 'Realtors bid',
              desc: 'Licensed agents bid a commission % or flat fee. We enforce a minimum floor so you always get quality service.',
            },
            {
              icon: <Star className="text-brand-400" size={24} />,
              step: '3',
              title: 'Compare & choose',
              desc: 'Sort by commission, ratings, experience, or brokerage. Read cover letters. Pick the right fit.',
            },
            {
              icon: <CheckCircle className="text-brand-400" size={24} />,
              step: '4',
              title: 'Sign & sell',
              desc: 'Accept a bid. We connect you with your chosen realtor to finalize the listing agreement.',
            },
          ].map(item => (
            <div key={item.step} className="card relative">
              <div className="text-xs font-bold text-gray-300 mb-3">STEP {item.step}</div>
              <div className="mb-3">{item.icon}</div>
              <h3 className="mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Minimum fee explainer */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="mb-4">A minimum fee that protects everyone</h2>
              <p className="text-gray-500 mb-6 leading-relaxed">
                We believe agents deserve fair compensation for their expertise. Our configurable
                commission floor — set at 1.2% of your home's estimated value by default — ensures
                only serious, quality agents participate in your auction.
              </p>
              <ul className="space-y-3">
                {[
                  'Floor is based on your home\'s estimated value (Bridge / ATTOM data)',
                  'Realtors physically cannot submit a bid below the floor',
                  'You still save vs. the typical 2.5–3% market rate',
                  'Platform owners can adjust the floor rate in settings',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={15} className="text-brand-400 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card">
              <div className="text-sm font-medium text-gray-600 mb-4">Example: $620,000 home</div>
              <div className="space-y-3">
                {[
                  { label: 'Traditional 3% commission', amount: '$18,600', highlight: false, bad: true },
                  { label: 'Traditional 2.5% commission', amount: '$15,500', highlight: false, bad: true },
                  { label: 'Minimum floor (1.2%)', amount: '$7,440', highlight: false, neutral: true },
                  { label: 'Winning bid example (1.8%)', amount: '$11,160', highlight: true },
                  { label: 'Your savings vs. 3%', amount: '$7,440 saved', highlight: false, green: true },
                ].map(row => (
                  <div
                    key={row.label}
                    className={`flex justify-between items-center p-3 rounded-lg text-sm ${
                      row.highlight ? 'bg-brand-50 border border-brand-200' :
                      row.green ? 'bg-green-50' : 'bg-gray-50'
                    }`}
                  >
                    <span className={row.bad ? 'text-gray-400 line-through' : 'text-gray-700'}>
                      {row.label}
                    </span>
                    <span className={`font-semibold ${
                      row.highlight ? 'text-brand-600' :
                      row.green ? 'text-green-600' :
                      row.bad ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      {row.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* State restrictions notice */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="card border-amber-200 bg-amber-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="text-amber-800 mb-2">State availability notice</h3>
              <p className="text-sm text-amber-700 mb-4">
                Real estate regulations vary by state. We cannot currently accept listings from
                the following states pending legal review. We're actively working to expand coverage.
              </p>

              <div className="mb-4">
                <div className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2">
                  Currently unavailable
                </div>
                <div className="flex flex-wrap gap-2">
                  {restrictedStates.map(s => (
                    <span key={s.state_code} className="badge-red">
                      {s.state_name} ({s.state_code})
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">
                  Available with attorney closing disclosure required
                </div>
                <div className="flex flex-wrap gap-2">
                  {attorneyStates.slice(0, 12).map(s => (
                    <span key={s.state_code} className="badge-amber">
                      {s.state_code}
                    </span>
                  ))}
                  {attorneyStates.length > 12 && (
                    <span className="badge-gray">+{attorneyStates.length - 12} more</span>
                  )}
                </div>
              </div>

              <p className="text-xs text-amber-600 mt-3">
                <Shield size={11} className="inline mr-1" />
                This platform is not a licensed real estate broker. Always consult a licensed
                real estate professional and/or attorney in your state.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-white font-semibold mb-2">
                <span className="text-brand-400">Marq</span>Bid
              </div>
              <p className="text-xs leading-relaxed">
                Mark it. Bid it. Sell it. The marketplace where homeowners set the terms and realtors compete to earn your business.
              </p>
            </div>
            {[
              { title: 'Homeowners', links: ['How it works', 'List my home', 'Dashboard', 'Pricing'] },
              { title: 'Realtors', links: ['Browse listings', 'Place a bid', 'Realtor portal', 'Sign up'] },
              { title: 'Company', links: ['About', 'State availability', 'Terms of service', 'Privacy'] },
            ].map(col => (
              <div key={col.title}>
                <div className="text-white text-sm font-medium mb-3">{col.title}</div>
                <ul className="space-y-2">
                  {col.links.map(link => (
                    <li key={link}>
                      <a href="#" className="text-xs hover:text-white transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-6 text-xs text-center">
            MarqBid is not a licensed real estate broker or agent.
            We connect homeowners with licensed realtors. Always verify realtor credentials in your state.
            © {new Date().getFullYear()} MarqBid. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
