import Image from 'next/image'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-white p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">About Em and M&apos;s Bird Feeder</h1>
      <Image src="/cardinal.png" alt="Device" width={120} height={120} className="mb-6" />
      <p className="text-center max-w-2xl text-zinc-400">
        This project uses a custom ESP32-CAM module to detect and photograph birds at a feeder. Images are uploaded in real-time to a Supabase storage bucket, and this app gives users a beautiful view into the daily life of our feathered friends.
      </p>
    </main>
  )
}
