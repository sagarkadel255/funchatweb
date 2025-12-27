// src/app/page.tsx
import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-[#dff6f9] via-[#9ad9e5] to-[#5a8fd8]">
      
      {/* Navbar */}
      <nav className="flex items-center justify-between px-12 py-6 bg-white/40 backdrop-blur-md shadow-md">
        <div className="flex items-center gap-2 text-2xl font-bold text-blue-600">
          <span>📞</span>
          FunChat
        </div>

        <ul className="flex gap-10 text-gray-700 font-medium">
          <li className="cursor-pointer hover:text-blue-600">Home</li>
          <li className="cursor-pointer hover:text-blue-600">
            Features ▾
          </li>
          <li className="cursor-pointer hover:text-blue-600">Services</li>
          <li className="cursor-pointer hover:text-blue-600">About us</li>
        </ul>

        <Link
          href="/auth/signup"
          className="bg-[#4aa3c3] text-white px-6 py-2 rounded-full hover:bg-[#3a8fad]"
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
              className="bg-[#4aa3c3] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#3a8fad]"
            >
              Get Started
            </Link>

            <button className="bg-[#4aa3c3] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#3a8fad]">
              Download
            </button>
          </div>
        </div>

        {/* Right Illustration */}
        <div className="relative">
          <div className="absolute -top-6 -left-6 bg-white/40 rounded-3xl w-100 h-130 rotate-10"></div>

          <div className="relative bg-white/60 backdrop-blur-lg rounded-3xl p-7 shadow-lg w-100 h-130 rotate-7">
            <Image
              src="/images/dashboard.png"
              alt="Chat Illustration"
              width={300}
              height={300}
            />

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-full px-4 py-2 shadow text-sm w-[320px] text-center">
              Message ....
            </div>
            <div className="absolute left-20 left-1/2 -translate-x-1/2 bg-white rounded-full px-4 py-2 shadow text-sm w-[130px] text-left">
              Message ....
            </div>
            <div className="absolute left-20 left-1/2 -translate-x-1/2 bg-white rounded-full px-4 py-2 shadow text-sm w-[130px] text-left">
              Message ....
            </div>
            <div className="absolute right-9 right-1/2 -translate-x-1/2 bg-white rounded-full px-4 py-2 shadow text-sm w-[130px] text-left">
              Message ....
            </div>
          </div>
        </div>
        
      </section>
    </div>
  )
}
