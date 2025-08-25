import { AvatarImage } from './avatar-image';

export function TestimonialsSection() {
  const testimonials = [
    {
      quote: "Link4Coders has completely transformed how I showcase my projects. The GitHub integration and interactive code snippets make my profile stand out to recruiters.",
      author: "Sarah Chen",
      role: "Senior Frontend Developer",
      avatar: null, // Remove non-existent image
    },
    {
      quote: "As a freelance developer, having a professional link-in-bio page has helped me land more clients. The project cards with live demos are a game-changer.",
      author: "Marcus Johnson",
      role: "Fullstack Freelancer",
      avatar: null, // Remove non-existent image
    },
    {
      quote: "I love how Link4Coders focuses on what matters to developers. It's not just about looking good, but showcasing technical skills in a meaningful way.",
      author: "Priya Sharma",
      role: "Open Source Contributor",
      avatar: null, // Remove non-existent image
    },
  ];

  return (
    <section className="relative w-full bg-[#18181a] py-20 overflow-hidden">
      <div className="relative w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">

        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-[48px] font-normal leading-[56px] tracking-[-2.88px] font-sharp-grotesk gradient-text-primary mb-6">
            Loved by Developers
          </h2>
          <p className="text-[20px] font-light leading-[30px] tracking-[-0.6px] text-[#7a7a83] font-sharp-grotesk max-w-[600px] mx-auto">
            Hear what other developers have to say about Link4Coders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="glassmorphic rounded-[20px] p-8 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)] group hover:scale-105 transition-transform duration-300"
            >
              <div className="flex flex-col h-full">
                <div className="mb-6 flex-grow">
                  <svg className="h-8 w-8 text-[#54E0FF] mb-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                  <p className="text-[16px] font-light leading-[24px] tracking-[-0.48px] text-white font-sharp-grotesk">{testimonial.quote}</p>
                </div>
                <div className="flex items-center mt-6">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-[#54E0FF]/20 to-[#29ADFF]/20 overflow-hidden mr-4 flex items-center justify-center">
                    {testimonial.avatar ? (
                      <AvatarImage
                        src={testimonial.avatar}
                        alt={testimonial.author}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-[18px] font-bold text-[#54E0FF]">
                          {testimonial.author[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-[16px] font-medium leading-[20px] tracking-[-0.48px] font-sharp-grotesk text-white">{testimonial.author}</h4>
                    <p className="text-[14px] font-light leading-[18px] tracking-[-0.42px] text-[#7a7a83] font-sharp-grotesk">{testimonial.role}</p>
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