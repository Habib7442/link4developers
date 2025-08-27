import React from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface RateLimitErrorData {
  error: string;
  retryAfter?: number;
  resetTime?: number;
}

/**
 * Parse a rate limit error response and extract the relevant information
 */
export function parseRateLimitError(errorMessage: string): RateLimitErrorData | null {
  try {
    // If the error is already a string representation of JSON, parse it
    if (errorMessage.startsWith('{') && errorMessage.endsWith('}')) {
      const parsedError = JSON.parse(errorMessage);
      
      if (parsedError.error && (parsedError.retryAfter || parsedError.resetTime)) {
        return parsedError as RateLimitErrorData;
      }
    }
    
    // Check for standard rate limit error messages
    if (errorMessage.includes('Too many') && errorMessage.includes('slow down')) {
      // Try to extract retry information using regex
      const retryMatch = errorMessage.match(/retry after (\d+)/i);
      const retryAfter = retryMatch ? parseInt(retryMatch[1], 10) : undefined;
      
      return {
        error: errorMessage,
        retryAfter
      };
    }
    
    return null;
  } catch (e) {
    console.error('Failed to parse rate limit error:', e);
    return null;
  }
}

/**
 * Format a human-readable message from rate limit error data
 */
export function formatRateLimitMessage(errorData: RateLimitErrorData): string {
  let message = errorData.error;
  
  // Add retry information if available
  if (errorData.retryAfter) {
    const retrySeconds = errorData.retryAfter;
    let timeDisplay = '';
    
    if (retrySeconds < 60) {
      timeDisplay = `${retrySeconds} second${retrySeconds === 1 ? '' : 's'}`;
    } else if (retrySeconds < 3600) {
      const minutes = Math.floor(retrySeconds / 60);
      timeDisplay = `${minutes} minute${minutes === 1 ? '' : 's'}`;
    } else {
      const hours = Math.floor(retrySeconds / 3600);
      timeDisplay = `${hours} hour${hours === 1 ? '' : 's'}`;
    }
    
    message += `\n\nPlease try again in ${timeDisplay}.`;
  } else if (errorData.resetTime) {
    const resetDate = new Date(errorData.resetTime);
    message += `\n\nPlease try again after ${resetDate.toLocaleTimeString()}.`;
  }
  
  return message;
}

interface RateLimitAlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  errorData: RateLimitErrorData;
}

/**
 * Alert dialog component to display rate limit errors
 */
export function RateLimitAlertDialog({ isOpen, onClose, errorData }: RateLimitAlertDialogProps) {
  const message = formatRateLimitMessage(errorData);
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Rate Limit Exceeded</AlertDialogTitle>
          <AlertDialogDescription className="whitespace-pre-line">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose}>
            I understand
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Handle API errors and check for rate limiting
 * Returns true if it was a rate limit error and was handled
 */
export function handleApiError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  
  const errorMessage = error.message;
  const rateLimitData = parseRateLimitError(errorMessage);
  
  if (rateLimitData) {
    // Use the existing toast system for immediate feedback
    toast.error('Rate limit exceeded', {
      description: 'You have made too many requests. Please try again later.',
      action: {
        label: 'View Details',
        onClick: () => {
          // Show the AlertDialog via a custom event
          const event = new CustomEvent('show-rate-limit-error', { 
            detail: rateLimitData 
          });
          window.dispatchEvent(event);
        }
      }
    });
    
    return true;
  }
  
  return false;
}