import { ConditionalNavigation } from '@/app/components/ConditionalNavigation'
import { ThemeProvider } from '@/app/components/ThemeProvider'
import { AutumnProvider } from "autumn-js/react"

export const metadata = {
  title: 'InlinkAI - Transform Your LinkedIn Presence with AI',
  description: 'Get noticed, stay relevant, and be chosen on LinkedIn. InlinkAI uses cutting-edge AI to improve your profile visibility, create engaging content, and connect you with the right prospects at the right time.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" />
        
        {/* Minimal critical CSS - just layout structure */}
        <style>{`
          body { 
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            margin: 0; padding: 0; 
          }
          .font-inter { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
          .hero { min-height: 100vh; display: flex; align-items: center; justify-content: center; }
          .loading { opacity: 0; transform: translateY(20px); transition: all 0.3s ease; }
          .loaded .loading { opacity: 1; transform: translateY(0); }
        `}</style>
        
        {/* Optimized font loading - eliminate render blocking */}
        <link 
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" 
          as="style"
        />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" 
          rel="stylesheet"
          media="print"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Immediate font activation - prevents layout shifts
              (function(){
                var link = document.querySelector('link[href*="fonts.googleapis"]');
                if(link) link.media = 'all';
              })();
            `
          }}
        />
        
        <link rel="stylesheet" href="/css/style.css" />
        <link rel="stylesheet" href="/globals.css" />
        
        {/* Defer only Font Awesome as it's not critical */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('DOMContentLoaded', function() {
                var link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
                document.head.appendChild(link);
              });
            `
          }}
        />
        
        <noscript>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        </noscript>
        
        <link rel="icon" type="image/png" href="/images/favicon.ico" sizes="32x32" />
        
        {/* Preload key resources */}
        <link rel="preload" href="/images/logo.png" as="image" />
      </head>
      <body className="font-inter">
        <AutumnProvider>
          <ThemeProvider>
            <ConditionalNavigation />
            {children}
          </ThemeProvider>
        </AutumnProvider>
      </body>
    </html>
  )
}
