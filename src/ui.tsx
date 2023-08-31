import { h, JSX } from "preact";
import useStore from "./store/useStore";
import { useRef, useEffect, useCallback } from "preact/hooks";
import { emit, on } from "@create-figma-plugin/utilities";
import { useWindowResize, render } from "@create-figma-plugin/ui";
import { clamp } from "./utils/math";
import chroma from "chroma-js";
import PreviewEditor from "./ui/Preview/preview";
import ColorInput from "./ui/ColorInput/color-input";
import Menu from "./ui/Menu/menu";

// Constants
import {
  WINDOW_INITIAL_WIDTH,
  WINDOW_INITIAL_HEIGHT,
  WINDOW_MIN_WIDTH,
  WINDOW_MAX_WIDTH,
  WINDOW_MIN_HEIGHT,
  WINDOW_MAX_HEIGHT,
  LIGHT_INITIAL_POSITION,
  LIGHT_INITIAL_BRIGHTNESS,
  TARGET_INITIAL_ELEVATION,
  SHADOW_DEFAULT_COLOR,
  SHADOW_DEFAULT_TYPE,
  BACKGROUND_DEFAULT_COLOR,
} from "./constants";

// Types
import { Light } from "./store/createLight";
import { Target } from "./store/createTarget";
import { Selection } from "./store/createSelection";
import { PluginData } from "./main";

const Plugin = () => {
  const bounds = useRef<any>();
  makePluginResizeable();
  const { light, target, color, setColor, previewBgColor, setPreview, setSelection, setEntireStore } = useStore(
    (state) => ({
      light: state.light,
      target: state.target,
      color: state.color,
      setColor: state.setColor,
      previewBgColor: state.preview.backgroundColor,
      setPreview: state.setPreview,
      setSelection: state.setSelection,
      setEntireStore: state.setEntireStore,
    })
  );

  /**
   * 👂 Listen for changes FROM plugin (main.ts)
   *
   * · See if the selected element has shadows from an earlier sessions and if yes, update the preview with said values
   * · Listen for selection updates and style the target element respectively
   */
  useEffect(() => {
    on("SELECTION_CHANGE", handleSelectionChange);
    on("LOAD_EXISTING_SHADOW_DATA", restorePrevEffectsAndSettings);
  }, []);

  const restorePrevEffectsAndSettings = useCallback((pluginData: PluginData) => {
    if (!pluginData) return;
    const x = pluginData.lightPosition?.x || LIGHT_INITIAL_POSITION.x;
    const y = pluginData.lightPosition?.y || LIGHT_INITIAL_POSITION.y;
    const color = pluginData.shadowColor || SHADOW_DEFAULT_COLOR;
    const type = pluginData.shadowType || SHADOW_DEFAULT_TYPE;
    const brightness = pluginData.brightness || LIGHT_INITIAL_BRIGHTNESS;
    const elevation = pluginData.elevation || TARGET_INITIAL_ELEVATION;

    const lightData: Pick<Light, "x" | "y" | "brightness"> = {
      x,
      y,
      brightness,
    };
    const targetData: Pick<Target, "elevation"> = { elevation };

    setEntireStore({
      color,
      type,
      light: { ...light, ...lightData },
      target: { ...target, ...targetData },
    });

    const restoreWindowSize = {
      width: Math.round(pluginData.previewBounds?.width) || WINDOW_INITIAL_WIDTH,
      height: Math.round(pluginData.previewBounds?.height) || WINDOW_INITIAL_HEIGHT,
    };
    emit("RESIZE_WINDOW", restoreWindowSize);

    // Shadows created in version =<9 don't have the lightPosition property
    if (Object.keys(pluginData).length < 5) {
      emit("SHOW_MESSAGE", `Couldn't restore all previous shadow settings due to a newer version. Sorry!`);
    } else {
      emit("SHOW_MESSAGE", "Restored previous shadow settings.");
    }
  }, []);

  const handleSelectionChange = useCallback((selection: Selection) => {
    setSelection(selection);

    const { prevShadowEffects } = selection;
    if (prevShadowEffects) {
      restorePrevEffectsAndSettings(prevShadowEffects);
    }
  }, []);

  function handleShadowColorChange(newColor: string) {
    setColor(newColor);
  }

  function handleBgColorChange(newColor: string) {
    setPreview({
      backgroundColor: newColor,
    });
  }

  return (
    <PreviewEditor ref={bounds}>
      <ColorInput
        hexColor={previewBgColor}
        onHexColorInput={handleBgColorChange}
        opacity={"100%"}
        type="square"
        style={{ transform: "translate(18px, -2px)" }}
      />
      <ColorInput
        hexColor={color}
        onHexColorInput={handleShadowColorChange}
        opacity={"100%"}
        type="round"
        style={{ transform: "translate(-8px, 0px)" }}
      />
      <Menu bounds={bounds} />
    </PreviewEditor>
  );
};

const makePluginResizeable = () => {
  const onWindowResize = (windowSize: { width: number; height: number }) => {
    emit("RESIZE_WINDOW", windowSize);
  };
  useWindowResize(onWindowResize, {
    minWidth: WINDOW_MIN_WIDTH,
    minHeight: WINDOW_MIN_HEIGHT,
    maxWidth: WINDOW_MAX_WIDTH,
    maxHeight: WINDOW_MAX_HEIGHT,
  });
  return null;
};

export default render(Plugin);
