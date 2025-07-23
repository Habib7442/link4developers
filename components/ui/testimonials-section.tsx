import { AvatarImage } from './avatar-image';

export function TestimonialsSection() {
  const testimonials = [
    {
      quote: "Link4Coders has completely transformed how I showcase my projects. The GitHub integration and interactive code snippets make my profile stand out to recruiters.",
      author: "Sarah Chen",
      role: "Senior Frontend Developer",
      avatar: "/avatars/avatar-1.png",
    },
    {
      quote: "As a freelance developer, having a professional link-in-bio page has helped me land more clients. The project cards with live demos are a game-changer.",
      author: "Marcus Johnson",
      role: "Fullstack Freelancer",
      avatar: "/avatars/avatar-2.png",
    },
    {
      quote: "I love how Link4Coders focuses on what matters to developers. It's not just about looking good, but showcasing technical skills in a meaningful way.",
      author: "Priya Sharma",
      role: "Open Source Contributor",
      avatar: "/avatars/avatar-3.png",
    },
  ];

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">Loved by Developers</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Hear what other developers have to say about Link4Coders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm"
            >
              <div className="flex flex-col h-full">
                <div className="mb-4 flex-grow">
                  <svg className="h-8 w-8 text-gray-400 mb-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                  <p className="text-gray-700 dark:text-gray-300">{testimonial.quote}</p>
                </div>
                <div className="flex items-center mt-4">
                  <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-700 overflow-hidden mr-3">
                    <AvatarImage 
                      src={testimonial.avatar} 
                      alt={testimonial.author}
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">{testimonial.author}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}