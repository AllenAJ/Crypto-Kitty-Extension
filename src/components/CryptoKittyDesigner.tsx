import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { saveUserPreferences, getUserPreferences } from '../services/userPreferences';

// Enums
enum BodyType {
  mainecoon = 'mainecoon',
  cymric = 'cymric',
  laperm = 'laperm',
  munchkin = 'munchkin',
  sphynx = 'sphynx',
  ragamuffin = 'ragamuffin',
  himalayan = 'himalayan',
  chartreux = 'chartreux',
}

enum PatternType {
  spock = 'spock',
  tigerpunk = 'tigerpunk',
  calicool = 'calicool',
  luckystripe = 'luckystripe',
  jaguar = 'jaguar',
  totesbasic = 'totesbasic',
}

enum EyeType {
  wingtips = 'wingtips',
  fabulous = 'fabulous',
  otaku = 'otaku',
  raisedbrow = 'raisedbrow',
  simple = 'simple',
  crazy = 'crazy',
  thicccbrowz = 'thicccbrowz',
  googly = 'googly',
}

enum MouthType {
  whixtensions = 'whixtensions',
  dali = 'dali',
  saycheese = 'saycheese',
  beard = 'beard',
  tongue = 'tongue',
  happygokitty = 'happygokitty',
  pouty = 'pouty',
  soserious = 'soserious',
  gerbil = 'gerbil',
}

interface KittyParts {
  body: string;
  eyes: string;
  mouth: string;
}

