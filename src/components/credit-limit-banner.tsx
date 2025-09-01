'use client';

import { FC } from 'react';
import { User } from '@/types/app';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Typography from '@/components/ui/typography';
import { IoDiamondOutline } from 'react-icons/io5';
import { FaExclamationTriangle } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

type CreditLimitBannerProps = {
  userData: User;
  className?: string;
};

const CreditLimitBanner: FC<CreditLimitBannerProps> = ({ userData, className = '' }) => {
  const router = useRouter();

  if (userData.subscription_tier !== 'free') {
    return null;
  }

  const creditsRemaining = userData.credits_remaining || 100;
  const isLowCredits = creditsRemaining <= 20;
  const isCriticalCredits = creditsRemaining <= 5;

  if (!isLowCredits) {
    return null;
  }

  const getBannerStyle = () => {
    if (isCriticalCredits) {
      return 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 text-red-800 dark:text-red-200';
    }
    return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200';
  };

  const getIcon = () => {
    if (isCriticalCredits) {
      return <FaExclamationTriangle className="text-red-600 dark:text-red-400" />;
    }
    return <IoDiamondOutline className="text-yellow-600 dark:text-yellow-400" />;
  };

  const getMessage = () => {
    if (isCriticalCredits) {
      return `Critical: Only ${creditsRemaining} credits remaining!`;
    }
    return `Low credits: ${creditsRemaining} remaining`;
  };

  const getDescription = () => {
    if (isCriticalCredits) {
      return 'You\'re almost out of credits. Upgrade now to continue using all features.';
    }
    return 'Upgrade to Premium for unlimited access and remove credit limits.';
  };

  return (
    <div className={`border rounded-lg p-4 ${getBannerStyle()} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getIcon()}
          <div>
            <Typography 
              text={getMessage()} 
              variant="h4" 
              className="font-semibold mb-1"
            />
            <Typography 
              text={getDescription()} 
              variant="p" 
              className="text-sm opacity-90"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
            {creditsRemaining} credits
          </Badge>
          <Button 
            onClick={() => router.push('/upgrade')}
            size="sm"
            className={isCriticalCredits ? 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600' : 'bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600'}
          >
            <IoDiamondOutline className="mr-2 h-4 w-4" />
            Upgrade Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreditLimitBanner;