// contentScript.ts
export {};

interface Position {
 x: number;
 y: number;
}

interface KittyData {
 body: string;
 eyes: string; 
 mouth: string;
}

class LaserCat {
 private kittyContainer: HTMLDivElement | null = null;
 private eyePosition = { x: 0, y: 0 };
 
 constructor(container: HTMLDivElement) {
   this.kittyContainer = container;
   this.setupListeners();
   this.addStyles();
 }

 private setupListeners() {
   document.addEventListener('click', this.handleClick.bind(this));
   document.addEventListener('mousemove', this.handleMouseMove.bind(this));
 }

 private handleClick(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (!target || !this.kittyContainer || this.kittyContainer.contains(target)) return;

  if (this.isDestructible(target)) {
    e.preventDefault();
    e.stopPropagation();
    
    const kittyRect = this.kittyContainer.getBoundingClientRect();
    const clickPosition = { x: e.clientX, y: e.clientY };
    
    // Flash eyes
    const eyesLayer = this.kittyContainer.querySelector('div:nth-child(3)') as HTMLElement;
    if (eyesLayer) {
      // Select paths that have fill="#fff" and contain the specific eye path data
      const eyes = eyesLayer.querySelectorAll('path[fill="#fff"][d*="129.7 129.7"]');
      eyes.forEach(eye => {
        const element = eye as SVGElement;
        const originalFill = element.style.fill || element.getAttribute('fill');
        
        // Set red color
        element.style.fill = 'red';
        
        // Reset to original colors
        setTimeout(() => {
          element.style.fill = originalFill || '';
          if (!element.getAttribute('style')) {
            element.removeAttribute('style');
          }
        }, 300);
      });
    }
    
    // Update laser starting positions with eye offset
    this.createLaserBeam(
      { 
        x: kittyRect.left + (kittyRect.width * 0.35) + (this.eyePosition.x * 10), 
        y: kittyRect.top + (kittyRect.height * 0.4) + (this.eyePosition.y * 10)
      },
      clickPosition
    );
    
    this.createLaserBeam(
      { 
        x: kittyRect.left + (kittyRect.width * 0.65) + (this.eyePosition.x * 10), 
        y: kittyRect.top + (kittyRect.height * 0.4) + (this.eyePosition.y * 10)
      },
      clickPosition
    );
    
    this.createExplosion(clickPosition);
    this.playLaserSound();
    this.removeTarget(target);
  }
}

 private handleMouseMove(e: MouseEvent) {
   if (!this.kittyContainer) return;

   const kittyRect = this.kittyContainer.getBoundingClientRect();
   const kittyCenter = {
     x: kittyRect.left + (kittyRect.width / 2),
     y: kittyRect.top + (kittyRect.height / 2)
   };

   const dx = e.clientX - kittyCenter.x;
   const dy = e.clientY - kittyCenter.y;
   
   const distance = Math.sqrt(dx * dx + dy * dy);
   const maxDistance = 2.5;
   
   const movementScale = Math.min(distance / 300, 1);
   const moveX = (dx / distance) * maxDistance * movementScale;
   const moveY = (dy / distance) * maxDistance * movementScale;

   const eyesLayer = this.kittyContainer.querySelector('div:nth-child(3)') as HTMLElement;
   if (eyesLayer) {
     eyesLayer.style.transform = `translate(${moveX}px, ${moveY}px)`;
     this.eyePosition = { x: moveX, y: moveY };
   }
 }

