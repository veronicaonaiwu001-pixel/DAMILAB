# DAMI LAB 🚀

**The Ultimate Multi-Category Tools Platform**

A modern, production-ready web application offering 30+ powerful tools for developers, cybersecurity learners, students, and everyday users. Built with React, TypeScript, Tailwind CSS, and OnSpace Cloud.

![DAMI LAB](https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=400&fit=crop)

## ✨ Features

### 🎨 **Modern UI/UX**
- **Glassmorphic Design** with gradient accents
- **Dark/Light Mode** with persistent theme
- **Mobile-First** responsive layout
- **Smooth Animations** and micro-interactions
- **Toast Notifications** for user feedback

### 🔐 **Authentication System**
- **Optional Authentication** - tools work without login
- **Email OTP + Password** authentication
- **User Profiles** with favorites and history
- **Secure Session Management**

### 🛠 **30+ Production Tools**

#### Dev Tools (7 tools)
- **Code Formatter** - JavaScript, Python, HTML, CSS with auto-detection
- **JSON ↔ YAML ↔ XML Converter** - Multi-format conversion with validation
- **Regex Tester** - Live pattern testing with highlighting
- **API Tester** - Mini Postman for REST API testing
- **UUID Generator** - v1, v4, v7 with bulk generation
- **Code Minifier** - JS/HTML/CSS compression with stats
- **Env Variable Manager** - Secure environment config management

#### User Tools (5 tools)
- **QR Code Generator** - Text, URL, WiFi, Email QR codes
- **Password Strength Checker** - Entropy scoring with suggestions
- **Fake Data Generator** - Test data for development
- **URL Shortener** - Custom aliases with analytics
- **Cloud Notepad** - Auto-save with Markdown support

#### Helpful Tools (3 tools)
- **GPA Calculator** - Multi-semester grade tracking
- **Pomodoro Timer** - Focus timer with task management
- **Invoice Generator** - Professional invoices with PDF export

#### Security Tools (4 tools)
- **Password Leak Checker** - k-anonymity breach lookup
- **Encryption Tool** - AES, RSA, Base64 encryption
- **JWT Decoder** - Token analysis and verification
- **IP Lookup** - Geolocation and network information

#### Privacy/OSINT Tools (3 tools)
- **Username Checker** - Multi-platform availability check
- **Metadata Remover** - EXIF and metadata scrubbing
- **WHOIS Lookup** - Domain registration information

#### AI Tools (3 tools) 🤖
- **AI Code Explainer** - Line-by-line code explanations
- **AI Bug Fixer** - Automated debugging assistance
- **Prompt Generator** - Optimized AI prompt creation

#### Utility Tools (4 tools)
- **Base64 Encoder/Decoder** - Text and file encoding
- **Timezone Converter** - Multi-timezone calculations
- **Color Picker** - Palette generation with HEX/RGB/HSL
- **Unit Converter** - Length, weight, temperature, and more

### 📊 **Advanced Features**
- **Global Search** across all tools
- **Category Filtering** by tool type
- **Favorites System** for quick access
- **Usage History** tracking (authenticated users)
- **Analytics Dashboard** with usage statistics
- **Copy/Download/Share** on every tool output
- **Tool Usage Tracking** for popularity metrics

### 🔒 **Security & Privacy**
- **Client-Side Processing** - sensitive data never leaves browser
- **Input Sanitization** and validation
- **Rate Limiting** on backend functions
- **Secure Authentication** with OnSpace Cloud
- **Educational Disclaimers** on security tools

## 🏗 Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Shadcn/UI** - Component library
- **Lucide React** - Icon system
- **React Router** - Client-side routing
- **Zustand** - State management
- **React Query** - Server state management
- **Sonner** - Toast notifications
- **UUID** - UUID generation
- **QRCode.react** - QR code generation

### Backend
- **OnSpace Cloud** - Supabase-compatible backend
- **PostgreSQL** - Primary database
- **Edge Functions** - Serverless compute
- **OnSpace AI** - Built-in AI capabilities
- **Row Level Security** - Database security

### Infrastructure
- **OnSpace Hosting** - Production deployment
- **OnSpace Cloud Dashboard** - Visual database management

## 📁 Project Structure

```
dami-lab/
├── src/
│   ├── assets/              # Static assets (images)
│   ├── components/
│   │   ├── features/        # Feature-specific components
│   │   │   ├── ToolCard.tsx
│   │   │   ├── ToolActions.tsx
│   │   │   └── ToolSkeleton.tsx
│   │   ├── layout/          # Layout components
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   └── ui/              # Shadcn UI components (DO NOT EDIT)
│   ├── constants/
│   │   └── tools.ts         # Tool definitions and categories
│   ├── hooks/
│   │   └── useAuth.ts       # Authentication hook
│   ├── lib/
│   │   ├── supabase.ts      # Supabase client
│   │   ├── auth.ts          # Auth service
│   │   └── tools.ts         # Tool utilities
│   ├── pages/
│   │   ├── Home.tsx         # Landing page
│   │   ├── ToolsPage.tsx    # All tools listing
│   │   ├── AuthPage.tsx     # Login/signup
│   │   ├── FavoritesPage.tsx
│   │   ├── AdminPage.tsx    # Analytics dashboard
│   │   └── tools/           # Individual tool pages
│   │       ├── UUIDGeneratorTool.tsx
│   │       ├── CodeExplainerTool.tsx
│   │       ├── QRGeneratorTool.tsx
│   │       └── PasswordCheckerTool.tsx
│   ├── stores/
│   │   ├── auth.ts          # Auth state
│   │   └── theme.ts         # Theme state
│   ├── types/
│   │   └── index.ts         # TypeScript types
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── supabase/
│   └── functions/
│       ├── _shared/
│       │   └── cors.ts      # CORS headers
│       └── ai-tools/
│           └── index.ts     # AI tools edge function
├── index.html               # HTML entry with SEO
├── tailwind.config.ts       # Tailwind configuration
├── package.json             # Dependencies
└── README.md                # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- OnSpace account

### Installation

1. **Clone or download** the project from OnSpace

2. **The project is pre-configured** with OnSpace Cloud backend - no additional setup needed!

3. **Preview locally:**
   ```bash
   # Dependencies are auto-installed
   # Just click "Preview" in OnSpace
   ```

### Environment Variables

The following are **automatically configured** by OnSpace:
- `VITE_SUPABASE_URL` - OnSpace Cloud URL
- `VITE_SUPABASE_ANON_KEY` - Public API key
- `ONSPACE_AI_API_KEY` - AI service authentication (Edge Functions only)
- `ONSPACE_AI_BASE_URL` - AI service endpoint (Edge Functions only)

## 📊 Database Schema

### Tables

**user_profiles**
- `id` (UUID, PK) - References auth.users
- `username` (TEXT)
- `email` (TEXT)

**tool_favorites**
- `id` (UUID, PK)
- `user_id` (UUID, FK → user_profiles)
- `tool_id` (TEXT)
- `created_at` (TIMESTAMP)

**tool_history**
- `id` (UUID, PK)
- `user_id` (UUID, FK → user_profiles)
- `tool_id` (TEXT)
- `input_preview` (TEXT)
- `used_at` (TIMESTAMP)

**tool_analytics**
- `tool_id` (TEXT, PK)
- `usage_count` (INTEGER)
- `last_used` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Edge Functions

**ai-tools**
- Handles AI-powered tool requests
- Supports code explanation, bug fixing, and prompt generation
- Uses OnSpace AI service

## 🎨 Design System

### Colors
- **Primary**: Purple (#A855F7) - Main brand color
- **Accent**: Blue (#3B82F6) - Secondary actions
- **Gradients**: Purple-to-pink, blue-to-cyan, etc.

### Typography
- **Headings**: Bold, gradient text effects
- **Body**: 16px base, line-height 1.6

### Components
- **Glass Cards**: Backdrop blur with subtle borders
- **Buttons**: Rounded, hover effects
- **Icons**: Lucide React icon set

## 🔧 Development

### Adding a New Tool

1. **Define the tool** in `src/constants/tools.ts`:
```typescript
{
  id: 'my-tool',
  name: 'My Tool',
  description: 'Tool description',
  category: 'dev',
  icon: 'Wrench',
  tags: ['tag1', 'tag2'],
  path: '/tools/my-tool',
}
```

2. **Create tool component** in `src/pages/tools/MyTool.tsx`:
```typescript
import { incrementToolUsage } from '@/lib/tools';

export default function MyTool() {
  useEffect(() => {
    incrementToolUsage('my-tool');
  }, []);
  
  // Tool implementation
}
```

3. **Add route** in `src/App.tsx`:
```typescript
<Route path="/tools/my-tool" element={<MyTool />} />
```

### Styling Guidelines
- Use Tailwind utility classes
- Follow glassmorphic design patterns
- Maintain consistent spacing (8px grid)
- Use gradient effects for accents

## 🚢 Deployment

### OnSpace Deployment (Recommended)

1. **Click "Publish"** in the OnSpace toolbar
2. Your site deploys to `*.onspace.app`
3. **Custom domain**: Use "Add Existing Domain" in Publish menu

### Manual Deployment

```bash
# Build for production
npm run build

# Output in dist/ folder
# Deploy to any static hosting service
```

## 📈 Usage Analytics

Access the **Analytics Dashboard** at `/admin` to view:
- Total tool usage across platform
- Most popular tools
- Usage trends
- Active tool count

## 🛡 Security Features

- **Client-side processing** for sensitive operations
- **Row Level Security** on all database tables
- **Input validation** and sanitization
- **Rate limiting** on Edge Functions
- **Secure authentication** with OTP + Password
- **No password storage** in browser

## 🤝 Contributing

This is a production-ready template. Feel free to:
- Add new tools
- Improve existing tools
- Enhance UI/UX
- Add new features
- Fix bugs

## 📝 License

This project is built with OnSpace. Feel free to use and modify for your needs.

## 🎯 Roadmap

### Coming Soon
- [ ] More AI-powered tools
- [ ] Collaborative features
- [ ] API access for developers
- [ ] Browser extensions
- [ ] Mobile app version
- [ ] Custom tool builder

## 💡 Tips & Best Practices

### Performance
- Tools use client-side processing when possible
- Lazy loading for route-based code splitting
- Optimized images and assets
- Minimal bundle size

### Security
- Never store sensitive data in localStorage
- Validate all user inputs
- Use HTTPS in production
- Follow OWASP guidelines

### User Experience
- Provide instant feedback with toasts
- Show loading states
- Handle errors gracefully
- Mobile-first design

## 📞 Support

Need help? Contact OnSpace support at contact@onspace.ai

## 🙏 Acknowledgments

- **OnSpace Platform** - For the amazing development platform
- **Shadcn/UI** - For beautiful components
- **Lucide** - For the icon library
- **Tailwind CSS** - For the styling system

---

**Built with ❤️ using OnSpace** | **Powered by OnSpace AI** | **© 2026 DAMI LAB**
