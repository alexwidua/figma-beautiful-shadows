import { getAbsolutePosition } from '@create-figma-plugin/utilities'

export function searchForEnclosingNode(
	node: PageNode | SceneNode,
	ref: SceneNode
): any {
	if (!node || !ref) return
	if ('children' in node) {
		// if frame, assume that frame background is the background color
		if (
			node.type === 'FRAME' &&
			node.children?.find((node) => node.id === ref.id)
		) {
			return node
		}
		// skip instances because instance nodes don't have own color fills
		else if (node.type !== 'INSTANCE') {
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
						return searchForEnclosingNode(child, ref)
					} else {
						return child
					}
				} else searchForEnclosingNode(child, ref)
			}
		}
	}
}

export function isSymbol(property: any) {
	return typeof property === 'symbol'
}
