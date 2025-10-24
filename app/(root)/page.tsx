import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react"
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-center items-center max-w-4xl w-full">
        {/* Animated Logo with Glow Effect */}
        <div className="relative mb-8">
          <div className="relative">
            <Image 
              src="/banner/logo.svg" 
              alt="Code Buddy Logo" 
              width={200} 
              height={200} 
              className="drop-shadow-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-20 blur-xl animate-pulse"></div>
          </div>
        </div>

        {/* Main Heading with Gradient Text */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 dark:from-purple-400 dark:via-pink-400 dark:to-red-400 leading-tight">
          code with <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">Code Buddy</span>
        </h1>

        {/* Enhanced Description */}
        <p className="text-lg md:text-xl text-center text-gray-700 dark:text-gray-300 px-4 py-6 max-w-3xl leading-relaxed">
          <span className="font-semibold">CodeBuddy</span> is a powerful and intelligent AI-based code editor that enhances your coding experience with advanced features and seamless integration. Designed to help you write, debug, and optimize your code efficiently.
        </p>

        {/* Call to Action Button */}
        <div className="mt-8">
          <Link href={"/dashboard"}>
            <Button className="px-8 py-4 text-lg font-semibold rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              Get Started <ArrowUpRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Additional Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
          <div className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-zinc-700/50 shadow-md hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-lg font-bold text-purple-600 dark:text-purple-400 mb-2">AI-Powered Assistance</h3>
            <p className="text-gray-700 dark:text-gray-300">Intelligent code suggestions and auto-completion</p>
          </div>
          <div className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-zinc-700/50 shadow-md hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-lg font-bold text-pink-600 dark:text-pink-400 mb-2">Real-time Collaboration</h3>
            <p className="text-gray-700 dark:text-gray-300">Work together with your team seamlessly</p>
          </div>
          <div className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-zinc-700/50 shadow-md hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">Advanced Debugging</h3>
            <p className="text-gray-700 dark:text-gray-300">Efficient debugging tools for faster development</p>
          </div>
        </div>
      </div>
    </div>
  );
}