 private createLaserBeam(start: Position, end: Position) {
  const laser = document.createElement('div');
  const angle = Math.atan2(end.y - start.y, end.x - start.x) * 180 / Math.PI;
  const distance = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));

  // Add red background to eyes first
  // const eyesContainer = this.kittyContainer?.querySelector('#eye') as HTMLElement;
  // if (eyesContainer) {
  //   eyesContainer.style.backgroundColor = 'red';
  //   setTimeout(() => {
  //     eyesContainer.style.backgroundColor = 'transparent';
  //   }, 300);
  // }

  laser.style.cssText = `
    position: fixed;
    height: 3px;
    background: linear-gradient(90deg, red, orange, yellow);
    box-shadow: 0 0 10px rgba(255,0,0,0.8);
    transform-origin: 0 50%;
    pointer-events: none;
    z-index: 99999;
    left: ${start.x}px;
    top: ${start.y}px;
    width: ${distance}px;
    transform: rotate(${angle}deg);
  `;

  document.body.appendChild(laser);
  setTimeout(() => laser.remove(), 300);
}

 private createExplosion(position: Position) {
   const explosion = document.createElement('div');
   explosion.style.cssText = `
     position: fixed;
     left: ${position.x}px;
     top: ${position.y}px;
     width: 30px;
     height: 30px;
     border: 3px solid violet;
     border-radius: 50%;
     transform: translate(-50%, -50%);
     pointer-events: none;
     z-index: 99998;
     animation: explosion 300ms ease-out forwards;
   `;

   document.body.appendChild(explosion);
   setTimeout(() => explosion.remove(), 300);
 }

 private playLaserSound() {
   const audio = new Audio(chrome.runtime.getURL('sounds/laser.mp3'));
   audio.volume = 0.4;
   audio.play().catch(console.error);
 }

 private removeTarget(target: HTMLElement) {
   target.style.transition = 'all 0.3s ease-out';
   target.style.transform = 'scale(0.8)';
   target.style.opacity = '0';
   setTimeout(() => target.remove(), 300);
 }

 private isDestructible(element: HTMLElement): boolean {
   const nonDestructibleTags = ['HTML', 'BODY', 'HEAD', 'SCRIPT', 'STYLE', 'LINK', 'META'];
   return Boolean(
     element && 
     element.tagName &&
     !nonDestructibleTags.includes(element.tagName) &&
     !element.contains(this.kittyContainer) &&
     element !== this.kittyContainer
   );
 }

 private addStyles() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes laserBeam {
      from { opacity: 0; transform: scale(0.8) rotate(var(--angle)); }
      to { opacity: 1; transform: scale(1) rotate(var(--angle)); }
    }
    @keyframes explosion {
      0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
      100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
    }
    svg circle, svg path, svg ellipse {
      transition: fill 0.1s ease, stroke 0.1s ease;
    }
  `;
  document.head.appendChild(style);
}
}

let kittyContainer: HTMLDivElement | null = null;
let laserCat: LaserCat | null = null;

function createKittyContainer(kittyData: KittyData) {
 if (kittyContainer) {
   kittyContainer.remove();
 }

 kittyContainer = document.createElement('div');
 kittyContainer.style.cssText = `
   position: fixed;
   bottom: 20px;
   right: 20px;
   width: 200px;
   height: 200px;
   z-index: 9999;
   cursor: move;
   user-select: none;
 `;
 
 const content = document.createElement('div');
 content.style.cssText = `
   width: 100%;
   height: 100%;
   position: relative;
 `;

 const bodyLayer = document.createElement('div');
 bodyLayer.innerHTML = kittyData.body;
 bodyLayer.style.cssText = 'position: absolute; inset: 0; z-index: 10;';

 const mouthLayer = document.createElement('div');
 mouthLayer.innerHTML = kittyData.mouth;
 mouthLayer.style.cssText = 'position: absolute; inset: 0; z-index: 20;';

 const eyesLayer = document.createElement('div');
 eyesLayer.innerHTML = kittyData.eyes;
 eyesLayer.style.cssText = 'position: absolute; inset: 0; z-index: 30; transition: transform 0.1s ease';

 content.appendChild(bodyLayer);
 content.appendChild(mouthLayer);
 content.appendChild(eyesLayer);
 kittyContainer.appendChild(content);
 document.body.appendChild(kittyContainer);

 makeDraggable(kittyContainer);

 return kittyContainer;
}

function makeDraggable(element: HTMLElement) {
 let isDragging = false;
 let initialX = 0, initialY = 0;

 const handleMouseDown = (e: MouseEvent) => {
   isDragging = true;
   initialX = e.clientX - element.offsetLeft;
   initialY = e.clientY - element.offsetTop;
   
   document.addEventListener('mousemove', handleMouseMove);
   document.addEventListener('mouseup', handleMouseUp);
 };

 const handleMouseMove = (e: MouseEvent) => {
   if (!isDragging) return;
   
   const newX = e.clientX - initialX;
   const newY = e.clientY - initialY;
   
   const rect = element.getBoundingClientRect();
   element.style.left = `${Math.max(0, Math.min(newX, window.innerWidth - rect.width))}px`;
   element.style.top = `${Math.max(0, Math.min(newY, window.innerHeight - rect.height))}px`;
 };

 const handleMouseUp = () => {
   isDragging = false;
   document.removeEventListener('mousemove', handleMouseMove);
   document.removeEventListener('mouseup', handleMouseUp);
 };

 element.addEventListener('mousedown', handleMouseDown);
}

chrome.runtime.onMessage.addListener((request) => {
 if (request.type === 'SHOW_KITTY') {
   const container = createKittyContainer(request.kittyData);
   laserCat = new LaserCat(container);
 } else if (request.type === 'HIDE_KITTY') {
   if (kittyContainer) {
     kittyContainer.remove();
     kittyContainer = null;
   }
 }
});