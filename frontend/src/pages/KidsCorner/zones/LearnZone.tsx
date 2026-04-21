import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, PartyPopper } from 'lucide-react';
import { KidsData } from '../../../types/kidscorner.types';

interface LearnZoneProps {
  kidsData: KidsData;
  onUpdateData?: (newData: Partial<KidsData>) => void;
}

interface Story {
  title: string;
  icon: string;
  tag: string;
  moodMatch: string[];
  pages: string[];
}

const STORIES: Story[] = [
  { 
    title: "The Brave Little Bear", 
    icon: "🐻", 
    tag: "anxiety", 
    moodMatch: ['worried', 'sad'],
    pages: [
      "Once upon a time, there was a little bear named Benny. Benny was often worried about trying new things.",
      "One day, his friends invited him to cross the wobbly log bridge over the river.",
      "Benny's tummy felt fluttery. He took a deep breath, just like his mom taught him.",
      "He took one step, then another. His friends cheered! Benny learned that being brave means trying even when you're scared."
    ]
  },
  { 
    title: "The Angry Volcano", 
    icon: "🌋", 
    tag: "anger", 
    moodMatch: ['angry'],
    pages: [
      "Victor the Volcano was rumbling. His lava was getting hot, and he felt like exploding!",
      "When someone took his favorite rock without asking, he wanted to yell.",
      "Instead, Victor remembered his cooling trick. He counted to 10 and let out a big breezy sigh.",
      "The rumble stopped, and his lava cooled down. Victor smiled, happy he kept his calm."
    ]
  },
  { 
    title: "The Happy Cloud", 
    icon: "☁️", 
    tag: "joy", 
    moodMatch: ['happy', 'calm', 'silly'],
    pages: [
      "Chloe the Cloud loved floating in the bright blue sky. She felt light and silly.",
      "She saw a sad little flower drooping in the sun.",
      "Chloe decided to share her happiness. She sprinkled a tiny, gentle rain shower over the flower.",
      "The flower perked up, and Chloe beamed with joy. Sharing happiness makes it grow!"
    ]
  },
  { 
    title: "Turtle Takes a Break", 
    icon: "🐢", 
    tag: "calm", 
    moodMatch: ['calm', 'worried'],
    pages: [
      "Timmy the Turtle was in a very noisy forest. The birds were loud, and the squirrels were running fast.",
      "Timmy felt overwhelmed. Everything was too much!",
      "He pulled his head into his shell. Inside, it was quiet, dark, and safe.",
      "He took three slow breaths. When he popped his head back out, everything seemed manageable again."
    ]
  },
  { 
    title: "Super Snail", 
    icon: "🐌", 
    tag: "patience", 
    moodMatch: ['silly', 'angry'],
    pages: [
      "Sammy Snail wanted to reach the juicy strawberry at the top of the hill, but everyone was passing him by.",
      "The rabbit zoomed past, and the mouse scurried by. Sammy felt frustrated.",
      "But Sammy kept gliding, slow and steady. He enjoyed the beautiful sparkly trail he left behind.",
      "Finally, he reached the berry! Taking his time meant he got there exactly when he needed to."
    ]
  },
];

