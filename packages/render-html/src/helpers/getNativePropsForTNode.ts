import { TBlock, TPhrasing, TText } from '@native-html/transient-render-engine';
import { TDefaultRendererProps } from '../shared-types';

/**
 * Extract React Native props for a given {@link TNode}. Native props target
 * either `Text` or `View` elements, with an optional `onPress` prop for
 * interactive elements.
 */
export default function getNativePropsForTNode(
  props: TDefaultRendererProps<TPhrasing | TText | TBlock>
) {
  const { tnode, style, type, nativeProps, onPress } = props;
  const switchProp = type === 'block' ? props.viewProps : props.textProps;
  return {
    ...tnode.getReactNativeProps()?.[type === 'block' ? 'view' : 'text'],
    ...nativeProps,
    ...switchProp,
    onPress,
    style: [style, nativeProps?.style, switchProp.style],
    testID: tnode.tagName || undefined
  };
}
