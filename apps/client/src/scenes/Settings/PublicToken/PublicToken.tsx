import { Button } from "@mui/material";
import { useCallback } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useSelector } from "react-redux";
import Text from "../../../components/Text";
import TitleCard from "../../../components/TitleCard";
import { alertMessage } from "../../../services/redux/modules/message/reducer";
import { selectUser } from "../../../services/redux/modules/user/selector";
import {
  deletePublicToken,
  generateNewPublicToken,
} from "../../../services/redux/modules/user/thunk";
import { useAppDispatch } from "../../../services/redux/tools";
import SettingLine from "../SettingLine";
import s from "./index.module.css";

export default function PublicToken() {
  const dispatch = useAppDispatch();
  const user = useSelector(selectUser);
  const location = window.location.origin;

  const generate = useCallback(() => {
    dispatch(generateNewPublicToken());
  }, [dispatch]);

  const deleteToken = useCallback(() => {
    dispatch(deletePublicToken());
  }, [dispatch]);

  const onCopy = useCallback(() => {
    dispatch(
      alertMessage({
        level: "info",
        message: "Public url copied to clipboard",
      }),
    );
  }, [dispatch]);

  if (!user) {
    return null;
  }

  const link = `${location}/?token=${user.publicToken}`;

  return (
    <TitleCard title="Public token">
      <Text element="div" className={s.disclaimer}>
        The generated url will allow anyone with it to view your stats
        indefinitely. The user won&apos;t be able to execute any action that
        modifies your account. Regenerating it will cause the older link to be
        deprecated instantly. You can also share the page you&apos;re currently
        viewing using the <code>Share this page</code> button on the side.
      </Text>
      <SettingLine
        left="Your public token"
        right={
          user.publicToken ? (
            <CopyToClipboard text={link} onCopy={onCopy}>
              <div className={s.link}>
                <Text element="div">{link}</Text>
              </div>
            </CopyToClipboard>
          ) : (
            "No token generated"
          )
        }
      />
      <SettingLine
        left="Regenerate"
        right={
          <div className={s.row}>
            <Button onClick={generate}>Generate</Button>
            <Button onClick={deleteToken}>Delete Token</Button>
          </div>
        }
      />
    </TitleCard>
  );
}
