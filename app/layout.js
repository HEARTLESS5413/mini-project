import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

export const metadata = {
  title: 'Instagram',
  description: 'Share photos and videos with friends and the world',
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#0095f6',
          colorBackground: '#000000',
          colorInputBackground: '#1a1a1a',
          colorText: '#f5f5f5',
        },
      }}
      signInUrl="/login"
      signUpUrl="/sign-up"
      afterSignInUrl="/feed"
      afterSignUpUrl="/feed"
    >
      <html lang="en" data-theme="dark">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
          <meta name="theme-color" content="#000000" />
          <link rel="icon" href="/favicon.ico" />
        </head>
        <body>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
