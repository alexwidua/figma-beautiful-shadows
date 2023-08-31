import useStore from "../../../../store/useStore";
import { resizeAndRetainAspectRatio } from "../../../../utils/math";
import { SelectionState } from "../../../../utils/selection";

// Constants
export const TARGET_WIDTH = 100;
export const TARGET_HEIGHT = 100;

const useSelectionStyle = () => {
  const {
    state,
    width,
    height,
    cornerRadius,
  }: {
    state: SelectionState;
    width: number;
    height: number;
    cornerRadius: number;
  } = useStore((state) => ({
    state: state.selection.state,
    width: state.selection.width,
    height: state.selection.height,
    cornerRadius: state.selection.cornerRadius,
  }));
  const isSelected = state === "VALID";
  const {
    width: elementWidth,
    height: elementHeight,
    ratio,
  } = resizeAndRetainAspectRatio(width, height, TARGET_WIDTH, TARGET_HEIGHT);
  const selectionStyles = {
    border: isSelected ? "1px solid var(--color-blue)" : "0px solid rgba(0,0,0,0.0)",
    width: elementWidth || TARGET_WIDTH,
    height: elementHeight || TARGET_HEIGHT,
    minWidth: 32,
    minHeight: 32,
    borderRadius: cornerRadius * ratio || 6,
  };
  return selectionStyles;
};

export default useSelectionStyle;
