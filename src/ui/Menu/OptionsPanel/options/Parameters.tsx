import { h, JSX } from "preact";
import useStore from "../../../../store/useStore";
import { useState, useEffect } from "preact/hooks";
import { percent, clamp, deriveXYFromAngle, degreeToRadian } from "../../../../utils/math";
import { TextboxNumeric } from "@create-figma-plugin/ui";
import styles from "./parameters.css";

// Types
import { Preview } from "../../../../store/createPreview";
import { Light } from "../../../../store/createLight";
import { Target } from "../../../../store/createTarget";

const Parameters = () => {
  /**
   * 💾 Store
   */
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

  /**
   * 📐 Azimuth
   */
  const [tempAzimuth, setTempAzimuth] = useState<string>("0°");
  const validateAzimuth = (value: null | number) => {
    if (value === null) return null;
    const valid = value >= 0 && value <= 360;
    if (valid) {
      const { dx, dy } = deriveXYFromAngle(value, distance);
      const adjustedX = previewBounds.width / 2 - lightSize / 2 - dx;
      const adjustedY = previewBounds.height / 2 - lightSize / 2 - dy;
      const data: Pick<Light, "x" | "y"> = { x: adjustedX, y: adjustedY };
      setLight(data);
    }
    return valid;
  };
  useEffect(() => {
    setTempAzimuth(Math.round(azimuth) + "°");
  }, [azimuth]);

  /**
   * 📏 Distance
   */
  const [tempDistance, setTempDistance] = useState<string>("0");
  const validateDistance = (value: null | number) => {
    if (value === null) return null;
    // TODO: Bounds math still not perfect...
    const { width, height } = previewBounds;
    const boundsX = width / 2;
    const boundsY = height / 2;
    const delta = degreeToRadian(azimuth);
    const cos = Math.cos(delta); //x
    const sin = Math.sin(delta); //u
    const bounds = Math.sqrt(Math.abs(boundsX * boundsX * cos) + Math.abs(boundsY * boundsY * sin)) - lightSize / 2;

    const valid = value >= 0 && value <= bounds;
    const data: Pick<Preview, "distance"> = { distance: valid ? value : bounds };
    setPreview(data);
    return valid;
  };

  useEffect(() => {
    setTempDistance(Math.round(distance).toString());
  }, [distance]);

  /**
   * ☀️ Brightness
   */
  const [tempBrightness, setTempBrightness] = useState<string>("0");
  const validateBrightness = (value: null | number) => {
    if (value === null) return null;
    const valid = value >= 0 && value <= 100;
    if (valid) {
      const data: Pick<Light, "brightness"> = { brightness: value / 100 }; // normalize value back to 0..1
      setLight(data);
    }
    return valid;
  };
  useEffect(() => {
    setTempBrightness(percent(brightness) + "%");
  }, [brightness]);

  /**
   * ⛰️ Elevation
   */
  const [tempElevation, setTempElevation] = useState<string>("0");
  const validateElevation = (value: null | number) => {
    if (value === null) return null;
    const valid = value >= 0 && value <= 100;
    if (valid) {
      const data: Pick<Target, "elevation"> = { elevation: value / 100 }; // normalize value back to 0..1
      setTarget(data);
    }
    return valid;
  };
  useEffect(() => {
    setTempElevation(clamp(percent(elevation), 0, 100) + "%");
  }, [elevation]);

  return (
    <div className={styles.parameters}>
      <TextboxNumeric
        name={"azimuth"}
        icon={"A"}
        onInput={(e: JSX.TargetedEvent<HTMLInputElement>) => setTempAzimuth(e.currentTarget.value)}
        value={tempAzimuth}
        suffix={"°"}
        validateOnBlur={validateAzimuth}
        noBorder
      />
      <TextboxNumeric
        name={"distance"}
        icon={"D"}
        onInput={(e: JSX.TargetedEvent<HTMLInputElement>) => setTempDistance(e.currentTarget.value)}
        value={tempDistance}
        validateOnBlur={validateDistance}
        noBorder
      />
      <TextboxNumeric
        name={"brightness"}
        icon={<IconBrightness16 v={1 - brightness} />}
        onInput={(e: JSX.TargetedEvent<HTMLInputElement>) => setTempBrightness(e.currentTarget.value)}
        value={tempBrightness}
        suffix={"%"}
        validateOnBlur={validateBrightness}
        noBorder
      />
      <TextboxNumeric
        name={"elevation"}
        icon={<IconElevation16 v={3 - Math.round(elevation * 3)} />}
        onInput={(e: JSX.TargetedEvent<HTMLInputElement>) => setTempElevation(e.currentTarget.value)}
        value={tempElevation}
        suffix={"%"}
        validateOnBlur={validateElevation}
        noBorder
      />
    </div>
  );
};

/**
 * Icons
 */
const IconBrightness16 = ({ v = 0 }) => {
  const inc = Math.cos(v);
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

const IconElevation16 = ({ v = 0 }) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 7L15 11L8 15L1 11L8 7Z" fill="currentColor" style={{ opacity: 0.8 }} />
      <path d={`M2 ${v + 6}L8 ${v + 2}.5L14 ${v + 6}L8 ${v + 9}.5L2 ${v + 6}Z`} fill="white" stroke="currentColor" />
    </svg>
  );
};

export default Parameters;
