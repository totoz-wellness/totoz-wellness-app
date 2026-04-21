import React, { useState, useEffect, useRef } from 'react';
import Phaser from 'phaser';

interface GameProps {
  onWin: (icon?: string) => void;
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
const BreathingGame = ({ onWin }: { onWin: (icon?: string) => void }) => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const phaserInstance = useRef<any>(null);

  useEffect(() => {
    if (gameContainerRef.current && !phaserInstance.current) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: gameContainerRef.current,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 800,
            height: 500
        },
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
                    onWin('🎈');
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

  return <div ref={gameContainerRef} className="rounded-2xl w-full max-w-4xl mx-auto aspect-[8/5] overflow-hidden shadow-xl border-4 border-pastel-green"></div>;
};

// ==========================================
// GAME 2: CALM POND (With Real Images & Interactivity)
// ==========================================
const CalmPondGame = ({ onWin }: { onWin: (icon?: string) => void }) => {
    const gameContainerRef = useRef<HTMLDivElement>(null);
    const phaserInstance = useRef<any>(null);
  
    useEffect(() => {
      if (gameContainerRef.current && !phaserInstance.current) {
        const config: Phaser.Types.Core.GameConfig = {
          type: Phaser.AUTO,
          parent: gameContainerRef.current,
          scale: {
              mode: Phaser.Scale.FIT,
              autoCenter: Phaser.Scale.CENTER_BOTH,
              width: 800,
              height: 500
          },
          backgroundColor: '#006266', // Deep teal backup color
          scene: {
            preload: function(this: Phaser.Scene) {
                // 1. LOAD ASSETS
                this.load.image('koi', '/assets/koi.png');
                this.load.image('lilypad', '/assets/lilypad.jpg');

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

              // --- 1. ENVIRONMENT & CALM METER ---
              const bgGraphics = scene.add.graphics();
              bgGraphics.fillGradientStyle(0x006266, 0x006266, 0x1dd1a1, 0x1dd1a1, 1);
              bgGraphics.fillRect(0, 0, width, height);

              // Sunlight (Acts as visual calm meter)
              const sun = scene.add.circle(400, 250, 0, 0xffeaa7, 0.0);
              // Gradually scales up and becomes visible over 30 seconds
              scene.tweens.add({ targets: sun, alpha: 0.15, radius: 400, duration: 30000, ease: 'Sine.easeInOut' });

              // --- 2. LILY PADS (Draggable) ---
              const createLilyPad = (x: number, y: number, initialScale: number) => {
                  const padContainer = scene.add.container(x, y);
                  const padImage = scene.add.image(0, 0, 'lilypad');
                  padImage.setScale(initialScale * 0.2); 
                  padContainer.add(padImage);
                  padContainer.setAlpha(0.9);
                  
                  // Enable Dragging
                  const hitArea = new Phaser.Geom.Circle(0, 0, 200 * (initialScale * 0.5));
                  padContainer.setInteractive(hitArea, Phaser.Geom.Circle.Contains);
                  scene.input.setDraggable(padContainer);

                  padContainer.on('drag', (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
                      padContainer.x = dragX;
                      padContainer.y = dragY;
                  });

                  // Bobbing animation
                  scene.tweens.add({
                      targets: padContainer, angle: { from: -5, to: 5 }, x: x + 10, duration: 6000 + Math.random() * 2000,
                      yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
                  });
              };

              createLilyPad(100, 150, 1.2);
              createLilyPad(700, 400, 1.0);
              createLilyPad(150, 420, 0.8);
              createLilyPad(650, 100, 1.1);

              // --- 3. KOI FISH (Interactive Feeding) ---
              const allFish: { container: Phaser.GameObjects.Container, moveTween: Phaser.Tweens.Tween | null, moveRandomly: Function }[] = [];

              const createKoi = () => {
                const startX = Phaser.Math.Between(100, 700);
                const startY = Phaser.Math.Between(100, 400);
                const fishContainer = scene.add.container(startX, startY);

                const shadowGraphics = scene.add.graphics();
                shadowGraphics.fillStyle(0x000000, 0.3);
                shadowGraphics.fillEllipse(5, 5, 60, 25);
                fishContainer.add(shadowGraphics);

                const fishImage = scene.add.image(0, 0, 'koi');
                fishImage.setScale(0.2); 
                fishContainer.add(fishImage);

                const fishObj: any = { container: fishContainer, moveTween: null };
                allFish.push(fishObj);

                fishObj.moveRandomly = () => {
                    const newX = Phaser.Math.Between(50, 750);
                    const newY = Phaser.Math.Between(50, 450);
                    const angle = Phaser.Math.Angle.Between(fishContainer.x, fishContainer.y, newX, newY);
                    
                    scene.tweens.add({ targets: fishContainer, rotation: angle, duration: 500, ease: 'Sine.easeOut' });

                    const distance = Phaser.Math.Distance.Between(fishContainer.x, fishContainer.y, newX, newY);
                    const duration = distance * 20 + Math.random() * 1000;

                    fishObj.moveTween = scene.tweens.add({
                        targets: fishContainer, x: newX, y: newY, duration: duration, ease: 'Quad.easeInOut', delay: 200,
                        onComplete: () => scene.time.delayedCall(Phaser.Math.Between(1000, 3000), fishObj.moveRandomly)
                    });
                };
                fishObj.moveRandomly();

                const hitArea = new Phaser.Geom.Rectangle(-50, -30, 100, 60); 
                fishContainer.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

                fishContainer.on('pointerover', () => {
                    scene.tweens.add({ targets: fishContainer, scale: 1.1, duration: 200 });
                    const thought = AFFIRMATIONS[Phaser.Math.Between(0, AFFIRMATIONS.length - 1)];
                    
                    const textBg = scene.add.graphics();
                    textBg.fillStyle(0xffffff, 0.9);
                    textBg.fillRoundedRect(-100, -90, 200, 40, 10);
                    
                    const textObj = scene.add.text(0, -70, thought, { fontFamily: 'Georgia', fontSize: '16px', color: '#333', fontStyle: 'italic' }).setOrigin(0.5);
                    const thoughtContainer = scene.add.container(fishContainer.x, fishContainer.y, [textBg, textObj]);
                    thoughtContainer.setAlpha(0).setScale(0.8).setDepth(100);

                    scene.tweens.add({ targets: thoughtContainer, alpha: 1, scale: 1, y: fishContainer.y - 20, duration: 500, hold: 1500, yoyo: true, onComplete: () => thoughtContainer.destroy() });
                });

                fishContainer.on('pointerout', () => {
                    scene.tweens.add({ targets: fishContainer, scale: 1, duration: 200 });
                });
              };

              for(let i=0; i<5; i++) createKoi();

              // --- 4. PARTICLES (Interactive Wind) ---
              const particles = scene.add.particles(0, 0, 'petal', {
                  x: { min: 0, max: 800 }, y: -10, lifespan: 8000, speedY: { min: 20, max: 50 }, speedX: { min: -10, max: 20 },
                  scale: { start: 0.5, end: 0 }, rotate: { start: 0, end: 360 }, alpha: { start: 0.8, end: 0 },
                  frequency: 300, blendMode: 'ADD'
              });

              let lastPointerX = width / 2;
              scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
                  const dx = pointer.x - lastPointerX;
                  if (Math.abs(dx) > 10) {
                      // Apply temporary wind force to particles (works for Phaser v3.6+)
                      if ((particles as any).setParticleGravity) {
                          (particles as any).setParticleGravity(dx * 5, 0);
                          scene.time.delayedCall(100, () => {
                              (particles as any).setParticleGravity(0, 0);
                          });
                      } else {
                          (particles as any).gravityX = dx * 5;
                          scene.time.delayedCall(100, () => {
                              (particles as any).gravityX = 0;
                          });
                      }
                  }
                  lastPointerX = pointer.x;
              });

              // --- 5. RIPPLES & FEEDING ---
              scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {
                  // Ignore clicks on draggable lily pads
                  if (currentlyOver.length > 0 && currentlyOver[0].type === 'Container') return;

                  // Ripples
                  const circle1 = scene.add.circle(pointer.x, pointer.y, 5);
                  circle1.setStrokeStyle(2, 0xffffff, 0.5);
                  scene.tweens.add({ targets: circle1, radius: 60, alpha: 0, duration: 1500, onComplete: () => circle1.destroy() });

                  // Drop Food
                  const food = scene.add.circle(pointer.x, pointer.y, 4, 0xffd32a);
                  
                  // Find closest fish
                  let closestFish = allFish[0];
                  let minDist = Infinity;
                  allFish.forEach(fish => {
                      const dist = Phaser.Math.Distance.Between(fish.container.x, fish.container.y, pointer.x, pointer.y);
                      if (dist < minDist) { minDist = dist; closestFish = fish; }
                  });

                  // Interrupt closest fish
                  if (closestFish.moveTween) closestFish.moveTween.stop();
                  const angle = Phaser.Math.Angle.Between(closestFish.container.x, closestFish.container.y, pointer.x, pointer.y);
                  
                  scene.tweens.add({ targets: closestFish.container, rotation: angle, duration: 300, ease: 'Sine.easeOut' });

                  scene.tweens.add({
                      targets: closestFish.container, x: pointer.x, y: pointer.y, duration: minDist * 15, delay: 300,
                      onComplete: () => {
                          if (food.active) food.destroy();
                          // Reward Heart
                          const heart = scene.add.text(closestFish.container.x, closestFish.container.y, '❤️', {fontSize: '24px'}).setOrigin(0.5);
                          scene.tweens.add({targets: heart, y: closestFish.container.y - 40, alpha: 0, duration: 1500, onComplete: () => heart.destroy()});
                          
                          // Resume random movement
                          closestFish.moveRandomly();
                      }
                  });
              });

              // --- 6. PASSIVE WIN ---
              scene.time.delayedCall(30000, () => onWin('🌸'));

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

    return <div ref={gameContainerRef} className="rounded-2xl w-full max-w-4xl mx-auto aspect-[8/5] overflow-hidden shadow-2xl border-4 border-white/50 cursor-crosshair"></div>;
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