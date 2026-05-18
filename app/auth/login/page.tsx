// app/auth/login/page.tsx
'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Home, Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

type Mode = 'login' | 'signup';
type Role = 'homeowner' | 'realtor';

export default function AuthPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [mode, setMode] = useState<Mode>((params.get('mode') as Mode) || 'login');
  const [role, setRole] = useState<Role>('homeowner');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [licenseState, setLicenseState] = useState('');
  const [brokerage, setBrokerage] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const supabase = createClient();

  async function handleSubmit() {
    setError('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role,
              license_state: role === 'realtor' ? licenseState : undefined,
              brokerage: role === 'realtor' ? brokerage : undefined,
              license_number: role === 'realtor' ? licenseNumber : undefined,
            },
          },
        });
        if (error) throw error;
        setSuccess('Check your email to confirm your account, then sign in.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push(role === 'realtor' ? '/realtor' : '/dashboard');
      }
    } catch (e: any) {
      setError(e.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="p-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-gray-900 w-fit">
          <Home size={18} className="text-brand-400" />
          <span><span className="text-brand-400">Marq</span>Bid</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="card">
            <h1 className="text-xl font-semibold mb-1">
              {mode === 'login' ? 'Sign in' : 'Create an account'}
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              {mode === 'login'
                ? 'Welcome back — sign in to your account.'
                : 'Join MarqBid as a homeowner or realtor.'}
            </p>

            {mode === 'signup' && (
              <>
                {/* Role picker */}
                <div className="mb-5">
                  <label className="label">I am a…</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['homeowner', 'realtor'] as Role[]).map(r => (
                      <button
                        key={r}
                        onClick={() => setRole(r)}
                        className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                          role === r
                            ? 'border-brand-400 bg-brand-50 text-brand-700'
                            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {r === 'homeowner' ? '🏠 Homeowner' : '🤝 Realtor'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="label">Full name</label>
                  <input className="input" placeholder="Jane Smith" value={fullName}
                    onChange={e => setFullName(e.target.value)} />
                </div>

                {role === 'realtor' && (
                  <>
                    <div className="mb-4">
                      <label className="label">License state</label>
                      <select className="input" value={licenseState}
                        onChange={e => setLicenseState(e.target.value)}>
                        <option value="">Select your license state</option>
                        {US_STATES.map(s => (
                          <option key={s.code} value={s.code}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="label">Brokerage name</label>
                      <input className="input" placeholder="Keller Williams, RE/MAX, etc."
                        value={brokerage} onChange={e => setBrokerage(e.target.value)} />
                    </div>
                    <div className="mb-4">
                      <label className="label">License number</label>
                      <input className="input" placeholder="State license number"
                        value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} />
                      <p className="text-xs text-gray-400 mt-1">
                        We may verify this with your state's real estate commission.
                      </p>
                    </div>
                  </>
                )}
              </>
            )}

            <div className="mb-4">
              <label className="label">Email address</label>
              <input className="input" type="email" placeholder="you@email.com"
                value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            <div className="mb-6">
              <label className="label">Password</label>
              <div className="relative">
                <input
                  className="input pr-10"
                  type={showPw ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-3 py-2 mb-4">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-brand-50 border border-brand-100 text-brand-700 text-sm rounded-lg px-3 py-2 mb-4">
                {success}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary w-full justify-center py-3 text-sm"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </button>

            <p className="text-center text-sm text-gray-500 mt-4">
              {mode === 'login' ? (
                <>Don't have an account?{' '}
                  <button onClick={() => setMode('signup')} className="text-brand-600 font-medium hover:underline">
                    Sign up
                  </button>
                </>
              ) : (
                <>Already have an account?{' '}
                  <button onClick={() => setMode('login')} className="text-brand-600 font-medium hover:underline">
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>

          <p className="text-xs text-center text-gray-400 mt-4">
            By creating an account you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}

const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' }, { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' },
  { code: 'DC', name: 'D.C.' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' }, { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' }, { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' }, { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' }, { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' }, { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' }, { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' },
];
