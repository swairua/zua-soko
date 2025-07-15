import Link from "next/link";
import { Sprout, Users, Truck, ShoppingCart, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Sprout className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                Zuasoko
              </span>
            </div>
            <nav className="flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="text-gray-700 hover:text-primary-600"
              >
                Login
              </Link>
              <Link
                href="/auth/login?role=admin"
                className="text-sm text-gray-500 hover:text-primary-600 px-2 py-1 rounded"
              >
                Admin
              </Link>
              <Link href="/auth/register" className="btn-primary">
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Empowering Farmers with AI
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Connect directly with consumers, get fair prices, and access smart
              farming tools powered by artificial intelligence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/register?role=farmer"
                className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
              >
                Join as Farmer
              </Link>
              <Link
                href="/marketplace"
                className="bg-primary-500 hover:bg-primary-400 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
              >
                Shop Fresh Produce
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Built for Everyone
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform serves farmers, consumers, drivers, and agents with
              tailored experiences
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card text-center">
              <Users className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Farmers</h3>
              <p className="text-gray-600">
                List produce, get fair prices, access weather alerts and market
                trends
              </p>
              <Link
                href="/auth/register?role=farmer"
                className="btn-primary mt-4 inline-block"
              >
                Join as Farmer
              </Link>
            </div>

            <div className="card text-center">
              <ShoppingCart className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Consumers</h3>
              <p className="text-gray-600">
                Buy fresh produce directly from farmers at competitive prices
              </p>
              <Link
                href="/marketplace"
                className="btn-primary mt-4 inline-block"
              >
                Start Shopping
              </Link>
            </div>

            <div className="card text-center">
              <Truck className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Drivers</h3>
              <p className="text-gray-600">
                Efficient delivery routes with AI-powered logistics optimization
              </p>
              <Link
                href="/auth/register?role=driver"
                className="btn-primary mt-4 inline-block"
              >
                Drive with Us
              </Link>
            </div>

            <div className="card text-center">
              <Shield className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Agents</h3>
              <p className="text-gray-600">
                Help onboard farmers and coordinate local agricultural
                activities
              </p>
              <Link
                href="/auth/register?role=agent"
                className="btn-primary mt-4 inline-block"
              >
                Become Agent
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile App Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            📱 Get the Mobile App
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Install Zuasoko on your phone for the best experience. Works on
            Android and iOS!
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                📱 Android Users
              </h3>
              <ol className="text-left text-gray-600 space-y-2 mb-4">
                <li>
                  1. Open Zuasoko in <strong>Chrome</strong>
                </li>
                <li>2. Look for "Install app" popup</li>
                <li>3. Tap "Install" or "Add to Home Screen"</li>
                <li>4. Enjoy the native app experience!</li>
              </ol>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                🍎 iPhone/iPad Users
              </h3>
              <ol className="text-left text-gray-600 space-y-2 mb-4">
                <li>
                  1. Open Zuasoko in <strong>Safari</strong>
                </li>
                <li>2. Tap the Share button</li>
                <li>3. Select "Add to Home Screen"</li>
                <li>4. Tap "Add" to install!</li>
              </ol>
            </div>
          </div>

          <div className="mt-8 bg-primary-50 border border-primary-200 rounded-lg p-6 max-w-2xl mx-auto">
            <h4 className="font-semibold text-primary-800 mb-2">
              ✨ App Benefits:
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-primary-700">
              <div>• Works offline</div>
              <div>• Push notifications</div>
              <div>• Faster loading</div>
              <div>• Native experience</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Sprout className="h-8 w-8 text-primary-500" />
              <span className="ml-2 text-xl font-bold">Zuasoko</span>
            </div>
            <p className="text-gray-400">
              Empowering smallholder farmers through technology
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
