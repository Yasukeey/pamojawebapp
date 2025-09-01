import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export const useCredits = (userData: any) => {
  const [creditsRemaining, setCreditsRemaining] = useState(
    userData?.credits_remaining || 100
  );

  useEffect(() => {
    if (userData) {
      setCreditsRemaining(userData.credits_remaining || 100);
    }
  }, [userData]);

  const checkCredits = (action: string, cost: number = 1): boolean => {
    if (!userData || userData.subscription_tier !== 'free') {
      return true; // Premium users have unlimited access
    }

    if (creditsRemaining < cost) {
      toast.error(`Insufficient credits for ${action}. Please upgrade to continue.`);
      return false;
    }

    return true;
  };

  const useCredits = (action: string, cost: number = 1): boolean => {
    if (!checkCredits(action, cost)) {
      return false;
    }

    if (userData?.subscription_tier === 'free') {
      setCreditsRemaining(prev => prev - cost);
      toast.info(`Used ${cost} credit for ${action}. ${creditsRemaining - cost} credits remaining.`);
      
      // In a real app, this would update the database
      // For now, we'll just update local state
    }

    return true;
  };

  const getCreditStatus = () => {
    if (!userData) return { canUse: false, message: 'User not loaded' };
    
    if (userData.subscription_tier !== 'free') {
      return { canUse: true, message: 'Unlimited access' };
    }

    if (creditsRemaining <= 0) {
      return { canUse: false, message: 'No credits remaining' };
    }

    if (creditsRemaining <= 10) {
      return { canUse: true, message: `Low credits: ${creditsRemaining} remaining` };
    }

    return { canUse: true, message: `${creditsRemaining} credits available` };
  };

  const getUpgradePrompt = () => {
    if (userData?.subscription_tier === 'free' && creditsRemaining <= 20) {
      return {
        show: true,
        message: `You're running low on credits (${creditsRemaining} remaining). Upgrade to Premium for unlimited access!`,
        urgent: creditsRemaining <= 5
      };
    }
    return { show: false, message: '', urgent: false };
  };

  return {
    creditsRemaining,
    checkCredits,
    useCredits,
    getCreditStatus,
    getUpgradePrompt,
    setCreditsRemaining
  };
};
