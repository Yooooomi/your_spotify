import { useMediaQuery } from '@material-ui/core';
import { moreThanMobile, moreThanTablet } from '../../services/theme';

function TextScreenSize({ phone = '', plusTablet = '', plusDesktop = '' }) {
  const morePhone = useMediaQuery(moreThanMobile);
  const moreTablet = useMediaQuery(moreThanTablet);

  let text = phone;
  if (morePhone) {
    text += plusTablet;
  }
  if (moreTablet) {
    text += plusDesktop;
  }

  return text;
}

export default TextScreenSize;
