# TempMail - Temporary Email Service

A modern, secure temporary email service built with Next.js and the Mail.tm API. Generate disposable email addresses instantly for testing, anonymous signups, or verification workflows.

## 🚀 Features

- **Instant Email Generation** - Create temporary email addresses in seconds
- **Real-time Inbox** - Auto-refreshing inbox with live message polling
- **Message Management** - Read, delete, and mark messages as read/unread
- **Attachment Support** - Download email attachments securely
- **Mobile Responsive** - Optimized for all device sizes
- **No Registration** - Completely anonymous, no personal data required
- **Rate Limited** - Built-in protection against API abuse
- **TypeScript** - Full type safety throughout the application

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **API**: Mail.tm REST API
- **State Management**: React Context + useReducer
- **HTTP Client**: Axios
- **Notifications**: Sonner
- **Deployment**: Vercel

## 📦 Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/temp-mail-app.git
cd temp-mail-app
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Architecture

\`\`\`
/temp-mail-app
├── /components          # React components
│   ├── EmailGenerator.tsx
│   ├── Inbox.tsx
│   ├── MessageView.tsx
│   └── /ui             # Reusable UI components
├── /lib                # Utilities and API clients
│   ├── mailtm.ts       # Mail.tm API client
│   ├── tempMailContext.tsx
│   └── utils.ts
├── /pages              # Next.js pages
│   ├── index.tsx       # Main application
│   └── /api
│       └── mail-tm.ts  # API proxy endpoint
└── /styles
    └── globals.css     # Global styles
\`\`\`

## 🔧 API Integration

The application integrates with the Mail.tm API through a custom client that handles:

- **Domain Management** - Fetching available email domains
- **Account Creation** - Creating temporary email accounts
- **Authentication** - Token-based API authentication
- **Message Operations** - CRUD operations for email messages
- **Error Handling** - Comprehensive error handling and user feedback
- **Rate Limiting** - Client-side and server-side rate limiting

## 🎨 UI/UX Features

- **Modern Design** - Clean, professional interface with gradient backgrounds
- **Responsive Layout** - Mobile-first design that works on all devices
- **Real-time Updates** - Live polling for new messages with visual indicators
- **Accessibility** - ARIA labels, keyboard navigation, screen reader support
- **Loading States** - Skeleton loaders and progress indicators
- **Error Handling** - User-friendly error messages and recovery options

## 🔒 Security & Privacy

- **No Data Storage** - No personal information stored on servers
- **Rate Limiting** - Protection against API abuse (8 requests/second)
- **Client Obfuscation** - Sensitive data not persisted in browser storage
- **CORS Protection** - Proper CORS headers for API security
- **Input Validation** - Comprehensive input sanitization and validation

## 📱 Usage

1. **Generate Email**: Click "Create Temporary Email" to generate a new disposable address
2. **Copy Address**: Use the copy button to copy the email address to your clipboard
3. **Receive Messages**: Messages appear automatically in the inbox with real-time polling
4. **Read Messages**: Click on any message to view full content, attachments, and headers
5. **Manage Messages**: Mark as read/unread, delete unwanted messages
6. **Delete Account**: Remove the entire email account when finished

## 🧪 Testing

Run the test suite:
\`\`\`bash
npm test
\`\`\`

Run tests in watch mode:
\`\`\`bash
npm run test:watch
\`\`\`

Run Cypress end-to-end tests:
\`\`\`bash
npm run cypress:open
\`\`\`

## 🚀 Deployment

The application is optimized for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Configure environment variables (if any)
3. Deploy with automatic CI/CD

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Mail.tm** - Providing the free temporary email API
- **Vercel** - Hosting and deployment platform
- **Radix UI** - Accessible component primitives
- **Tailwind CSS** - Utility-first CSS framework

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.

---

**Powered by [Mail.tm](https://mail.tm) • Built with ❤️ using Next.js and TypeScript**
