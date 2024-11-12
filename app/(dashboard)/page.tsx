import { Lander } from "@/components/lander";

export default function HomePage() {
  return (
    <>
      <main>
        <Lander />
      </main>
      <footer className="border-t border-zinc-800 py-12">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="font-bold text-lg">ClickWrite</h3>
              <p className="text-zinc-400 text-sm">
                AI-powered content creation for Webflow sites.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold">Product</h4>
              <ul className="space-y-2 text-zinc-400">
                <li>Features</li>
                <li>Pricing</li>
                <li>Documentation</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold">Company</h4>
              <ul className="space-y-2 text-zinc-400">
                <li>About</li>
                <li>Blog</li>
                <li>Contact</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold">Legal</h4>
              <ul className="space-y-2 text-zinc-400">
                <li>Privacy</li>
                <li>Terms</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-zinc-800 mt-12 pt-8 text-center text-zinc-400 text-sm">
            © {new Date().getFullYear()} ClickWrite. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  )
}
