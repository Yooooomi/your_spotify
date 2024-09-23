import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Text from "../../../components/Text";
import { selectUser } from "../../../services/redux/modules/user/selector";
import { getSpotifyLogUrl, Cookies } from "../../../services/tools";
import { Checkbox } from "@mui/material";
import s from "../index.module.css";

export default function Login() {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [rememberMe, setRememberMe] = useState(Cookies.get('rememberMe') === 'true'); // Initialize state based on cookie

  useEffect(() => {
    if (user) {
      navigate("/");
    } else if (Cookies.get('rememberMe') === 'true') {
      window.location.href = getSpotifyLogUrl();
    }
  }, [navigate, user]);

  const handleRememberMeClick = () => {
    const newRememberMe = !rememberMe;
    setRememberMe(newRememberMe);
    if (newRememberMe) {
      Cookies.set('rememberMe', 'true');
    } else {
      Cookies.remove('rememberMe');
    }
  };

  return (
    <div className={s.root}>
      <Text element="h1" className={s.title}>
        Login
      </Text>
      <Text className={s.welcome}>
        To access your personal dashboard, please login with your account
      </Text>
      <div>
        <a className={s.link} href={getSpotifyLogUrl()}>
          Login
        </a>
      </div>
      <div>
        <button
          type="button"
          key="Remember me"
          className={s.rememberMe}
          onClick={handleRememberMeClick}>
          <Text>Remember me</Text>
          <Checkbox
            checked={rememberMe}
            disabled={false}
            disableRipple
            disableTouchRipple
            disableFocusRipple
          />
        </button>
      </div>
    </div>
  );
}