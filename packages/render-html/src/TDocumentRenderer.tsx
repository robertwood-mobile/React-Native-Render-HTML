import React, { memo, useEffect, useMemo } from 'react';
import { TDocument } from '@native-html/transient-render-engine';
import { DocumentMetadata, RenderHTMLSourceProps } from './shared-types';
import DocumentMetadataProvider from './context/DocumentMetadataProvider';
import { defaultMarkers } from './helpers/getMarkersFromTNode';
import TNodeRenderer from './TNodeRenderer';

const TDocumentRenderer = memo(
  ({
    tdoc,
    baseUrl,
    onDocumentMetadataLoaded
  }: {
    tdoc: TDocument;
    baseUrl?: string;
    onDocumentMetadataLoaded?: RenderHTMLSourceProps['onDocumentMetadataLoaded'];
  }) => {
    const metadata: DocumentMetadata = useMemo(() => {
      const {
        baseHref,
        baseTarget,
        lang,
        links,
        meta,
        title,
        dir
      } = tdoc.context;
      return {
        baseTarget,
        baseUrl: baseUrl ?? baseHref,
        lang,
        dir,
        links,
        meta,
        title
      };
    }, [tdoc.context, baseUrl]);
    useEffect(() => {
      onDocumentMetadataLoaded?.call(null, metadata);
    }, [onDocumentMetadataLoaded, metadata]);
    const parentMarkers = useMemo(
      () => ({
        ...defaultMarkers,
        direction: metadata.dir,
        lang: metadata.lang
      }),
      [metadata.dir, metadata.lang]
    );
    return (
      <DocumentMetadataProvider value={metadata}>
        <TNodeRenderer parentMarkers={parentMarkers} tnode={tdoc} />
      </DocumentMetadataProvider>
    );
  }
);
export default TDocumentRenderer;
