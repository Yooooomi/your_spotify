import { useMemo } from "react";
import BlacklistArtistDialog from "../../../components/BlacklistArtistDialog";
import ThreePoints from "../../../components/ThreePoints";
import { ThreePointItem } from "../../../components/ThreePoints/ThreePoints";
import { useSheetState } from "../../../services/hooks/hooks";
import { compact, conditionalEntry } from "../../../services/tools";

interface ArtistContextMenuProps {
  artistId: string;
  artistName: string;
  blacklisted: boolean;
}

export default function ArtistContextMenu({
  artistId,
  artistName,
  blacklisted,
}: ArtistContextMenuProps) {
  const [open, setOpen, setClosed] = useSheetState();

  const items = useMemo<ThreePointItem[]>(
    () =>
      compact([
        conditionalEntry(
          {
            label: "Blacklist",
            onClick: setOpen,
            style: "destructive",
          },
          !blacklisted,
        ),
        conditionalEntry(
          {
            label: "Unblacklist",
            onClick: setOpen,
            style: "destructive",
          },
          blacklisted,
        ),
      ]),
    [blacklisted, setOpen],
  );

  return (
    <>
      <ThreePoints items={items} />
      <BlacklistArtistDialog
        blacklisted={blacklisted}
        artistId={open ? artistId : undefined}
        artistName={artistName}
        onClose={setClosed}
      />
    </>
  );
}
