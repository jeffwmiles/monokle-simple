import { TitleBar } from "@components/foundation/primitives";

import * as S from './Header.styled';

export const Header = ({title}: {title: string}) => {
  return (
    <S.Container>
      <TitleBar type="secondary" title={title} />
    </S.Container>
  );
};
