import { redirect } from 'next/navigation';

/** Legacy `/anime` hub replaced by discover nav (Popular, New, Simulcast). */
export default function AnimePage() {
  redirect('/discover/popular');
}
