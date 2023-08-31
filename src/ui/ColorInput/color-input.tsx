/**
 * @file Forked from https://github.com/yuanqing/create-figma-plugin/blob/main/packages/ui/src/components/textbox/textbox-color/textbox-color.tsx
 */
import { h, JSX } from "preact";
import { useCallback } from "preact/hooks";
import { createClassName } from "@create-figma-plugin/ui";
import { normalizeUserInputColor } from "./normalize-hex-color";
import { MIXED_STRING } from "@create-figma-plugin/utilities";
import styles from "./color-input.css";

const EMPTY_STRING = "";

export default function ColorInput<Name extends string, HexColorName extends string, OpacityName extends string>({
  disabled = false,
  name,
  hexColor,
  hasMixedColors,
  onHexColorInput,
  type = "round",
  ...rest
}: any): JSX.Element {
  const handleHexColorSelectorInput = useCallback(function (event: JSX.TargetedEvent<HTMLInputElement>): void {
    const hexColor = event.currentTarget.value.slice(1).toUpperCase();
    onHexColorInput(hexColor);
  }, []);

  const normalizedHexColor =
    hexColor === EMPTY_STRING || hexColor === MIXED_STRING ? "FFFFFF" : normalizeUserInputColor(hexColor);

  return (
    <div
      class={createClassName([
        styles.colorSwatch,
        disabled === true ? styles.disabled : null,
        type === "round" ? styles.round : styles.square,
      ])}
      {...rest}
    >
      <input
        class={styles.hexColorSelector}
        disabled={disabled}
        onInput={handleHexColorSelectorInput}
        tabIndex={-1}
        type="color"
        value={`#${normalizedHexColor}`}
      />
      <div
        class={styles.color}
        style={{
          background: hasMixedColors
            ? `linear-gradient(90deg, #FE1086 0%, #FFCE26 31.77%, #56ED5D 68.23%, #006CF8 100%)`
            : `#${normalizedHexColor}`,
        }}
      />
    </div>
  );
}
