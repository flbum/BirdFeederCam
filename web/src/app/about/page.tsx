export default function AboutPage() {
    return (
        <main className="p-6">
            <h1 className="text-2xl font-bold mb-4">About Bird Feeder Cam</h1>
            <p>This projects wakes up on motion and caputures a picture of a bird, stores the image in Supabase, and displays them with a dark theme web app</p>
            <p>Built with an ESP32-Cam and Next.js + Supabase frontend</p>
        </main>
    );
}