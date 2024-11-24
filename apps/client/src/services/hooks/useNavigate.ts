import { useNavigate as RRDuseNavigate } from "react-router-dom";

export function useNavigate() {
  return RRDuseNavigate() as (to: string) => void;
}