const CryptoKittyDesigner: React.FC = () => {
  const { isAuthenticated, user, userId } = useAuth();
  const [preferencesLoading, setPreferencesLoading] = useState(false);

  // Color definitions
  const Colors = {
    primary: {
      mauveover: '#ded0ee',
      cloudwhite: '#ffffff',
      salmon: '#f4a792',
      shadowgrey: '#b1b1be',
      orangesoda: '#f7bc56',
      aquamarine: '#add5d2',
      greymatter: '#d1dadf',
      oldlace: '#ffebe9',
      cottoncandy: '#ecd1eb'
    },
    secondary: {
      peach: '#f9cfad',
      bloodred: '#ff7a7a',
      emeraldgreen: '#8be179',
      granitegrey: '#b1aeb9',
      kittencream: '#f7ebda'
    },
    tertiary: {
      barkbrown: '#886662',
      cerulian: '#385877',
      scarlet: '#ea5f5a',
      skyblue: '#83d5ff',
      coffee: '#756650',
      royalpurple: '#cf5be8',
      lemonade: '#ffef85',
      swampgreen: '#44e192',
      chocolate: '#c47e33',
      royalblue: '#5b6ee8',
      wolfgrey: '#737184'
    },
    eyeColor: {
      gold: '#fcdf35',
      bubblegum: '#ef52d1',
      limegreen: '#aef72f',
      chestnut: '#a56429',
      topaz: '#0ba09c',
      mintgreen: '#43edac',
      strawberry: '#ef4b62',
      sizzurp: '#7c40ff'
    }
  };

  // State
  const [kittyParts, setKittyParts] = useState<KittyParts>({ body: '', eyes: '', mouth: '' });
  const [selectedBody, setSelectedBody] = useState<BodyType>(BodyType.cymric);
  const [selectedPattern, setSelectedPattern] = useState<PatternType>(PatternType.jaguar);
  const [selectedEye, setSelectedEye] = useState<EyeType>(EyeType.fabulous);
  const [selectedMouth, setSelectedMouth] = useState<MouthType>(MouthType.soserious);
  const [selectedColors, setSelectedColors] = useState({
    primary: 'mauveover',
    secondary: 'peach',
    tertiary: 'royalpurple',
    eyeColor: 'bubblegum'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>();
  const lastUpdateTimeRef = useRef<number>(0);
  const velocityRef = useRef({ x: 0, y: 0 });
  
  // Eye movement constants
const SPRING_STRENGTH = 0.2;  // Reduced from 0.3
const DAMPING = 0.8;         // Increased from 0.75 for more stability
const MAX_VELOCITY = 0.3;    // Reduced from 0.5
const MAX_DISTANCE = 0.2;    // Reduced from 3
const IDLE_MOVEMENT_RADIUS = 0.2; // Reduced from 0.3
  const IDLE_MOVEMENT_SPEED = 0.001;

    // Function to calculate distance between two points
    const getDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
      return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    };
    
    // Function to limit a value between min and max
    const clamp = (value: number, min: number, max: number) => {
      return Math.min(Math.max(value, min), max);
    };
    
    // Function to simulate natural eye movement when idle
    const getIdlePosition = (time: number) => {
      const angle = time * IDLE_MOVEMENT_SPEED;
      return {
        x: Math.cos(angle) * IDLE_MOVEMENT_RADIUS,
        y: Math.sin(angle * 1.5) * IDLE_MOVEMENT_RADIUS // Use different frequency for y to create more natural movement
      };
    };
  
    // Update animation loop
    const updateEyePosition = (timestamp: number) => {
      if (!lastUpdateTimeRef.current) {
        lastUpdateTimeRef.current = timestamp;
      }
      
      const deltaTime = timestamp - lastUpdateTimeRef.current;
      lastUpdateTimeRef.current = timestamp;
      
      // Calculate spring force
      const dx = targetPosition.x - eyePosition.x;
      const dy = targetPosition.y - eyePosition.y;
      
      // Apply spring physics
      velocityRef.current.x += dx * SPRING_STRENGTH;
      velocityRef.current.y += dy * SPRING_STRENGTH;
      
      // Apply damping
      velocityRef.current.x *= DAMPING;
      velocityRef.current.y *= DAMPING;
      
      // Limit velocity
      const currentVelocity = getDistance({ x: 0, y: 0 }, velocityRef.current);
      if (currentVelocity > MAX_VELOCITY) {
        const scale = MAX_VELOCITY / currentVelocity;
        velocityRef.current.x *= scale;
        velocityRef.current.y *= scale;
      }
      
      // Update position
      const newX = eyePosition.x + velocityRef.current.x;
      const newY = eyePosition.y + velocityRef.current.y;
      
      // Limit maximum eye movement distance
      const distanceFromCenter = getDistance({ x: 0, y: 0 }, { x: newX, y: newY });
      if (distanceFromCenter > MAX_DISTANCE) {
        const scale = MAX_DISTANCE / distanceFromCenter;
        setEyePosition({
          x: newX * scale,
          y: newY * scale
        });
      } else {
        setEyePosition({ x: newX, y: newY });
      }
      
      animationFrameRef.current = requestAnimationFrame(updateEyePosition);
    };

    
  const replaceColors = (svgContent: string, svgType: 'body' | 'eyes' | 'mouth') => {
    let result = svgContent;

    result = result.replace(/<(path|circle|rect|ellipse)/g, '<$1 style="transition: fill 0.3s ease-in-out"');

    const escapeRegExp = (string: string) => {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

    const createColorReplacer = (originalColor: string, newColor: string) => {
      const hexRegex = new RegExp(`${escapeRegExp(originalColor)}`, 'gi');
      result = result.replace(hexRegex, newColor);

      const hexToRgb = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return [r, g, b];
      };

      if (originalColor.startsWith('#')) {
        const [r, g, b] = hexToRgb(originalColor);
        const rgbRegex = new RegExp(`rgb\\(\\s*${r}\\s*,\\s*${g}\\s*,\\s*${b}\\s*\\)`, 'gi');
        result = result.replace(rgbRegex, newColor);
      }
    };

    if (svgType === 'body') {
      const primaryColors = Object.values(Colors.primary);
      primaryColors.forEach(originalColor => {
        createColorReplacer(originalColor, Colors.primary[selectedColors.primary as keyof typeof Colors.primary]);
      });

      const secondaryColors = Object.values(Colors.secondary);
      secondaryColors.forEach(originalColor => {
        createColorReplacer(originalColor, Colors.secondary[selectedColors.secondary as keyof typeof Colors.secondary]);
      });

      const tertiaryColors = Object.values(Colors.tertiary);
      tertiaryColors.forEach(originalColor => {
        createColorReplacer(originalColor, Colors.tertiary[selectedColors.tertiary as keyof typeof Colors.tertiary]);
      });
    } else if (svgType === 'eyes') {
      const eyeColors = Object.values(Colors.eyeColor);
      eyeColors.forEach(originalColor => {
        createColorReplacer(originalColor, Colors.eyeColor[selectedColors.eyeColor as keyof typeof Colors.eyeColor]);
      });
    } else if (svgType === 'mouth') {
      createColorReplacer(Colors.primary.shadowgrey, Colors.primary[selectedColors.primary as keyof typeof Colors.primary]);
    }

    return result;
  };

  const getColorButtonClass = (colorType: string, colorName: string) => {
    const isSelected = selectedColors[colorType as keyof typeof selectedColors] === colorName;
    return `w-10 h-10 rounded-full transition-all duration-300 hover:scale-110 ${
      isSelected ? 'ring-4 ring-blue-500 ring-offset-2 scale-110' : ''
    }`;
  };

  const handleColorChange = (colorType: keyof typeof selectedColors, colorName: string) => {
    setSelectedColors(prev => ({ ...prev, [colorType]: colorName }));
  };

  const loadSvgContent = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [bodyResponse, eyesResponse, mouthResponse] = await Promise.all([
        fetch(`/cattributes/body/${selectedBody}-${selectedPattern}.svg`),
        fetch(`/cattributes/eye/${selectedEye}.svg`),
        fetch(`/cattributes/mouth/${selectedMouth}.svg`)
      ]);

      if (!bodyResponse.ok || !eyesResponse.ok || !mouthResponse.ok) {
        throw new Error('Failed to load SVG parts');
      }

      let [bodySvg, eyesSvg, mouthSvg] = await Promise.all([
        bodyResponse.text(),
        eyesResponse.text(),
        mouthResponse.text()
      ]);

      bodySvg = replaceColors(bodySvg, 'body');
      eyesSvg = replaceColors(eyesSvg, 'eyes');
      mouthSvg = replaceColors(mouthSvg, 'mouth');

      setKittyParts({ body: bodySvg, eyes: eyesSvg, mouth: mouthSvg });
    } catch (error) {
      console.error('Error loading SVG:', error);
      setError(error instanceof Error ? error.message : 'Failed to load kitty');
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!user || !userId) return;
  
    try {
      await saveUserPreferences(user, {
        selectedBody,
        selectedPattern,
        selectedEye,
        selectedMouth,
        selectedColors
      }, userId);
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const generateRandomKitty = () => {
    setSelectedBody(Object.values(BodyType)[Math.floor(Math.random() * Object.values(BodyType).length)]);
    setSelectedPattern(Object.values(PatternType)[Math.floor(Math.random() * Object.values(PatternType).length)]);
    setSelectedEye(Object.values(EyeType)[Math.floor(Math.random() * Object.values(EyeType).length)]);
    setSelectedMouth(Object.values(MouthType)[Math.floor(Math.random() * Object.values(MouthType).length)]);
    
    const newColors = {
      primary: Object.keys(Colors.primary)[Math.floor(Math.random() * Object.keys(Colors.primary).length)],
      secondary: Object.keys(Colors.secondary)[Math.floor(Math.random() * Object.keys(Colors.secondary).length)],
      tertiary: Object.keys(Colors.tertiary)[Math.floor(Math.random() * Object.keys(Colors.tertiary).length)],
      eyeColor: Object.keys(Colors.eyeColor)[Math.floor(Math.random() * Object.keys(Colors.eyeColor).length)]
    };
    
    setSelectedColors(newColors);
  };

  // Load user preferences
  useEffect(() => {
    const loadUserPreferences = async () => {
      if (!user || !userId) return;
      
      try {
        setPreferencesLoading(true);
        const prefs = await getUserPreferences(user, userId);
        
        if (prefs) {
          setSelectedBody(prefs.selectedBody as BodyType);
          setSelectedPattern(prefs.selectedPattern as PatternType);
          setSelectedEye(prefs.selectedEye as EyeType);
          setSelectedMouth(prefs.selectedMouth as MouthType);
          setSelectedColors(prefs.selectedColors);
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      } finally {
        setPreferencesLoading(false);
      }
    };

    loadUserPreferences();
  }, [user, userId]);

  // Save preferences when they change
  useEffect(() => {
    if (!user || !userId) return;
    
    const timeoutId = setTimeout(() => {
      savePreferences();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [selectedBody, selectedPattern, selectedEye, selectedMouth, selectedColors, user, userId]);

  // Load SVG content
  useEffect(() => {
    loadSvgContent();
  }, [selectedBody, selectedPattern, selectedEye, selectedMouth, selectedColors]);

  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      
      // Calculate mouse position relative to container center
      const containerCenterX = rect.left + rect.width / 2;
      const containerCenterY = rect.top + rect.height / 2;
      
      // Calculate normalized vector from center to mouse
      const dx = e.clientX - containerCenterX;
      const dy = e.clientY - containerCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance === 0) return; // Prevent division by zero
      
      // Set target position with distance-based scaling
      const scale = Math.min(distance / (rect.width / 2), 1);
      const targetX = (dx / distance) * MAX_DISTANCE * scale;
      const targetY = (dy / distance) * MAX_DISTANCE * scale;
      
      setTargetPosition({ 
        x: clamp(targetX, -MAX_DISTANCE, MAX_DISTANCE),
        y: clamp(targetY, -MAX_DISTANCE, MAX_DISTANCE)
      });
    };
  
    const updateEyePosition = (timestamp: number) => {
      if (!lastUpdateTimeRef.current) {
        lastUpdateTimeRef.current = timestamp;
      }
      
      const deltaTime = timestamp - lastUpdateTimeRef.current;
      lastUpdateTimeRef.current = timestamp;
      
      // Calculate spring force
      const dx = targetPosition.x - eyePosition.x;
      const dy = targetPosition.y - eyePosition.y;
      
      // Apply spring physics
      velocityRef.current.x += dx * SPRING_STRENGTH;
      velocityRef.current.y += dy * SPRING_STRENGTH;
      
      // Apply damping
      velocityRef.current.x *= DAMPING;
      velocityRef.current.y *= DAMPING;
      
      // Limit velocity
      const currentVelocity = getDistance({ x: 0, y: 0 }, velocityRef.current);
      if (currentVelocity > MAX_VELOCITY) {
        const scale = MAX_VELOCITY / currentVelocity;
        velocityRef.current.x *= scale;
        velocityRef.current.y *= scale;
      }
      
      // Update position
      const newX = eyePosition.x + velocityRef.current.x;
      const newY = eyePosition.y + velocityRef.current.y;
      
      // Limit maximum eye movement distance
      const distanceFromCenter = getDistance({ x: 0, y: 0 }, { x: newX, y: newY });
      if (distanceFromCenter > MAX_DISTANCE) {
        const scale = MAX_DISTANCE / distanceFromCenter;
        setEyePosition({
          x: newX * scale,
          y: newY * scale
        });
      } else {
        setEyePosition({ x: newX, y: newY });
      }
      
      animationFrameRef.current = requestAnimationFrame(updateEyePosition);
    };
    
    // Start animation loop
    animationFrameRef.current = requestAnimationFrame(updateEyePosition);
    
    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove);
    
    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [eyePosition, targetPosition]);

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-lg text-gray-600">Please log in to create your kitty</p>
      </div>
    );
  }

  if (preferencesLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-xl">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-2">CryptoKitty Designer</h1>
          <p className="text-gray-600 mb-8">Design your dream kitty!</p>

          {/* Kitty Display */}
          <div className="bg-gray-50 rounded-xl p-8 mb-8 flex justify-center items-center min-h-[400px] relative">
        {isLoading && (
          <div className="loading-spinner absolute" />
        )}
        {error && (
          <div className="text-red-500 absolute">{error}</div>
        )}
<div className="kitty-svg-container relative w-96 h-96" ref={containerRef}>
  {!isLoading && !error && (
    <>
      <div dangerouslySetInnerHTML={{ __html: kittyParts.body }} className="absolute inset-0 z-10" />
      <div dangerouslySetInnerHTML={{ __html: kittyParts.mouth }} className="absolute inset-0 z-20" />
      <div 
  dangerouslySetInnerHTML={{ __html: kittyParts.eyes }} 
  className="absolute inset-0 z-30"
  style={{
    transform: `translate(${eyePosition.x * 10}px, ${eyePosition.y * 10}px)`,
    transition: 'transform 0.05s cubic-bezier(0.4, 0, 0.2, 1)'
  }}
/>

    </>
  )}
</div>
      </div>

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div>
              {/* Body Type */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">Body Type</h2>
                <div className="flex flex-wrap gap-2">
                  {Object.values(BodyType).map(bodyType => (
                    <button
                      key={bodyType}
                      onClick={() => setSelectedBody(bodyType)}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        selectedBody === bodyType
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {bodyType}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pattern */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">Pattern</h2>
                <div className="flex flex-wrap gap-2">
                  {Object.values(PatternType).map(pattern => (
                    <button
                      key={pattern}
                      onClick={() => setSelectedPattern(pattern)}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        selectedPattern === pattern
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {pattern}
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary Colors */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">Primary Color</h2>
                <div className="flex flex-wrap gap-3">
          {Object.entries(Colors.primary).map(([colorName, colorValue]) => (
            <button
              key={colorName}
              onClick={() => handleColorChange('primary', colorName)}
              className={getColorButtonClass('primary', colorName)}
              style={{ backgroundColor: colorValue }}
              title={colorName}
            />
          ))}
        </div>
              </div>

              {/* Secondary Colors */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">Secondary Color</h2>
                <div className="flex flex-wrap gap-3">
                {Object.entries(Colors.secondary).map(([colorName, colorValue]) => (
  <button
    key={colorName}
    onClick={() => handleColorChange('secondary', colorName)}
    className={getColorButtonClass('secondary', colorName)}
    style={{ backgroundColor: colorValue }}
    title={colorName}
  />
))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div>
              {/* Eyes */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">Eyes</h2>
                <div className="flex flex-wrap gap-2">
                  {Object.values(EyeType).map(eyeType => (
                    <button
                      key={eyeType}
                      onClick={() => setSelectedEye(eyeType)}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        selectedEye === eyeType
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {eyeType}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mouth */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">Mouth</h2>
                <div className="flex flex-wrap gap-2">
                  {Object.values(MouthType).map(mouthType => (
                    <button
                      key={mouthType}
                      onClick={() => setSelectedMouth(mouthType)}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        selectedMouth === mouthType
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {mouthType}
                    </button>
                  ))}
                </div>
              </div>

 {/* Tertiary Colors */}
 <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">Tertiary Color</h2>
                <div className="flex flex-wrap gap-3">
                {Object.entries(Colors.tertiary).map(([colorName, colorValue]) => (
  <button
    key={colorName}
    onClick={() => handleColorChange('tertiary', colorName)}
    className={getColorButtonClass('tertiary', colorName)}
    style={{ backgroundColor: colorValue }}
    title={colorName}
  />
))}
                </div>
              </div>

              {/* Eye Colors */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">Eye Color</h2>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(Colors.eyeColor).map(([colorName, colorValue]) => (
                    <button
                      key={colorName}
                      onClick={() => setSelectedColors(prev => ({ ...prev, eyeColor: colorName }))}
                      className={`w-10 h-10 rounded-full transition-transform hover:scale-110 ${
                        selectedColors.eyeColor === colorName ? 'ring-4 ring-blue-500 ring-offset-2' : ''
                      }`}
                      style={{ backgroundColor: colorValue }}
                      title={colorName}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Random Button */}
          <div className="flex justify-center mt-8">
            <button 
              onClick={generateRandomKitty}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-xl 
                font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
            >
              Random Kitty
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoKittyDesigner;