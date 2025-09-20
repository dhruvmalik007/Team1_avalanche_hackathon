import { redirect } from 'next/navigation';

export default function Page() {
  // Redirect root to the new homepage
  redirect('/homepage');
}
