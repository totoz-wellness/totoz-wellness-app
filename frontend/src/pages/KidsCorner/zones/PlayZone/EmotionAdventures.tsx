import React, { useState } from 'react';

interface GameProps {
  onWin: () => void;
  onBack: () => void;
}

const ScenarioGame = ({ onWin }: { onWin: () => void }) => {
    const [step, setStep] = useState(0);
    const scenarios = [
        { q: "Your friend dropped their ice cream. How do they feel?", options: [{ t: "Happy", c: false }, { t: "Sad", c: true }, { t: "Excited", c: false }] },
        { q: "You have a big test tomorrow. You might feel...", options: [{ t: "Nervous", c: true }, { t: "Sleepy", c: false }, { t: "Hungry", c: false }] }
    ];

    const handleAnswer = (correct: boolean) => {
        if (correct) {
            if (step + 1 < scenarios.length) setStep(step + 1);
            else onWin();
        } else {
            alert("Try again! Look closely at the situation.");
        }
    };

    return (
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-black mb-6">Scenario #{step + 1}</h3>
            <p className="text-xl mb-8">{scenarios[step].q}</p>
            <div className="grid grid-cols-3 gap-4">
                {scenarios[step].options.map((opt, i) => (
                    <button key={i} onClick={() => handleAnswer(opt.c)} className="bg-blue-50 hover:bg-blue-100 p-4 rounded-xl font-bold text-blue-800 transition-colors">{opt.t}</button>
                ))}
            </div>
        </div>
    );
};

const EmotionAdventures: React.FC<GameProps> = ({ onWin, onBack }) => {
  const [activeGame, setActiveGame] = useState<'scenarios' | null>(null);

  if (activeGame === 'scenarios') return <div className="animate-fade-in"><button onClick={() => setActiveGame(null)} className="mb-4 bg-gray-100 px-4 py-2 rounded-full font-bold">⬅ Back</button><ScenarioGame onWin={onWin} /></div>;

  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="mb-6 flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full font-bold hover:bg-gray-200">⬅ Back to Zones</button>
      <h2 className="text-3xl font-black mb-6 text-blue-800">🎭 Emotion Adventures</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button onClick={() => setActiveGame('scenarios')} className="bg-white p-6 rounded-3xl shadow-lg hover:scale-105 transition-all text-left border-2 border-blue-100"><div className="text-5xl mb-4">🤔</div><h3 className="text-xl font-bold">What would you do?</h3></button>
      </div>
    </div>
  );
};

export default EmotionAdventures;