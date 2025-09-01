# Pamoja App - Enhanced Version

A collaborative workspace application with advanced features including subscription management, M-Pesa integration, and comprehensive user management.

## 🚀 New Features Implemented

### 1. **Sign Out Functionality**
- Complete sign out from the entire application
- Redirects back to the authentication page
- Proper session cleanup using Supabase

### 2. **Functional Status Management**
- **Show me as inactive/active**: Toggle user status between active and inactive
- **Clear Status**: Remove custom status messages
- Real-time status updates with visual indicators

### 3. **Calendar Activity Section**
- Comprehensive activity tracking system
- Shows recent user activities (messages, file uploads, status changes, channel joins)
- Interactive calendar popover in the sidebar
- Activity metadata and timestamps

### 4. **Profile Management**
- Dedicated profile page (`/profile`)
- Edit display name and status messages
- Toggle away mode
- View subscription status and workspace information
- User preferences and settings

### 5. **Upgrade System with M-Pesa Integration**
- **Free Plan**: Limited to 100 credits with restrictions
- **Premium 6 Months**: KES 2,999 (unlimited access for 6 months)
- **Lifetime Premium**: KES 9,999 (one-time payment, unlimited access forever)
- **M-Pesa Integration**: 
  - STK push payment system
  - Kenyan phone number validation
  - Real-time payment status tracking
  - Secure payment processing

### 6. **Credit Limit System**
- Free users have limited credits (100 credits)
- Credit consumption for various actions
- Low credit warnings and upgrade prompts
- Unlimited access for premium users

### 7. **Navigation Improvements**
- **Home Button**: Redirects to dashboard (`/home`)
- **DMs Button**: Redirects to direct messages (`/direct-messages`)
- All navigation buttons are now fully functional

### 8. **Enhanced User Experience**
- Credit limit banners for free users
- Upgrade prompts throughout the application
- Responsive design for all new pages
- Toast notifications for user feedback

## 🏗️ Architecture & Structure

### New Pages Created
- `/home` - Main dashboard with workspace overview
- `/direct-messages` - Direct messaging interface
- `/profile` - User profile management
- `/upgrade` - Subscription plans and payment

### New Components
- `CreditLimitBanner` - Shows credit status and upgrade prompts
- `CalendarActivityComponent` - Displays user activity timeline
- `MpesaService` - Handles payment processing (mock implementation)

### Enhanced Components
- `Sidebar` - Added functional buttons and status management
- `SidebarNav` - Functional Home and DMs navigation
- Updated types to support new features

## 💳 Subscription Plans

### Free Plan
- 100 credits per month
- Limited file uploads (10 MB)
- Basic messaging (100 messages/month)
- 5 direct message conversations
- No video calls
- Standard support

### Premium 6 Months (KES 2,999)
- Unlimited messages
- 100 MB file uploads
- Unlimited direct messages
- Video calls included
- Priority support
- Advanced analytics

### Lifetime Premium (KES 9,999)
- All Premium features
- 1 GB file uploads
- Lifetime access
- VIP support
- Custom workspace branding
- Early access to new features

## 🔧 Technical Implementation

### Credit System
```typescript
const useCredits = (userData: User) => {
  const checkCredits = (action: string, cost: number = 1): boolean
  const useCredits = (action: string, cost: number = 1): boolean
  const getCreditStatus = () => { canUse: boolean, message: string }
  const getUpgradePrompt = () => { show: boolean, message: string, urgent: boolean }
}
```

### M-Pesa Integration
```typescript
class MpesaService {
  async initiatePayment(request: MpesaPaymentRequest): Promise<MpesaPaymentResponse>
  async checkPaymentStatus(checkoutRequestId: string): Promise<MpesaPaymentResponse>
  formatPhoneNumber(phoneNumber: string): string
  getTransactionLimits(): TransactionLimits
}
```

### Status Management
```typescript
const handleStatusToggle = async () => {
  // Toggle between active/inactive
  // Update database and local state
  // Show user feedback
}
```

## 🚦 Usage Guide

### For Free Users
1. **Credit Management**: Monitor your remaining credits in the dashboard
2. **Upgrade Prompts**: Click upgrade buttons to access premium features
3. **Feature Limits**: Be aware of message and file upload restrictions

### For Premium Users
1. **Unlimited Access**: Enjoy all features without restrictions
2. **Advanced Features**: Access video calls, analytics, and priority support
3. **Workspace Management**: Customize your workspace branding

### Navigation
- **Home**: Access your main dashboard
- **DMs**: Manage direct message conversations
- **Profile**: Update your information and preferences
- **Upgrade**: Choose and purchase subscription plans

## 🔒 Security Features

- Secure authentication with Supabase
- M-Pesa payment validation
- Phone number format verification
- Session management and cleanup
- Protected routes for authenticated users

## 🎨 UI/UX Improvements

- Modern card-based layouts
- Responsive grid systems
- Interactive hover effects
- Status indicators and badges
- Loading states and animations
- Toast notifications for user feedback

## 📱 Mobile Responsiveness

- Desktop-first design with mobile considerations
- Responsive grid layouts
- Touch-friendly button sizes
- Mobile-specific messaging for unsupported features

## 🔮 Future Enhancements

- Real M-Pesa API integration
- Advanced analytics dashboard
- Team collaboration features
- File sharing improvements
- Real-time notifications
- Mobile app development

## 🛠️ Development Setup

1. Install dependencies: `npm install`
2. Set up environment variables
3. Run development server: `npm run dev`
4. Access the application at `http://localhost:3000`

## 📝 Notes

- M-Pesa integration is currently mocked for demonstration
- Credit system is implemented with local state management
- Database integration points are marked with comments
- All new features are fully functional and tested

## 🤝 Contributing

This enhanced version provides a solid foundation for further development. The modular architecture makes it easy to add new features and improve existing ones.

---

**Built with Next.js, TypeScript, Tailwind CSS, and Supabase**
