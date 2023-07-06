export type SelectionState =
  | "MULTIPLE"
  | "VALID"
  | "INVALID"
  | "HAS_COMPONENT_CHILD"
  | "IS_WITHIN_COMPONENT"
  | "IS_WITHIN_INSTANCE"
  | "EMPTY";

/**
 * Checks if current selection is empty, multiple, valid or updateable.
 * @param selection - Current page selection
 * @returns {SelectionState}
 */
export function validateSelection(
  selection: ReadonlyArray<SceneNode>,
  validNodeTypes: Array<NodeType>
): SelectionState {
  if (selection.length) {
    if (selection.length > 1) {
      return "MULTIPLE";
    }
    const node: SceneNode = selection[0];
    if (validNodeTypes.indexOf(node.type) >= 0) {
      if (isWithinNodeType(node, "COMPONENT")) {
        //
        // TODO: Remove these guards?
        // When trying to derive the background color of the shadow node, (deeply) nested components
        // caused a lot of issues hence I disabled shadows for components/nested components altogether.
        // This was a poor decision though as it is very unexpected for the user.
        // In a future refactor, I should either refactor the deriveBgColor or remove it altogether.
        //
        // return 'IS_WITHIN_COMPONENT'
        return "VALID";
      } else if (node.type === "GROUP" && hasComponentChild(node)) {
        // return "HAS_COMPONENT_CHILD";
        return "VALID";
      } else {
        return "VALID";
      }
    } else {
      return "INVALID";
    }
  } else {
    return "EMPTY";
  }
}

/**
 * Check if node is parented under certain node type.
 * @param node
 * @param type
 * @returns
 */
export function isWithinNodeType(node: SceneNode, type: NodeType): boolean {
  const parent = node.parent;
  if (parent === null || parent.type === "DOCUMENT" || parent.type === "PAGE") {
    return false;
  }
  if (parent.type === type) {
    return true;
  }
  return isWithinNodeType(parent, type);
}

/**
 * Search group for component child nodes, that would throw a re-componentizing error.
 * @param selection
 * @returns - truthy value if component child has been found
 */
export function hasComponentChild(selection: SceneNode): boolean | undefined {
  let hasComponent;
  if (selection.type === "COMPONENT") {
    return true;
  } else if (selection.type !== "GROUP") {
    return false;
  }
  selection.children.some((child) => (hasComponent = hasComponentChild(child)));
  return hasComponent;
}
