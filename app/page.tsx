import Link from 'next/link';

export default function Home() {
  return (
    <main className="home">
      <h1>LegalZone</h1>
      <ul>
        <li>
          <Link href="/documents/mutual-nda">Mutual Non-Disclosure Agreement</Link>
        </li>
      </ul>
    </main>
  );
}
