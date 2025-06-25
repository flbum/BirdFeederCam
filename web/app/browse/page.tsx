import { Suspense } from 'react';
import BrowseClient from './BrowseClient';

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="p-6">Loading folder contents...</div>}>
      <BrowseClient />
    </Suspense>
  );
}
