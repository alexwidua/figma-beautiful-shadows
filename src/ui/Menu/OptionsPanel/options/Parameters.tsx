import { h, JSX } from "preact";
import useStore from "../../../../store/useStore";
import { useState, useEffect } from "preact/hooks";
import { clamp, deriveXYFromAngle, degreeToRadian } from "../../../../utils/math";
import styles from "./parameters.css";

interface SliderGroupProps {
  icon: JSX.Element;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (val: number) => void;
}

const SliderGroup = ({
  icon,
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
}: SliderGroupProps) => {
  const [textValue, setTextValue] = useState<string>(`${Math.round(value)}${unit}`);

  useEffect(() => {
    setTextValue(`${Math.round(value)}${unit}`);
  }, [value, unit]);

  const handleInput = (e: JSX.TargetedEvent<HTMLInputElement>) => {
    const val = Number(e.currentTarget.value);
    onChange(val);
  };

  const handleTextChange = (e: JSX.TargetedEvent<HTMLInputElement>) => {
    setTextValue(e.currentTarget.value);
  };

  const handleTextBlur = () => {
    const parsed = parseFloat(textValue.replace(/[^0-9.-]/g, ""));
    if (!isNaN(parsed)) {
      const clamped = clamp(parsed, min, max);
      onChange(clamped);
      setTextValue(`${Math.round(clamped)}${unit}`);
    } else {
      setTextValue(`${Math.round(value)}${unit}`);
    }
  };

  const handleTextKeyDown = (e: JSX.TargetedKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  const percentFilled = max > min ? Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100) : 0;

  return (
    <div
      className={styles.sliderGroup}
      data-no-drag
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className={styles.headerRow}>
        <div className={styles.labelWrapper}>
          <span className={styles.icon}>{icon}</span>
          <span className={styles.labelText}>{label}</span>
        </div>
        <input
          type="text"
          className={styles.valueInput}
          value={textValue}
          onInput={handleTextChange}
          onBlur={handleTextBlur}
          onKeyDown={handleTextKeyDown}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        />
      </div>
      <div
        className={styles.sliderTrackWrapper}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <input
          type="range"
          className={styles.sliderInput}
          min={min}
          max={max}
          step={step}
          value={value}
          onInput={handleInput}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          style={{
            background: `linear-gradient(to right, #18a0fb 0%, #18a0fb ${percentFilled}%, #e5e5e5 ${percentFilled}%, #e5e5e5 100%)`,
          }}
        />
      </div>
    </div>
  );
};

const Parameters = () => {
  const { previewBounds, lightSize, azimuth, distance, brightness, elevation, setPreview, setLight, setTarget } =
    useStore((state) => ({
      previewBounds: state.previewBounds,
      lightSize: state.light.size,
      azimuth: state.preview.azimuth,
      distance: state.preview.distance,
      brightness: state.preview.brightness,
      elevation: state.preview.elevation,
      setPreview: state.setPreview,
      setLight: state.setLight,
      setTarget: state.setTarget,
    }));

  const { width, height } = previewBounds;
  const boundsX = width > 0 ? width / 2 : 150;
  const boundsY = height > 0 ? height / 2 : 150;
  const delta = degreeToRadian(azimuth);
  const cos = Math.cos(delta);
  const sin = Math.sin(delta);
  const calculatedBounds = Math.sqrt(Math.abs(boundsX * boundsX * cos) + Math.abs(boundsY * boundsY * sin)) - lightSize / 2;
  const maxDistance = Math.max(Math.round(calculatedBounds), 200);

  const handleBrightnessChange = (val: number) => {
    setLight({ brightness: val / 100 });
  };

  const handleElevationChange = (val: number) => {
    setTarget({ elevation: val / 100 });
  };

  const handleDistanceChange = (val: number) => {
    setPreview({ distance: val });
  };

  const handleAzimuthChange = (val: number) => {
    const { dx, dy } = deriveXYFromAngle(val, distance);
    const adjustedX = previewBounds.width / 2 - lightSize / 2 - dx;
    const adjustedY = previewBounds.height / 2 - lightSize / 2 - dy;
    setLight({ x: adjustedX, y: adjustedY });
  };

  return (
    <div
      className={styles.parameters}
      data-no-drag
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <SliderGroup
        icon={<IconBrightness16 v={1 - brightness} />}
        label={"Helligkeit"}
        value={Math.round(brightness * 100)}
        min={0}
        max={100}
        unit={"%"}
        onChange={handleBrightnessChange}
      />
      <SliderGroup
        icon={<IconElevation16 v={3 - Math.round(elevation * 3)} />}
        label={"Höhe"}
        value={Math.round(elevation * 100)}
        min={0}
        max={100}
        unit={"%"}
        onChange={handleElevationChange}
      />
      <SliderGroup
        icon={<IconDistance16 />}
        label={"Abstand"}
        value={Math.round(distance)}
        min={0}
        max={maxDistance}
        unit={"px"}
        onChange={handleDistanceChange}
      />
      <SliderGroup
        icon={<IconAzimuth16 />}
        label={"Winkel"}
        value={Math.round(azimuth)}
        min={0}
        max={360}
        unit={"°"}
        onChange={handleAzimuthChange}
      />
    </div>
  );
};

const IconBrightness16 = ({ v = 0 }: { v?: number }) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 6.5C7.17157 6.5 6.5 7.17157 6.5 8C6.5 8.82843 7.17157 9.5 8 9.5C8.82843 9.5 9.5 8.82843 9.5 8C9.5 7.17157 8.82843 6.5 8 6.5ZM5.5 8C5.5 6.61929 6.61929 5.5 8 5.5C9.38071 5.5 10.5 6.61929 10.5 8C10.5 9.38071 9.38071 10.5 8 10.5C6.61929 10.5 5.5 9.38071 5.5 8Z"
        fill="currentColor"
      />
      <path d={`M5 5L${3 + v} ${3 + v}`} stroke="currentColor" />
      <path d={`M${1 + v} 8H4`} stroke="currentColor" />
      <path d={`M${3 + v} ${13 - v}L5 11`} stroke="currentColor" />
      <path d={`M8 ${15.5 - v}L8 12`} stroke="currentColor" />
      <path d={`M${13 - v} ${13 - v}L10.5 11`} stroke="currentColor" />
      <path d={`M12 8H${15 - v}`} stroke="currentColor" />
      <path d={`M10.5 5L${13 - v} ${3 + v}`} stroke="currentColor" />
      <path d={`M8 4L8 ${v + 1}`} stroke="currentColor" />
    </svg>
  );
};

const IconElevation16 = ({ v = 0 }: { v?: number }) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 7L15 11L8 15L1 11L8 7Z" fill="currentColor" style={{ opacity: 0.8 }} />
      <path d={`M2 ${v + 6}L8 ${v + 2}.5L14 ${v + 6}L8 ${v + 9}.5L2 ${v + 6}Z`} fill="white" stroke="currentColor" />
    </svg>
  );
};

const IconDistance16 = () => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.5 8H13.5M2.5 8L5 5.5M2.5 8L5 10.5M13.5 8L11 5.5M13.5 8L11 10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

const IconAzimuth16 = () => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.2" strokeDasharray="1.5 1.5"/>
      <path d="M8 8L11.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
    </svg>
  );
};

export default Parameters;
