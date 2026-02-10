import React, { useState, useEffect, useRef } from 'react';
import Phaser from 'phaser';

interface GameProps {
  onWin: () => void;
  onBack: () => void;
}

// --- CONFIGURATION ---
const AFFIRMATIONS = [
  "I am enough.",
  "I am safe here.",
  "My feelings matter.",
  "Breathe in, breathe out.",
  "I am loved.",
  "This wave will pass.",
  "I can take my time.",
  "Peace begins with me."
];

// ==========================================
// GAME 1: BREATHING BALLOON
// ==========================================
const BreathingGame = ({ onWin }: { onWin: () => void }) => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const phaserInstance = useRef<any>(null);

  useEffect(() => {
    if (gameContainerRef.current && !phaserInstance.current) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: gameContainerRef.current,
        width: 800,
        height: 500,
        backgroundColor: '#ffffff',
        physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 } } },
        scene: {
          create: function (this: Phaser.Scene) {
            const scene = this;
            // Background Elements
            scene.add.circle(400, 250, 200, 0xA8D5BA, 0.1);
            scene.add.circle(400, 250, 150, 0xA8D5BA, 0.2);

            // Balloon
            const balloon = scene.add.circle(400, 250, 60, 0xff7675).setStrokeStyle(4, 0xd63031);
            const text = scene.add.text(400, 420, 'Breathe in...', { fontSize: '28px', color: '#17252A', fontFamily: 'Arial', fontStyle: 'bold' }).setOrigin(0.5);
            
            // Animation
            scene.tweens.add({
                targets: balloon, radius: 140, duration: 4000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
                onYoyo: () => text.setText('Breathe out...'),
                onRepeat: () => text.setText('Breathe in...')
            });

            // Interaction
            let clicks = 0;
            balloon.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
                clicks++;
                if (clicks === 5) {
                    text.setText('Great job!');
                    balloon.setFillStyle(0xfdcb6e);
                    onWin();
                    clicks = 0;
                }
            });
            
            // Title
            scene.add.text(400, 50, 'The Calming Balloon', { fontSize: '20px', color: '#3AAFA9', fontFamily: 'Arial' }).setOrigin(0.5);
          }
        }
      };
      phaserInstance.current = new Phaser.Game(config);
    }
    return () => { if (phaserInstance.current) { phaserInstance.current.destroy(true); phaserInstance.current = null; } };
  }, []);

  return <div ref={gameContainerRef} className="rounded-2xl overflow-hidden shadow-xl border-4 border-pastel-green"></div>;
};

