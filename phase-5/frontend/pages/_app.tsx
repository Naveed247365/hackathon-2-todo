/**
 * Next.js App component wrapper with theme provider.
 */
import type { AppProps } from 'next/app';
import { ThemeProvider } from '../contexts/ThemeContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
