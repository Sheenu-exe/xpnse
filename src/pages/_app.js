import '../app/globals.css';
import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>XPNSR</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}
