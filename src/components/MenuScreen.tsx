import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Palette, LogOut } from 'lucide-react';
import { getUserPreferences } from '../services/userPreferences';

const MenuScreen = ({ onCustomize }: { onCustomize: () => void }) => {
  const { user, userId, logout } = useAuth();
  const [kittyParts, setKittyParts] = useState({ body: '', eyes: '', mouth: '' });
  const [loading, setLoading] = useState(true);

  const replaceColors = (svgContent: string, colors: {
    primary: Record<string, string>;
    secondary: Record<string, string>;
    tertiary: Record<string, string>;
    eyeColor: Record<string, string>;
    selectedColors: {
      primary: string;
      secondary: string;
      tertiary: string;
      eyeColor: string;
    };
  }, type: 'body' | 'eyes' | 'mouth') => {
    let result = svgContent;
    
    if (type === 'body') {
      Object.entries(colors.primary).forEach(([_, color]) => {
        const regex = new RegExp(String(color), 'g');
        result = result.replace(regex, colors.primary[colors.selectedColors.primary]);
      });
      
      Object.entries(colors.secondary).forEach(([_, color]) => {
        const regex = new RegExp(String(color), 'g');
        result = result.replace(regex, colors.secondary[colors.selectedColors.secondary]);
      });
      
      Object.entries(colors.tertiary).forEach(([_, color]) => {
        const regex = new RegExp(String(color), 'g');
        result = result.replace(regex, colors.tertiary[colors.selectedColors.tertiary]);
      });
    } else if (type === 'eyes') {
      Object.entries(colors.eyeColor).forEach(([_, color]) => {
        const regex = new RegExp(String(color), 'g');
        result = result.replace(regex, colors.eyeColor[colors.selectedColors.eyeColor]);
      });
    }
    
    return result;
  };

  useEffect(() => {
    const loadKittyPreview = async () => {
      if (!user || !userId) return;

      try {
        const prefs = await getUserPreferences(user, userId);
        if (prefs) {
          const [bodyResponse, eyesResponse, mouthResponse] = await Promise.all([
            fetch(chrome.runtime.getURL(`cattributes/body/${prefs.selectedBody}-${prefs.selectedPattern}.svg`)),
            fetch(chrome.runtime.getURL(`cattributes/eye/${prefs.selectedEye}.svg`)),
            fetch(chrome.runtime.getURL(`cattributes/mouth/${prefs.selectedMouth}.svg`))
          ]);

          const [bodySvg, eyesSvg, mouthSvg] = await Promise.all([
            bodyResponse.text(),
            eyesResponse.text(),
            mouthResponse.text()
          ]);

          setKittyParts({
            body: replaceColors(bodySvg, { ...Colors, selectedColors: prefs.selectedColors }, 'body'),
            eyes: replaceColors(eyesSvg, { ...Colors, selectedColors: prefs.selectedColors }, 'eyes'),
            mouth: mouthSvg
          });
        }
      } catch (error) {
        console.error('Error loading kitty preview:', error);
      } finally {
        setLoading(false);
      }
    };

    loadKittyPreview();
  }, [user, userId]);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="w-full px-4 py-3 bg-white border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-sm text-purple-600 font-medium">
              {user?.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-sm text-gray-600 truncate max-w-[200px]">{user}</span>
        </div>
        <button onClick={logout} className="text-gray-500 hover:text-gray-700">
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
        <div className="w-48 h-48 bg-white rounded-full shadow-lg flex items-center justify-center">
          {loading ? (
            <div className="loading-spinner" />
          ) : (
            <div className="kitty-svg-container relative w-40 h-40">
              <div dangerouslySetInnerHTML={{ __html: kittyParts.body }} className="absolute inset-0 z-10" />
              <div dangerouslySetInnerHTML={{ __html: kittyParts.mouth }} className="absolute inset-0 z-20" />
              <div dangerouslySetInnerHTML={{ __html: kittyParts.eyes }} className="absolute inset-0 z-30" />
            </div>
          )}
        </div>

        <div className="w-full max-w-xs">
          <button
            onClick={onCustomize}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-3 px-4 rounded-xl hover:bg-purple-700 transition-colors"
          >
            <Palette className="w-5 h-5" />
            <span>Customize Your Kitty</span>
          </button>
        </div>
      </div>
    </div>
  );
};

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

export default MenuScreen;