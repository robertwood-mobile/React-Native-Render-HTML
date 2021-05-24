import React, { PropsWithChildren, ReactElement, useMemo } from 'react';
import PropTypes from 'prop-types';
import RenderersPropsProvider from './context/RenderersPropsProvider';
import SharedPropsProvider from './context/SharedPropsProvider';
import TChildrenRenderersContext from './context/TChildrenRendererContext';
import { RenderHTMLConfig, RenderersPropsBase } from './shared-types';
import TNodeChildrenRenderer from './TNodeChildrenRenderer';
import TChildrenRenderer from './TChildrenRenderer';
import sourceLoaderContext from './context/sourceLoaderContext';
import RenderRegistryProvider from './context/RenderRegistryProvider';
import { useAmbientTRenderEngine } from './TRenderEngineProvider';

const childrenRendererContext = {
  TChildrenRenderer,
  TNodeChildrenRenderer
};

export type RenderHTMLConfigPropTypes = Record<keyof RenderHTMLConfig, any>;

export const renderHTMLConfigPropTypes: RenderHTMLConfigPropTypes = {
  defaultTextProps: PropTypes.object,
  defaultViewProps: PropTypes.object,
  enableExperimentalMarginCollapsing: PropTypes.bool,
  remoteErrorView: PropTypes.func,
  remoteLoadingView: PropTypes.func,
  debug: PropTypes.bool,
  computeEmbeddedMaxWidth: PropTypes.func,
  renderersProps: PropTypes.object,
  WebView: PropTypes.any,
  GenericPressable: PropTypes.any,
  defaultWebViewProps: PropTypes.object,
  pressableHightlightColor: PropTypes.string,
  customListStyleSpecs: PropTypes.object,
  renderers: PropTypes.object
};

export default function RenderHTMLConfigProvider<
  P extends RenderersPropsBase = RenderersPropsBase
>(props: PropsWithChildren<RenderHTMLConfig<P>>): ReactElement {
  const {
    remoteErrorView,
    remoteLoadingView,
    renderersProps,
    debug,
    children,
    renderers,
    ...sharedProps
  } = props;
  const engine = useAmbientTRenderEngine();
  const sourceLoaderConfig = useMemo(
    () => ({
      remoteErrorView,
      remoteLoadingView
    }),
    [remoteErrorView, remoteLoadingView]
  );
  return (
    <RenderRegistryProvider
      renderers={renderers}
      elementModels={engine.getHTMLElementsModels()}>
      <SharedPropsProvider {...sharedProps}>
        <RenderersPropsProvider renderersProps={renderersProps}>
          <TChildrenRenderersContext.Provider value={childrenRendererContext}>
            <sourceLoaderContext.Provider value={sourceLoaderConfig}>
              {children}
            </sourceLoaderContext.Provider>
          </TChildrenRenderersContext.Provider>
        </RenderersPropsProvider>
      </SharedPropsProvider>
    </RenderRegistryProvider>
  );
}

RenderHTMLConfigProvider.propTypes = renderHTMLConfigPropTypes;
