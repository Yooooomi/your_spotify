import { Button, Input } from "@material-ui/core";
import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { alertMessage } from "../../../services/redux/modules/message/reducer";
import { selectSettings } from "../../../services/redux/modules/settings/selector";
import { register as registerThunk } from "../../../services/redux/modules/user/thunk";
import s from "../index.module.css";

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const settings = useSelector(selectSettings);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  const register = useCallback(
    async (ev: React.SyntheticEvent) => {
      ev.preventDefault();
      if (password !== repeatPassword) {
        dispatch(
          alertMessage({
            level: "info",
            message: "Password and repeat password differ",
          })
        );
        return;
      }
      await dispatch(registerThunk({ username, password }));
      navigate("/");
    },
    [dispatch, navigate, password, repeatPassword, username]
  );

  return (
    <div className={s.root}>
      <form onSubmit={register} className={s.form}>
        <h1>Register</h1>
        <Input
          placeholder="Username"
          value={username}
          onChange={(ev) => setUsername(ev.target.value)}
        />
        <Input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
        />
        <Input
          placeholder="Repeat password"
          type="password"
          value={repeatPassword}
          onChange={(ev) => setRepeatPassword(ev.target.value)}
        />
        <div>
          <div className={s.button}>
            <Button
              variant="contained"
              type="submit"
              disabled={!settings?.allowRegistrations}
            >
              Register
            </Button>
          </div>
          <Link to="/login">Login instead</Link>
        </div>
      </form>
    </div>
  );
}
