import React from 'react';
import { KidsData } from '../../../types/kidscorner.types';

interface LearnZoneProps {
  kidsData: KidsData;
}

const STORIES = [
  { title: "The Brave Little Bear", icon: "🐻", tag: "anxiety", moodMatch: ['worried', 'sad'] },
  { title: "The Angry Volcano", icon: "🌋", tag: "anger", moodMatch: ['angry'] },
  { title: "The Happy Cloud", icon: "☁️", tag: "joy", moodMatch: ['happy', 'calm', 'silly'] },
  { title: "Turtle Takes a Break", icon: "🐢", tag: "calm", moodMatch: ['calm', 'worried'] },
  { title: "Super Snail", icon: "🐌", tag: "patience", moodMatch: ['silly', 'angry'] },
];

const LearnZone: React.FC<LearnZoneProps> = ({ kidsData }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Adaptive Recommendation */}
      {kidsData.lastMood && (
          <div className="bg-gradient-to-r from-teal/10 to-blue-100 p-6 rounded-3xl border border-teal/20 mb-4">
              <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">💡</span>
                  <h4 className="font-black text-teal text-lg">Because you're feeling {kidsData.lastMood}...</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {STORIES.filter(s => s.moodMatch.includes(kidsData.lastMood!)).length > 0 ? (
                   STORIES.filter(s => s.moodMatch.includes(kidsData.lastMood!)).map(s => (
                      <button key={s.title} className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md transition-all text-left">
                          <span className="text-4xl">{s.icon}</span>
                          <div>
                              <span className="font-bold text-dark-text block">{s.title}</span>
                              <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Recommended</span>
                          </div>
                      </button>
                  ))
              ) : (
                  <p className="text-gray-500 italic">We have lots of stories for you below!</p>
              )}
              </div>
          </div>
      )}

      {/* 2. Full Library */}
      <h3 className="font-black text-2xl text-dark-text mb-4">Explore Library 📚</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {STORIES.map((s, idx) => (
               <div key={idx} className="bg-white p-6 rounded-3xl shadow-lg border-b-4 border-gray-100 flex flex-col items-center text-center hover:-translate-y-1 transition-transform">
                  <div className="text-5xl mb-4">{s.icon}</div>
                  <h3 className="font-black text-xl mb-2">{s.title}</h3>
                  <button className="mt-4 bg-teal text-white w-full py-3 rounded-2xl font-bold hover:bg-teal/90 transition-all">
                      Read Story
                  </button>
               </div>
          ))}
      </div>
    </div>
  );
};

export default LearnZone;