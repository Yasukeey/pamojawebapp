'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserData } from '@/actions/get-user-data';
import { getUserWorkspaceData } from '@/actions/workspaces';
import Sidebar from '@/components/sidebar';
import { User, Workspace, SubscriptionPlan } from '@/types/app';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Typography from '@/components/ui/typography';
import {
  FaCheck,
  FaTimes,
  FaMobile,
  FaCreditCard,
  FaShieldAlt,
  FaRocket,
  FaInfinity,
  FaUsers,
  FaSpinner
} from 'react-icons/fa';
import { toast } from 'sonner';
import MpesaService from '@/lib/mpesa-service';

const UpgradePage = () => {
  const [userData, setUserData] = useState<User | null>(null);
  const [userWorkspaces, setUserWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'initiating' | 'waiting' | 'checking' | 'completed' | 'failed'>('idle');
  const [checkoutRequestId, setCheckoutRequestId] = useState<string>('');
  const router = useRouter();

  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'premium-6months',
      name: 'Premium 6 Months',
      duration: '6months',
      price_kes: 2999,
      features: [
        'Unlimited messages',
        'Unlimited file uploads',
        'Advanced search',
        'Priority support',
        'Custom status messages',
        'Advanced analytics'
      ],
      credits_per_month: 1000
    },
    {
      id: 'lifetime',
      name: 'Lifetime Premium',
      duration: 'lifetime',
      price_kes: 9999,
      features: [
        'All Premium features',
        'Lifetime access',
        'No monthly fees',
        'Early access to new features',
        'VIP support',
        'Custom workspace branding'
      ]
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getUserData();
        if (!user) {
          router.push('/auth');
          return;
        }
        setUserData(user);

        const workspaces = await getUserWorkspaceData(user.workspaces!);
        setUserWorkspaces(workspaces as Workspace[]);
        if (workspaces.length > 0) setCurrentWorkspace(workspaces[0] as Workspace);
      } catch (error) {
        console.error('Error fetching data:', error);
        router.push('/auth');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <Typography text="Loading..." variant="p" className="text-gray-600 text-sm" />
        </div>
      </div>
    );
  }

  if (!userData || !currentWorkspace) return null;

  const handlePlanSelect = (plan: SubscriptionPlan) => setSelectedPlan(plan);

  const handlePayment = async () => {
    if (!selectedPlan || !phoneNumber) {
      toast.error('Please select a plan and enter your phone number');
      return;
    }
    setProcessing(true);
    setPaymentStatus('initiating');
    try {
      const mpesaService = MpesaService.getInstance();
      const response = await mpesaService.initiatePayment({
        phoneNumber: mpesaService.formatPhoneNumber(phoneNumber),
        amount: selectedPlan.price_kes,
        reference: `UPGRADE_${selectedPlan.id}_${Date.now()}`,
        description: `Upgrade to ${selectedPlan.name}`
      });

      if (response.success && response.checkoutRequestId) {
        setCheckoutRequestId(response.checkoutRequestId);
        setPaymentStatus('waiting');
        toast.success(response.message);
        setTimeout(() => {
          checkPaymentStatus(response.checkoutRequestId!);
        }, 5000);
      } else {
        toast.error(response.message);
        setPaymentStatus('failed');
      }
    } catch (error) {
      toast.error('Payment failed. Please try again.');
      setPaymentStatus('failed');
    } finally {
      setProcessing(false);
    }
  };

  const checkPaymentStatus = async (requestId: string) => {
    setPaymentStatus('checking');
    try {
      const mpesaService = MpesaService.getInstance();
      const response = await mpesaService.checkPaymentStatus(requestId);
      if (response.success) {
        setPaymentStatus('completed');
        toast.success('Payment successful! Your subscription has been upgraded.');
        setUserData({
          ...userData,
          subscription_tier: selectedPlan?.duration === 'lifetime' ? 'lifetime' : 'premium',
          credits_remaining: selectedPlan?.duration === 'lifetime' ? 999999 : 1000
        });
        setTimeout(() => {
          router.push('/home');
        }, 2000);
      } else {
        setPaymentStatus('failed');
        toast.error(response.message);
      }
    } catch (error) {
      setPaymentStatus('failed');
      toast.error('Failed to check payment status');
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(price);

  const getFeatureIcon = (feature: string) => {
    if (feature.includes('Unlimited')) return <FaInfinity className="text-green-500 text-[10px]" />;
    if (feature.includes('support')) return <FaShieldAlt className="text-blue-500 text-[10px]" />;
    if (feature.includes('analytics')) return <FaRocket className="text-purple-500 text-[10px]" />;
    if (feature.includes('branding')) return <FaUsers className="text-orange-500 text-[10px]" />;
    return <FaCheck className="text-green-500 text-[10px]" />;
  };

  const getPaymentButtonText = () => {
    switch (paymentStatus) {
      case 'initiating': return 'Initiating Payment...';
      case 'waiting': return 'Complete Payment on Phone';
      case 'checking': return 'Verifying Payment...';
      case 'completed': return 'Payment Successful!';
      case 'failed': return 'Payment Failed - Try Again';
      default: return 'Pay with M-Pesa';
    }
  };

  const getPaymentButtonIcon = () => {
    switch (paymentStatus) {
      case 'initiating':
      case 'checking': return <FaSpinner className="animate-spin text-[10px]" />;
      case 'waiting': return <FaMobile className="text-[10px]" />;
      case 'completed': return <FaCheck className="text-[10px]" />;
      case 'failed': return <FaTimes className="text-[10px]" />;
      default: return <FaCreditCard className="text-[10px]" />;
    }
  };

  const isPaymentButtonDisabled = () =>
    processing || paymentStatus === 'waiting' || paymentStatus === 'checking' || paymentStatus === 'completed';

  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:flex min-h-screen bg-gray-50">
        <Sidebar
          currentWorkspaceData={currentWorkspace}
          userData={userData}
          userWorksapcesData={userWorkspaces}
        />

        {/* Main Content */}
        <div className="flex-1 ml-20 overflow-y-auto">
          <div className="p-2">
            <div className="max-w-3xl mx-auto">
              {/* Header (compact) */}
              <div className="text-center mb-2">
                <h1 className="text-[18px] md:text-[20px] font-bold leading-tight text-gray-900">
                  Upgrade Your Workspace
                </h1>
                <p className="text-[12px] md:text-[13px] text-gray-600 leading-snug max-w-[48ch] mx-auto">
                  Choose the perfect plan for your team and unlock powerful features
                </p>
              </div>

              {/* Subscription Plans (compact) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 max-w-3xl mx-auto mb-2">
                {subscriptionPlans.map((plan) => (
                  <Card
                    key={plan.id}
                    className={`cursor-pointer transition-all duration-200 bg-white p-2
                    ${selectedPlan?.id === plan.id ? 'ring-1 ring-blue-500 shadow-sm' : 'border border-gray-200 shadow-xs'}`}
                    onClick={() => handlePlanSelect(plan)}
                  >
                    <CardHeader className="text-center pb-1 px-2">
                      <CardTitle className="text-[13px] font-bold text-gray-900 leading-tight">{plan.name}</CardTitle>
                      <div className={`text-[18px] md:text-[20px] font-bold mt-0.5 ${plan.duration === 'lifetime' ? 'text-orange-600' : 'text-blue-600'}`}>
                        {formatPrice(plan.price_kes)}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        {plan.duration === 'lifetime' ? 'One-time payment' : 'Every 6 months'}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-1 px-2">
                      <ul className="space-y-0.5">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-1 text-[11px] leading-tight">
                            {getFeatureIcon(feature)}
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Payment Section (compact) */}
              {selectedPlan && (
                <div className="max-w-md mx-auto mb-2">
                  <Card className="shadow-sm border border-blue-200 bg-white">
                    <CardHeader className="text-center pb-1 bg-gradient-to-r from-blue-50 to-purple-50 px-2">
                      <CardTitle className="text-[13px] font-bold text-gray-900 flex items-center justify-center gap-1">
                        <FaCreditCard className="text-blue-600 text-[12px]" />
                        Complete Your Purchase
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 p-2">
                      <div>
                        <p className="text-[11px] font-semibold text-gray-700 mb-1">Selected Plan</p>
                        <div className="p-2 bg-gray-50 rounded border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-bold text-[12px] leading-tight">{selectedPlan.name}</div>
                              <div className="text-[11px] text-gray-500">
                                {selectedPlan.duration === 'lifetime' ? 'One-time payment' : 'Every 6 months'}
                              </div>
                            </div>
                            <div className="text-[18px] font-bold text-blue-600">
                              {formatPrice(selectedPlan.price_kes)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold text-gray-700 mb-1">M-Pesa Phone Number</p>
                        <div className="relative">
                          <FaMobile className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-[12px]" />
                          <Input
                            placeholder="254XXXXXXXXX"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="pl-7 h-7 text-[12px] border focus:border-blue-500"
                            disabled={paymentStatus === 'waiting' || paymentStatus === 'checking'}
                          />
                        </div>
                      </div>

                      <Button
                        onClick={handlePayment}
                        className={`w-full h-8 text-[12px] font-semibold ${
                          paymentStatus === 'completed' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                        disabled={isPaymentButtonDisabled()}
                      >
                        <div className="flex items-center gap-1">
                          {getPaymentButtonIcon()}
                          <span>{getPaymentButtonText()}</span>
                        </div>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpgradePage;