const LearnZone: React.FC<LearnZoneProps> = ({ kidsData, onUpdateData }) => {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasAwardedSticker, setHasAwardedSticker] = useState(false);

  const handleOpenStory = (story: Story) => {
    setSelectedStory(story);
    setCurrentPage(0);
    setHasAwardedSticker(false);
  };

  const handleCloseStory = () => {
    setSelectedStory(null);
  };

  const handleNextPage = () => {
    if (selectedStory && currentPage < selectedStory.pages.length) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      
      if (nextPage === selectedStory.pages.length && !hasAwardedSticker && onUpdateData) {
        onUpdateData({ stickers: [...kidsData.stickers, selectedStory.icon], hasReadBook: true });
        setHasAwardedSticker(true);
      }
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
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
                      <motion.button 
                        key={s.title} 
                        onClick={() => handleOpenStory(s)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md transition-all text-left border-2 border-transparent hover:border-teal/30"
                      >
                          <span className="text-4xl">{s.icon}</span>
                          <div>
                              <span className="font-bold text-dark-text block">{s.title}</span>
                              <span className="text-xs text-teal uppercase font-bold tracking-wider">Recommended</span>
                          </div>
                      </motion.button>
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
               <motion.div 
                 key={idx} 
                 onClick={() => handleOpenStory(s)}
                 whileHover={{ y: -8, scale: 1.02 }}
                 className="bg-white p-6 rounded-3xl shadow-lg border-b-4 border-gray-100 flex flex-col items-center text-center transition-all cursor-pointer"
               >
                  <div className="text-6xl mb-4 drop-shadow-md">{s.icon}</div>
                  <h3 className="font-black text-xl mb-2 text-gray-800">{s.title}</h3>
                  <p className="text-gray-500 text-sm font-medium mb-4 flex-grow">A fun story about feeling {s.tag}!</p>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-auto bg-teal text-white w-full py-3 rounded-2xl font-bold hover:bg-teal/90 shadow-md transition-all active:shadow-sm"
                  >
                      Read Story
                  </motion.button>
               </motion.div>
          ))}
      </div>

      {/* 3. Story Reader Modal */}
      <AnimatePresence>
        {selectedStory && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-teal/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-white rounded-3xl w-full max-w-3xl h-[85vh] sm:h-[75vh] overflow-hidden shadow-2xl flex flex-col border-4 border-white/50"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-100 bg-teal/5">
                <div className="flex items-center gap-3">
                  <span className="text-3xl sm:text-4xl drop-shadow-sm">{selectedStory.icon}</span>
                  <h2 className="font-black text-xl sm:text-2xl text-gray-800">{selectedStory.title}</h2>
                </div>
                <button 
                  onClick={handleCloseStory}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-600"
                >
                  <X size={24} strokeWidth={3} />
                </button>
              </div>

              {/* Story Content */}
              <div className="flex-1 p-8 sm:p-12 overflow-y-auto bg-yellow-50 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-50 to-white">
                <AnimatePresence mode="wait">
                  {currentPage < selectedStory.pages.length ? (
                    <motion.p 
                      key={currentPage}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="text-2xl sm:text-4xl font-bold text-gray-700 leading-relaxed text-center"
                    >
                      {selectedStory.pages[currentPage]}
                    </motion.p>
                  ) : (
                    <motion.div 
                      key="finished"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", bounce: 0.5 }}
                      className="flex flex-col items-center text-center"
                    >
                      <PartyPopper size={100} className="text-yellow-400 mb-6 animate-bounce" />
                      <h3 className="text-5xl font-black text-teal mb-4">Great Job!</h3>
                      <p className="text-2xl font-bold text-gray-600 mb-6">You finished the story!</p>
                      
                      {hasAwardedSticker && (
                        <motion.div 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          className="bg-pastel-green/20 px-6 py-4 rounded-3xl flex items-center gap-4 border-2 border-pastel-green/50 shadow-sm"
                        >
                          <span className="text-4xl drop-shadow-sm">{selectedStory.icon}</span>
                          <span className="font-bold text-teal text-lg">Sticker Awarded! Check your Hub.</span>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer Controls */}
              <div className="p-4 sm:p-6 bg-white border-t border-gray-100 flex justify-between items-center">
                <div className="flex-1">
                  {currentPage > 0 && currentPage < selectedStory.pages.length && (
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handlePrevPage}
                      className="flex items-center gap-2 font-bold text-gray-500 hover:text-teal transition-colors px-4 py-3 rounded-xl hover:bg-gray-50 bg-white border-2 border-gray-100"
                    >
                      <ChevronLeft size={24} /> Back
                    </motion.button>
                  )}
                </div>

                {currentPage < selectedStory.pages.length ? (
                  <div className="flex gap-2 mx-4">
                    {selectedStory.pages.map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-3 rounded-full transition-all ${
                          i === currentPage ? 'bg-teal w-8' : 'bg-gray-200 w-3'
                        }`} 
                      />
                    ))}
                  </div>
                ) : null}

                <div className="flex-1 flex justify-end">
                  {currentPage < selectedStory.pages.length ? (
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleNextPage}
                      className="flex items-center gap-2 font-black text-white bg-teal px-6 sm:px-8 py-3 sm:py-4 rounded-2xl hover:bg-teal/90 shadow-md transition-all active:shadow-sm text-lg"
                    >
                      Next <ChevronRight size={24} />
                    </motion.button>
                  ) : (
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCloseStory}
                      className="font-black text-white bg-blue-500 px-8 py-4 rounded-2xl shadow-md transition-all active:shadow-sm text-lg hover:bg-blue-600"
                    >
                      Done reading
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LearnZone;