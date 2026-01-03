import { stringifySequence } from "../../services/shortcuts";
import Text from "../Text";
import s from './index.module.css'

interface ShortcutProps {
  sequence: string;
}

export function Shortcut({ sequence }: ShortcutProps) {
  return <div className={s.root}><Text size="small" onDark>{stringifySequence(sequence)}</Text></div>
}

interface AbsoluteShortcutProps extends ShortcutProps {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
}

export function AbsoluteShortcut({ bottom, left, right, sequence, top, }: AbsoluteShortcutProps) {
  return <div className={s.absolute} style={{ left, right, top, bottom }}>
    <Shortcut sequence={sequence} />
  </div>
}
