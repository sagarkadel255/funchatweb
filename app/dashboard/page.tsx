// src/app/page.tsx
import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  return (
    <>

      {/* First Page - Hero Section */}
      <div className="min-h-screen bg-gradient-to-r from-[#dff6f9] via-[#9ad9e5] to-[#5a8fd8]">
        
        {/* Navbar */}
        <nav className="flex items-center justify-between px-12 py-6 bg-white/40 backdrop-blur-md shadow-md">
          <div className="flex items-center gap-2 text-2xl font-bold text-blue-600">
            <Image
              src="/images/phone.png"
              alt="FunChat Logo"
              width={50}
              height={50}
              className="object-contain"
            />
            FunChat
          </div>

          <ul className="flex gap-10 text-gray-700 font-medium">
            <li className="cursor-pointer hover:text-blue-600">Home</li>
            <li className="cursor-pointer hover:text-blue-600">Features ▾</li>
            <li className="cursor-pointer hover:text-blue-600">Services</li>
            <li className="cursor-pointer hover:text-blue-600">About us</li>
          </ul>

          <Link
            href="/auth/signup"
            className="bg-[#4aa3c3] text-white px-6 py-2 rounded-full hover:bg-[#3a8fad] transition"
          >
            Sign In
          </Link>
        </nav>

        {/* Hero Section */}
        <section className="flex items-center justify-between px-16 py-20">
          
          {/* Left Content */}
          <div className="max-w-xl">
            <h1 className="text-4xl font-extrabold text-black mb-6">
              Chat. Connect. Have Fun.
            </h1>

            <p className="text-lg text-gray-800 mb-6">
              A smooth, simple chat experience designed to keep your
              conversations flowing without distractions.
            </p>

            <div className="flex gap-4">
              <Link
                href="/signup"
                className="bg-[#4aa3c3] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#3a8fad] transition"
              >
                Get Started
              </Link>

              <button className="bg-[#4aa3c3] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#3a8fad] transition">
                Download
              </button>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="relative animate-float">
            <div className="absolute -top-6 -left-6 bg-white/40 rounded-3xl w-[400px] h-[520px] rotate-[10deg]"></div>

            <div className="relative bg-white/60 backdrop-blur-lg rounded-3xl p-7 shadow-lg w-[400px] h-[520px] rotate-[7deg] flex items-center justify-center">
              {/* Dashboard Image */}
              <div className="w-[300px] h-[300px] bg-gradient-to-br from-[#b8e6ef] to-[#7dd3e8] rounded-2xl flex items-center justify-center overflow-hidden">
                <Image
                  src="/images/dashboard.png"
                  alt="Dashboard"
                  width={300}
                  height={300}
                  className="object-cover w-full h-full"
                />
              </div>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-full px-4 py-2 shadow text-sm w-[320px] text-center">
                Message ....
              </div>
              <div className="absolute top-20 left-20 -translate-x-1/2 bg-white rounded-full px-4 py-2 shadow text-sm w-[130px] text-left">
                Message ....
              </div>
              <div className="absolute top-35 left-20 -translate-x-1/2 bg-white rounded-full px-4 py-2 shadow text-sm w-[130px] text-left">
                Message ....
              </div>
              <div className="absolute top-9 right-9 translate-x-1/2 bg-white rounded-full px-4 py-2 shadow text-sm w-[130px] text-left">
                Message ....
              </div>
            </div>
          </div>
          
        </section>
      </div>

      {/* Features Section */}
      <section className="py-24 px-16 bg-gradient-to-br from-[#dff6f9] to-[#9ad9e5]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-black mb-5">Powerful Features</h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Everything you need to stay connected with friends, family, and colleagues in one place
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Feature Card 1 */}
            <div className="bg-white p-10 rounded-2xl shadow-lg border-2 border-transparent hover:border-[#4aa3c3] hover:-translate-y-3 transition-all duration-300 cursor-pointer">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#4aa3c3] to-[#3a8fad] flex items-center justify-center overflow-hidden">
                <Image
                  src="/images/image.png"
                  alt="Chat Icon"
                  width={60}
                  height={60}
                  className="object-contain"
                />
              </div>
              <h3 className="text-2xl font-bold text-black mb-4 text-center">Instant Chat</h3>
              <p className="text-gray-700 text-center leading-relaxed">
                Send messages instantly with real-time delivery and read receipts. Stay in touch effortlessly.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="bg-white p-10 rounded-2xl shadow-lg border-2 border-transparent hover:border-[#4aa3c3] hover:-translate-y-3 transition-all duration-300 cursor-pointer">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#4aa3c3] to-[#3a8fad] flex items-center justify-center overflow-hidden">
                <Image
                  src="/images/voicecall.png"
                  alt="Voice Call Icon"
                  width={60}
                  height={60}
                  className="object-contain"
                />
              </div>
              <h3 className="text-2xl font-bold text-black mb-4 text-center">Voice Calls</h3>
              <p className="text-gray-700 text-center leading-relaxed">
                Crystal clear voice calls with HD quality. Connect with anyone, anywhere in the world.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="bg-white p-10 rounded-2xl shadow-lg border-2 border-transparent hover:border-[#4aa3c3] hover:-translate-y-3 transition-all duration-300 cursor-pointer">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#4aa3c3] to-[#3a8fad] flex items-center justify-center overflow-hidden">
                <Image
                  src="/images/videocall.png"
                  alt="Video Call Icon"
                  width={60}
                  height={60}
                  className="object-contain"
                />
              </div>
              <h3 className="text-2xl font-bold text-black mb-4 text-center">Video Calls</h3>
              <p className="text-gray-700 text-center leading-relaxed">
                Face-to-face conversations with high-definition video calling. See your loved ones anytime.
              </p>
            </div>

            {/* Feature Card 4 */}
            <div className="bg-white p-10 rounded-2xl shadow-lg border-2 border-transparent hover:border-[#4aa3c3] hover:-translate-y-3 transition-all duration-300 cursor-pointer">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#4aa3c3] to-[#3a8fad] flex items-center justify-center overflow-hidden">
                <Image
                  src="/images/add friend.png"
                  alt="Add Friends Icon"
                  width={60}
                  height={60}
                  className="object-contain"
                />
              </div>
              <h3 className="text-2xl font-bold text-black mb-4 text-center">Add Friends</h3>
              <p className="text-gray-700 text-center leading-relaxed">
                Easily find and add friends with our smart search. Build your network seamlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 px-16 bg-gradient-to-br from-[#9ad9e5] to-[#5a8fd8]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-16 flex-col lg:flex-row">
            {/* Left Content */}
            <div className="flex-1">
              <h2 className="text-5xl font-bold text-black mb-8">Our Services</h2>
              <p className="text-lg text-gray-800 mb-5 leading-relaxed">
                FunChat offers a comprehensive suite of communication tools designed to make your conversations more engaging and productive. We&apos;re committed to providing a seamless experience across all your devices.
              </p>
              <ul className="space-y-4 mt-8">
                <li className="flex items-center gap-4 text-lg text-gray-800">
                  <span className="flex-shrink-0 w-8 h-8 bg-[#4aa3c3] rounded-full flex items-center justify-center text-white font-bold">✓</span>
                  24/7 reliable messaging infrastructure
                </li>
                <li className="flex items-center gap-4 text-lg text-gray-800">
                  <span className="flex-shrink-0 w-8 h-8 bg-[#4aa3c3] rounded-full flex items-center justify-center text-white font-bold">✓</span>
                  End-to-end encrypted communications
                </li>
                <li className="flex items-center gap-4 text-lg text-gray-800">
                  <span className="flex-shrink-0 w-8 h-8 bg-[#4aa3c3] rounded-full flex items-center justify-center text-white font-bold">✓</span>
                  Cross-platform synchronization
                </li>
                <li className="flex items-center gap-4 text-lg text-gray-800">
                  <span className="flex-shrink-0 w-8 h-8 bg-[#4aa3c3] rounded-full flex items-center justify-center text-white font-bold">✓</span>
                  Group chats with unlimited members
                </li>
                <li className="flex items-center gap-4 text-lg text-gray-800">
                  <span className="flex-shrink-0 w-8 h-8 bg-[#4aa3c3] rounded-full flex items-center justify-center text-white font-bold">✓</span>
                  File sharing and media support
                </li>
                <li className="flex items-center gap-4 text-lg text-gray-800">
                  <span className="flex-shrink-0 w-8 h-8 bg-[#4aa3c3] rounded-full flex items-center justify-center text-white font-bold">✓</span>
                  Custom themes and personalization
                </li>
              </ul>
            </div>

            {/* Right Illustration */}
            <div className="flex-1 flex justify-center">
              <div className="w-full max-w-lg h-96 bg-white/30 backdrop-blur-md rounded-3xl flex items-center justify-center text-9xl shadow-2xl hover:scale-105 transition-transform duration-300 cursor-pointer">
                🚀
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 px-16 bg-gradient-to-br from-[#dff6f9] to-[#9ad9e5]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-16 flex-col-reverse lg:flex-row-reverse">
            {/* Left Content */}
            <div className="flex-1">
              <h2 className="text-5xl font-bold text-black mb-8">About Us</h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                FunChat was founded with a simple mission: to make communication fun, simple, and accessible to everyone. We believe that staying connected with the people who matter most shouldn&apos;t be complicated.
              </p>
              <p className="text-lg text-gray-700 mb-10 leading-relaxed">
                Our team of passionate developers and designers work tirelessly to create an experience that feels natural and intuitive. With millions of users worldwide, we&apos;re proud to be bringing people together every single day.
              </p>
              
              {/* Stats */}
              <div className="flex gap-10 mt-10">
                <div className="text-center">
                  <div className="text-5xl font-bold text-[#4aa3c3] mb-2">10M+</div>
                  <div className="text-gray-700">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-[#4aa3c3] mb-2">150+</div>
                  <div className="text-gray-700">Countries</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-[#4aa3c3] mb-2">99.9%</div>
                  <div className="text-gray-700">Uptime</div>
                </div>
              </div>
            </div>

            {/* Right Illustration */}
            <div className="flex-1 flex justify-center">
              <div className="w-full max-w-lg h-96 bg-white/30 backdrop-blur-md rounded-3xl flex items-center justify-center text-9xl shadow-2xl hover:scale-105 transition-transform duration-300 cursor-pointer">
                🌍
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-[#4aa3c3] to-[#3a8fad] text-white py-10 px-16 text-center">
        <p className="mb-2">&copy; 2026 FunChat. All rights reserved.</p>
        <p>Making conversations better, one chat at a time.</p>
      </footer>
    </>
  )
}