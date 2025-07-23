'use client';

import { useState } from 'react';
import { Button } from './button';
import supabase from '@/lib/supabase';
import { toast } from 'sonner';

export function EarlyAccessForm() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setIsSubmitting(false);
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      // Store email in Supabase
      const { error: supabaseError } = await supabase
        .from('early_access')
        .insert([{ email }]);
      
      if (supabaseError) throw supabaseError;
      
      setIsSuccess(true);
      setEmail('');
      toast.success('Thank you for joining our waitlist!');
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {isSuccess ? (
        <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg text-center">
          <h4 className="font-medium text-green-800 dark:text-green-300 mb-1">Thank you for joining!</h4>
          <p className="text-sm text-green-700 dark:text-green-400">
            We'll notify you when Link4Coders is ready for early access.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-2">
          <div className="flex-grow relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
            {error && (
              <p className="absolute text-xs text-red-500 mt-1">{error}</p>
            )}
          </div>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="py-3 px-6 font-medium sm:w-auto w-full"
            size="lg"
          >
            {isSubmitting ? 'Joining...' : 'Get Early Access'}
          </Button>
        </form>
      )}
    </div>
  );
}