import React from 'react';
import PropTypes from 'prop-types';

import Attributes from './attributes';
import CdataElement from './cdata-el';
import CommentElement from './comment-el';
import InstructionElement from './instruction-el';
import TextElement from './text-el';

function getIndentationString(size) {
    return new Array(size + 1).join(" ");
}

function isTextElement(elements) {
    return elements.length === 1 && elements[0].type === "text";
}

const Element = ({ name, elements, attributes, theme, indentation, indentSize, renderAttribute, renderElement, parentXpath }) => {
    return (
        <div style={{ whiteSpace: 'pre' }}>
            <span style={{ color: theme.separatorColor }}>{`${indentation}<`}</span>
            <span style={{ color: theme.tagColor }}>{name}</span>
            <Attributes attributes={attributes} theme={theme} renderAttribute={renderAttribute} nodeXpath={parentXpath} />
            <span style={{ color: theme.separatorColor }}>{(elements ? '>' : '/>')}</span>
            {elements && <Elements elements={elements} theme={theme} indentation={indentation + getIndentationString(indentSize)} indentSize={indentSize} renderAttribute={renderAttribute} renderElement={renderElement} parentXPath={parentXpath} />}
            {elements && <span style={{ color: theme.separatorColor }}>{`${isTextElement(elements) ? "" : indentation}</`}</span>}
            {elements && <span style={{ color: theme.tagColor }}>{name}</span>}
            {elements && <span style={{ color: theme.separatorColor }}>{">"}</span>}
        </div>
    );
}

Element.propTypes = {
    name: PropTypes.string.isRequired,
    elements: PropTypes.arrayOf(PropTypes.object),
    attributes: PropTypes.object,
    theme: PropTypes.object.isRequired,
    indentation: PropTypes.string.isRequired,
    indentSize: PropTypes.number.isRequired,
    renderAttribute: PropTypes.func,
    xpath: PropTypes.string.isRequired,
}

const identity = value => value;

const getElement = (theme, indentation, indentSize, renderAttribute, renderElement, parentXpath, xpath) => (element, index) => {
    switch (element.type) {
        case "text":
            return <TextElement key={`el-${index}`} text={element.text} theme={theme} xpath={xpath} />;
        case "element":
            return <Element key={`el-${index}`} name={element.name} elements={element.elements} attributes={element.attributes} theme={theme} indentation={indentation} indentSize={indentSize} renderElement={renderElement} renderAttribute={renderAttribute} parentXpath={parentXpath} />
        case "comment":
            return <CommentElement key={`el-${index}`} comment={element.comment} theme={theme} indentation={indentation} xpath={xpath} />;
        case "cdata":
            return <CdataElement key={`el-${index}`} cdata={element.cdata} theme={theme} indentation={indentation} xpath={xpath} />;
        case "instruction":
            return <InstructionElement key={`el-${index}`} instruction={element.instruction} name={element.name} theme={theme} indentation={indentation} xpath={xpath} />;
        default:
            return null;
    }
}

const getRelativeXpath = element => {
  switch (element.type) {
      case "text":
          return '/text()';
      case "element":
          return '/node()';
      case "comment":
          return '/comment()';
      case "cdata":
          return '/text()';
      case "instruction":
          return '/processing-instruction()';
      default:
          return '/node()';
    }
}

const getElements = ({ elements, theme, indentation, indentSize, renderAttribute, renderElement, parentXPath }) => {
    const xpathIndex = {}
    return elements.map((element, index) => {
      const { name } = element
      if (xpathIndex[name]) {
        xpathIndex[name] += 1
      } else {
        xpathIndex[name] = 1
      }
      const parentXpath = name ? `${parentXPath}/${name}[${xpathIndex[name]}]` : parentXPath
      const xpath = `${parentXpath}${getRelativeXpath(element)}`
      const elementWrapper = renderElement
          ? el => renderElement({ indentation, indentSize, theme, element, xpath }, el)
          : identity;

      return elementWrapper(getElement(theme, indentation, indentSize, renderAttribute, renderElement, parentXpath, xpath)(element, index))
    })
}

const Elements = props => {
  const elementsArr = getElements(props)

  return <span>{elementsArr}</span>
}

Elements.propTypes = {
    elements: PropTypes.arrayOf(PropTypes.object),
    theme: PropTypes.object.isRequired,
    indentation: PropTypes.string.isRequired,
    indentSize: PropTypes.number.isRequired,
    renderElement: PropTypes.function,
    parentXPath: PropTypes.string.isRequired,
}

export default Elements;
