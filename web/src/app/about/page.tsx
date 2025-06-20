import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <Image src="/cardinal.png" alt="Logo" width={200} height={200} />
      <p className="mt-6 text-center max-w-lg">
        This project captures bird activity via an ESP32-CAM and uploads snapshots to Supabase. Explore recent sightings, browse past footage, and enjoy our little winged friends!
      </p>
    </div>
  );
}
