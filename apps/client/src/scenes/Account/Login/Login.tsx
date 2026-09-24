import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { Checkbox } from "@mui/material";
import clsx from "clsx";
import Text from "../../../components/Text";
import { selectUser } from "../../../services/redux/modules/user/selector";
import { getSpotifyLogUrl } from "../../../services/tools";
import s from "../index.module.css";
import { LocalStorage, REMEMBER_ME_KEY } from "../../../services/storage";
import { useNavigate } from "../../../services/hooks/useNavigate";

function formatDuration(seconds: number) {
  const minutes = Math.max(1, Math.ceil(seconds / 60));
  if (minutes < 60) {
    return `${minutes} minute${minutes > 1 ? "s" : ""}`;
  }
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest > 0
    ? `${hours}h${rest.toString().padStart(2, "0")}`
    : `${hours}h`;
}

function getLoginErrorMessage(error: string, retryAfter: string | null) {
  switch (error) {
    case "not_registered":
      return "Your Spotify account is not allowed to use this instance. Ask the administrator to add the email of your Spotify account to the users of the Spotify app, then try again.";
    case "rate_limited": {
      const seconds = Number(retryAfter);
      return Number.isFinite(seconds) && seconds > 0
        ? `Spotify is temporarily limiting requests from this instance. Please try again in about ${formatDuration(seconds)}.`
        : "Spotify is temporarily limiting requests from this instance. Please try again later.";
    }
    case "too_many_attempts": {
      const seconds = Math.max(1, Number(retryAfter) || 60);
      return `Too many login attempts. Please try again in ${seconds} second${seconds > 1 ? "s" : ""}.`;
    }
    default:
      return "Logging in with Spotify failed. Please try again later.";
  }
}

export default function Login() {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [searchParams] = useSearchParams();
  const loginError = searchParams.get("error");
  const [rememberMe, setRememberMe] = useState(
    LocalStorage.get(REMEMBER_ME_KEY) === "true",
  );

  useEffect(() => {
    if (user) {
      navigate("/");
    } else if (!loginError && LocalStorage.get(REMEMBER_ME_KEY) === "true") {
      // Not after a failed login: it would immediately fail again, forever
      window.location.href = getSpotifyLogUrl();
    }
  }, [navigate, user, loginError]);

  const handleRememberMeClick = async () => {
    const newRememberMe = !rememberMe;
    setRememberMe(newRememberMe);
    if (newRememberMe) {
      LocalStorage.set(REMEMBER_ME_KEY, "true");
    } else {
      LocalStorage.delete(REMEMBER_ME_KEY);
    }
  };

  return (
    <div className={s.root}>
      <Text size="pagetitle" element="h1" className={s.title}>
        Login
      </Text>
      <Text size="big" className={s.welcome}>
        To access your personal dashboard, please login with your account
      </Text>
      {loginError && (
        <div role="alert" className={s.error}>
          <Text size="normal">
            {getLoginErrorMessage(loginError, searchParams.get("retry_after"))}
          </Text>
        </div>
      )}
      <div>
        <a className={s.link} href={getSpotifyLogUrl()}>
          Login
        </a>
      </div>
      <div>
        <button
          type="button"
          className={clsx("no-button", s.rememberMe)}
          onClick={handleRememberMeClick}>
          <Checkbox
            checked={rememberMe}
            disableRipple
            disableTouchRipple
            disableFocusRipple
            classes={{ root: s.check }}
          />
          <Text size="normal">Remember me</Text>
        </button>
      </div>
    </div>
  );
}
