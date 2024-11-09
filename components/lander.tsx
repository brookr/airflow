'use client'

import Image from "next/image"
import { Button } from "@/components/ui/button"

export function Lander() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="container px-4 pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
            Beautiful Screen Recordings
            <br />
            in Minutes
          </h1>
          <p className="mx-auto max-w-[700px] text-zinc-400 md:text-xl">
            Create stunning screen recordings with automatic zooming and professional animations.
          </p>
        </div>
        <div className="mt-12 rounded-lg border border-zinc-800 overflow-hidden">
          <Image
            src="https://placehold.co/1200x600"
            width={1200}
            height={600}
            className="w-full"
            alt="Screen recording interface"
          />
        </div>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Image src="https://placehold.co/100x30" width={100} height={30} alt="Microsoft logo" />
          <Image src="https://placehold.co/100x30" width={100} height={30} alt="Google logo" />
          <Image src="https://placehold.co/100x30" width={100} height={30} alt="Adobe logo" />
        </div>
      </section>

      {/* Made With Section */}
      <section className="container px-4 py-16 md:py-24">
        <h2 className="text-2xl font-bold text-center mb-12">Made with Screen Studio</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="rounded-lg border border-zinc-800 p-4 space-y-4">
            <Image
              src="https://placehold.co/600x300"
              width={600}
              height={300}
              className="w-full rounded-lg"
              alt="Screen recording example 1"
            />
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-zinc-800" />
              <div className="text-sm text-zinc-400">Example Recording 1</div>
            </div>
          </div>
          <div className="rounded-lg border border-zinc-800 p-4 space-y-4">
            <Image
              src="https://placehold.co/600x300"
              width={600}
              height={300}
              className="w-full rounded-lg"
              alt="Screen recording example 2"
            />
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-zinc-800" />
              <div className="text-sm text-zinc-400">Example Recording 2</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container px-4 py-16 md:py-24">
        <div className="space-y-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">Engaging screen recordings.</h3>
              <h4 className="text-3xl font-bold">Created in minutes.</h4>
              <p className="text-zinc-400">
                Create professional screen recordings with automatic zooming and smooth animations. Perfect for tutorials,
                demos, and presentations.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800 overflow-hidden">
              <Image
                src="https://placehold.co/600x400"
                width={600}
                height={400}
                className="w-full"
                alt="Feature preview"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">Automatic zoom for engaging screen recordings</h3>
              <p className="text-zinc-400">
                Our intelligent zoom feature automatically focuses on important content, making your recordings more engaging
                and professional.
              </p>
            </div>
            <div className="rounded-lg overflow-hidden bg-gradient-to-br from-rose-500 to-orange-500 p-8">
              <Image
                src="https://placehold.co/600x400"
                width={600}
                height={400}
                className="w-full rounded-lg border border-white/20"
                alt="Zoom feature preview"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">Professional animations by default</h3>
              <p className="text-zinc-400">
                Every recording comes with smooth, professional animations that make your content look polished and
                engaging.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800 overflow-hidden">
              <Image
                src="https://placehold.co/600x400"
                width={600}
                height={400}
                className="w-full"
                alt="Animation feature preview"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container px-4 py-16 md:py-24 text-center">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">Start Recording Today</h2>
          <p className="text-zinc-400 mx-auto max-w-[600px]">
            Join thousands of professionals creating beautiful screen recordings with our tool.
          </p>
          <Button className="bg-white text-black hover:bg-zinc-200 mt-4">Download Now</Button>
        </div>
      </section>
    </div>
  )
}
