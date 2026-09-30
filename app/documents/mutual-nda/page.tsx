import { redirect } from 'next/navigation';

// The Mutual NDA generator is the homepage (KAN-4); keep the old URL working.
export default function MutualNdaPage() {
  redirect('/');
}