// ==========================================
// GAME 2: CALM POND (With Real Images)
// ==========================================
const CalmPondGame = ({ onWin }: { onWin: () => void }) => {
    const gameContainerRef = useRef<HTMLDivElement>(null);
    const phaserInstance = useRef<any>(null);
  
    useEffect(() => {
      if (gameContainerRef.current && !phaserInstance.current) {
        const config: Phaser.Types.Core.GameConfig = {
          type: Phaser.AUTO,
          parent: gameContainerRef.current,
          width: 800,
          height: 500,
          backgroundColor: '#006266', // Deep teal backup color
          scene: {
            preload: function(this: Phaser.Scene) {
                // 1. LOAD ASSETS
                // Loading the real images you added
                this.load.image('koi', '/assets/koi.png');
                this.load.image('lilypad', '/assets/lilypad.jpg');

                // Generate petal texture for particles (Keep this programmatic for performance)
                const graphics = this.make.graphics({ x: 0, y: 0 });
                graphics.fillStyle(0xffcccc, 1);
                graphics.fillCircle(4, 4, 4);
                graphics.generateTexture('petal', 8, 8);
                graphics.destroy();
            },
            create: function (this: Phaser.Scene) {
              const scene = this;
              const width = 800;
              const height = 500;

              // --- 1. ENVIRONMENT ---
              const bgGraphics = scene.add.graphics();
              bgGraphics.fillGradientStyle(0x006266, 0x006266, 0x1dd1a1, 0x1dd1a1, 1);
              bgGraphics.fillRect(0, 0, width, height);

              // Sunlight
              const sun = scene.add.circle(0, 0, 300, 0xffeaa7, 0.15);
              scene.tweens.add({ targets: sun, alpha: 0.25, duration: 4000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

              // --- 2. LILY PADS (Using Real Image) ---
              const createLilyPad = (x: number, y: number, initialScale: number) => {
                  const padContainer = scene.add.container(x, y);
                  
                  // Add the image
                  const padImage = scene.add.image(0, 0, 'lilypad');
                  
                  // Scale it down (Adjust 0.2 to fit your specific image size)
                  padImage.setScale(initialScale * 0.2); 
                  
                  // If your jpg has a white background, you might want to try blending, 
                  // but standard mode is safest to start.
                  
                  padContainer.add(padImage);
                  padContainer.setAlpha(0.9);
                  
                  // Bobbing animation
                  scene.tweens.add({
                      targets: padContainer,
                      angle: { from: -5, to: 5 },
                      x: x + 10,
                      duration: 6000 + Math.random() * 2000,
                      yoyo: true,
                      repeat: -1,
                      ease: 'Sine.easeInOut'
                  });
              };

              // Place pads
              createLilyPad(100, 150, 1.2);
              createLilyPad(700, 400, 1.0);
              createLilyPad(150, 420, 0.8);
              createLilyPad(650, 100, 1.1);

              // --- 3. KOI FISH (Using Real Image) ---
              const createKoi = () => {
                const startX = Phaser.Math.Between(100, 700);
                const startY = Phaser.Math.Between(100, 400);
                
                // Movement Container
                const fishContainer = scene.add.container(startX, startY);

                // A. Shadow (Drawn programmatically for performance/style)
                const shadowGraphics = scene.add.graphics();
                shadowGraphics.fillStyle(0x000000, 0.3);
                shadowGraphics.fillEllipse(5, 5, 60, 25);
                fishContainer.add(shadowGraphics);

                // B. Real Fish Image
                const fishImage = scene.add.image(0, 0, 'koi');
                
                // IMPORTANT: Scale adjustment (0.2 = 20% size). Change this if fish is too big!
                fishImage.setScale(0.2); 
                
                // If your fish image faces UP in the file, uncomment the line below:
                // fishImage.setAngle(90);

                fishContainer.add(fishImage);

                // C. Organic Movement
                const moveFish = () => {
                    const newX = Phaser.Math.Between(50, 750);
                    const newY = Phaser.Math.Between(50, 450);
                    
                    // Calculate rotation
                    const angle = Phaser.Math.Angle.Between(fishContainer.x, fishContainer.y, newX, newY);
                    
                    // Rotate container to face destination
                    scene.tweens.add({ targets: fishContainer, rotation: angle, duration: 500, ease: 'Sine.easeOut' });

                    const distance = Phaser.Math.Distance.Between(fishContainer.x, fishContainer.y, newX, newY);
                    const duration = distance * 20 + Math.random() * 1000;

                    scene.tweens.add({
                        targets: fishContainer, x: newX, y: newY, duration: duration, ease: 'Quad.easeInOut', delay: 200,
                        onComplete: () => scene.time.delayedCall(Phaser.Math.Between(1000, 3000), moveFish)
                    });
                };
                moveFish();

                // D. Interaction (Affirmations)
                // We make the interactive area slightly bigger than the fish for easier clicking
                const hitArea = new Phaser.Geom.Rectangle(-50, -30, 100, 60); 
                fishContainer.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

                fishContainer.on('pointerover', () => {
                    scene.tweens.add({ targets: fishContainer, scale: 1.1, duration: 200 });
                    
                    const thought = AFFIRMATIONS[Phaser.Math.Between(0, AFFIRMATIONS.length - 1)];
                    
                    // Text Box
                    const textBg = scene.add.graphics();
                    textBg.fillStyle(0xffffff, 0.9);
                    textBg.fillRoundedRect(-100, -90, 200, 40, 10);
                    
                    const textObj = scene.add.text(0, -70, thought, { 
                        fontFamily: 'Georgia', fontSize: '16px', color: '#333', fontStyle: 'italic' 
                    }).setOrigin(0.5);
                    
                    const thoughtContainer = scene.add.container(fishContainer.x, fishContainer.y, [textBg, textObj]);
                    thoughtContainer.setAlpha(0).setScale(0.8).setDepth(100);

                    // Float up animation
                    scene.tweens.add({ 
                        targets: thoughtContainer, alpha: 1, scale: 1, y: fishContainer.y - 20, duration: 500, hold: 1500, yoyo: true, 
                        onComplete: () => thoughtContainer.destroy() 
                    });
                });

                fishContainer.on('pointerout', () => {
                    scene.tweens.add({ targets: fishContainer, scale: 1, duration: 200 });
                });
              };

              // Spawn 5 Fish
              for(let i=0; i<5; i++) createKoi();

              // --- 4. PARTICLES (Cherry Blossoms) ---
              scene.add.particles(0, 0, 'petal', {
                  x: { min: 0, max: 800 }, y: -10, lifespan: 8000, speedY: { min: 20, max: 50 }, speedX: { min: -10, max: 20 },
                  scale: { start: 0.5, end: 0 }, rotate: { start: 0, end: 360 }, alpha: { start: 0.8, end: 0 },
                  frequency: 300, blendMode: 'ADD'
              });

              // --- 5. RIPPLES ---
              scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
                  const circle1 = scene.add.circle(pointer.x, pointer.y, 5);
                  circle1.setStrokeStyle(2, 0xffffff, 0.5);
                  scene.tweens.add({ targets: circle1, radius: 60, alpha: 0, duration: 1500, onComplete: () => circle1.destroy() });

                  const circle2 = scene.add.circle(pointer.x, pointer.y, 2);
                  circle2.setStrokeStyle(1, 0xffffff, 0.8);
                  scene.tweens.add({ targets: circle2, radius: 40, alpha: 0, duration: 1200, delay: 200, onComplete: () => circle2.destroy() });
              });

              // --- 6. PASSIVE WIN ---
              scene.time.delayedCall(30000, () => onWin());

              // RENAMED TITLE
              scene.add.text(20, 20, 'Calm Pond', { 
                  fontSize: '24px', fontFamily: 'Georgia', color: '#ffffff', fontStyle: 'italic', shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 4, fill: true } 
              });
            }
          }
        };
        phaserInstance.current = new Phaser.Game(config);
      }
      return () => { if (phaserInstance.current) { phaserInstance.current.destroy(true); phaserInstance.current = null; } };
    }, []);

    return <div ref={gameContainerRef} className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white/50"></div>;
};

