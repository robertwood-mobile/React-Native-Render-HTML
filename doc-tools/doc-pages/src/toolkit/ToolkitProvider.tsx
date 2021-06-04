import React, { PropsWithChildren, useMemo } from 'react';
import acronymsIndex from '../acronymsIndex';
import figuresIndex from '../figuresIndex';
import pagesSpecs from '../pagesSpecs';
import {
  UIToolkit,
  UIToolkitConfig,
  UIToolkitRefs,
  StatementDeclaration
} from './toolkit-types';
import toolkitContext from './toolkitContext';
import makeSnippet from './makeSnippet';
import defaultImports from './defaultImports';

function buildRefs(Builder: UIToolkitConfig['RefBuilder']): UIToolkitRefs {
  return {
    RefCssProperty: ({ name }) => (
      <Builder type="css-prop" name={name} url={`https://mdn.io/${name}`} />
    ),
    RefESSymbol: ({ name }) => (
      <Builder type="es-symbol" name={name} url={`https://mdn.io/${name}`} />
    ),
    // TODO enhance this by parsing this page and generating a linkmap in a
    // buildstep: https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes
    RefHtmlAttr: ({ name }) => (
      <Builder
        type="html-attr"
        name={name}
        url={`https://mdn.io/attribute/${name}`}
      />
    ),
    RefHtmlElement: ({ name }) => (
      <Builder
        type="html-el"
        name={`<${name}>`}
        url={`https://mdn.io/${name}`}
      />
    ),
    RefLibrary: ({ name, url }) => (
      <Builder type="library" name={name} url={url} />
    ),
    RefRNSymbol: ({ name }) => (
      <Builder
        type="rn-symbol"
        name={name}
        url={`https://reactnative.dev/docs/${name}`}
      />
    )
  };
}

export default function ToolkitProvider({
  children,
  config
}: PropsWithChildren<{ config: UIToolkitConfig }>) {
  const {
    RefBuilder,
    RenderHtmlCard,
    RefDoc,
    Acronym,
    SvgFigure,
    RefRenderHtmlProp,
    ...other
  } = config;
  const uitoolkit = useMemo<UIToolkit>(
    () => ({
      ...other,
      ...buildRefs(RefBuilder),
      RenderHtmlCard({
        title,
        caption,
        props,
        config: renderConfig,
        preferHtmlSrc = false
      }) {
        const conf = {
          exprSrcMap: {},
          fnSrcMap: {},
          importStatements: [] as StatementDeclaration[],
          ...renderConfig
        };
        return (
          <RenderHtmlCard
            title={title}
            caption={caption}
            snippet={makeSnippet(props, conf, false)}
            expoSource={makeSnippet(props, conf, true)}
            preferHtmlSrc={preferHtmlSrc}
            props={props}
            extraneousDeps={conf.importStatements
              .map((v) => v.package)
              .filter((pck) => !(pck in defaultImports))}
          />
        );
      },
      RefDoc({ target, children }) {
        if (!(target in pagesSpecs)) {
          throw new Error(`Target "${target}" is not a registered page.`);
        }
        return <RefDoc target={pagesSpecs[target]} children={children} />;
      },
      Acronym({ name }) {
        const acronym = acronymsIndex[name];
        return <Acronym {...acronym} />;
      },
      SvgFigure({ asset }) {
        const assetSpecs = figuresIndex[asset];
        return <SvgFigure asset={asset} description={assetSpecs.description} />;
      },
      RefRenderHtmlProp({ name }) {
        const fragment = name.toLowerCase();
        const docRelativePath = 'api/interfaces/renderhtmlprops';
        const pageAbsoluteUrl = `/docs/${docRelativePath}#${fragment}`;
        return (
          <RefRenderHtmlProp
            name={name}
            pageAbsoluteUrl={pageAbsoluteUrl}
            docRelativePath={docRelativePath}
            fragment={fragment}
          />
        );
      }
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...Object.values(other), RefBuilder]
  );
  return (
    <toolkitContext.Provider value={uitoolkit}>
      {children}
    </toolkitContext.Provider>
  );
}
