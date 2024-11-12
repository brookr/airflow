"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";

export function Lander() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-black text-white">
      <div className="flex w-full flex-1 flex-col items-center">
        {/* Hero Section */}
        <section className="container max-w-7xl px-4 pt-20 pb-16 md:pt-32 md:pb-24">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              SEO-Optimized Articles
              <br />
              Crafted in Seconds
            </h1>
            <p className="mx-auto max-w-[700px] text-zinc-400 md:text-xl">
              Create high-impact articles with 1 click.
            </p>
          </div>
          <div className="mt-12 rounded-lg border border-zinc-800 overflow-hidden">
            <video
              src="https://p57.p1.n0.cdn.zight.com/items/L1uE1nWB/871a299c-9135-4842-b946-66a5897559f7.mp4?v=6f0b8ce6892247b1c3503c2d72b1618d"
              className="w-full"
              autoPlay
              muted
              loop
              playsInline
            />
          </div>
          <div className="mt-8 flex flex-col items-center justify-center gap-4">
            <p className="text-zinc-400 text-lg mb-4">
              Helping people craft content at:
            </p>
            <div className="flex items-center justify-center gap-8">
              <Image
                src="https://placehold.co/100x30"
                width={100}
                height={30}
                alt="Microsoft logo"
                className="opacity-50 hover:opacity-100 transition-opacity"
              />
              <Image
                src="https://placehold.co/100x30"
                width={100}
                height={30}
                alt="Google logo"
                className="opacity-50 hover:opacity-100 transition-opacity"
              />
              <Image
                src="https://placehold.co/100x30"
                width={100}
                height={30}
                alt="Adobe logo"
                className="opacity-50 hover:opacity-100 transition-opacity"
              />
            </div>
          </div>
        </section>

        {/* Made With Section */}
        <section className="container max-w-7xl px-4 py-16 md:py-24">
          <h2 className="text-2xl font-bold text-center mb-4">
            Made with ClickWrite
          </h2>
          <p className="text-zinc-400 text-center max-w-2xl mx-auto mb-12">
            Thousands of people use the tech powering ClickWrite to streamline
            their content production, optimize for SEO, and accelerate their
            website launches.
          </p>
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
        <section className="container max-w-7xl px-4 py-16 md:py-24">
          <div className="space-y-16">
            <div className="flex flex-col items-center w-full">
              <div className="space-y-6 text-center">
                <div className="space-y-2">
                  <h2 className="text-5xl font-bold tracking-tight">
                    Engaging articles.
                    <span className="block text-orange-500">Created in seconds.</span>
                  </h2>
                </div>
                <p className="text-xl text-zinc-400">
                  ClickWrite is an intuitive AI creator for Webflow that makes
                  your content production easy and fast and powerful. It
                  automatically generates compelling, SEO-optimized content,
                  titles, and metadata and publishes to Webflow in click.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">
                  One-Click Content Generation
                </h3>
                <p className="text-zinc-400">
                  Say goodbye to endless brainstorming. ClickWrite generates
                  compelling titles, writes your content, and even creates
                  relevant images automatically. Once your content is ready,
                  publish it directly to Webflow with a single click.
                </p>
              </div>
              <div className="rounded-lg overflow-hidden bg-gradient-to-br from-rose-500 to-orange-500 p-8">
                <Image
                  src="https://placehold.co/600x400"
                  width={600}
                  height={400}
                  className="w-full rounded-lg border border-white/20"
                  alt="Content generation preview"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="rounded-lg border border-zinc-800 overflow-hidden">
                <Image
                  src="https://placehold.co/600x400"
                  width={600}
                  height={400}
                  className="w-full"
                  alt="SEO optimization preview"
                />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">
                  Automatic SEO Optimization
                </h3>
                <p className="text-zinc-400">
                  ClickWrite takes the guesswork out of content creation by
                  automatically optimizing your posts for SEO. It's like having
                  an expert copywriter and SEO strategist at your
                  fingertips—making sure your content ranks higher and gets more
                  visibility.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">
                  Seamless Webflow Integration
                </h3>
                <p className="text-zinc-400">
                  With ClickWrite, you don't have to worry about exporting files or complicated integrations. Once your content is ready, upload it straight to Webflow with just one click. It's as easy as that.
                </p>
              </div>
              <div className="rounded-lg border border-zinc-800 overflow-hidden">
                <Image
                  src="https://placehold.co/600x400"
                  width={600}
                  height={400}
                  className="w-full rounded-lg border border-white/20"
                  alt="Webflow integration preview"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="rounded-lg border border-zinc-800 overflow-hidden">
                <Image
                  src="https://placehold.co/600x400"
                  width={600}
                  height={400}
                  className="w-full"
                  alt="Confidence preview"
                />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">
                  Create with Confidence
                </h3>
                <p className="text-zinc-400">
                  You're just one click away from polished, SEO-optimized content. ClickWrite handles the heavy lifting so you can focus on what matters most—creating.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">
                  Fast, Accurate, and Powerful
                </h3>
                <p className="text-zinc-400">
                  ClickWrite is designed to be fast, accurate, and powerful. Whether you're working on a blog, a landing page, or a full website, ClickWrite is here to make sure your content shines—effortlessly.
                </p>
              </div>
              <div className="rounded-lg border border-zinc-800 overflow-hidden">
                <Image
                  src="https://placehold.co/600x400"
                  width={600}
                  height={400}
                  className="w-full rounded-lg border border-white/20"
                  alt="Speed preview"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="rounded-lg border border-zinc-800 overflow-hidden">
                <Image
                  src="https://placehold.co/600x400"
                  width={600}
                  height={400}
                  className="w-full"
                  alt="Publishing preview"
                />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">
                  Instant Publishing
                </h3>
                <p className="text-zinc-400">
                  Once your content is ready, publish it directly to Webflow with one click. You're always ready to go live, faster than ever.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">
                  Supercharge Your Webflow Workflow
                </h3>
                <p className="text-zinc-400">
                  ClickWrite takes your Webflow projects to the next level. No more jumping between apps, no more wasted time—just create, optimize, and publish, all in one place.
                </p>
              </div>
              <div className="rounded-lg border border-zinc-800 overflow-hidden">
                <Image
                  src="https://placehold.co/600x400"
                  width={600}
                  height={400}
                  className="w-full rounded-lg border border-white/20"
                  alt="Workflow preview"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="rounded-lg border border-zinc-800 overflow-hidden">
                <Image
                  src="https://placehold.co/600x400"
                  width={600}
                  height={400}
                  className="w-full"
                  alt="Speed preview"
                />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">
                  Create More, Faster
                </h3>
                <p className="text-zinc-400">
                  With ClickWrite's intuitive AI, content creation has never been faster or easier. Start saving time today—create content that's optimized, engaging, and ready to publish, in seconds.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="container max-w-7xl px-4 py-16 md:py-24">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold">Designed for Webflow</h2>
            <p className="text-zinc-400 mx-auto max-w-[600px]">
              Built and designed to be fast, reliable and easy to use.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            <div className="bg-white/5 p-8 rounded-lg border border-zinc-800">
              <div className="flex items-center gap-4 mb-4">
                <Image
                  src="https://placehold.co/100"
                  width={50}
                  height={50}
                  alt="User"
                  className="rounded-full"
                />
                <div>
                  <p className="font-semibold">John Smith</p>
                  <p className="text-sm text-zinc-400">Marketing Director</p>
                </div>
              </div>
              <p className="text-zinc-400">"ClickWrite has transformed how we create content. The AI is incredibly intuitive."</p>
            </div>
            <div className="bg-white/5 p-8 rounded-lg border border-zinc-800">
              <div className="flex items-center gap-4 mb-4">
                <Image
                  src="https://placehold.co/100"
                  width={50}
                  height={50}
                  alt="User"
                  className="rounded-full"
                />
                <div>
                  <p className="font-semibold">Sarah Johnson</p>
                  <p className="text-sm text-zinc-400">Content Creator</p>
                </div>
              </div>
              <p className="text-zinc-400">"The SEO optimization features are game-changing. Our traffic has increased by 200%."</p>
            </div>
            <div className="bg-white/5 p-8 rounded-lg border border-zinc-800">
              <div className="flex items-center gap-4 mb-4">
                <Image
                  src="https://placehold.co/100"
                  width={50}
                  height={50}
                  alt="User"
                  className="rounded-full"
                />
                <div>
                  <p className="font-semibold">Mike Wilson</p>
                  <p className="text-sm text-zinc-400">Agency Owner</p>
                </div>
              </div>
              <p className="text-zinc-400">"We've cut our content creation time in half. The ROI is incredible."</p>
            </div>
          </div>

          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold">One tool for your Webflow content needs</h2>
            <p className="text-zinc-400 mx-auto max-w-[600px]">
              Level up your blogs, website pages, and productivity with ClickWrite.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            <div className="bg-white/5 p-8 rounded-lg border border-zinc-800">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">Monthly</h3>
                <p className="text-4xl font-bold mb-6">$169<span className="text-sm text-zinc-400">/mo</span></p>
                <Button className="w-full bg-white text-black hover:bg-zinc-200">Get Started</Button>
              </div>
            </div>
            <div className="bg-gradient-to-br from-rose-500 to-orange-500 p-8 rounded-lg">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">Yearly</h3>
                <p className="text-4xl font-bold mb-6">$69<span className="text-sm text-zinc-400">/mo</span></p>
                <Button className="w-full bg-white text-black hover:bg-zinc-200">Save $100 monthly</Button>
              </div>
            </div>
            <div className="bg-white/5 p-8 rounded-lg border border-zinc-800">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">Lifetime</h3>
                <p className="text-4xl font-bold mb-6">$4499</p>
                <Button className="w-full bg-white text-black hover:bg-zinc-200">One payment, forever</Button>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Questions & Answers</h2>
              <p className="text-zinc-400">If you have any other questions - please get in touch</p>
            </div>
            
            <div className="space-y-4 max-w-3xl mx-auto">
              <details className="group bg-white/5 p-6 rounded-lg">
                <summary className="flex justify-between items-center cursor-pointer">
                  <h3 className="font-bold">How is ClickWrite different from other AI writing tools?</h3>
                  <span className="transform group-open:rotate-180 transition-transform">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <p className="text-zinc-400 mt-3">ClickWrite is specifically designed for Webflow, offering seamless integration and specialized features for Webflow content creation.</p>
              </details>
              
              <details className="group bg-white/5 p-6 rounded-lg">
                <summary className="flex justify-between items-center cursor-pointer">
                  <h3 className="font-bold">Is ClickWrite compatible with all Webflow sites?</h3>
                  <span className="transform group-open:rotate-180 transition-transform">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <p className="text-zinc-400 mt-3">Yes, ClickWrite works with any Webflow site, regardless of your template or custom design.</p>
              </details>
              
              <details className="group bg-white/5 p-6 rounded-lg">
                <summary className="flex justify-between items-center cursor-pointer">
                  <h3 className="font-bold">How does ClickWrite ensure content is SEO-friendly?</h3>
                  <span className="transform group-open:rotate-180 transition-transform">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <p className="text-zinc-400 mt-3">Our AI analyzes current SEO trends and automatically optimizes your content for relevant keywords and search patterns.</p>
              </details>
              
              <details className="group bg-white/5 p-6 rounded-lg">
                <summary className="flex justify-between items-center cursor-pointer">
                  <h3 className="font-bold">What happens with my subscription after one year?</h3>
                  <span className="transform group-open:rotate-180 transition-transform">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <p className="text-zinc-400 mt-3">Your subscription will automatically renew at the same rate unless cancelled. You can cancel anytime.</p>
              </details>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container max-w-7xl px-4 py-16 md:py-24 text-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Boost Your SEO Today</h2>
            <p className="text-zinc-400 mx-auto max-w-[600px]">
              Reach more customers, rank higher, and grow your business with ClickWrite.
            </p>
            <Button className="bg-white text-black hover:bg-zinc-200 mt-4">
              Pick a Plan
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
