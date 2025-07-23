import { Check } from 'lucide-react';
import { Button } from './button';
import { EarlyAccessForm } from './early-access-form';

interface PricingTierProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  comingSoon?: boolean;
}

function PricingTier({ 
  name, 
  price, 
  description, 
  features, 
  highlighted = false,
  comingSoon = false 
}: PricingTierProps) {
  return (
    <div className={`flex flex-col p-8 rounded-xl border ${highlighted ? 'border-primary bg-primary/5 shadow-lg' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'}`}>
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-2">{name}</h3>
        <div className="mb-3">
          <span className="text-3xl font-bold">{price}</span>
          {price !== 'Free' && <span className="text-gray-500 dark:text-gray-400">/month</span>}
        </div>
        <p className="text-gray-600 dark:text-gray-400">{description}</p>
      </div>

      <ul className="space-y-3 mb-8 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {comingSoon ? (
        <div className="mt-auto">
          <div className="w-full">
            <EarlyAccessForm />
          </div>
        </div>
      ) : (
        <Button 
          className={`w-full ${highlighted ? '' : 'bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200'}`}
          disabled={comingSoon}
        >
          {comingSoon ? 'Coming Soon' : 'Get Started'}
        </Button>
      )}
    </div>
  );
}

export function PricingSection() {
  const pricingTiers = [
    {
      name: 'Free',
      price: 'Free',
      description: 'Perfect for getting started with a basic developer profile.',
      features: [
        'Basic link-in-bio profile',
        'Up to 5 project showcases',
        'GitHub profile integration',
        'Basic analytics',
        'Standard themes',
      ],
      comingSoon: true,
    },
    {
      name: 'Pro',
      price: '$9',
      description: 'For developers serious about their professional brand.',
      features: [
        'Everything in Free',
        'Unlimited project showcases',
        'Interactive code snippets',
        'Dynamic GitHub integration',
        'Comprehensive skill matrix',
        'Blog/article feed integration',
        'Advanced analytics',
        'Premium developer themes',
        'Custom domain',
      ],
      highlighted: true,
      comingSoon: true,
    },
    {
      name: 'Team',
      price: '$29',
      description: 'For development teams and agencies to showcase their work.',
      features: [
        'Everything in Pro',
        'Team management',
        'Collaborative projects',
        'Team analytics dashboard',
        'Priority support',
        'Team branding options',
        'API access',
        'Remove Link4Coders branding',
      ],
      comingSoon: true,
    },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Choose the plan that fits your needs. All plans include core features to showcase your developer profile.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <PricingTier
              key={index}
              name={tier.name}
              price={tier.price}
              description={tier.description}
              features={tier.features}
              highlighted={tier.highlighted}
              comingSoon={tier.comingSoon}
            />
          ))}
        </div>
      </div>
    </section>
  );
}