// ==========================================
// MAIN MENU COMPONENT
// ==========================================
const MindfulGames: React.FC<GameProps> = ({ onWin, onBack }) => {
  const [activeGame, setActiveGame] = useState<'balloon' | 'pond' | null>(null);

  // RENDER: Active Game View
  if (activeGame === 'balloon') {
    return (
      <div className="animate-fade-in">
        <button onClick={() => setActiveGame(null)} className="mb-4 bg-gray-100 px-4 py-2 rounded-full font-bold hover:bg-gray-200">⬅ Back to Mindful Menu</button>
        <div className="flex justify-center"><BreathingGame onWin={onWin} /></div>
      </div>
    );
  }

  if (activeGame === 'pond') {
    return (
      <div className="animate-fade-in">
        <button onClick={() => setActiveGame(null)} className="mb-4 bg-gray-100 px-4 py-2 rounded-full font-bold hover:bg-gray-200">⬅ Back to Mindful Menu</button>
        <div className="flex justify-center"><CalmPondGame onWin={onWin} /></div>
        <p className="text-center text-gray-400 text-sm mt-4 italic">Relax. Watch the fish. There is no rush.</p>
      </div>
    );
  }

  // RENDER: Menu Selection
  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="mb-6 flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full font-bold hover:bg-gray-200">⬅ Back to Zones</button>
      <h2 className="text-3xl font-black mb-6 text-green-800">🌿 Mindful Games</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Balloon Card */}
        <button onClick={() => setActiveGame('balloon')} className="bg-white p-6 rounded-3xl shadow-lg hover:scale-105 transition-all text-left border-2 border-green-100 group">
           <div className="text-5xl mb-4 group-hover:scale-110 transition-transform w-fit">🎈</div>
           <h3 className="text-xl font-bold text-gray-800">Breathing Balloon</h3>
           <p className="text-gray-500 text-sm mt-2">Practice deep breathing to relax.</p>
        </button>

        {/* Calm Pond Card */}
        <button onClick={() => setActiveGame('pond')} className="bg-white p-6 rounded-3xl shadow-lg hover:scale-105 transition-all text-left border-2 border-blue-100 group">
           <div className="text-5xl mb-4 group-hover:scale-110 transition-transform w-fit">🌸</div>
           <h3 className="text-xl font-bold text-gray-800">Calm Pond</h3>
           <p className="text-gray-500 text-sm mt-2">Relax with fish & ripples.</p>
        </button>

      </div>
    </div>
  );
};

export default MindfulGames;