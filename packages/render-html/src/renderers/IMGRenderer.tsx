import React from 'react';
import { TBlock } from '@native-html/transient-render-engine';
import IMGElement, { IMGElementProps } from '../elements/IMGElement';
import { InternalBlockRenderer } from '../render/render-types';
import { useComputeMaxWidthForTag } from '../context/SharedPropsProvider';
import { ImageStyle } from 'react-native';
import { InternalRendererProps } from '../shared-types';
import useNormalizedUrl from '../hooks/useNormalizedUrl';
import { useRendererProps } from '../context/RenderersPropsProvider';
import useContentWidth from '../hooks/useContentWidth';

/**
 * A hook to produce props consumable by {@link IMGElement} component
 * from custom renderer props.
 */
export function useIMGElementProps(
  props: InternalRendererProps<TBlock>
): IMGElementProps {
  const { style, tnode, onPress } = props;
  const contentWidth = useContentWidth();
  const { initialDimensions, enableExperimentalPercentWidth } =
    useRendererProps('img');
  const computeImagesMaxWidth = useComputeMaxWidthForTag('img');
  const src = tnode.attributes.src || '';
  return {
    contentWidth,
    computeMaxWidth: computeImagesMaxWidth,
    enableExperimentalPercentWidth,
    initialDimensions,
    onPress,
    alt: tnode.attributes.alt,
    testID: 'img',
    altColor: tnode.styles.nativeTextFlow.color as string,
    source: { uri: useNormalizedUrl(src) },
    style: style as ImageStyle,
    width: tnode.attributes.width,
    height: tnode.attributes.height,
    objectFit: tnode.styles.webBlockRet.objectFit
  };
}

const IMGRenderer: InternalBlockRenderer = (props) => {
  return React.createElement(IMGElement, useIMGElementProps(props));
};

export default IMGRenderer;
