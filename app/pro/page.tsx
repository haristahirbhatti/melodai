import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/AppShell'
import { Check, Zap, Music2, Crown } from 'lucide-react'

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    credits: 30,
    color: 'border-surface-border2',
    features: ['30 credits/month', '1 min preview songs', 'v4.5 model', 'Public library access'],
    cta: 'Current Plan',
    disabled: true,
  },
  {
    name: 'Pro',
    price: '$8',
    period: 'per month',
    credits: 500,
    color: 'border-brand-orange',
    highlight: true,
    features: ['500 credits/month', 'Full length songs (4 min)', 'v5 model access', 'Download songs', 'Private songs', 'Priority generation'],
    cta: 'Upgrade to Pro',
    disabled: false,
  },
  {
    name: 'Enterprise',
    price: '$24',
    period: 'per month',
    credits: 2000,
    color: 'border-purple-500/50',
    features: ['2000 credits/month', 'Everything in Pro', 'Commercial license', 'API access', 'Team workspace', 'Priority support'],
    cta: 'Contact Sales',
    disabled: false,
  },
]

export default async function ProPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = user ? await supabase.from('profiles').select('*').eq('id', user.id).single() : { data: null }

  return (
    <AppShell profile={profile}>
      <div className="h-full overflow-y-auto px-4 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="text-center mb-10 lg:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-orange/30 bg-brand-orange/10 text-xs text-brand-orange font-600 mb-4">
            <Zap size={12} className="fill-brand-orange" /> Upgrade Your Music
          </div>
          <h1 className="font-display font-800 text-3xl lg:text-5xl mb-4">
            Choose Your <span className="gradient-text">Plan</span>
          </h1>
          <p className="text-zinc-400 text-sm lg:text-base max-w-md mx-auto">
            Unlock unlimited creativity with more credits, better models, and full-length songs
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 max-w-5xl mx-auto mb-12">
          {PLANS.map((plan) => (
            <div key={plan.name} className={`relative rounded-2xl border p-6 lg:p-8 ${plan.color} ${plan.highlight ? 'bg-brand-orange/5' : 'bg-surface-1'}`}>
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-gradient rounded-full text-xs font-700 text-white whitespace-nowrap">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  {plan.name === 'Pro' && <Crown size={18} className="text-brand-orange" />}
                  {plan.name === 'Enterprise' && <Crown size={18} className="text-purple-400" />}
                  <h2 className="font-display font-700 text-xl">{plan.name}</h2>
                </div>
                <div className="flex items-end gap-1 mb-1">
                  <span className="font-display font-800 text-4xl">{plan.price}</span>
                  <span className="text-zinc-500 text-sm mb-1">/{plan.period}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                  <Music2 size={13} />
                  <span>{plan.credits} credits/month</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-300">
                    <Check size={15} className="text-brand-orange flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <button disabled={plan.disabled}
                className={`w-full py-3 rounded-xl font-700 text-sm transition-all ${
                  plan.disabled ? 'bg-surface-3 text-zinc-500 cursor-not-allowed' :
                  plan.highlight ? 'bg-brand-gradient text-white hover:opacity-90' :
                  'bg-surface-2 border border-surface-border2 text-white hover:bg-surface-3'
                }`}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display font-700 text-xl text-center mb-6">Frequently Asked</h2>
          {[
            { q: 'What are credits?', a: 'Each song generation costs 5 credits. Credits reset monthly based on your plan.' },
            { q: 'Can I download my songs?', a: 'Pro and Enterprise plans allow you to download full-length MP3 files.' },
            { q: 'What is the difference between v4.5 and v5?', a: 'v5 produces higher quality audio with better vocal clarity and instrumental separation.' },
            { q: 'Can I cancel anytime?', a: 'Yes, you can cancel your subscription anytime from your profile settings.' },
          ].map(({ q, a }) => (
            <div key={q} className="border-b border-surface-border py-4">
              <p className="font-600 text-sm mb-2">{q}</p>
              <p className="text-zinc-500 text-sm leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
