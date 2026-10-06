import {useState} from 'react';

import {Button} from 'antd';
import {PlusOutlined} from '@ant-design/icons';

import {canExpand, ObjectFieldTemplateProps, RJSFSchema} from '@rjsf/utils';

import * as S from './FormEditor.styled';

const FormObjectFieldTemplate = (props: ObjectFieldTemplateProps<any, RJSFSchema, any>) => {
  const {title, properties, uiSchema, schema, formData, onAddProperty, disabled, readonly} = props;
  const [isExpanded, toggleExpand] = useState<boolean>(true);
  const opacity = (10 - (uiSchema?.level ?? 0)) / 10;

  return (
    <>
      <S.TitleWrapper onClick={() => toggleExpand(prev => !prev)} opacityStep={opacity || 1}>
        {isExpanded ? <S.ArrowIconExpanded /> : <S.ArrowIconClosed />}

        {title ? (
          <S.TitleText isBold={uiSchema?.level === 0}>{title}</S.TitleText>
        ) : (
          <S.ElementText>element</S.ElementText>
        )}
      </S.TitleWrapper>
      {isExpanded && (
        <>
          {properties.map(element => (
            <S.PropertyContainer key={element.name} hidden={element.hidden}>{element.content}</S.PropertyContainer>
          ))}
          {canExpand(schema, uiSchema, formData) && (
            <Button icon={<PlusOutlined />} disabled={disabled || readonly} style={{marginTop: properties.length === 0 ? '1rem' : '0'}} onClick={onAddProperty}>
              Add Item
            </Button>
          )}
        </>
      )}
    </>
  );
};

export default FormObjectFieldTemplate;
