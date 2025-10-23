
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { name: 'Aware of Need', value: 85.7 },
  { name: 'Willing to Use App', value: 81.0 },
];

const COLORS = ['#A8D5BA', '#3AAFA9'];

const WhyUs: React.FC = () => {
  return (
    <section id="why-us" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-dark-text mb-6">
              Why Totoz Wellness?
            </h2>
            <p className="text-lg text-dark-text/70 mb-4">
              Our approach is backed by research and a deep understanding of caregivers' needs. We surveyed parents and found a strong desire for a supportive tool like ours.
            </p>
            <p className="text-lg text-dark-text/70">
              The data shows that caregivers are not only aware of the challenges in children's mental health but are actively seeking accessible solutions.
            </p>
          </div>
          <div className="lg:w-1/2 w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} />
                <YAxis dataKey="name" type="category" width={150} tick={{ fill: '#17252A' }} />
                <Tooltip cursor={{fill: 'rgba(249, 250, 251, 0.5)'}} formatter={(value: number) => [`${value}%`, 'Percentage']} />
                <Bar dataKey="value" barSize={40} radius={[0, 10, 10, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
