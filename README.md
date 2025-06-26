# AI-Driven Provider Search

A Salesforce SLDS-based healthcare provider search application built with Lightning Web Components (LWC) and Lightning Web Runtime (LWR).

## Features

- Modern, responsive UI using Salesforce Lightning Design System (SLDS)
- Patient details sidebar with contact information and medical history
- AI-powered provider search functionality
- Accordion-style medical information display
- Mobile-friendly design

## Tech Stack

- **Frontend**: Lightning Web Components (LWC)
- **Runtime**: Lightning Web Runtime (LWR)
- **Styling**: Salesforce Lightning Design System (SLDS)
- **Build Tool**: LWR Build System
- **Deployment**: Vercel

## Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager

## Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-driven-provider-search
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run clean` - Clean build artifacts

## Deployment to Vercel

### Option 1: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

### Option 2: Deploy via GitHub Integration

1. **Push your code to GitHub**

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect the configuration

3. **Automatic deployments**
   - Every push to `main` branch will trigger a new deployment
   - Pull requests will create preview deployments

## Project Structure

```
ai-driven-provider-search/
├── src/
│   ├── assets/           # Static assets (images, icons)
│   ├── layouts/          # Layout templates
│   └── modules/          # LWC components
│       └── main/
│           └── app/      # Main application component
├── lwr.config.json       # LWR configuration
├── package.json          # Dependencies and scripts
├── vercel.json          # Vercel deployment configuration
└── README.md            # This file
```

## Configuration

### LWR Configuration (`lwr.config.json`)
- Defines routes and components
- Configures asset serving
- Sets up build options

### Vercel Configuration (`vercel.json`)
- Specifies build settings
- Configures routing for SPA
- Sets environment variables

## Environment Variables

No environment variables are required for basic functionality. If you need to add any:

1. Create a `.env` file for local development
2. Add environment variables in Vercel dashboard for production

## Troubleshooting

### Build Issues
- Ensure Node.js version is 18.0.0 or higher
- Clear cache: `npm run clean`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Deployment Issues
- Check Vercel build logs for specific errors
- Ensure all dependencies are in `package.json`
- Verify `vercel.json` configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## License

MIT License - see LICENSE file for details
