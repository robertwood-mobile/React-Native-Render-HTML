import React from 'react';
import { defaultHTMLElementModels } from '@native-html/transient-render-engine';
import HTMLListElement, {
  HTMLListElementProps
} from '../elements/HTMLListElement';
import { DefaultBlockRenderer } from '../render/render-types';
import { DefaultTagRendererProps } from '../shared-types';
import { TBlock } from '@native-html/transient-render-engine';
import { SupportedListStyleType } from '../elements/usePrefixRenderer';

function getListStyleTypeFromNestLevel(
  nestLevel: number
): SupportedListStyleType {
  switch (nestLevel % 3) {
    case 0:
      return 'disc';
    case 1:
      return 'circle';
    default:
      return 'square';
  }
}

export function useUnorderedListRendererProps(
  props: DefaultTagRendererProps<TBlock>
): HTMLListElementProps {
  return {
    ...props,
    listType: 'ul',
    getListStyleTypeFromNestLevel
  };
}

const UnorderedListRenderer: DefaultBlockRenderer = (props) => {
  return React.createElement(
    HTMLListElement,
    useUnorderedListRendererProps(props)
  );
};

UnorderedListRenderer.model = defaultHTMLElementModels.ul;

export default UnorderedListRenderer;
