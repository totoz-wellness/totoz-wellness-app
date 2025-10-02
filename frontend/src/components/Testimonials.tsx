
import React from 'react';

const testimonials = [
  {
    quote: "Finally, a resource that understands what parents are going through. Totoz Wellness has been a game-changer for our family's communication.",
    author: 'Davine O., Mother of Two',
    avatar: 'https://picsum.photos/id/1011/100/10',
  },
  {
    quote: "The GrowTrack feature helped us identify patterns we never would have seen on our own. It's so empowering to have this insight.",
    author: 'Maigua G., Father of One',
    avatar: 'https://picsum.photos/id/1012/100/10',
  },
  {
    quote: "Being part of the ParentCircle community makes me feel less alone. Sharing stories and advice with other caregivers is invaluable.",
    author: 'Arogo C., Guardian',
    avatar: 'https://picsum.photos/id/1027/100/10',
  },
];

const Testimonials: React.FC = () => {
  return (
    <section id="community" className="py-20 bg-light-bg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-dark-text">
            Stories from Our Community
          </h2>
          <p className="mt-4 text-lg text-dark-text/60 max-w-2xl mx-auto">
            Hear from caregivers who have found support and guidance with Totoz Wellness.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-md flex flex-col items-center text-center">
              <img src={testimonial.avatar} alt={testimonial.author} className="w-20 h-20 rounded-full mb-4 border-4 border-pastel-green" />
              <p className="text-dark-text/80 italic mb-6">"{testimonial.quote}"</p>
              <h4 className="font-bold text-teal">{testimonial.author}</h4>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
