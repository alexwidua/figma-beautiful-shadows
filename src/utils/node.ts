import { getAbsolutePosition } from '@create-figma-plugin/utilities'

export function searchForIntersectingNode(
	node: PageNode | SceneNode,
	ref: SceneNode
): any {
	if (!node || !ref) return

	if ('children' in node) {
		// skip instances because they inherit their color props from
		if (node.type !== 'INSTANCE') {
			for (const child of node.children) {
				const childAbs = getAbsolutePosition(child)
				const refAbs = getAbsolutePosition(ref)
				if (
					child.id !== ref.id &&
					childAbs.x <= refAbs.x &&
					childAbs.y <= refAbs.y &&
					childAbs.x + child.width >= refAbs.x + ref.width &&
					childAbs.y + child.height >= refAbs.y + ref.height
				) {
					if (child.type === 'FRAME' || child.type === 'GROUP') {
						return searchForIntersectingNode(child, ref)
					} else {
						return child
					}
				} else searchForIntersectingNode(child, ref)
			}
		}
	}
}
