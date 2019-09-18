import React from 'react';
import PropTypes from 'prop-types';

const identity = value => value;

const getAttributes = ({ attributes, theme, renderAttribute, nodeXpath }) => {
    let attributeList = [];

    for (const key in attributes) {
      const value = attributes[key];
      const attributeXpath = `${nodeXpath}/@${key}`;
      const attributeWrapper = renderAttribute
        ? attrElement => renderAttribute({ xpath: attributeXpath, key, value, theme }, attrElement)
        : identity;

      attributeList.push(attributeWrapper(
        <span key={`attr-${key}[${value}]`}>
          <span style={{ color: theme.attributeKeyColor }}>{` ${key}`}</span>
          <span style={{ color: theme.separatorColor }}>{"="}</span>
          <span style={{ color: theme.attributeValueColor }}>{`"${value}"`}</span>
        </span>
      ));
    }


    return attributeList;
}

const Attributes = (props) => {
  const attrArr = getAttributes(props)

  return <span>{attrArr}</span>
}

Attributes.propTypes = {
    attributes: PropTypes.object,
    renderAttribute: PropTypes.func,
    theme: PropTypes.object.isRequired,
    nodeXpath: PropTypes.string,
};


export default Attributes;
