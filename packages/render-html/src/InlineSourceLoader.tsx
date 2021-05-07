import React, { useEffect } from 'react';
import { SourceLoaderProps } from './internal-types';
import { RenderHTMLSourceInline } from './shared-types';

export type InlineSourceLoaderProps = {
  source: RenderHTMLSourceInline;
} & SourceLoaderProps;

function useInlineSourceLoader({
  source,
  onHTMLLoaded
}: InlineSourceLoaderProps) {
  const html = source.html;
  useEffect(() => {
    html && onHTMLLoaded?.call(null, html);
  }, [html, onHTMLLoaded]);
  return source;
}

export default function InlineSourceLoader(props: InlineSourceLoaderProps) {
  const { ResolvedHtmlRenderer: ChildrenRenderer, tamperDOM } = props;
  const { html } = useInlineSourceLoader(props);
  return React.createElement(ChildrenRenderer, {
    html,
    tamperDOM,
    baseUrl: props.source.baseUrl
  });
}
