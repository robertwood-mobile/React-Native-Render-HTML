import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Text } from 'react-native';
import { AllHtmlEntities } from 'html-entities';
import { RE, TEXT_TAG_NAMES, PRE_TAG_NAMES } from './HTMLUtils';
import { _constructStyles } from './HTMLStyles';

export default class HTMLTextNode extends PureComponent {

    static propTypes = {
        children: PropTypes.string.isRequired,
        tagName: PropTypes.string.isRequired,
        htmlAttribs: PropTypes.object
    }

    /**
    * Formats text the same way a browser would be removing whitespace
    * @param str: the string to remove chars from
    * @param nodeIndex: the index of the node in its parent
    * @param parentTagName: the name of the parent node
    * @return the new string
    */
    static removeWhitespaceListHTML (str, nodeIndex, parentTagName) {
        if (PRE_TAG_NAMES.has(parentTagName)) {
            return str;
        } else {
            const htmlStr = str
                .replace(RE.MULT_NEWLINE, '\n')
                .replace(RE.MULT_WHITESPACE, ' ')
                .replace(RE.PREFIX_NEWLINE, '')
                .replace(RE.SUFFIX_NEWLINE, '');

            if (!TEXT_TAG_NAMES.has(parentTagName) && htmlStr.trim().length === 0) {
                return '';
            } else {
                if (nodeIndex === 0) {
                    return htmlStr.replace(RE.PREFIX_WHITESPACE, '');
                } else {
                    return htmlStr;
                }
            }
        }
    }

    render () {
        const { tagName, htmlAttribs } = this.props;
        const style = _constructStyles({
            tagName,
            htmlAttribs,
            passProps: {},
            htmlStyles: {},
            styleSet: 'TEXT'
        });
        return (
            <Text {...this.props} style={style}>
                { AllHtmlEntities.decode(this.props.children) }
            </Text>
        );
    }
}
