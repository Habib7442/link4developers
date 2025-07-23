import { Button } from './button';
import { EarlyAccessForm } from './early-access-form';
import { DashboardImage } from './dashboard-image';

export function HeroSection() {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent -z-10" />
      
      {/* Code pattern background */}
      <div className="absolute inset-0 opacity-[0.03] -z-10">
        <div className="absolute inset-0 bg-[url('/code-pattern.svg')] bg-repeat bg-center" />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-primary/10 text-primary text-sm font-medium">
            Coming Soon - Join the Waitlist
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            The Ultimate <span className="text-primary">Link-in-Bio</span> Platform for Developers
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl">
            Showcase your projects, skills, and contributions in a way that matters to recruiters and fellow developers. Stand out with interactive code snippets, GitHub integration, and more.
          </p>
          
          <div className="w-full max-w-md mb-12">
            <EarlyAccessForm />
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 border-2 border-white dark:border-gray-900 flex items-center justify-center text-xs font-medium">
                    {i}
                  </div>
                ))}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Join 400+ developers</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Rated 4.9/5</span>
            </div>
          </div>
          
          <div className="relative w-full max-w-5xl mx-auto rounded-xl overflow-hidden shadow-2xl">
            <div className="aspect-[16/9] bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
              <DashboardImage />
            </div>
            
            {/* Browser frame overlay */}
            <div className="absolute top-0 left-0 right-0 h-8 bg-gray-200 dark:bg-gray-700 rounded-t-xl flex items-center px-4">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="ml-4 bg-white dark:bg-gray-800 rounded-full h-5 w-1/2 max-w-xs" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}