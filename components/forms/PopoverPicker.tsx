import { useEffect, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";


export const PopoverPicker = ({ color, onChange }: { color: string, onChange: (color: string) => void }) => {
    const popover = useRef<HTMLDivElement>(null);
    const [isOpen, toggle] = useState(false);

    const handleClickOutside = (event: MouseEvent) => {
        if (popover.current && !popover.current.contains(event.target as Node)) {
            toggle(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


  return (
    <div className="picker">
      <div
        className="swatch"
        style={{ backgroundColor: color }}
        onClick={() => toggle(true)}
      />

      {isOpen && (
        <div className="popover" ref={popover}>
          <HexColorPicker color={color} onChange={onChange} />
        </div>
      )}
    </div>
  );
};
